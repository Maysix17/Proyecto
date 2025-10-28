import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVentaDto {
  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  fkCosechaId: string;

  @IsNumber()
  @IsOptional()
  precioKilo?: number;
}
