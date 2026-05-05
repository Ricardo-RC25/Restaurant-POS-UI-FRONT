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

interface UpdateTableRequest {
  number?: number;
  capacity?: number;
  status?: 'free' | 'occupied' | 'billed';
  waiter_id?: string | null;
  occupied_at?: string | null;
}

interface UpdateTableResponse {
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
   * Actualizar una mesa
   */
  async updateTable(id: string, data: UpdateTableRequest): Promise<UpdateTableResponse> {
    console.log('📡 [API] Actualizando mesa:', { id, data });
    const response = await apiClient.put<UpdateTableResponse>(`/tables/${id}`, data);
    console.log('✅ [API] Mesa actualizada:', response);
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
