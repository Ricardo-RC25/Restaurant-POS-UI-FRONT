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
    const response = await apiClient.get<CategoryApiResponse[]>('/categories');
    return response;
  },

  /**
   * Crear una nueva categoría
   */
  async createCategory(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const response = await apiClient.post<CreateCategoryResponse>('/categories', data);
    return response;
  },

  /**
   * Actualizar una categoría
   */
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    const response = await apiClient.put<UpdateCategoryResponse>(`/categories/${id}`, data);
    return response;
  },

  /**
   * Eliminar una categoría
   */
  async deleteCategory(id: string): Promise<DeleteCategoryResponse> {
    const response = await apiClient.delete<DeleteCategoryResponse>(`/categories/${id}`);
    return response;
  },
};
