import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCultivoDto {
  @IsUUID()
  tipoCultivoId: string;

  @IsUUID()
  variedadId: string;

  @IsUUID()
  zonaId: string;

  @IsNumber()
  @IsOptional()
  estado?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  siembra?: Date;
}
