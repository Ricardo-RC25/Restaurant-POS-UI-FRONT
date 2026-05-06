/**
 * Tables API Service
 */

import { apiClient } from './api';

interface CreateTableRequest {
  number: number;
  status: 'free' | 'occupied' | 'billed';
}

interface CreateTableResponse {
  message: string;
  tableId: string;
}

interface DeleteTableResponse {
  message: string;
}

interface UpdateTableNumberRequest {
  number: number;
}

interface UpdateTableNumberResponse {
  message: string;
}

interface TableApiResponse {
  id: string;
  number: number;
  status: 'free' | 'occupied' | 'billed';
  current_order_id: string | null;
  waiter_id: string | null;
  occupied_at: string | null;
  active: number;
}

export const tablesService = {
  /**
   * Obtener todas las mesas
   */
  async getTables(): Promise<TableApiResponse[]> {
    const response = await apiClient.get<TableApiResponse[]>('/tables');
    return response;
  },

  /**
   * Crear una nueva mesa
   */
  async createTable(data: CreateTableRequest): Promise<CreateTableResponse> {
    const response = await apiClient.post<CreateTableResponse>('/tables', data);
    return response;
  },

  /**
   * Actualizar el número de una mesa
   */
  async updateTableNumber(id: string, newNumber: number): Promise<UpdateTableNumberResponse> {
    const response = await apiClient.patch<UpdateTableNumberResponse>(`/tables/${id}/number`, { number: newNumber });
    return response;
  },

  /**
   * Eliminar una mesa
   */
  async deleteTable(id: string): Promise<DeleteTableResponse> {
    const response = await apiClient.delete<DeleteTableResponse>(`/tables/${id}`);
    return response;
  },
};
