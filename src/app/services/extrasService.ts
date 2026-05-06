/**
 * Extras API Service
 */

import { apiClient } from './api';

interface CreateExtraRequest {
  name: string;
  description: string;
  price: number;
  application_type: 'global' | 'category' | 'product';
  active: boolean;
  categories: string[];
  products: string[];
}

interface CreateExtraResponse {
  message: string;
  extraId: string;
}

interface ExtraApiResponse {
  id: string;
  name: string;
  description: string;
  price: string;
  application_type: 'global' | 'category' | 'product';
  active: number;
  created_at: string;
  categories?: string[];
  products?: string[];
}

interface UpdateExtraRequest {
  name?: string;
  description?: string;
  price?: number;
  application_type?: 'global' | 'category' | 'product';
  active?: boolean;
  categories?: string[];
  products?: string[];
}

interface UpdateExtraResponse {
  message: string;
}

interface DeleteExtraResponse {
  message: string;
}

export const extrasService = {
  /**
   * Obtener todos los extras
   */
  async getExtras(): Promise<ExtraApiResponse[]> {
    const response = await apiClient.get<ExtraApiResponse[]>('/extras');
    return response;
  },

  /**
   * Crear un nuevo extra
   */
  async createExtra(data: CreateExtraRequest): Promise<CreateExtraResponse> {
    const response = await apiClient.post<CreateExtraResponse>('/extras', data);
    return response;
  },

  /**
   * Actualizar un extra
   */
  async updateExtra(id: string, data: UpdateExtraRequest): Promise<UpdateExtraResponse> {
    const response = await apiClient.put<UpdateExtraResponse>(`/extras/${id}`, data);
    return response;
  },

  /**
   * Eliminar un extra
   */
  async deleteExtra(id: string): Promise<DeleteExtraResponse> {
    const response = await apiClient.delete<DeleteExtraResponse>(`/extras/${id}`);
    return response;
  },
};
