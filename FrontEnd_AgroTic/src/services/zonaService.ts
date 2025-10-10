import apiClient from '../lib/axios/axios';

export const zonaService = {
  async getAll() {
    const response = await apiClient.get('/zonas');
    return response.data;
  },
};

export default zonaService;