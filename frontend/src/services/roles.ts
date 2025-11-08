import apiClient from './client';
import { API_ENDPOINTS } from '@/configs/constant';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types';

/**
 * Roles Service
 * Handles role management API calls
 */
class RolesService {
  /**
   * Create a new role
   */
  async create(data: CreateRoleRequest): Promise<Role> {
    const response = await apiClient.post<{ success: boolean; data: Role; message: string }>(
      API_ENDPOINTS.ROLES.BASE,
      data
    );
    return response.data;
  }

  /**
   * Get all roles
   */
  async findAll(filter?: Record<string, any>, options?: {
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
  }): Promise<Role[]> {
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

    const response = await apiClient.get<{ success: boolean; data: Role[]; message: string }>(
      `${API_ENDPOINTS.ROLES.BASE}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get role by ID
   */
  async findOne(uid: string): Promise<Role> {
    const response = await apiClient.get<{ success: boolean; data: Role; message: string }>(
      API_ENDPOINTS.ROLES.BY_ID(uid)
    );
    return response.data;
  }

  /**
   * Update role
   */
  async update(uid: string, data: UpdateRoleRequest): Promise<Role> {
    const response = await apiClient.patch<{ success: boolean; data: Role; message: string }>(
      API_ENDPOINTS.ROLES.BY_ID(uid),
      data
    );
    return response.data;
  }

  /**
   * Delete role
   */
  async delete(uid: string): Promise<void> {
    await apiClient.delete<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.ROLES.BY_ID(uid)
    );
  }
}

export const rolesService = new RolesService();

