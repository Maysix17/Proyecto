import { PartialType } from '@nestjs/mapped-types';
import { CreateMapaDto } from './create-mapa.dto';

export class UpdateMapaDto extends PartialType(CreateMapaDto) {}
