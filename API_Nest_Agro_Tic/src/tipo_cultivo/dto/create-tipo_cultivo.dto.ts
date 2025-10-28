import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateTipoCultivoDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nombre: string;
}
