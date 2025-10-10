import apiClient from '../lib/axios/axios';

export const categoriaService = {
  async getAll() {
    const response = await apiClient.get('/categoria-actividad');
    console.log('Categorias response:', response.data);
    return response.data || [];
  },
};

export default categoriaService;