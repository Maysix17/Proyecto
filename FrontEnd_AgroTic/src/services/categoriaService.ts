import apiClient from '../lib/axios/axios';
import type { CategoriaData } from '../types/categoria.types';

export const categoriaService = {
  async getAll(): Promise<CategoriaData[]> {
    const response = await apiClient.get('/categoria');
    console.log('Categorias response:', response.data);
    return response.data || [];
  },
  async create(data: Omit<CategoriaData, 'id'>): Promise<CategoriaData> {
    const response = await apiClient.post('/categoria', data);
    return response.data;
  },
  async update(id: string, data: Omit<CategoriaData, 'id'>): Promise<CategoriaData> {
    const response = await apiClient.put(`/categoria/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/categoria/${id}`);
  },
};

export const getCategorias = async () => {
  const response = await apiClient.get('/categoria');
  return response.data || [];
};

export const registerCategoria = async (data: { nombre: string; descripcion?: string; esDivisible: boolean }) => {
  const response = await apiClient.post('/categoria', data);
  return response.data;
};

export const updateCategoria = async (id: string, data: { nombre: string; descripcion?: string; esDivisible: boolean }) => {
  const response = await apiClient.put(`/categoria/${id}`, data);
  return response.data;
};

export const deleteCategoria = async (id: string) => {
  const response = await apiClient.delete(`/categoria/${id}`);
  return response.data;
};

export default categoriaService;