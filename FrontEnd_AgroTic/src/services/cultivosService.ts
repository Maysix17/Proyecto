import type { Cultivo, SearchCultivoDto, CreateCultivoData } from "../types/cultivos.types";
import apiClient from '../lib/axios/axios';

export const searchCultivos = async (
  searchData: SearchCultivoDto
): Promise<Cultivo[]> => {
  const response = await apiClient.post('/cultivos/search', searchData);
  return response.data;
};

export const getAllCultivos = async (): Promise<Cultivo[]> => {
  const response = await apiClient.get('/cultivos');
  return response.data;
};

export const createCultivo = async (data: CreateCultivoData): Promise<Cultivo> => {
  const response = await apiClient.post('/cultivos', data);
  return response.data;
};

export const getCultivosVariedadXZonaByCultivo = async (cultivoId: string): Promise<any[]> => {
  const response = await apiClient.get(`/cultivos-variedad-x-zona/cultivo/${cultivoId}`);
  return response.data;
};

export const getZonaCultivosVariedadXZona = async (zonaId: string): Promise<any[]> => {
  const response = await apiClient.get(`/zonas/${zonaId}/cultivos-variedad-zona`);
  return response.data.cultivos || [];
};

export const getZonaByNombre = async (nombre: string): Promise<any> => {
  const response = await apiClient.get(`/zonas?nombre=${encodeURIComponent(nombre)}`);
  const zonas = response.data;
  const zona = zonas.find((z: any) => z.nombre === nombre);
  if (!zona) {
    throw new Error(`Zona con nombre ${nombre} no encontrada`);
  }
  return zona;
};