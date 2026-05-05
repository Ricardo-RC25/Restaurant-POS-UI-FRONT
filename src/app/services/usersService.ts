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

interface UserApiResponse {
  id: string;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'manager' | 'waiter' | 'cashier';
  active: number;
  created_at: string;
}

interface UpdateUserRequest {
  username?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  role?: 'admin' | 'manager' | 'waiter' | 'cashier';
  active?: boolean;
}

interface UpdateUserResponse {
  message: string;
}

export const usersService = {
  /**
   * Obtener todos los usuarios
   */
  async getUsers(): Promise<UserApiResponse[]> {
    console.log('📡 [API] Obteniendo todos los usuarios');
    const response = await apiClient.get<UserApiResponse[]>('/users');
    console.log('✅ [API] Usuarios obtenidos:', response);
    return response;
  },

  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    console.log('📡 [API] Creando usuario:', { ...data, password: '***' });
    const response = await apiClient.post<CreateUserResponse>('/users', data);
    console.log('✅ [API] Usuario creado:', response);
    return response;
  },

  /**
   * Actualizar un usuario
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    console.log('📡 [API] Actualizando usuario:', { id, data });
    const response = await apiClient.put<UpdateUserResponse>(`/users/${id}`, data);
    console.log('✅ [API] Usuario actualizado:', response);
    return response;
  },
};
