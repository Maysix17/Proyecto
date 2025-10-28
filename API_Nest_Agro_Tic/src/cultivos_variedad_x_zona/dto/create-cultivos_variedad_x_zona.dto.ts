import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCultivosVariedadXZonaDto {
  @IsString()
  @IsNotEmpty()
  fkCultivosXVariedadId: string;

  @IsString()
  @IsNotEmpty()
  fkZonaId: string;
}
