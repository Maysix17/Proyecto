import { IsUUID, IsNumber, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateLotesInventarioDto {
  @IsUUID()
  fkProductoId: string;

  @IsUUID()
  fkBodegaId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  cantidadDisponible: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  cantidadReservada: number;

  @IsBoolean()
  esParcial: boolean;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;
}