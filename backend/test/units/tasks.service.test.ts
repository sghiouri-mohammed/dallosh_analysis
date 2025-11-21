import { TasksService } from '@api/tasks/service';
import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';
import { COLLECTIONS, TASK_STATUS, RABBITMQ_EVENTS } from '@configs/constants';
import { Task, TaskData } from '@/types/schema/tasks.schema';
import { Settings } from '@/types/schema/settings.schema';
import amqp from 'amqplib';

// Mock amqplib
jest.mock('amqplib');
const mockedAmqp = amqp as jest.Mocked<typeof amqp>;

describe('TasksService', () => {
  let tasksService: TasksService;
  let mockDb: jest.Mocked<DatabaseAdapter>;
  let mockChannel: any;
  let mockConnection: any;

  beforeEach(() => {
    // Create mock database adapter
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

    // Create mock RabbitMQ channel and connection
    mockChannel = {
      publish: jest.fn(),
      assertExchange: jest.fn(),
      close: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn(),
    };

    mockedAmqp.connect.mockResolvedValue(mockConnection as any);

    tasksService = new TasksService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task successfully', async () => {
      const taskData: TaskData = {
        file_id: 'file-123',
        file_path: '/path/to/file.csv',
        status: TASK_STATUS.ADDED,
        file_cleaned: { path: null, type: null },
        file_analysed: { path: null, type: null },
      };
      const createdBy = 'user-123';

      const mockTask: Task = {
        uid: 'task-123',
        data: taskData,
        createdAt: new Date(),
        createdBy,
        updatedAt: new Date(),
        updatedBy: createdBy,
      };

      mockDb.insertOne.mockResolvedValue(mockTask);

      const result = await tasksService.create(taskData, createdBy);

      expect(mockDb.insertOne).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.objectContaining({
          data: expect.objectContaining({
            file_id: taskData.file_id,
            file_path: taskData.file_path,
          }),
          createdBy,
        })
      );
      expect(result).toBeDefined();
      expect(result.data.file_id).toBe(taskData.file_id);
    });

    it('should publish added event when creating task with file_id and file_path', async () => {
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

      mockDb.insertOne.mockResolvedValue(mockTask);

      await tasksService.create(taskData, 'user-123');

      // Connect to RabbitMQ should be called
      await tasksService.connectRabbitMQ();

      expect(mockChannel.publish).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tasks with default filter', async () => {
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

      mockDb.findMany.mockResolvedValue(mockTasks);

      const result = await tasksService.findAll();

      expect(mockDb.findMany).toHaveBeenCalledWith(COLLECTIONS.TASKS, {}, {});
      expect(result).toEqual(mockTasks);
    });

    it('should return filtered tasks', async () => {
      const filter = { 'data.status': TASK_STATUS.IN_QUEUE };
      const options = { limit: 10 };

      const mockTasks: Task[] = [];
      mockDb.findMany.mockResolvedValue(mockTasks);

      const result = await tasksService.findAll(filter, options);

      expect(mockDb.findMany).toHaveBeenCalledWith(COLLECTIONS.TASKS, filter, options);
      expect(result).toEqual(mockTasks);
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

      mockDb.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.findOne(uid);

      expect(mockDb.findOne).toHaveBeenCalledWith(COLLECTIONS.TASKS, { uid });
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      const uid = 'nonexistent';

      mockDb.findOne.mockResolvedValue(null);

      const result = await tasksService.findOne(uid);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update task', async () => {
      const uid = 'task-123';
      const updates: Partial<TaskData> = {
        status: TASK_STATUS.IN_QUEUE,
      };
      const updatedBy = 'user-123';

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
        updatedBy,
      };

      mockDb.updateOne.mockResolvedValue({} as any);
      mockDb.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.update(uid, updates, updatedBy);

      expect(mockDb.updateOne).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        { uid },
        expect.objectContaining({
          'data.status': updates.status,
          updatedAt: expect.any(Date),
          updatedBy,
        })
      );
      expect(result).toBeDefined();
      expect(result?.data.status).toBe(updates.status);
    });
  });

  describe('delete', () => {
    it('should delete task', async () => {
      const uid = 'task-123';

      mockDb.deleteOne.mockResolvedValue(true);

      const result = await tasksService.delete(uid);

      expect(mockDb.deleteOne).toHaveBeenCalledWith(COLLECTIONS.TASKS, { uid });
      expect(result).toBe(true);
    });

    it('should return false if task not found', async () => {
      const uid = 'nonexistent';

      mockDb.deleteOne.mockResolvedValue(false);

      const result = await tasksService.delete(uid);

      expect(result).toBe(false);
    });
  });

  describe('proceedTask', () => {
    it('should proceed task successfully', async () => {
      const fileId = 'file-123';
      const filePath = '/path/to/file.csv';

      const mockSettings: Settings = {
        uid: 'settings-123',
        data: {
          ai: {
            preferences: {},
            local: [],
            external: [],
          },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      const mockTask: Task = {
        uid: 'task-123',
        data: {
          file_id: fileId,
          file_path: filePath,
          status: TASK_STATUS.ADDED,
          file_cleaned: { path: null, type: null },
          file_analysed: { path: null, type: null },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne
        .mockResolvedValueOnce(mockSettings) // Settings query
        .mockResolvedValueOnce(mockTask); // Task query

      mockDb.updateOne.mockResolvedValue({} as any);

      await tasksService.connectRabbitMQ();

      await tasksService.proceedTask(fileId, filePath);

      expect(mockDb.findOne).toHaveBeenCalledWith(COLLECTIONS.SETTINGS, {});
      expect(mockDb.updateOne).toHaveBeenCalled();
      expect(mockChannel.publish).toHaveBeenCalledWith(
        expect.any(String),
        RABBITMQ_EVENTS.PROCEED_TASK,
        expect.any(Buffer),
        { persistent: true }
      );
    });

    it('should throw error if settings not found', async () => {
      const fileId = 'file-123';
      const filePath = '/path/to/file.csv';

      mockDb.findOne.mockResolvedValue(null);

      await expect(tasksService.proceedTask(fileId, filePath)).rejects.toThrow(
        'Settings not found'
      );
    });

    it('should throw error if AI settings not configured', async () => {
      const fileId = 'file-123';
      const filePath = '/path/to/file.csv';

      const mockSettings: Settings = {
        uid: 'settings-123',
        data: {},
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockSettings);

      await expect(tasksService.proceedTask(fileId, filePath)).rejects.toThrow(
        'AI settings not configured'
      );
    });

    it('should create task if it does not exist', async () => {
      const fileId = 'file-123';
      const filePath = '/path/to/file.csv';

      const mockSettings: Settings = {
        uid: 'settings-123',
        data: {
          ai: {
            preferences: {},
            local: [],
            external: [],
          },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne
        .mockResolvedValueOnce(mockSettings) // Settings query
        .mockResolvedValueOnce(null); // Task not found

      const mockTask: Task = {
        uid: 'task-123',
        data: {
          file_id: fileId,
          file_path: filePath,
          status: TASK_STATUS.ADDED,
          file_cleaned: { path: null, type: null },
          file_analysed: { path: null, type: null },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.insertOne.mockResolvedValue(mockTask);
      mockDb.updateOne.mockResolvedValue({} as any);

      await tasksService.connectRabbitMQ();

      await tasksService.proceedTask(fileId, filePath);

      expect(mockDb.insertOne).toHaveBeenCalled();
    });
  });

  describe('retryStep', () => {
    it('should retry task step successfully', async () => {
      const fileId = 'file-123';
      const filePath = '/path/to/file.csv';
      const lastEventStep = TASK_STATUS.ON_ERROR;

      const mockSettings: Settings = {
        uid: 'settings-123',
        data: {
          ai: {
            preferences: {},
            local: [],
            external: [],
          },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockSettings);

      await tasksService.connectRabbitMQ();

      await tasksService.retryStep(fileId, filePath, lastEventStep);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        expect.any(String),
        RABBITMQ_EVENTS.RETRY_STEP,
        expect.any(Buffer),
        { persistent: true }
      );
    });
  });

  describe('handleProcess', () => {
    it('should handle process event', async () => {
      const fileId = 'file-123';
      const event = 'pause';

      await tasksService.connectRabbitMQ();

      await tasksService.handleProcess(fileId, event);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        expect.any(String),
        RABBITMQ_EVENTS.HANDLE_PROCESS,
        expect.any(Buffer),
        { persistent: true }
      );
    });
  });

  describe('restartTask', () => {
    it('should restart task successfully', async () => {
      const fileId = 'file-123';

      const mockTask: Task = {
        uid: 'task-123',
        data: {
          file_id: fileId,
          file_path: '/path/to/file.csv',
          status: TASK_STATUS.ON_ERROR,
          file_cleaned: { path: '/path/to/cleaned.csv', type: 'csv' },
          file_analysed: { path: '/path/to/analysed.csv', type: 'csv' },
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockTask);
      mockDb.updateOne.mockResolvedValue({} as any);

      // Mock FilesService
      jest.doMock('../files/service', () => ({
        FilesService: jest.fn().mockImplementation(() => ({
          delete: jest.fn().mockResolvedValue(true),
        })),
      }));

      const result = await tasksService.restartTask(fileId);

      expect(mockDb.findOne).toHaveBeenCalledWith(COLLECTIONS.TASKS, {
        'data.file_id': fileId,
      });
      expect(result).toBeDefined();
    });

    it('should throw error if task not found', async () => {
      const fileId = 'nonexistent';

      mockDb.findOne.mockResolvedValue(null);

      await expect(tasksService.restartTask(fileId)).rejects.toThrow('Task not found');
    });
  });

  describe('deleteTaskWithFiles', () => {
    it('should delete task with files', async () => {
      const fileId = 'file-123';

      const mockTask: Task = {
        uid: 'task-123',
        data: {
          file_id: fileId,
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

      mockDb.findOne.mockResolvedValue(mockTask);
      mockDb.deleteOne.mockResolvedValue(true);

      // Mock FilesService
      jest.doMock('../files/service', () => ({
        FilesService: jest.fn().mockImplementation(() => ({
          delete: jest.fn().mockResolvedValue(true),
        })),
      }));

      const result = await tasksService.deleteTaskWithFiles(fileId);

      expect(result).toBe(true);
    });

    it('should return false if task not found', async () => {
      const fileId = 'nonexistent';

      mockDb.findOne.mockResolvedValue(null);

      const result = await tasksService.deleteTaskWithFiles(fileId);

      expect(result).toBe(false);
    });
  });

  describe('RabbitMQ connection', () => {
    it('should connect to RabbitMQ', async () => {
      await tasksService.connectRabbitMQ();

      expect(mockedAmqp.connect).toHaveBeenCalled();
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertExchange).toHaveBeenCalled();
    });

    it('should disconnect from RabbitMQ', async () => {
      await tasksService.connectRabbitMQ();
      await tasksService.disconnectRabbitMQ();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });
});

