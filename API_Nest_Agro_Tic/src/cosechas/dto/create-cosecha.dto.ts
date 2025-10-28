import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCosechaDto {
  @IsString()
  @IsNotEmpty()
  unidadMedida: string = 'kg';

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsOptional()
  @IsString()
  fecha?: string;

  @IsString()
  @IsNotEmpty()
  fkCultivosVariedadXZonaId: string;
}
