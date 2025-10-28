// en src/services/mapService.ts
import apiClient from '../lib/axios/axios';
import type { MapData, ApiResponse } from "../types/map.types";

export const registerMap = async (mapData: MapData): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("nombre", mapData.nombre);
  if (mapData.imagen) {
    formData.append("imagen", mapData.imagen);
  }

  const response = await apiClient.post('/maps/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
