import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { Permiso } from './entities/permiso.entity';
import { Recurso } from '../recursos/entities/recurso.entity';
import { Modulo } from '../modulos/entities/modulo.entity';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisosRepository: Repository<Permiso>,
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
    @InjectRepository(Modulo)
    private readonly moduloRepository: Repository<Modulo>,
  ) {}

  /**
   * Sincroniza los permisos para un recurso específico dentro de un módulo.
   */
  async sincronizarPermisos(createPermisoDto: CreatePermisoDto): Promise<any> {
    const { moduloNombre, recurso: nombreRecurso, acciones } = createPermisoDto;

    // 1. Busca el módulo por su nombre. Si no existe, lo crea.
    let modulo = await this.moduloRepository.findOneBy({
      nombre: moduloNombre,
    });
    if (!modulo) {
      modulo = this.moduloRepository.create({ nombre: moduloNombre });
      await this.moduloRepository.save(modulo);
    }

    // 2. Busca el recurso. Si no existe, lo crea y lo asocia al módulo.
    let recurso = await this.recursoRepository.findOne({
      where: { nombre: nombreRecurso },
      relations: ['modulo'],
    });

    if (!recurso) {
      recurso = this.recursoRepository.create({
        nombre: nombreRecurso,
        modulo: modulo, // Asociación clave al crear
      });
      await this.recursoRepository.save(recurso);
    } else if (recurso.modulo.id !== modulo.id) {
      // Si el recurso ya existe pero pertenece a otro módulo, se lanza un error.
      // Esto previene que un recurso cambie de módulo accidentalmente.
      throw new ConflictException(
        `El recurso '${nombreRecurso}' ya existe y pertenece al módulo '${recurso.modulo.nombre}'.`,
      );
    }

    // 3. La lógica para sincronizar las acciones (crear/eliminar permisos) es la misma.
    const permisosActuales = await this.permisosRepository.find({
      where: { recurso: { id: recurso.id } },
    });

    const accionesActuales = permisosActuales.map((p) => p.accion);
    const accionesACrear = acciones.filter(
      (a) => !accionesActuales.includes(a),
    );
    const permisosAEliminar = permisosActuales.filter(
      (p) => !acciones.includes(p.accion),
    );

    if (permisosAEliminar.length > 0) {
      await this.permisosRepository.remove(permisosAEliminar);
    }

    if (accionesACrear.length > 0) {
      const nuevosPermisos = accionesACrear.map((accion) =>
        this.permisosRepository.create({ accion, recurso }),
      );
      await this.permisosRepository.save(nuevosPermisos);
    }

    // 4. Devuelve una respuesta clara con toda la información anidada.
    const permisosFinales = await this.permisosRepository.find({
      where: { recurso: { id: recurso.id } },
      order: { accion: 'ASC' },
    });

    return {
      modulo: modulo.nombre,
      recurso: recurso.nombre,
      permisos: permisosFinales.map((p) => ({ id: p.id, accion: p.accion })),
    };
  }

  /**
   * Obtiene todos los permisos existentes, agrupados por módulo y recurso.
   */
  async findAll(): Promise<any[]> {
    const todosLosPermisos = await this.permisosRepository.find({
      relations: ['recurso', 'recurso.modulo'],
      order: {
        recurso: { modulo: { nombre: 'ASC' }, nombre: 'ASC' },
        accion: 'ASC',
      },
    });

    const agrupados = todosLosPermisos.reduce((acc, permiso) => {
      const nombreModulo = permiso.recurso.modulo.nombre;
      const nombreRecurso = permiso.recurso.nombre;
      const key = `${nombreModulo}-${nombreRecurso}`;

      if (!acc[key]) {
        acc[key] = {
          modulo: nombreModulo,
          recurso: nombreRecurso,
          acciones: [],
        };
      }
      acc[key].acciones.push(permiso.accion);
      return acc;
    }, {});

    return Object.values(agrupados);
  }

  /**
   * Busca los permisos para un recurso específico por su ID.
   */
  async findByRecurso(recursoId: string): Promise<Permiso[]> {
    const recurso = await this.recursoRepository.findOneBy({ id: recursoId });
    if (!recurso) {
      throw new NotFoundException(
        `Recurso con ID "${recursoId}" no encontrado.`,
      );
    }

    return this.permisosRepository.find({
      where: { recurso: { id: recursoId } },
    });
  }
}
