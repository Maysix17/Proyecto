import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cosecha } from './entities/cosecha.entity';
import { CreateCosechaDto } from './dto/create-cosecha.dto';
import { UpdateCosechaDto } from './dto/update-cosecha.dto';
import { Cultivo } from '../cultivos/entities/cultivo.entity';
import { CultivosVariedadXZona } from '../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';
import { CultivosXVariedad } from '../cultivos_x_variedad/entities/cultivos_x_variedad.entity';

@Injectable()
export class CosechasService {
  constructor(
    @InjectRepository(Cosecha)
    private readonly cosechaRepository: Repository<Cosecha>,
    @InjectRepository(Cultivo)
    private readonly cultivoRepository: Repository<Cultivo>,
    @InjectRepository(CultivosVariedadXZona)
    private readonly cvzRepository: Repository<CultivosVariedadXZona>,
    @InjectRepository(CultivosXVariedad)
    private readonly cxvRepository: Repository<CultivosXVariedad>,
  ) {}

  async create(createCosechaDto: CreateCosechaDto): Promise<Cosecha> {
    // Set default date if not provided or empty
    if (!createCosechaDto.fecha || createCosechaDto.fecha.trim() === '') {
      createCosechaDto.fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    const cosecha = this.cosechaRepository.create(createCosechaDto);
    const savedCosecha = await this.cosechaRepository.save(cosecha);

    // Update cultivo estado to Finalizado (0)
    const cvz = await this.cvzRepository.findOne({
      where: { id: createCosechaDto.fkCultivosVariedadXZonaId },
      relations: ['cultivoXVariedad'],
    });
    if (cvz?.cultivoXVariedad) {
      const cxv = await this.cxvRepository.findOne({
        where: { id: cvz.cultivoXVariedad.id },
        relations: ['cultivo'],
      });
      if (cxv?.cultivo) {
        cxv.cultivo.estado = 0; // Finalizado
        await this.cultivoRepository.save(cxv.cultivo);
      }
    }

    return savedCosecha;
  }

  async findAll(): Promise<Cosecha[]> {
    return await this.cosechaRepository.find();
  }

  async findOne(id: string): Promise<Cosecha> {
    const cosecha = await this.cosechaRepository.findOne({ where: { id } });
    if (!cosecha) {
      throw new NotFoundException(`Cosecha con id ${id} no encontrada`);
    }
    return cosecha;
  }

  async update(
    id: string,
    updateCosechaDto: UpdateCosechaDto,
  ): Promise<Cosecha> {
    const cosecha = await this.findOne(id);
    Object.assign(cosecha, updateCosechaDto);
    return await this.cosechaRepository.save(cosecha);
  }

  async remove(id: string): Promise<void> {
    const cosecha = await this.findOne(id);
    await this.cosechaRepository.remove(cosecha);
  }
}
