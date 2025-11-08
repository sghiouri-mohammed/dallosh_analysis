import apiClient from './client';
import { API_ENDPOINTS } from '@/configs/constant';
import type { User, RegisterRequest, UpdateAccountRequest } from '@/types';

/**
 * Users Service
 * Handles user management API calls
 */
class UsersService {
  /**
   * Create a new user
   */
  async create(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post<{ success: boolean; data: User; message: string }>(
      API_ENDPOINTS.USERS.BASE,
      data
    );
    return response.data;
  }

  /**
   * Get all users
   */
  async findAll(filter?: Record<string, any>, options?: {
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
  }): Promise<User[]> {
    const params = new URLSearchParams();
    
    if (filter) {
      params.append('filter', JSON.stringify(filter));
    }
    if (options?.sort) {
      params.append('sort', JSON.stringify(options.sort));
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.skip) {
      params.append('skip', options.skip.toString());
    }

    const response = await apiClient.get<{ success: boolean; data: User[]; message: string }>(
      `${API_ENDPOINTS.USERS.BASE}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get user by ID
   */
  async findOne(uid: string): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User; message: string }>(
      API_ENDPOINTS.USERS.BY_ID(uid)
    );
    return response.data;
  }

  /**
   * Update user
   */
  async update(uid: string, data: UpdateAccountRequest): Promise<User> {
    const response = await apiClient.patch<{ success: boolean; data: User; message: string }>(
      API_ENDPOINTS.USERS.BY_ID(uid),
      data
    );
    return response.data;
  }

  /**
   * Delete user
   */
  async delete(uid: string): Promise<void> {
    await apiClient.delete<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.USERS.BY_ID(uid)
    );
  }
}

export const usersService = new UsersService();

