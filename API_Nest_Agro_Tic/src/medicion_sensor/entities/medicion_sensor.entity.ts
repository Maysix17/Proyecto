// File: src/entities/medicion_sensor/medicion_sensor.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sensor } from '../../sensor/entities/sensor.entity';

@Entity('medicion_sensor')
export class MedicionSensor {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_medicion' })
  id: string;

  @Column({ name: 'med_valor', type: 'numeric', precision: 10, scale: 2 })
  valor: number;

  @Column({ name: 'med_fecha_medicion', type: 'timestamp' })
  fechaMedicion: Date;

  @Column({ name: 'fk_id_sensor' })
  fkSensorId: number;

  @ManyToOne(() => Sensor, (s) => s.mediciones)
  @JoinColumn({ name: 'fk_id_sensor' })
  sensor?: Sensor;
}
