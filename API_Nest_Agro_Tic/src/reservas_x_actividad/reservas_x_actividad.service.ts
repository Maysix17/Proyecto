import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservasXActividad } from './entities/reservas_x_actividad.entity';
import { CreateReservasXActividadDto } from './dto/create-reservas_x_actividad.dto';
import { UpdateReservasXActividadDto } from './dto/update-reservas_x_actividad.dto';
import { FinalizeActivityDto } from './dto/finalize-activity.dto';
import { Actividad } from '../actividades/entities/actividades.entity';
import { EstadoReserva } from '../estados_reserva/entities/estados_reserva.entity';

@Injectable()
export class ReservasXActividadService {
  constructor(
    @InjectRepository(ReservasXActividad)
    private readonly reservasXActividadRepo: Repository<ReservasXActividad>,
    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>,
    @InjectRepository(EstadoReserva)
    private readonly estadoReservaRepo: Repository<EstadoReserva>,
  ) {}

  async create(createDto: CreateReservasXActividadDto): Promise<ReservasXActividad> {
    const entity = this.reservasXActividadRepo.create(createDto);
    return await this.reservasXActividadRepo.save(entity);
  }

  async findAll(): Promise<ReservasXActividad[]> {
    return await this.reservasXActividadRepo.find({ relations: ['actividad', 'lote', 'estado'] });
  }

  async findOne(id: string): Promise<ReservasXActividad> {
    const entity = await this.reservasXActividadRepo.findOne({
      where: { id },
      relations: ['actividad', 'lote', 'estado'],
    });
    if (!entity) throw new NotFoundException(`ReservasXActividad con ID ${id} no encontrado`);
    return entity;
  }

  async update(id: string, updateDto: UpdateReservasXActividadDto): Promise<ReservasXActividad> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.reservasXActividadRepo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.reservasXActividadRepo.remove(entity);
  }

  async finalizeActivity(finalizeDto: FinalizeActivityDto): Promise<void> {
    // Find the activity
    const actividad = await this.actividadRepo.findOne({
      where: { id: finalizeDto.actividadId },
    });
    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${finalizeDto.actividadId} no encontrada`);
    }

    // Find the confirmed state
    const estadoConfirmada = await this.estadoReservaRepo.findOne({
      where: { nombre: 'Confirmada' },
    });
    if (!estadoConfirmada) {
      throw new NotFoundException('Estado de reserva "Confirmada" no encontrado');
    }

    // Process each reservation
    for (const reservaDto of finalizeDto.reservas) {
      const reserva = await this.reservasXActividadRepo.findOne({
        where: { id: reservaDto.reservaId },
        relations: ['actividad'],
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva con ID ${reservaDto.reservaId} no encontrada`);
      }

      // Verify the reservation belongs to the activity
      if (reserva.fkActividadId !== finalizeDto.actividadId) {
        throw new BadRequestException(
          `La reserva ${reservaDto.reservaId} no pertenece a la actividad ${finalizeDto.actividadId}`
        );
      }

      // Set cantidad_devuelta
      reserva.cantidadDevuelta = reservaDto.cantidadDevuelta || 0;

      // Calculate cantidad_usada = cantidad_reservada - cantidad_devuelta
      reserva.cantidadUsada = reserva.cantidadReservada - reserva.cantidadDevuelta;

      // Change estado to confirmed
      reserva.fkEstadoId = estadoConfirmada.id;

      // Save the reservation
      await this.reservasXActividadRepo.save(reserva);
    }

    // Set activity estado to false (finished)
    actividad.estado = false;
    actividad.fechaFinalizacion = new Date();
    await this.actividadRepo.save(actividad);
  }
}