import apiClient from './client';
import { API_ENDPOINTS, TASK_EVENTS } from '@/configs/constant';
import { env } from '@/configs/env';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProceedTaskRequest,
  RetryTaskRequest,
  HandleProcessRequest,
  TaskEventMessage,
  TaskProgressionEventMessage,
  TaskEventCallback,
  TaskProgressionEventCallback,
} from '@/types';

// Lazy import amqplib only when needed (server-side only)
let amqp: typeof import('amqplib') | null = null;
const getAmqp = async () => {
  if (typeof window === 'undefined' && !amqp) {
    amqp = await import('amqplib');
  }
  return amqp;
};

/**
 * Tasks Service
 * Handles task management API calls and RabbitMQ event listeners
 * 
 * Note: RabbitMQ connections (amqplib) work in server-side contexts only:
 * - Next.js API routes
 * - Server Components
 * - getServerSideProps / getStaticProps
 * 
 * For client-side components, create API routes that use this service
 * and expose events via Server-Sent Events (SSE) or WebSockets.
 */
class TasksService {
  private connection: any = null;
  private channel: any = null;
  private eventCallbacks: Map<string, TaskEventCallback[]> = new Map();
  private progressionCallbacks: Map<string, TaskProgressionEventCallback[]> = new Map();
  private isConnected: boolean = false;

  /**
   * Initialize RabbitMQ connection
   */
  private async connect(): Promise<void> {
    // Only connect in server-side environments
    if (typeof window !== 'undefined') {
      console.warn('RabbitMQ connections are only available server-side. Use API routes for client-side event listening.');
      return;
    }

    if (this.isConnected && this.connection && this.channel) {
      return;
    }

    try {
      const amqpLib = await getAmqp();
      if (!amqpLib) {
        throw new Error('amqplib is not available in this environment');
      }
      
      this.connection = await amqpLib.connect(env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Assert exchange for tasks
      await this.channel.assertExchange(env.RABBITMQ_TOPIC_TASKS, 'topic', {
        durable: true,
      });

      // Assert queue for task events
      const queue = await this.channel.assertQueue('', {
        exclusive: true,
      });

      // Bind queue to exchange for all task events
      await this.channel.bindQueue(queue.queue, env.RABBITMQ_TOPIC_TASKS, '#');

      // Consume messages
      await this.channel.consume(queue.queue, (msg) => {
        if (msg) {
          try {
            const message: TaskEventMessage | TaskProgressionEventMessage = JSON.parse(
              msg.content.toString()
            );

            // Handle progression events
            if (message.event === TASK_EVENTS.SENDING_TO_LLM_PROGRESSION) {
              const progressionMessage = message as TaskProgressionEventMessage;
              this.handleProgressionEvent(progressionMessage);
            } else {
              // Handle regular events
              this.handleEvent(message as TaskEventMessage);
            }

            this.channel?.ack(msg);
          } catch (error) {
            console.error('Error processing RabbitMQ message:', error);
            this.channel?.nack(msg, false, false);
          }
        }
      });

      this.isConnected = true;
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.isConnected = false;
    }
  }

  /**
   * Handle task event
   */
  private handleEvent(message: TaskEventMessage): void {
    const callbacks = this.eventCallbacks.get(message.file_id) || [];
    callbacks.forEach((callback) => callback(message));

    // Also call global callbacks
    const globalCallbacks = this.eventCallbacks.get('*') || [];
    globalCallbacks.forEach((callback) => callback(message));
  }

  /**
   * Handle task progression event
   */
  private handleProgressionEvent(message: TaskProgressionEventMessage): void {
    const callbacks = this.progressionCallbacks.get(message.file_id) || [];
    callbacks.forEach((callback) => callback(message));

    // Also call global callbacks
    const globalCallbacks = this.progressionCallbacks.get('*') || [];
    globalCallbacks.forEach((callback) => callback(message));
  }

  /**
   * Listen to task events for a specific file
   */
  async onTaskEvent(fileId: string, callback: TaskEventCallback): Promise<void> {
    await this.connect();
    
    if (!this.eventCallbacks.has(fileId)) {
      this.eventCallbacks.set(fileId, []);
    }
    this.eventCallbacks.get(fileId)!.push(callback);
  }

  /**
   * Listen to task progression events for a specific file
   */
  async onTaskProgression(
    fileId: string,
    callback: TaskProgressionEventCallback
  ): Promise<void> {
    await this.connect();
    
    if (!this.progressionCallbacks.has(fileId)) {
      this.progressionCallbacks.set(fileId, []);
    }
    this.progressionCallbacks.get(fileId)!.push(callback);
  }

  /**
   * Listen to all task events
   */
  async onAllTaskEvents(callback: TaskEventCallback): Promise<void> {
    await this.connect();
    
    if (!this.eventCallbacks.has('*')) {
      this.eventCallbacks.set('*', []);
    }
    this.eventCallbacks.get('*')!.push(callback);
  }

  /**
   * Remove event listener
   */
  offTaskEvent(fileId: string, callback?: TaskEventCallback): void {
    if (!callback) {
      this.eventCallbacks.delete(fileId);
      return;
    }

    const callbacks = this.eventCallbacks.get(fileId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Remove progression event listener
   */
  offTaskProgression(fileId: string, callback?: TaskProgressionEventCallback): void {
    if (!callback) {
      this.progressionCallbacks.delete(fileId);
      return;
    }

    const callbacks = this.progressionCallbacks.get(fileId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    this.isConnected = false;
    this.eventCallbacks.clear();
    this.progressionCallbacks.clear();
  }

  /**
   * Create a new task
   */
  async create(data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<{ success: boolean; data: Task; message: string }>(
      API_ENDPOINTS.TASKS.BASE,
      data
    );
    return response.data;
  }

  /**
   * Get all tasks
   */
  async findAll(filter?: Record<string, any>, options?: {
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
  }): Promise<Task[]> {
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

    const response = await apiClient.get<{ success: boolean; data: Task[]; message: string }>(
      `${API_ENDPOINTS.TASKS.BASE}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get task by ID
   */
  async findOne(uid: string): Promise<Task> {
    const response = await apiClient.get<{ success: boolean; data: Task; message: string }>(
      API_ENDPOINTS.TASKS.BY_ID(uid)
    );
    return response.data;
  }

  /**
   * Update task
   */
  async update(uid: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.patch<{ success: boolean; data: Task; message: string }>(
      API_ENDPOINTS.TASKS.BY_ID(uid),
      data
    );
    return response.data;
  }

  /**
   * Delete task
   */
  async delete(uid: string): Promise<void> {
    await apiClient.delete<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.BY_ID(uid)
    );
  }

  /**
   * Proceed with task processing
   */
  async proceed(data: ProceedTaskRequest): Promise<void> {
    await apiClient.post<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.PROCEED,
      data
    );
  }

  /**
   * Retry task from a specific step
   */
  async retry(data: RetryTaskRequest): Promise<void> {
    await apiClient.post<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.RETRY,
      data
    );
  }

  /**
   * Handle process (pause/resume/stop)
   */
  async handleProcess(data: HandleProcessRequest): Promise<void> {
    await apiClient.post<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.HANDLE_PROCESS,
      data
    );
  }

  /**
   * Restart task (delete cleaned/analysed files and reset to 'added' status)
   */
  async restart(fileId: string): Promise<Task> {
    const response = await apiClient.post<{ success: boolean; data: Task; message: string }>(
      API_ENDPOINTS.TASKS.RESTART,
      { fileId }
    );
    return response.data;
  }

  /**
   * Delete task with associated files
   */
  async deleteWithFiles(fileId: string): Promise<void> {
    await apiClient.post<{ success: boolean; data: null; message: string }>(
      API_ENDPOINTS.TASKS.DELETE_WITH_FILES,
      { fileId }
    );
  }
}

export const tasksService = new TasksService();

