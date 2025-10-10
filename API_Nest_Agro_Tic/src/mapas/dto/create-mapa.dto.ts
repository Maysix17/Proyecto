import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMapaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
