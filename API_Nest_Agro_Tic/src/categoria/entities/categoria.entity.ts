import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Producto } from '../../productos/entities/productos.entity';

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @OneToMany(() => Producto, (p) => p.categoria)
  productos?: Producto[];
}
