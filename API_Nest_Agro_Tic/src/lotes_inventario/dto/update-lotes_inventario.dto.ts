import { PartialType } from '@nestjs/mapped-types';
import { CreateLotesInventarioDto } from './create-lotes_inventario.dto';

export class UpdateLotesInventarioDto extends PartialType(CreateLotesInventarioDto) {}