import apiClient from '../lib/axios/axios';

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Bodega {
  id: string;
  nombre: string;
}

export interface CreateInventoryDto {
  nombre: string;
  descripcion?: string;
  stock: number;
  precio: number;
  capacidadUnidad?: number;
  fechaVencimiento?: string;
  fkCategoriaId: string;
  fkBodegaId: string;
  imgUrl?: File;
}

export interface InventoryItem {
  id: string;
  nombre: string;
  descripcion?: string;
  stock: number;
  precio: number;
  capacidadUnidad?: number;
  fechaVencimiento?: string;
  imgUrl?: string;
  fkCategoriaId: string;
  fkBodegaId: string;
  categoria?: Categoria;
  bodega?: Bodega;
  stock_disponible?: number;
  stock_devuelto?: number;
  stock_sobrante?: number;
}

export interface LoteInventario {
  id: string;
  fkProductoId: string;
  fkBodegaId: string;
  cantidadDisponible: string;
  cantidadReservada: string;
  fechaIngreso: string;
  fechaVencimiento?: string;
  esParcial: boolean;
  producto: {
    id: string;
    nombre: string;
    descripcion?: string;
    sku: string;
    precioCompra: string;
    precioVenta: string;
    // Add other product fields as needed
  };
  bodega: Bodega;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export const inventoryService = {
  create: async (data: CreateInventoryDto): Promise<any> => {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    if (data.descripcion) formData.append('descripcion', data.descripcion);
    formData.append('stock', data.stock.toString());
    formData.append('precio', data.precio.toString());
    if (data.capacidadUnidad) formData.append('capacidadUnidad', data.capacidadUnidad.toString());
    if (data.fechaVencimiento) formData.append('fechaVencimiento', data.fechaVencimiento);
    formData.append('fkCategoriaId', data.fkCategoriaId);
    formData.append('fkBodegaId', data.fkBodegaId);
    if (data.imgUrl) formData.append('imgUrl', data.imgUrl);

    const response = await apiClient.post('/inventario', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: CreateInventoryDto): Promise<any> => {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    if (data.descripcion) formData.append('descripcion', data.descripcion);
    formData.append('stock', data.stock.toString());
    formData.append('precio', data.precio.toString());
    if (data.capacidadUnidad) formData.append('capacidadUnidad', data.capacidadUnidad.toString());
    if (data.fechaVencimiento) formData.append('fechaVencimiento', data.fechaVencimiento);
    formData.append('fkCategoriaId', data.fkCategoriaId);
    formData.append('fkBodegaId', data.fkBodegaId);
    if (data.imgUrl) formData.append('imgUrl', data.imgUrl);

    const response = await apiClient.put(`/inventario/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/inventario/${id}`);
    return response.data;
  },

  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<LoteInventario>> => {
    const response = await apiClient.get(`/inventario?page=${page}&limit=${limit}`);
    return response.data;
  },

  search: async (query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<LoteInventario>> => {
    const response = await apiClient.get(`/inventario/search/${query}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getCategorias: async (): Promise<Categoria[]> => {
    const response = await apiClient.get('/categoria');
    return response.data;
  },

  getBodegas: async (): Promise<Bodega[]> => {
    const response = await apiClient.get('/bodega');
    return response.data;
  },

  getAvailableStock: async (id: string): Promise<number> => {
    const response = await apiClient.get(`/inventario/${id}/stock-disponible`);
    return response.data;
  },

  validateStockAvailability: async (id: string, quantity: number): Promise<boolean> => {
    const response = await apiClient.get(`/inventario/${id}/validar-stock/${quantity}`);
    return response.data;
  },
};