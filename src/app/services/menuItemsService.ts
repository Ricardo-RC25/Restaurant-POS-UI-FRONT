/**
 * Menu Items API Service
 */

import { apiClient } from './api';

interface CreateMenuItemRequest {
  name: string;
  description: string;
  category_id: string;
  price_provider: number;
  price_client: number;
  stock: number;
  min_stock: number;
  image?: File;
}

interface CreateMenuItemResponse {
  message: string;
  item: {
    id: string;
    name: string;
    description: string;
    category_id: string;
    price_provider: string;
    price_client: string;
    stock: string;
    min_stock: string;
    image: string;
    active: boolean;
    created_by: string | null;
  };
}

interface MenuItemApiResponse {
  id: string;
  name: string;
  description: string;
  category_id: string;
  price_provider: string;
  price_client: string;
  stock: string;
  min_stock: string;
  image: string;
  active: number;
  created_at: string;
}

interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  category_id?: string;
  price_provider?: number;
  price_client?: number;
  stock?: number;
  min_stock?: number;
  active?: boolean;
  image?: File;
}

interface UpdateMenuItemResponse {
  message: string;
}

interface DeleteMenuItemResponse {
  message: string;
}

export const menuItemsService = {
  /**
   * Obtener todos los productos
   */
  async getMenuItems(): Promise<MenuItemApiResponse[]> {
    const response = await apiClient.get<MenuItemApiResponse[]>('/menu-items');
    return response;
  },

  /**
   * Crear un nuevo producto (con FormData para soportar imagen)
   */
  async createMenuItem(data: CreateMenuItemRequest): Promise<CreateMenuItemResponse> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category_id', data.category_id);
    formData.append('price_provider', data.price_provider.toString());
    formData.append('price_client', data.price_client.toString());
    formData.append('stock', data.stock.toString());
    formData.append('min_stock', data.min_stock.toString());

    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.postFormData<CreateMenuItemResponse>('/menu-items', formData);
    return response;
  },

  /**
   * Actualizar un producto (con FormData para soportar imagen)
   */
  async updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<UpdateMenuItemResponse> {
    const formData = new FormData();

    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.category_id !== undefined) formData.append('category_id', data.category_id);
    if (data.price_provider !== undefined) formData.append('price_provider', data.price_provider.toString());
    if (data.price_client !== undefined) formData.append('price_client', data.price_client.toString());
    if (data.stock !== undefined) formData.append('stock', data.stock.toString());
    if (data.min_stock !== undefined) formData.append('min_stock', data.min_stock.toString());
    if (data.active !== undefined) formData.append('active', data.active.toString());
    if (data.image) formData.append('image', data.image);

    const response = await apiClient.putFormData<UpdateMenuItemResponse>(`/menu-items/${id}`, formData);
    return response;
  },

  /**
   * Eliminar un producto
   */
  async deleteMenuItem(id: string): Promise<DeleteMenuItemResponse> {
    const response = await apiClient.delete<DeleteMenuItemResponse>(`/menu-items/${id}`);
    return response;
  },
};
