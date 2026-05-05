/**
 * Auth API Service
 */

import { apiClient } from './api';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export const authService = {
  /**
   * Autenticar usuario
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    console.log('📡 [API] Iniciando sesión:', { username: data.username, password: '***' });
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    console.log('✅ [API] Login exitoso:', { ...response, token: '***' });
    return response;
  },
};
