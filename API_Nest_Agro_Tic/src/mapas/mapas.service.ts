import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mapa } from './entities/mapa.entity';
import { CreateMapaDto } from './dto/create-mapa.dto';
import { UpdateMapaDto } from './dto/update-mapa.dto';

@Injectable()
export class MapasService {
  constructor(
    @InjectRepository(Mapa)
    private readonly mapaRepo: Repository<Mapa>,
  ) {}

  async create(dto: { nombre: string; urlImg: string }) {
    const mapa = this.mapaRepo.create(dto);
    return await this.mapaRepo.save(mapa);
  }

  async findAll(): Promise<Mapa[]> {
    return await this.mapaRepo.find();
  }

  async findOne(id: string): Promise<Mapa> {
    const mapa = await this.mapaRepo.findOne({ where: { id } });
    if (!mapa) throw new NotFoundException(`Mapa con id ${id} no encontrado`);
    return mapa;
  }

  async update(id: string, dto: UpdateMapaDto): Promise<Mapa> {
    const mapa = await this.findOne(id);
    Object.assign(mapa, dto);
    return await this.mapaRepo.save(mapa);
  }

  async remove(id: string): Promise<void> {
    const mapa = await this.findOne(id);
    await this.mapaRepo.remove(mapa);
  }
}
