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

interface DeleteUserResponse {
  message: string;
}

export const usersService = {
  /**
   * Obtener todos los usuarios
   */
  async getUsers(): Promise<UserApiResponse[]> {
    const response = await apiClient.get<UserApiResponse[]>('/users');
    return response;
  },

  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await apiClient.post<CreateUserResponse>('/users', data);
    return response;
  },

  /**
   * Actualizar un usuario
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    const response = await apiClient.put<UpdateUserResponse>(`/users/${id}`, data);
    return response;
  },

  /**
   * Eliminar un usuario
   */
  async deleteUser(id: string): Promise<DeleteUserResponse> {
    const response = await apiClient.delete<DeleteUserResponse>(`/users/${id}`);
    return response;
  },
};
