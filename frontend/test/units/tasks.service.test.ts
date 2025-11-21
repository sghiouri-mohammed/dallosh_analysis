/**
 * Unit tests for Tasks Service
 */
import { tasksService } from '@/services/tasks';
import apiClient from '@/services/client';
import { Client } from '@stomp/stompjs';
import { env } from '@/configs/env';

// Mock dependencies
jest.mock('@/services/client');
jest.mock('@stomp/stompjs');
jest.mock('@/configs/env', () => ({
  env: {
    RABBITMQ_URL: 'ws://localhost:15674/ws',
    RABBITMQ_TOPIC_TASKS: 'tasks',
    NODE_ENV: 'test',
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const MockedClient = Client as jest.MockedClass<typeof Client>;

describe('TasksService', () => {
  let mockClientInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Client instance
    mockClientInstance = {
      activate: jest.fn(),
      deactivate: jest.fn(),
      subscribe: jest.fn(),
      connected: true,
    };

    MockedClient.mockImplementation(() => mockClientInstance as any);

    // Reset service state
    (tasksService as any).client = null;
    (tasksService as any).isConnected = false;
    (tasksService as any).subscriptions = new Map();
    (tasksService as any).eventCallbacks = new Map();
    (tasksService as any).progressionCallbacks = new Map();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        file_id: 'file-123',
        file_path: '/path/to/file.csv',
      };

      const mockResponse = {
        success: true,
        data: {
          uid: 'task-123',
          data: taskData,
        },
        message: 'Task created',
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await tasksService.create(taskData);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        taskData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('findAll', () => {
    it('should get all tasks', async () => {
      const mockTasks = [
        {
          uid: 'task-1',
          data: { file_id: 'file-1', file_path: '/path/to/file1.csv' },
        },
      ];

      const mockResponse = {
        success: true,
        data: mockTasks,
        message: 'Tasks retrieved',
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await tasksService.findAll();

      expect(mockedApiClient.get).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });

    it('should get tasks with filter and options', async () => {
      const filter = { 'data.status': 'in_queue' };
      const options = { limit: 10, skip: 0 };

      mockedApiClient.get.mockResolvedValue({
        success: true,
        data: [],
        message: 'Tasks retrieved',
      });

      await tasksService.findAll(filter, options);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter=')
      );
    });
  });

  describe('findOne', () => {
    it('should get task by id', async () => {
      const uid = 'task-123';
      const mockTask = {
        uid,
        data: { file_id: 'file-123', file_path: '/path/to/file.csv' },
      };

      const mockResponse = {
        success: true,
        data: mockTask,
        message: 'Task retrieved',
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await tasksService.findOne(uid);

      expect(mockedApiClient.get).toHaveBeenCalledWith(expect.stringContaining(uid));
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update task', async () => {
      const uid = 'task-123';
      const updates = { status: 'in_queue' };

      const mockResponse = {
        success: true,
        data: { uid, data: updates },
        message: 'Task updated',
      };

      mockedApiClient.patch.mockResolvedValue(mockResponse);

      const result = await tasksService.update(uid, updates);

      expect(mockedApiClient.patch).toHaveBeenCalledWith(
        expect.stringContaining(uid),
        updates
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('should delete task', async () => {
      const uid = 'task-123';

      mockedApiClient.delete.mockResolvedValue({
        success: true,
        data: null,
        message: 'Task deleted',
      });

      await tasksService.delete(uid);

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        expect.stringContaining(uid)
      );
    });
  });

  describe('proceed', () => {
    it('should proceed task', async () => {
      const data = {
        fileId: 'file-123',
        filePath: '/path/to/file.csv',
      };

      mockedApiClient.post.mockResolvedValue({
        success: true,
        data: null,
        message: 'Task started',
      });

      await tasksService.proceed(data);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        data
      );
    });
  });

  describe('retry', () => {
    it('should retry task', async () => {
      const data = {
        fileId: 'file-123',
        filePath: '/path/to/file.csv',
        lastEventStep: 'on_error',
      };

      mockedApiClient.post.mockResolvedValue({
        success: true,
        data: null,
        message: 'Task retry initiated',
      });

      await tasksService.retry(data);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        data
      );
    });
  });

  describe('handleProcess', () => {
    it('should handle process event', async () => {
      const data = {
        fileId: 'file-123',
        event: 'pause' as const,
      };

      mockedApiClient.post.mockResolvedValue({
        success: true,
        data: null,
        message: 'Process handled',
      });

      await tasksService.handleProcess(data);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        data
      );
    });
  });

  describe('restart', () => {
    it('should restart task', async () => {
      const fileId = 'file-123';

      const mockResponse = {
        success: true,
        data: {
          uid: 'task-123',
          data: { file_id: fileId },
        },
        message: 'Task restarted',
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await tasksService.restart(fileId);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        { fileId }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteWithFiles', () => {
    it('should delete task with files', async () => {
      const fileId = 'file-123';

      mockedApiClient.post.mockResolvedValue({
        success: true,
        data: null,
        message: 'Task deleted',
      });

      await tasksService.deleteWithFiles(fileId);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        { fileId }
      );
    });
  });

  describe('RabbitMQ event listeners', () => {
    it('should connect to RabbitMQ', async () => {
      // Mock WebSocket
      global.WebSocket = jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
      })) as any;

      // Mock client connection
      mockClientInstance.connected = true;

      await (tasksService as any).connect();

      expect(MockedClient).toHaveBeenCalled();
    });

    it('should register event callback', async () => {
      const fileId = 'file-123';
      const callback = jest.fn();

      mockClientInstance.connected = true;
      (tasksService as any).client = mockClientInstance;
      (tasksService as any).isConnected = true;

      await tasksService.onTaskEvent(fileId, callback);

      const callbacks = (tasksService as any).eventCallbacks.get(fileId);
      expect(callbacks).toContain(callback);
    });

    it('should remove event callback', () => {
      const fileId = 'file-123';
      const callback = jest.fn();

      (tasksService as any).eventCallbacks.set(fileId, [callback]);

      tasksService.offTaskEvent(fileId, callback);

      const callbacks = (tasksService as any).eventCallbacks.get(fileId);
      expect(callbacks).not.toContain(callback);
    });

    it('should disconnect from RabbitMQ', async () => {
      const mockSubscription = {
        unsubscribe: jest.fn(),
      };

      (tasksService as any).subscriptions.set('test', mockSubscription);
      (tasksService as any).client = mockClientInstance;

      await tasksService.disconnect();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockClientInstance.deactivate).toHaveBeenCalled();
    });
  });
});

