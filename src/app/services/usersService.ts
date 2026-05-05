/**
 * Users API Service
 */

import { apiClient } from './api';

interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'waiter' | 'cashier';
  email?: string;
  phone?: string;
  created_by?: string | null;
}

interface CreateUserResponse {
  message: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export const usersService = {
  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    console.log('📡 [API] Creando usuario:', { ...data, password: '***' });
    const response = await apiClient.post<CreateUserResponse>('/users', data);
    console.log('✅ [API] Usuario creado:', response);
    return response;
  },
};
