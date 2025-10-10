import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoriaDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres.' })
  nombre: string;
}
