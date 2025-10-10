// src/types/map.types.ts
export interface MapData {
  nombre: string;
  imagen: File | null;
}

export interface ApiResponse {
  message: string;
  success: boolean;
}
