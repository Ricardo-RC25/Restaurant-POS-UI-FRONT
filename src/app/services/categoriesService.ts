/**
 * Categories API Service
 */

import { apiClient } from './api';

interface CreateCategoryRequest {
  name: string;
  description?: string;
}

interface CreateCategoryResponse {
  message: string;
  category: {
    id: string;
    name: string;
    description: string;
    display_order: number;
    active: boolean;
    created_by: string | null;
  };
}

interface CategoryApiResponse {
  id: string;
  name: string;
  description: string;
  display_order: number;
  active: number;
  created_at: string;
}

interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  display_order?: number;
  active?: boolean;
}

interface UpdateCategoryResponse {
  message: string;
}

interface DeleteCategoryResponse {
  message: string;
}

export const categoriesService = {
  /**
   * Obtener todas las categorías
   */
  async getCategories(): Promise<CategoryApiResponse[]> {
    console.log('📡 [API] Obteniendo todas las categorías');
    const response = await apiClient.get<CategoryApiResponse[]>('/categories');
    console.log('✅ [API] Categorías obtenidas:', response);
    return response;
  },

  /**
   * Crear una nueva categoría
   */
  async createCategory(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    console.log('📡 [API] Creando categoría:', data);
    const response = await apiClient.post<CreateCategoryResponse>('/categories', data);
    console.log('✅ [API] Categoría creada:', response);
    return response;
  },

  /**
   * Actualizar una categoría
   */
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    console.log('📡 [API] Actualizando categoría:', { id, data });
    const response = await apiClient.put<UpdateCategoryResponse>(`/categories/${id}`, data);
    console.log('✅ [API] Categoría actualizada:', response);
    return response;
  },

  /**
   * Eliminar una categoría
   */
  async deleteCategory(id: string): Promise<DeleteCategoryResponse> {
    console.log('📡 [API] Eliminando categoría:', id);
    const response = await apiClient.delete<DeleteCategoryResponse>(`/categories/${id}`);
    console.log('✅ [API] Categoría eliminada:', response);
    return response;
  },
};
