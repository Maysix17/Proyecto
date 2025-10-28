import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/productos.entity';
import { CreateProductosDto } from './dto/create-productos.dto';
import { UpdateProductosDto } from './dto/update-productos.dto';
import { CreateProductoWithLoteDto } from './dto/create-producto-with-lote.dto';
import { LotesInventario } from '../lotes_inventario/entities/lotes_inventario.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  async create(createDto: CreateProductosDto): Promise<Producto> {
    const entity = this.productoRepo.create(createDto);
    return await this.productoRepo.save(entity);
  }

  async findAll(): Promise<Producto[]> {
    return await this.productoRepo.find({
      relations: ['categoria', 'unidadMedida'],
    });
  }

  async findOne(id: string): Promise<Producto> {
    const entity = await this.productoRepo.findOne({
      where: { id },
      relations: ['categoria', 'unidadMedida'],
    });
    if (!entity)
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return entity;
  }

  async update(id: string, updateDto: UpdateProductosDto): Promise<Producto> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.productoRepo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.productoRepo.remove(entity);
  }

  async createWithLote(createDto: CreateProductoWithLoteDto): Promise<Producto> {
    // Start transaction
    const queryRunner = this.productoRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create product
      const producto = this.productoRepo.create({
        nombre: createDto.nombre,
        descripcion: createDto.descripcion,
        sku: createDto.sku,
        precioCompra: createDto.precioCompra,
        capacidadPresentacion: createDto.capacidadPresentacion,
        fkCategoriaId: createDto.fkCategoriaId,
        fkUnidadMedidaId: createDto.fkUnidadMedidaId,
      });
      const savedProducto = await queryRunner.manager.save(Producto, producto);

      // Calculate cantidadDisponible = stock * capacidadPresentacion
      const cantidadDisponible = createDto.stock * (savedProducto.capacidadPresentacion || 1);

      // Create lot inventory
      const loteInventario = queryRunner.manager.create(LotesInventario, {
        fkProductoId: savedProducto.id,
        fkBodegaId: createDto.fkBodegaId,
        cantidadDisponible,
        stock: createDto.stock,
        esParcial: false, // Default to false
        cantidadParcial: 0, // Default to 0
        fechaVencimiento: createDto.fechaVencimiento ? new Date(createDto.fechaVencimiento) : undefined,
      });
      await queryRunner.manager.save(LotesInventario, loteInventario);

      // Commit transaction
      await queryRunner.commitTransaction();

      return savedProducto;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
