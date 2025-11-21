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
    getInstance: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('FilesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should upload a file successfully', async () => {
      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const mockResponse = {
        success: true,
        data: {
          uid: 'file-123',
          data: {
            filename: 'test.csv',
            size: 1024,
            file_path: '/path/to/file.csv',
            extension: '.csv',
            type: 'text/csv',
          },
        },
        message: 'File uploaded successfully',
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await filesService.upload(file);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should upload a Blob with filename', async () => {
      const blob = new Blob(['test content'], { type: 'text/csv' });
      const filename = 'test.csv';

      const mockResponse = {
        success: true,
        data: {
          uid: 'file-123',
          data: {
            filename,
            size: 1024,
            file_path: '/path/to/file.csv',
            extension: '.csv',
            type: 'text/csv',
          },
        },
        message: 'File uploaded',
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      await filesService.upload(blob, filename);

      expect(mockedApiClient.post).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should get all files', async () => {
      const mockFiles = [
        {
          uid: 'file-1',
          data: {
            filename: 'file1.csv',
            size: 1024,
            file_path: '/path/to/file1.csv',
            extension: '.csv',
            type: 'text/csv',
          },
        },
      ];

      const mockResponse = {
        success: true,
        data: mockFiles,
        message: 'Files retrieved',
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await filesService.findAll();

      expect(mockedApiClient.get).toHaveBeenCalled();
      expect(result).toEqual(mockFiles);
    });

    it('should get files with filter and options', async () => {
      const filter = { 'data.extension': '.csv' };
      const options = { limit: 10, skip: 0 };

      mockedApiClient.get.mockResolvedValue({
        success: true,
        data: [],
        message: 'Files retrieved',
      });

      await filesService.findAll(filter, options);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter=')
      );
    });
  });

  describe('findOne', () => {
    it('should get file by id', async () => {
      const uid = 'file-123';
      const mockFile = {
        uid,
        data: {
          filename: 'test.csv',
          size: 1024,
          file_path: '/path/to/file.csv',
          extension: '.csv',
          type: 'text/csv',
        },
      };

      const mockResponse = {
        success: true,
        data: mockFile,
        message: 'File retrieved',
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await filesService.findOne(uid);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(uid)
      );
      expect(result).toEqual(mockFile);
    });
  });

  describe('download', () => {
    it('should download file as blob', async () => {
      const uid = 'file-123';
      const source = 'analysed';
      const mockBlob = new Blob(['test content'], { type: 'text/csv' });

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: mockBlob,
        }),
      };

      mockedApiClient.getInstance.mockReturnValue(mockAxiosInstance as any);

      const result = await filesService.download(uid, source);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(uid),
        expect.objectContaining({
          responseType: 'blob',
        })
      );
      expect(result).toBe(mockBlob);
    });

    it('should use default source if not provided', async () => {
      const uid = 'file-123';
      const mockBlob = new Blob(['test content']);

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: mockBlob,
        }),
      };

      mockedApiClient.getInstance.mockReturnValue(mockAxiosInstance as any);

      await filesService.download(uid);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('source=analysed'),
        expect.any(Object)
      );
    });
  });

  describe('getDownloadUrl', () => {
    it('should create object URL for inline display', async () => {
      const uid = 'file-123';
      const mockBlob = new Blob(['test content']);

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: mockBlob,
        }),
      };

      mockedApiClient.getInstance.mockReturnValue(mockAxiosInstance as any);

      // Mock URL.createObjectURL
      const mockUrl = 'blob:http://localhost/test';
      global.URL.createObjectURL = jest.fn().mockReturnValue(mockUrl);

      const result = await filesService.getDownloadUrl(uid);

      expect(result).toBe(mockUrl);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });
  });

  describe('downloadFile', () => {
    it('should trigger browser download', async () => {
      const uid = 'file-123';
      const mockBlob = new Blob(['test content']);

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: mockBlob,
        }),
      };

      mockedApiClient.getInstance.mockReturnValue(mockAxiosInstance as any);

      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
      global.URL.revokeObjectURL = jest.fn();
      document.createElement = jest.fn().mockReturnValue(mockLink as any);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();

      await filesService.downloadFile(uid);

      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete file', async () => {
      const uid = 'file-123';

      mockedApiClient.delete.mockResolvedValue({
        success: true,
        data: null,
        message: 'File deleted',
      });

      await filesService.delete(uid);

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        expect.stringContaining(uid)
      );
    });

    it('should delete file with source parameter', async () => {
      const uid = 'file-123';
      const source = 'analysed';

      mockedApiClient.delete.mockResolvedValue({
        success: true,
        data: null,
        message: 'File deleted',
      });

      await filesService.delete(uid, source);

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        expect.stringContaining('source=analysed')
      );
    });
  });
});
