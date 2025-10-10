import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { LotesInventario } from './entities/lotes_inventario.entity';
import { CreateLotesInventarioDto } from './dto/create-lotes_inventario.dto';
import { UpdateLotesInventarioDto } from './dto/update-lotes_inventario.dto';

@Injectable()
export class LotesInventarioService {
  constructor(
    @InjectRepository(LotesInventario)
    private readonly lotesInventarioRepo: Repository<LotesInventario>,
  ) {}

  async create(createDto: CreateLotesInventarioDto): Promise<LotesInventario> {
    const entity = this.lotesInventarioRepo.create(createDto);
    return await this.lotesInventarioRepo.save(entity);
  }

  async findAll(): Promise<LotesInventario[]> {
    return await this.lotesInventarioRepo.find({ relations: ['producto', 'producto.unidadMedida', 'bodega', 'reservas'] });
  }

  async findOne(id: string): Promise<LotesInventario> {
    const entity = await this.lotesInventarioRepo.findOne({
      where: { id },
      relations: ['producto', 'bodega', 'reservas'],
    });
    if (!entity) throw new NotFoundException(`LotesInventario con ID ${id} no encontrado`);
    return entity;
  }

  async update(id: string, updateDto: UpdateLotesInventarioDto): Promise<LotesInventario> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.lotesInventarioRepo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.lotesInventarioRepo.remove(entity);
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    console.log(`Starting search for query: "${query}", page: ${page}, limit: ${limit}`);

    try {
      const skip = (page - 1) * limit;

      // First, get all lotes that match the product name search
      const lotes = await this.lotesInventarioRepo.find({
        where: query ? {
          producto: {
            nombre: ILike(`%${query}%`),
          },
        } : {},
        relations: ['producto', 'producto.categoria', 'producto.unidadMedida', 'bodega', 'reservas'],
      });

      console.log(`Found ${lotes.length} lotes matching product name search`);

      // Group by product and calculate availability like getAvailableProducts
      const productMap = new Map();

      for (const lote of lotes) {
        console.log(`Processing lote ${lote.id} for search results`);
        if (!lote.producto) {
          console.log(`Skipping lote ${lote.id} - no producto relation`);
          continue;
        }

        const productId = lote.fkProductoId;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product: lote.producto,
            totalAvailable: 0,
            totalPartialReturns: 0,
            hasPartialReturns: false,
            lotes: [],
          });
        }

        const productData = productMap.get(productId);
        productData.lotes.push(lote);

        // Calculate available quantity for this lote
        const availableInLote = lote.cantidadDisponible - lote.cantidadReservada;
        productData.totalAvailable += availableInLote;
        console.log(`Lote ${lote.id}: available ${availableInLote}, total for product now ${productData.totalAvailable}`);

        // Calculate partial returns from reservations
        if (lote.reservas) {
          console.log(`Lote ${lote.id} has ${lote.reservas.length} reservations`);
          for (const reserva of lote.reservas) {
            if (reserva.cantidadDevuelta && reserva.cantidadDevuelta > 0) {
              productData.totalPartialReturns += reserva.cantidadDevuelta;
              productData.hasPartialReturns = true;
              console.log(`Reservation ${reserva.id}: devuelta ${reserva.cantidadDevuelta}`);
            }
          }
        } else {
          console.log(`Lote ${lote.id} has no reservations`);
        }
      }

      console.log(`Product map has ${productMap.size} products after grouping`);

      // Convert to array and sort: products with partial returns first, then by availability
      const products = Array.from(productMap.values())
        .filter(item => item.totalAvailable > 0) // Only show products with available quantity
        .sort((a, b) => {
          if (a.hasPartialReturns && !b.hasPartialReturns) return -1;
          if (!a.hasPartialReturns && b.hasPartialReturns) return 1;
          return b.totalAvailable - a.totalAvailable; // Sort by availability descending
        });

      console.log(`After filtering available products: ${products.length} products`);

      // Apply pagination to the results
      const total = products.length;
      const paginatedProducts = products.slice(skip, skip + limit);

      console.log(`Returning page ${page} with ${paginatedProducts.length} products (total: ${total})`);

      // Log activity for search in reservation context
      console.log(`Search activity logged: Query "${query}" returned ${total} available products`);

      // Return in frontend-friendly format
      const result = paginatedProducts.map(item => ({
        id: item.product.id,
        nombre: item.product.nombre,
        descripcion: item.product.descripcion,
        sku: item.product.sku,
        precioCompra: item.product.precioCompra,
        esDivisible: item.product.esDivisible,
        capacidadPresentacion: item.product.capacidadPresentacion,
        categoria: item.product.categoria,
        unidadMedida: item.product.unidadMedida,
        cantidadDisponible: item.totalAvailable,
        stock_devuelto: item.totalPartialReturns,
        stock_sobrante: item.totalPartialReturns, // Assuming surplus is the partial returns available
        tieneDevolucionesParciales: item.hasPartialReturns,
        lotes: item.lotes.map(l => ({
          id: l.id,
          cantidadDisponible: l.cantidadDisponible,
          cantidadReservada: l.cantidadReservada,
          bodega: l.bodega,
        })),
      }));

      console.log('Search completed successfully');
      return { items: result, total };
    } catch (error) {
      console.error('Error in search function:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  async findAllPaginated(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.lotesInventarioRepo.findAndCount({
      relations: ['producto', 'producto.categoria', 'producto.unidadMedida', 'bodega'],
      skip,
      take: limit,
    });

    return { items, total };
  }

  async getAvailableProducts() {
    try {
      console.log('Starting getAvailableProducts');
      // Get all lotes with product and reservation relations
      const lotes = await this.lotesInventarioRepo.find({
        relations: ['producto', 'producto.categoria', 'producto.unidadMedida', 'reservas'],
      });
      console.log(`Found ${lotes.length} lotes`);

      // Group by product
      const productMap = new Map();

      for (const lote of lotes) {
        console.log(`Processing lote ${lote.id}, producto: ${lote.producto ? lote.producto.id : 'null'}`);
        // Skip if product relation is not loaded
        if (!lote.producto) {
          console.log(`Skipping lote ${lote.id} - no producto`);
          continue;
        }

        const productId = lote.fkProductoId;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product: lote.producto,
            totalAvailable: 0,
            totalPartialReturns: 0,
            hasPartialReturns: false,
          });
        }

        const productData = productMap.get(productId);

        // Calculate available quantity for this lote
        const availableInLote = lote.cantidadDisponible - lote.cantidadReservada;
        productData.totalAvailable += availableInLote;
        console.log(`Lote ${lote.id}: available ${availableInLote}, total now ${productData.totalAvailable}`);

        // Calculate partial returns from reservations
        if (lote.reservas) {
          console.log(`Lote ${lote.id} has ${lote.reservas.length} reservations`);
          for (const reserva of lote.reservas) {
            if (reserva.cantidadDevuelta && reserva.cantidadDevuelta > 0) {
              productData.totalPartialReturns += reserva.cantidadDevuelta;
              productData.hasPartialReturns = true;
              console.log(`Reservation ${reserva.id}: devuelta ${reserva.cantidadDevuelta}`);
            }
          }
        } else {
          console.log(`Lote ${lote.id} has no reservations`);
        }
      }

      console.log(`Product map has ${productMap.size} products`);
      // Convert to array and sort: products with partial returns first
      const products = Array.from(productMap.values()).sort((a, b) => {
        if (a.hasPartialReturns && !b.hasPartialReturns) return -1;
        if (!a.hasPartialReturns && b.hasPartialReturns) return 1;
        return 0;
      });

      console.log(`Returning ${products.length} products`);
      // Return in frontend-friendly format
      const result = products.map(item => {
        console.log(`Mapping product ${item.product.id}`);
        return {
          id: item.product.id,
          nombre: item.product.nombre,
          descripcion: item.product.descripcion,
          sku: item.product.sku,
          precioCompra: item.product.precioCompra,
          esDivisible: item.product.esDivisible,
          capacidadPresentacion: item.product.capacidadPresentacion,
          categoria: item.product.categoria,
          unidadMedida: item.product.unidadMedida,
          cantidadDisponible: item.totalAvailable,
          stock_devuelto: item.totalPartialReturns,
          stock_sobrante: item.totalPartialReturns, // Assuming surplus is the partial returns available
          tieneDevolucionesParciales: item.hasPartialReturns,
        };
      });
      console.log('getAvailableProducts completed successfully');
      return result;
    } catch (error) {
      console.error('Error in getAvailableProducts:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }
}