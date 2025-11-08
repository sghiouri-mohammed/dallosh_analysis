import apiClient from './client';
import { API_ENDPOINTS } from '@/configs/constant';
import type { File, UploadFileResponse } from '@/types';

/**
 * Files/Datasets Service
 * Handles file management API calls
 */
class FilesService {
  /**
   * Upload a file
   * Matches workflow test pattern: uses FormData with 'file' field
   */
  async upload(file: File | Blob, filename?: string): Promise<File> {
    const formData = new FormData();
    // FormData.append accepts File or Blob, and File extends Blob
    // If it's a File, use it directly; if it's a Blob, provide filename
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      // For Blob, we need to provide a filename
      formData.append('file', file as Blob, filename || 'file.csv');
    }

    const response = await apiClient.post<{ success: boolean; data: File; message: string }>(
      API_ENDPOINTS.FILES.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Get all files
   */
  async findAll(filter?: Record<string, any>, options?: {
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
  }): Promise<File[]> {
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

    const response = await apiClient.get<{ success: boolean; data: File[]; message: string }>(
      `${API_ENDPOINTS.FILES.BASE}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get file by ID
   */
  async findOne(uid: string): Promise<File> {
    const response = await apiClient.get<{ success: boolean; data: File; message: string }>(
      API_ENDPOINTS.FILES.BY_ID(uid)
    );
    return response.data;
  }

  /**
   * Download a file
   * @param uid - File ID
   * @param source - Source type: 'datasets' | 'cleaned' | 'analysed' (default: 'analysed')
   * @param contentDisposition - 'inline' to display in browser, 'attachment' to download (default: 'attachment')
   * @returns Blob for inline display, or triggers download for attachment
   */
  async download(
    uid: string,
    source: 'datasets' | 'cleaned' | 'analysed' = 'analysed',
    contentDisposition: 'inline' | 'attachment' = 'attachment'
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('source', source);
    params.append('contentDisposition', contentDisposition);

    const response = await apiClient.getInstance().get(
      `${API_ENDPOINTS.FILES.DOWNLOAD(uid)}?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );
    return response.data as Blob;
  }

  /**
   * Download file as a URL (for inline display in iframe/img/etc)
   * @param uid - File ID
   * @param source - Source type: 'datasets' | 'cleaned' | 'analysed' (default: 'analysed')
   * @returns Object URL that can be used in src attributes
   */
  async getDownloadUrl(
    uid: string,
    source: 'datasets' | 'cleaned' | 'analysed' = 'analysed'
  ): Promise<string> {
    const blob = await this.download(uid, source, 'inline');
    return URL.createObjectURL(blob);
  }

  /**
   * Download file and trigger browser download
   * @param uid - File ID
   * @param source - Source type: 'datasets' | 'cleaned' | 'analysed' (default: 'analysed')
   * @param filename - Optional custom filename
   */
  async downloadFile(
    uid: string,
    source: 'datasets' | 'cleaned' | 'analysed' = 'analysed',
    filename?: string
  ): Promise<void> {
    const blob = await this.download(uid, source, 'attachment');
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `file_${source}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Delete file
   * @param uid - File ID
   * @param source - Optional source type: 'datasets' | 'cleaned' | 'analysed' (default: 'datasets')
   */
  async delete(uid: string, source?: 'datasets' | 'cleaned' | 'analysed'): Promise<void> {
    const params = new URLSearchParams();
    if (source) {
      params.append('source', source);
    }

    const url = params.toString()
      ? `${API_ENDPOINTS.FILES.BY_ID(uid)}?${params.toString()}`
      : API_ENDPOINTS.FILES.BY_ID(uid);

    await apiClient.delete<{ success: boolean; data: null; message: string }>(url);
  }
}

export const filesService = new FilesService();

