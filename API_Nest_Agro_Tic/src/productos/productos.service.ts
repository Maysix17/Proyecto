import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/productos.entity';
import { CreateProductosDto } from './dto/create-productos.dto';
import { UpdateProductosDto } from './dto/update-productos.dto';

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
    return await this.productoRepo.find({ relations: ['categoria', 'unidadMedida'] });
  }

  async findOne(id: string): Promise<Producto> {
    const entity = await this.productoRepo.findOne({
      where: { id },
      relations: ['categoria', 'unidadMedida'],
    });
    if (!entity) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
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
}