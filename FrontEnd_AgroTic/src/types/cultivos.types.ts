export interface Cultivo {
  cvzid: string; // CVZ ID - fundamental para cosechas
  id: string;
  ficha: string;
  lote: string; // CORREGIDO: Propiedades en minúsculas para coincidir con el backend (getRawMany)
  nombrecultivo: string;
  fechasiembra: string;
  fechacosecha: string;
  estado: number; // Estado del cultivo: 1=En curso, 0=Finalizado
  cosechaid?: string; // ID de la cosecha para ventas
}

export interface SearchCultivoDto {
  buscar?: string; // Buscar por zona
  buscar_cultivo?: string; // Buscar por variedad o tipo de cultivo
  fecha_inicio?: string; // Fecha inicio del rango
  fecha_fin?: string; // Fecha fin del rango
  id_titulado?: string; // Número de ficha del titulado
  estado_cultivo?: number; // Estado: 1=activo, 0=inactivo
}

export interface CreateCultivoData {
  tipoCultivoId: string;
  variedadId: string;
  zonaId: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}
