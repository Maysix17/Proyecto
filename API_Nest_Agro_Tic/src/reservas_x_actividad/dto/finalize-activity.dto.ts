import { IsArray, IsUUID, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FinalizeReservationDto {
  @IsUUID()
  reservaId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  cantidadDevuelta?: number;
}

export class FinalizeActivityDto {
  @IsUUID()
  actividadId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalizeReservationDto)
  reservas: FinalizeReservationDto[];
}