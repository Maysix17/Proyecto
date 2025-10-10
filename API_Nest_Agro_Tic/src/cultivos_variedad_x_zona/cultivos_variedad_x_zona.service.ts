import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CultivosVariedadXZona } from './entities/cultivos_variedad_x_zona.entity';
import { CreateCultivosVariedadXZonaDto } from './dto/create-cultivos_variedad_x_zona.dto';
import { UpdateCultivosVariedadXZonaDto } from './dto/update-cultivos_variedad_x_zona.dto';

@Injectable()
export class CultivosVariedadXZonaService {
  constructor(
    @InjectRepository(CultivosVariedadXZona)
    private readonly cvzRepository: Repository<CultivosVariedadXZona>,
  ) {}

  async create(
    createCultivosVariedadXZonaDto: CreateCultivosVariedadXZonaDto,
  ): Promise<CultivosVariedadXZona> {
    const cvz = this.cvzRepository.create(createCultivosVariedadXZonaDto);
    return await this.cvzRepository.save(cvz);
  }

  async findAll(): Promise<CultivosVariedadXZona[]> {
    return await this.cvzRepository.find();
  }

  async findByCultivo(cultivoId: string): Promise<CultivosVariedadXZona[]> {
    return await this.cvzRepository.find({
      where: {
        cultivoXVariedad: {
          fkCultivoId: cultivoId,
        },
      },
      relations: [
        'cultivoXVariedad',
        'cultivoXVariedad.variedad',
        'cultivoXVariedad.variedad.tipoCultivo',
        'zona',
      ],
    });
  }

  async findOne(id: number): Promise<CultivosVariedadXZona> {
    const cvz = await this.cvzRepository.findOne({
      where: { id: id.toString() },
    });
    if (!cvz) {
      throw new NotFoundException(
        `CultivosVariedadXZona con id ${id} no encontrada`,
      );
    }
    return cvz;
  }

  async update(
    id: number,
    updateCultivosVariedadXZonaDto: UpdateCultivosVariedadXZonaDto,
  ): Promise<CultivosVariedadXZona> {
    const cvz = await this.findOne(id);
    Object.assign(cvz, updateCultivosVariedadXZonaDto);
    return await this.cvzRepository.save(cvz);
  }

  async remove(id: number): Promise<void> {
    const cvz = await this.findOne(id);
    await this.cvzRepository.remove(cvz);
  }
}
