/**
 * Unit tests for Files Service
 */
import { filesService } from '@/services/files';
import apiClient from '@/services/client';

// Mock the API client
jest.mock('@/services/client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('FilesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should upload a file successfully', async () => {
      const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const mockResponse = {
        success: true,
        data: {
          uid: 'file-123',
          data: {
            filename: 'test.csv',
            size: 1024,
            type: 'text/csv',
          },
        },
        message: 'File uploaded successfully',
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await filesService.upload(mockFile);

      expect(mockedApiClient.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'test.csv');
      mockedApiClient.post.mockRejectedValue(new Error('Upload failed'));

      await expect(filesService.upload(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('findAll', () => {
    it('should fetch all files', async () => {
      const mockResponse = {
        success: true,
        data: [
          { uid: 'file-1', data: { filename: 'file1.csv' } },
          { uid: 'file-2', data: { filename: 'file2.csv' } },
        ],
        message: 'Files retrieved',
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await filesService.findAll();

      expect(mockedApiClient.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('findOne', () => {
    it('should fetch a single file by ID', async () => {
      const fileId = 'file-123';
      const mockResponse = {
        success: true,
        data: {
          uid: fileId,
          data: { filename: 'test.csv' },
        },
        message: 'File retrieved',
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await filesService.findOne(fileId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(`/files/${fileId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('should delete a file', async () => {
      const fileId = 'file-123';
      const mockResponse = {
        success: true,
        data: null,
        message: 'File deleted',
      };

      mockedApiClient.delete.mockResolvedValue(mockResponse);

      await filesService.delete(fileId);

      expect(mockedApiClient.delete).toHaveBeenCalledWith(`/files/${fileId}`);
    });
  });

  describe('download', () => {
    it('should download a file', async () => {
      const fileId = 'file-123';
      const source = 'datasets';
      const contentDisposition = 'attachment';

      mockedApiClient.get.mockResolvedValue({} as any);

      await filesService.download(fileId, source, contentDisposition);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        `/files/${fileId}/download`,
        {
          params: { source, contentDisposition },
          responseType: 'blob',
        }
      );
    });
  });
});

