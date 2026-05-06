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

interface LogoutResponse {
  message: string;
}

export const authService = {
  /**
   * Autenticar usuario
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>('/auth/logout', {});
    return response;
  },
};
