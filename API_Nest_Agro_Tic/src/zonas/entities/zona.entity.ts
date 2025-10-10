// File: src/entities/zonas/zonas.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Mapa } from '../../mapas/entities/mapa.entity';
import { CultivosVariedadXZona } from '../../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';
import { Sensor } from '../../sensor/entities/sensor.entity';

@Entity('zonas')
export class Zona {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_zona' })
  id: string;

  @Column({ name: 'zon_nombre', type: 'varchar', length: 50 })
  nombre: string;

  @Column({ name: 'zon_tipo_lote', type: 'varchar', length: 8 })
  tipoLote: string;

  @Column({ name: 'zon_coor_x', type: 'numeric', precision: 10, scale: 2 })
  coorX: number;

  @Column({ name: 'zon_coor_y', type: 'numeric', precision: 10, scale: 2 })
  coorY: number;

  @Column({ name: 'fk_id_mapa' })
  fkMapaId: string;

  @ManyToOne(() => Mapa, (m) => m.zonas)
  @JoinColumn({ name: 'fk_id_mapa' })
  mapa?: Mapa;

  @OneToMany(() => CultivosVariedadXZona, (cvz) => cvz.zona)
  cultivosVariedad?: CultivosVariedadXZona[];

  @OneToMany(() => Sensor, (s) => s.zona)
  sensores?: Sensor[];
}
