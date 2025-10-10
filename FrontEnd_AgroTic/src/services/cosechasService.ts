import apiClient from '../lib/axios/axios';
import type { Cosecha } from '../types/cosechas.types';

export const createCosecha = async (data: Omit<Cosecha, 'id'>): Promise<Cosecha> => {
  const response = await apiClient.post('/cosechas', data);
  return response.data;
};

export const getCosechas = async (): Promise<Cosecha[]> => {
  const response = await apiClient.get('/cosechas');
  return response.data;
};

export const updateCosecha = async (id: string, data: Partial<Cosecha>): Promise<Cosecha> => {
  const response = await apiClient.patch(`/cosechas/${id}`, data);
  return response.data;
};

export const deleteCosecha = async (id: string): Promise<void> => {
  await apiClient.delete(`/cosechas/${id}`);
};