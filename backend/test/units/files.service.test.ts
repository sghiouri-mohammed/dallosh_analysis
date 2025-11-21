import { FilesService } from '@api/files/service';
import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';
import { COLLECTIONS, TASK_STATUS } from '@configs/constants';
import { File, FileData } from '@/types/schema/files.schema';
import { Task } from '@/types/schema/tasks.schema';
import * as fs from 'fs/promises';
import * as path from 'path';
import amqp from 'amqplib';

// Mock dependencies
jest.mock('fs/promises');
jest.mock('amqplib');
const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedAmqp = amqp as jest.Mocked<typeof amqp>;

describe('FilesService', () => {
  let filesService: FilesService;
  let mockDb: jest.Mocked<DatabaseAdapter>;
  let mockChannel: any;
  let mockConnection: any;

  beforeEach(() => {
    mockDb = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findMany: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      insertMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      createCollection: jest.fn(),
      collectionExists: jest.fn(),
    } as any;

    mockChannel = {
      publish: jest.fn(),
      assertExchange: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    };

    mockedAmqp.connect.mockResolvedValue(mockConnection as any);
    mockedFs.mkdir.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
    mockedFs.access.mockResolvedValue(undefined);
    mockedFs.unlink.mockResolvedValue(undefined);

    filesService = new FilesService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should upload a file successfully', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        size: 1024,
        buffer: Buffer.from('test content'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const createdBy = 'user-123';
      const fileId = 'file-123';

      const mockFileDoc: File = {
        uid: fileId,
        data: {
          filename: mockFile.originalname,
          size: mockFile.size,
          file_path: '/path/to/file.csv',
          extension: '.csv',
          type: mockFile.mimetype,
        },
        createdAt: new Date(),
        createdBy,
        updatedAt: new Date(),
        updatedBy: createdBy,
      };

      const mockTask: Task = {
        uid: 'task-123',
        data: {
          file_id: fileId,
          file_path: '/path/to/file.csv',
          status: TASK_STATUS.ADDED,
          file_cleaned: { path: null, type: null },
          file_analysed: { path: null, type: null },
        },
        createdAt: new Date(),
        createdBy,
        updatedAt: new Date(),
        updatedBy: createdBy,
      };

      mockDb.insertOne
        .mockResolvedValueOnce(mockFileDoc)
        .mockResolvedValueOnce(mockTask);
      mockDb.findOne.mockResolvedValue(mockTask);

      const result = await filesService.upload(mockFile, createdBy);

      expect(mockedFs.mkdir).toHaveBeenCalled();
      expect(mockedFs.writeFile).toHaveBeenCalled();
      expect(mockDb.insertOne).toHaveBeenCalledTimes(2); // File and Task
      expect(result).toBeDefined();
      expect(result.data.filename).toBe(mockFile.originalname);
    });

    it('should create task when uploading file', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        size: 1024,
        buffer: Buffer.from('test content'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const mockFileDoc: File = {
        uid: 'file-123',
        data: {
          filename: mockFile.originalname,
          size: mockFile.size,
          file_path: '/path/to/file.csv',
          extension: '.csv',
          type: mockFile.mimetype,
        },
        createdAt: new Date(),
        createdBy: 'user-123',
        updatedAt: new Date(),
        updatedBy: 'user-123',
      };

      const mockTask: Task = {
        uid: 'task-123',
        data: {
          file_id: 'file-123',
          file_path: '/path/to/file.csv',
          status: TASK_STATUS.ADDED,
          file_cleaned: { path: null, type: null },
          file_analysed: { path: null, type: null },
        },
        createdAt: new Date(),
        createdBy: 'user-123',
        updatedAt: new Date(),
        updatedBy: 'user-123',
      };

      mockDb.insertOne
        .mockResolvedValueOnce(mockFileDoc)
        .mockResolvedValueOnce(mockTask);
      mockDb.findOne.mockResolvedValue(mockTask);

      await filesService.upload(mockFile, 'user-123');

      expect(mockDb.insertOne).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.objectContaining({
          data: expect.objectContaining({
            status: TASK_STATUS.ADDED,
          }),
        })
      );
    });
  });

  describe('findAll', () => {
    it('should return all files', async () => {
      const mockFiles: File[] = [
        {
          uid: 'file-1',
          data: {
            filename: 'file1.csv',
            size: 1024,
            file_path: '/path/to/file1.csv',
            extension: '.csv',
            type: 'text/csv',
          },
          createdAt: new Date(),
          createdBy: 'system',
          updatedAt: new Date(),
          updatedBy: 'system',
        },
      ];

      mockDb.findMany.mockResolvedValue(mockFiles);

      const result = await filesService.findAll();

      expect(mockDb.findMany).toHaveBeenCalledWith(COLLECTIONS.FILES, {}, {});
      expect(result).toEqual(mockFiles);
    });
  });

  describe('findOne', () => {
    it('should return file by uid', async () => {
      const uid = 'file-123';
      const mockFile: File = {
        uid,
        data: {
          filename: 'test.csv',
          size: 1024,
          file_path: '/path/to/file.csv',
          extension: '.csv',
          type: 'text/csv',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockFile);

      const result = await filesService.findOne(uid);

      expect(mockDb.findOne).toHaveBeenCalledWith(COLLECTIONS.FILES, { uid });
      expect(result).toEqual(mockFile);
    });

    it('should return null if file not found', async () => {
      const uid = 'nonexistent';

      mockDb.findOne.mockResolvedValue(null);

      const result = await filesService.findOne(uid);

      expect(result).toBeNull();
    });
  });

  describe('download', () => {
    it('should download analysed file', async () => {
      const uid = 'file-123';
      const source = 'analysed';

      const mockTask: Task = {
        uid: 'task-123',
        data: {
          file_id: uid,
          file_path: '/path/to/file.csv',
          status: TASK_STATUS.COMPLETED,
          file_cleaned: { path: '/path/to/cleaned.csv', type: 'csv' },
          file_analysed: { path: '/path/to/analysed.csv', type: 'csv' },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      const mockFile: File = {
        uid,
        data: {
          filename: 'test.csv',
          size: 1024,
          file_path: '/path/to/file.csv',
          extension: '.csv',
          type: 'text/csv',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(mockFile);

      const result = await filesService.download(uid, source);

      expect(result).toBeDefined();
      expect(result?.filename).toContain('analysed');
      expect(result?.mimeType).toBe('text/csv');
    });

    it('should return null if task not found', async () => {
      const uid = 'nonexistent';

      mockDb.findOne.mockResolvedValue(null);

      const result = await filesService.download(uid, 'analysed');

      expect(result).toBeNull();
    });

    it('should download dataset file', async () => {
      const uid = 'file-123';

      const mockFile: File = {
        uid,
        data: {
          filename: 'test.csv',
          size: 1024,
          file_path: '/path/to/file.csv',
          extension: '.csv',
          type: 'text/csv',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockFile);

      const result = await filesService.download(uid, 'datasets');

      expect(result).toBeDefined();
      expect(result?.filename).toBe(mockFile.data.filename);
    });
  });

  describe('delete', () => {
    it('should delete analysed file', async () => {
      const uid = 'file-123';
      const source = 'analysed';

      const mockTask: Task = {
        uid: 'task-123',
        data: {
          file_id: uid,
          file_path: '/path/to/file.csv',
          status: TASK_STATUS.COMPLETED,
          file_cleaned: { path: null, type: null },
          file_analysed: { path: '/path/to/analysed.csv', type: 'csv' },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockTask);
      mockDb.updateOne.mockResolvedValue({} as any);

      const result = await filesService.delete(uid, source);

      expect(mockedFs.unlink).toHaveBeenCalled();
      expect(mockDb.updateOne).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should delete dataset file', async () => {
      const uid = 'file-123';

      const mockFile: File = {
        uid,
        data: {
          filename: 'test.csv',
          size: 1024,
          file_path: '/path/to/file.csv',
          extension: '.csv',
          type: 'text/csv',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockFile);
      mockDb.updateOne.mockResolvedValue({} as any);
      mockDb.deleteOne.mockResolvedValue(true);

      const result = await filesService.delete(uid, 'datasets');

      expect(mockedFs.unlink).toHaveBeenCalled();
      expect(mockDb.deleteOne).toHaveBeenCalledWith(COLLECTIONS.FILES, { uid });
      expect(result).toBe(true);
    });

    it('should return false if task not found for cleaned/analysed', async () => {
      const uid = 'nonexistent';

      mockDb.findOne.mockResolvedValue(null);

      const result = await filesService.delete(uid, 'analysed');

      expect(result).toBe(false);
    });
  });
});

