import apiClient from './client';
import { API_ENDPOINTS } from '@/configs/constant';
import type {
  Settings,
  UpdateSettingsRequest,
  UpdateGeneralSettingsRequest,
  UpdateAISettingsRequest,
  UpdateStorageSettingsRequest,
} from '@/types';

/**
 * Settings Service
 * Handles application settings API calls
 */
class SettingsService {
  /**
   * Get application settings
   */
  async get(): Promise<Settings> {
    const response = await apiClient.get<{ success: boolean; data: Settings; message: string }>(
      API_ENDPOINTS.SETTINGS.BASE
    );
    // Backend returns { success, data, message }, extract data
    return response.data;
  }

  /**
   * Update settings
   */
  async update(data: UpdateSettingsRequest): Promise<Settings> {
    const response = await apiClient.patch<{ success: boolean; data: Settings; message: string }>(
      API_ENDPOINTS.SETTINGS.BASE,
      data
    );
    return response.data;
  }

  /**
   * Update general settings
   */
  async updateGeneral(data: UpdateGeneralSettingsRequest): Promise<Settings> {
    const response = await apiClient.patch<{ success: boolean; data: Settings; message: string }>(
      API_ENDPOINTS.SETTINGS.GENERAL,
      data
    );
    return response.data;
  }

  /**
   * Update AI settings
   */
  async updateAI(data: UpdateAISettingsRequest): Promise<Settings> {
    const response = await apiClient.patch<{ success: boolean; data: Settings; message: string }>(
      API_ENDPOINTS.SETTINGS.AI,
      data
    );
    return response.data;
  }

  /**
   * Update storage settings
   */
  async updateStorage(data: UpdateStorageSettingsRequest): Promise<Settings> {
    const response = await apiClient.patch<{ success: boolean; data: Settings; message: string }>(
      API_ENDPOINTS.SETTINGS.STORAGE,
      data
    );
    return response.data;
  }
}

export const settingsService = new SettingsService();

