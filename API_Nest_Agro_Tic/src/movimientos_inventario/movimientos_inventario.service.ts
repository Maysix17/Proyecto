import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientosInventario } from './entities/movimientos_inventario.entity';
import { CreateMovimientosInventarioDto } from './dto/create-movimientos_inventario.dto';
import { UpdateMovimientosInventarioDto } from './dto/update-movimientos_inventario.dto';

@Injectable()
export class MovimientosInventarioService {
  constructor(
    @InjectRepository(MovimientosInventario)
    private readonly movimientosInventarioRepo: Repository<MovimientosInventario>,
  ) {}

  async create(createDto: CreateMovimientosInventarioDto): Promise<MovimientosInventario> {
    const entity = this.movimientosInventarioRepo.create(createDto);
    return await this.movimientosInventarioRepo.save(entity);
  }

  async findAll(): Promise<MovimientosInventario[]> {
    return await this.movimientosInventarioRepo.find({ relations: ['lote', 'reserva', 'tipoMovimiento'] });
  }

  async findOne(id: string): Promise<MovimientosInventario> {
    const entity = await this.movimientosInventarioRepo.findOne({
      where: { id },
      relations: ['lote', 'reserva', 'tipoMovimiento'],
    });
    if (!entity) throw new NotFoundException(`MovimientosInventario con ID ${id} no encontrado`);
    return entity;
  }

  async update(id: string, updateDto: UpdateMovimientosInventarioDto): Promise<MovimientosInventario> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.movimientosInventarioRepo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.movimientosInventarioRepo.remove(entity);
  }
}