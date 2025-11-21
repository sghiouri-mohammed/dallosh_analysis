import { TasksController } from '@api/tasks/controller';
import { TasksService } from '@api/tasks/service';
import { AuthRequest } from '@common/middleware/auth';
import { Response } from 'express';
import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';
import { TASK_STATUS } from '@configs/constants';
import { Task, TaskData } from '@/types/schema/tasks.schema';

// Mock TasksService
jest.mock('@api/tasks/service');
const MockedTasksService = TasksService as jest.MockedClass<typeof TasksService>;

describe('TasksController', () => {
  let tasksController: TasksController;
  let mockDb: jest.Mocked<DatabaseAdapter>;
  let mockTasksService: jest.Mocked<TasksService>;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

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

    mockTasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      proceedTask: jest.fn(),
      retryStep: jest.fn(),
      handleProcess: jest.fn(),
      restartTask: jest.fn(),
      deleteTaskWithFiles: jest.fn(),
    } as any;

    MockedTasksService.mockImplementation(() => mockTasksService);

    tasksController = new TasksController(mockDb);

    mockReq = {
      user: {
        uid: 'user-123',
        email: 'test@example.com',
      },
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const taskData: TaskData = {
        file_id: 'file-123',
        file_path: '/path/to/file.csv',
        status: TASK_STATUS.ADDED,
        file_cleaned: { path: null, type: null },
        file_analysed: { path: null, type: null },
      };

      const mockTask: Task = {
        uid: 'task-123',
        data: taskData,
        createdAt: new Date(),
        createdBy: 'user-123',
        updatedAt: new Date(),
        updatedBy: 'user-123',
      };

      mockReq.body = taskData;
      mockTasksService.create.mockResolvedValue(mockTask);

      await tasksController.create(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.create).toHaveBeenCalledWith(taskData, 'user-123');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Task created successfully',
          data: mockTask,
        })
      );
    });

    it('should handle errors when creating task', async () => {
      const error = new Error('Database error');
      mockReq.body = { file_id: 'file-123' };
      mockTasksService.create.mockRejectedValue(error);

      await tasksController.create(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const mockTasks: Task[] = [
        {
          uid: 'task-1',
          data: {
            file_id: 'file-1',
            file_path: '/path/to/file1.csv',
            status: TASK_STATUS.ADDED,
            file_cleaned: { path: null, type: null },
            file_analysed: { path: null, type: null },
          },
          createdAt: new Date(),
          createdBy: 'system',
          updatedAt: new Date(),
          updatedBy: 'system',
        },
      ];

      mockReq.query = {};
      mockTasksService.findAll.mockResolvedValue(mockTasks);

      await tasksController.findAll(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.findAll).toHaveBeenCalledWith({}, {});
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTasks,
        })
      );
    });

    it('should handle query parameters', async () => {
      const filter = { 'data.status': TASK_STATUS.IN_QUEUE };
      const sort = { createdAt: -1 };
      const limit = 10;
      const skip = 0;

      mockReq.query = {
        filter: JSON.stringify(filter),
        sort: JSON.stringify(sort),
        limit: limit.toString(),
        skip: skip.toString(),
      };

      mockTasksService.findAll.mockResolvedValue([]);

      await tasksController.findAll(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.findAll).toHaveBeenCalledWith(filter, {
        sort,
        limit,
        skip,
      });
    });

    it('should handle invalid JSON in query parameters', async () => {
      mockReq.query = {
        filter: 'invalid-json',
      };

      await tasksController.findAll(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('findOne', () => {
    it('should return task by uid', async () => {
      const uid = 'task-123';
      const mockTask: Task = {
        uid,
        data: {
          file_id: 'file-123',
          file_path: '/path/to/file.csv',
          status: TASK_STATUS.ADDED,
          file_cleaned: { path: null, type: null },
          file_analysed: { path: null, type: null },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockReq.params = { uid };
      mockTasksService.findOne.mockResolvedValue(mockTask);

      await tasksController.findOne(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.findOne).toHaveBeenCalledWith(uid);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTask,
        })
      );
    });

    it('should return 404 if task not found', async () => {
      const uid = 'nonexistent';

      mockReq.params = { uid };
      mockTasksService.findOne.mockResolvedValue(null);

      await tasksController.findOne(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Task not found',
        })
      );
    });
  });

  describe('update', () => {
    it('should update task successfully', async () => {
      const uid = 'task-123';
      const updates = { status: TASK_STATUS.IN_QUEUE };

      const mockTask: Task = {
        uid,
        data: {
          file_id: 'file-123',
          file_path: '/path/to/file.csv',
          status: TASK_STATUS.IN_QUEUE,
          file_cleaned: { path: null, type: null },
          file_analysed: { path: null, type: null },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'user-123',
      };

      mockReq.params = { uid };
      mockReq.body = updates;
      mockTasksService.update.mockResolvedValue(mockTask);

      await tasksController.update(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.update).toHaveBeenCalledWith(uid, updates, 'user-123');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTask,
        })
      );
    });

    it('should return 404 if task not found', async () => {
      const uid = 'nonexistent';

      mockReq.params = { uid };
      mockReq.body = { status: TASK_STATUS.IN_QUEUE };
      mockTasksService.update.mockResolvedValue(null);

      await tasksController.update(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('delete', () => {
    it('should delete task successfully', async () => {
      const uid = 'task-123';

      mockReq.params = { uid };
      mockTasksService.delete.mockResolvedValue(true);

      await tasksController.delete(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.delete).toHaveBeenCalledWith(uid);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Task deleted successfully',
        })
      );
    });

    it('should return 404 if task not found', async () => {
      const uid = 'nonexistent';

      mockReq.params = { uid };
      mockTasksService.delete.mockResolvedValue(false);

      await tasksController.delete(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('proceed', () => {
    it('should proceed task successfully', async () => {
      const fileId = 'file-123';
      const filePath = '/path/to/file.csv';

      mockReq.body = { fileId, filePath };
      mockTasksService.proceedTask.mockResolvedValue();

      await tasksController.proceed(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.proceedTask).toHaveBeenCalledWith(fileId, filePath);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Task started successfully',
        })
      );
    });

    it('should return 400 if fileId or filePath is missing', async () => {
      mockReq.body = { fileId: 'file-123' };

      await tasksController.proceed(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'fileId and filePath are required',
        })
      );
    });
  });

  describe('retry', () => {
    it('should retry task step successfully', async () => {
      const fileId = 'file-123';
      const filePath = '/path/to/file.csv';
      const lastEventStep = TASK_STATUS.ON_ERROR;

      mockReq.body = { fileId, filePath, lastEventStep };
      mockTasksService.retryStep.mockResolvedValue();

      await tasksController.retry(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.retryStep).toHaveBeenCalledWith(
        fileId,
        filePath,
        lastEventStep
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Task retry initiated successfully',
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      mockReq.body = { fileId: 'file-123' };

      await tasksController.retry(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('handleProcess', () => {
    it('should handle process event successfully', async () => {
      const fileId = 'file-123';
      const event = 'pause';

      mockReq.body = { fileId, event };
      mockTasksService.handleProcess.mockResolvedValue();

      await tasksController.handleProcess(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.handleProcess).toHaveBeenCalledWith(fileId, event);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Process handled successfully',
        })
      );
    });

    it('should return 400 if event is invalid', async () => {
      const fileId = 'file-123';
      const event = 'invalid';

      mockReq.body = { fileId, event };

      await tasksController.handleProcess(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Event must be pause, resume, or stop',
        })
      );
    });
  });

  describe('restart', () => {
    it('should restart task successfully', async () => {
      const fileId = 'file-123';

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
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockReq.body = { fileId };
      mockTasksService.restartTask.mockResolvedValue(mockTask);

      await tasksController.restart(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.restartTask).toHaveBeenCalledWith(fileId);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTask,
        })
      );
    });

    it('should return 400 if fileId is missing', async () => {
      mockReq.body = {};

      await tasksController.restart(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteWithFiles', () => {
    it('should delete task with files successfully', async () => {
      const fileId = 'file-123';

      mockReq.body = { fileId };
      mockTasksService.deleteTaskWithFiles.mockResolvedValue(true);

      await tasksController.deleteWithFiles(mockReq as AuthRequest, mockRes as Response);

      expect(mockTasksService.deleteTaskWithFiles).toHaveBeenCalledWith(fileId);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Task and associated files deleted successfully',
        })
      );
    });

    it('should return 404 if task not found', async () => {
      const fileId = 'nonexistent';

      mockReq.body = { fileId };
      mockTasksService.deleteTaskWithFiles.mockResolvedValue(false);

      await tasksController.deleteWithFiles(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});

