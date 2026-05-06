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
    console.log('📡 [API] Obteniendo todas las mesas');
    const response = await apiClient.get<TableApiResponse[]>('/tables');
    console.log('✅ [API] Mesas obtenidas:', response);
    return response;
  },

  /**
   * Crear una nueva mesa
   */
  async createTable(data: CreateTableRequest): Promise<CreateTableResponse> {
    console.log('📡 [API] Creando mesa:', data);
    const response = await apiClient.post<CreateTableResponse>('/tables', data);
    console.log('✅ [API] Mesa creada:', response);
    return response;
  },

  /**
   * Actualizar el número de una mesa
   */
  async updateTableNumber(id: string, newNumber: number): Promise<UpdateTableNumberResponse> {
    console.log('📡 [API] Actualizando número de mesa:', { id, newNumber });
    const response = await apiClient.patch<UpdateTableNumberResponse>(`/tables/${id}/number`, { number: newNumber });
    console.log('✅ [API] Número de mesa actualizado:', response);
    return response;
  },

  /**
   * Eliminar una mesa
   */
  async deleteTable(id: string): Promise<DeleteTableResponse> {
    console.log('📡 [API] Eliminando mesa:', id);
    const response = await apiClient.delete<DeleteTableResponse>(`/tables/${id}`);
    console.log('✅ [API] Mesa eliminada:', response);
    return response;
  },
};
