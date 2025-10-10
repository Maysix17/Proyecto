// File: src/entities/cultivos_variedad_x_zona/cultivos_variedad_x_zona.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CultivosXVariedad } from '../../cultivos_x_variedad/entities/cultivos_x_variedad.entity';
import { Zona } from '../../zonas/entities/zona.entity';
import { Actividad } from '../../actividades/entities/actividades.entity';
import { Cosecha } from '../../cosechas/entities/cosecha.entity';

@Entity('cultivos_variedad_x_zona')
export class CultivosVariedadXZona {
  @PrimaryGeneratedColumn('uuid', { name: 'pk_id_cv_zona' })
  id: string;

  @Column({ name: 'fk_id_cultivos_x_variedad' })
  fkCultivosXVariedadId: string;

  @Column({ name: 'fk_id_zona' })
  fkZonaId: string;

  @ManyToOne(() => CultivosXVariedad, (cxv) => cxv.zonas)
  @JoinColumn({ name: 'fk_id_cultivos_x_variedad' })
  cultivoXVariedad?: CultivosXVariedad;

  @ManyToOne(() => Zona, (z) => z.cultivosVariedad)
  @JoinColumn({ name: 'fk_id_zona' })
  zona?: Zona;

  @OneToMany(() => Actividad, (a) => a.cultivoVariedadZona)
  actividades?: Actividad[];

  @OneToMany(() => Cosecha, (c) => c.cultivosVariedadXZona)
  cosechas?: Cosecha[];
}
