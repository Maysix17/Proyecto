import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Actividad } from './entities/actividades.entity';
import { CreateActividadeDto } from './dto/create-actividade.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';
import { ReservasXActividadService } from '../reservas_x_actividad/reservas_x_actividad.service';
import { CreateReservasXActividadDto } from '../reservas_x_actividad/dto/create-reservas_x_actividad.dto';
import { ReservasXActividad } from '../reservas_x_actividad/entities/reservas_x_actividad.entity';
import { LotesInventario } from '../lotes_inventario/entities/lotes_inventario.entity';

@Injectable()
export class ActividadesService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadesRepo: Repository<Actividad>,
    @InjectRepository(ReservasXActividad)
    private readonly reservasXActividadRepo: Repository<ReservasXActividad>,
    private readonly reservasXActividadService: ReservasXActividadService,
  ) {}

  async create(
    dto: CreateActividadeDto & { imgUrl: string },
  ): Promise<Actividad> {
    const actividad: Actividad = this.actividadesRepo.create(dto);
    return await this.actividadesRepo.save(actividad);
  }
  async findAll(): Promise<Actividad[]> {
    return await this.actividadesRepo.find();
  }

  async countByDate(date: string): Promise<number> {
    return await this.actividadesRepo.count({
      where: { fechaAsignacion: new Date(date) },
    });
  }

  async findByDate(date: string): Promise<Actividad[]> {
    return await this.actividadesRepo.find({
      where: { fechaAsignacion: new Date(date) },
      relations: [
        'categoriaActividad',
        'cultivoVariedadZona',
        'cultivoVariedadZona.cultivoXVariedad',
        'cultivoVariedadZona.cultivoXVariedad.cultivo',
        'cultivoVariedadZona.cultivoXVariedad.variedad',
        'cultivoVariedadZona.cultivoXVariedad.variedad.tipoCultivo',
        'cultivoVariedadZona.zona',
        'usuariosAsignados',
        'usuariosAsignados.usuario',
        'usuariosAsignados.usuario.ficha',
        'reservas',
        'reservas.lote',
        'reservas.lote.producto',
        'reservas.lote.producto.unidadMedida',
        'reservas.estado',
      ],
    });
  }

  async findByDateWithActive(date: string): Promise<Actividad[]> {
    const actividades = await this.findByDate(date);
    // Filter relations to only active
    return actividades.map((act) => ({
      ...act,
      usuariosAsignados:
        act.usuariosAsignados?.filter((u) => u.activo !== false) || [],
      reservas: act.reservas?.filter((r) => r.estado?.id === 1) || [], // Assuming 1 is 'Reservado' or active state
    }));
  }

  async findByDateRange(start: string, end: string): Promise<Actividad[]> {
    return await this.actividadesRepo.find({
      where: { fechaAsignacion: Between(new Date(start), new Date(end)) },
      relations: [
        'categoriaActividad',
        'cultivoVariedadZona',
        'cultivoVariedadZona.cultivoXVariedad',
        'cultivoVariedadZona.cultivoXVariedad.cultivo',
        'cultivoVariedadZona.cultivoXVariedad.variedad',
        'cultivoVariedadZona.cultivoXVariedad.variedad.tipoCultivo',
        'cultivoVariedadZona.zona',
        'usuariosAsignados',
        'usuariosAsignados.usuario',
        'usuariosAsignados.usuario.ficha',
        'reservas',
        'reservas.lote',
        'reservas.lote.producto',
        'reservas.lote.producto.unidadMedida',
        'reservas.estado',
      ],
    });
  }

  async findOne(id: string): Promise<Actividad> {
    const actividad = await this.actividadesRepo.findOne({ where: { id } });
    if (!actividad)
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    return actividad;
  }

  async update(id: string, dto: UpdateActividadeDto): Promise<Actividad> {
    const actividad = await this.findOne(id);
    Object.assign(actividad, dto);
    return await this.actividadesRepo.save(actividad);
  }

  async remove(id: string): Promise<void> {
    const actividad = await this.findOne(id);
    await this.actividadesRepo.remove(actividad);
  }

  async finalizar(
    id: string,
    observacion?: string,
    imgUrl?: string,
    horas?: number,
    precioHora?: number,
  ): Promise<Actividad> {
    const actividad = await this.findOne(id);
    actividad.estado = false;
    actividad.fechaFinalizacion = new Date();
    if (observacion) actividad.observacion = observacion;
    if (imgUrl) actividad.imgUrl = imgUrl;
    if (horas !== undefined) actividad.horasDedicadas = horas;
    if (precioHora !== undefined) actividad.precioHora = precioHora;
    return await this.actividadesRepo.save(actividad);
  }

  // New methods for reservation management

  async createReservation(
    actividadId: string,
    loteId: string,
    cantidadReservada: number,
    estadoId: number = 1,
  ): Promise<ReservasXActividad> {
    const dto: CreateReservasXActividadDto = {
      fkActividadId: actividadId,
      fkLoteId: loteId,
      cantidadReservada,
      fkEstadoId: estadoId,
    };
    return await this.reservasXActividadService.create(dto);
  }

  async createReservationByProduct(
    actividadId: string,
    productId: string,
    cantidadReservada: number,
    estadoId: number = 1,
  ): Promise<ReservasXActividad> {
    // Find an available lote for this product
    const lotes = await this.actividadesRepo.manager.find(LotesInventario, {
      where: { fkProductoId: productId },
      relations: ['reservas', 'reservas.estado'],
    });

    // Find a lote with enough available quantity
    for (const lote of lotes) {
      // Calculate active reserved quantity (only reservations that are not 'Confirmada')
      let cantidadReservadaActiva = 0;
      if (lote.reservas) {
        for (const reserva of lote.reservas) {
          if (reserva.estado && reserva.estado.nombre !== 'Confirmada') {
            cantidadReservadaActiva += (reserva.cantidadReservada || 0) - (reserva.cantidadDevuelta || 0);
          }
        }
      }

      // Available quantity includes cantidadDisponible + cantidadParcial - active reservations
      const cantidadDisponibleNum = Number(lote.cantidadDisponible) || 0;
      const cantidadParcialNum = Number(lote.cantidadParcial) || 0;
      const available = cantidadDisponibleNum + cantidadParcialNum - cantidadReservadaActiva;
      if (available >= cantidadReservada) {
        return this.createReservation(
          actividadId,
          lote.id,
          cantidadReservada,
          estadoId,
        );
      }
    }

    throw new Error(
      `No hay suficiente stock disponible para el producto ${productId}`,
    );
  }

  async confirmUsage(
    reservaId: string,
    cantidadUsada: number,
  ): Promise<ReservasXActividad> {
    const reserva = await this.reservasXActividadService.findOne(reservaId);
    reserva.cantidadUsada = cantidadUsada;
    reserva.fkEstadoId = 2; // Assuming 2 is 'Usado'
    return await this.reservasXActividadService.update(reservaId, reserva);
  }

  async calculateCost(actividadId: string): Promise<number> {
    const reservas = await this.reservasXActividadService.findAll();
    const actividadReservas = reservas.filter(
      (r) => r.fkActividadId === actividadId && r.cantidadUsada,
    );
    let totalCost = 0;
    for (const reserva of actividadReservas) {
      // Assuming cost is cantidadUsada * some price, but since no price in entities, perhaps placeholder
      // For now, just sum cantidadUsada as cost
      totalCost += reserva.cantidadUsada || 0;
    }
    return totalCost;
  }

  async getReservationsByActivity(
    actividadId: string,
  ): Promise<ReservasXActividad[]> {
    return await this.reservasXActividadRepo.find({
      where: { fkActividadId: actividadId },
      relations: [
        'lote',
        'lote.producto',
        'lote.producto.unidadMedida',
        'estado',
      ],
    });
  }
}
