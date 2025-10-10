import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasXActividadService } from './reservas_x_actividad.service';
import { ReservasXActividadController } from './reservas_x_actividad.controller';
import { ReservasXActividad } from './entities/reservas_x_actividad.entity';
import { Actividad } from '../actividades/entities/actividades.entity';
import { EstadoReserva } from '../estados_reserva/entities/estados_reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReservasXActividad, Actividad, EstadoReserva])],
  controllers: [ReservasXActividadController],
  providers: [ReservasXActividadService],
  exports: [ReservasXActividadService],
})
export class ReservasXActividadModule {}