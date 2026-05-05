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

export const tablesService = {
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
