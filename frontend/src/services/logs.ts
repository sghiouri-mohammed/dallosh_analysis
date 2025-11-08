import apiClient from './client';
import { API_ENDPOINTS } from '@/configs/constant';
import type { Log } from '@/types';

/**
 * Logs Service
 * Handles activity logs API calls
 */
class LogsService {
  /**
   * Get all logs
   */
  async findAll(filter?: Record<string, any>, options?: {
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
  }): Promise<Log[]> {
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

    const response = await apiClient.get<{ success: boolean; data: Log[]; message: string }>(
      `${API_ENDPOINTS.LOGS.BASE}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get log by ID
   */
  async findOne(uid: string): Promise<Log> {
    const response = await apiClient.get<{ success: boolean; data: Log; message: string }>(
      API_ENDPOINTS.LOGS.BY_ID(uid)
    );
    return response.data;
  }

  /**
   * Delete log
   */
  async delete(uid: string): Promise<void> {
    await apiClient.delete<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.LOGS.BY_ID(uid)
    );
  }
}

export const logsService = new LogsService();

