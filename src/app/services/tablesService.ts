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
};
