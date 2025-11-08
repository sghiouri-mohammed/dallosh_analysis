import apiClient from './client';
import { API_ENDPOINTS } from '@/configs/constant';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UpdateAccountRequest,
  User,
} from '@/types';

/**
 * Auth Service
 * Handles authentication-related API calls
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse; message: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    const { user, token } = response.data;
    
    // Store token and user
    apiClient.setToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { user, token };
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse; message: string }>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    const { user, token } = response.data;
    
    // Store token and user
    apiClient.setToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { user, token };
  }

  /**
   * Get current authenticated user
   */
  async me(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User; message: string }>(
      API_ENDPOINTS.AUTH.ME
    );
    return response.data;
  }

  /**
   * Update current user account
   */
  async updateAccount(data: UpdateAccountRequest): Promise<User> {
    const response = await apiClient.patch<{ success: boolean; data: User; message: string }>(
      API_ENDPOINTS.AUTH.UPDATE_ACCOUNT,
      data
    );
    const user = response.data;
    
    // Update stored user
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return user;
  }

  /**
   * Delete current user account
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.AUTH.DELETE_ACCOUNT
    );
    
    // Clear token and user
    apiClient.clearToken();
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ success: boolean; data: { token: string }; message: string }>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );
    const { token } = response.data;
    
    // Update stored token
    apiClient.setToken(token);
    
    return token;
  }

  /**
   * Logout user
   */
  logout(): void {
    apiClient.clearToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.getToken() !== null;
  }
}

export const authService = new AuthService();

