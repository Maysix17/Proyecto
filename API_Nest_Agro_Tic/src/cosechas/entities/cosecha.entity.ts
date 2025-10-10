// File: src/entities/cosechas/cosechas.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CultivosVariedadXZona } from '../../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';
import { Venta } from '../../venta/entities/venta.entity';

@Entity('cosechas')
export class Cosecha {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_cosecha' })
  id: string;

  @Column({ name: 'cos_unidad_medida', type: 'varchar', length: 2 })
  unidadMedida: string;

  @Column({ name: 'cos_cantidad', type: 'numeric', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ name: 'cos_fecha', type: 'date', nullable: true })
  fecha?: string;

  @Column({ name: 'fk_id_cultivos_variedad_x_zona' })
  fkCultivosVariedadXZonaId: string;

  @ManyToOne(() => CultivosVariedadXZona, (cvz) => cvz.cosechas)
  @JoinColumn({ name: 'fk_id_cultivos_variedad_x_zona' })
  cultivosVariedadXZona?: CultivosVariedadXZona;

  @OneToMany(() => Venta, (v) => v.cosecha)
  ventas?: Venta[];
}
