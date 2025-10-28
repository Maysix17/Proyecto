export interface Cosecha {
  id: string;
  unidadMedida: string;
  cantidad: number;
  fecha?: string;
  fkCultivosVariedadXZonaId: string;
}

export interface CreateCosechaDto {
  unidadMedida: string;
  cantidad: number;
  fecha?: string;
  fkCultivosVariedadXZonaId: string;
}