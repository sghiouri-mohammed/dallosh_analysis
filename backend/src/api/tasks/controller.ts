import { Response } from 'express';
import { BaseController } from '@common/controllers/BaseController';
import { TasksService } from './service';
import { AuthRequest } from '@common/middleware/auth';
import { TaskStatus } from '@/types/schema/tasks.schema';

export class TasksController extends BaseController {
  private tasksService: TasksService;

  constructor(db: any) {
    super(db);
    this.tasksService = new TasksService(db);
  }

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const taskData = req.body;
      const createdBy = req.user?.uid || 'system';

      const task = await this.tasksService.create(taskData, createdBy);
      this.success(res, task, 'Task created successfully', 201);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  findAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};
      const options = {
        sort: req.query.sort ? JSON.parse(req.query.sort as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        skip: req.query.skip ? parseInt(req.query.skip as string) : undefined,
      };

      const tasks = await this.tasksService.findAll(filter, options);
      this.success(res, tasks, 'Tasks retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  findOne = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const task = await this.tasksService.findOne(uid);

      if (!task) {
        this.error(res, 'Task not found', 404);
        return;
      }

      this.success(res, task, 'Task retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const updates = req.body;
      const updatedBy = req.user?.uid || 'system';

      const task = await this.tasksService.update(uid, updates, updatedBy);
      if (!task) {
        this.error(res, 'Task not found', 404);
        return;
      }

      this.success(res, task, 'Task updated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const deleted = await this.tasksService.delete(uid);

      if (!deleted) {
        this.error(res, 'Task not found', 404);
        return;
      }

      this.success(res, null, 'Task deleted successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  proceed = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileId } = req.body;
      const { filePath } = req.body;

      if (!fileId || !filePath) {
        this.error(res, 'fileId and filePath are required', 400);
        return;
      }

      await this.tasksService.proceedTask(fileId, filePath);
      this.success(res, null, 'Task started successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  retry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileId, filePath, lastEventStep } = req.body;

      if (!fileId || !filePath || !lastEventStep) {
        this.error(res, 'fileId, filePath, and lastEventStep are required', 400);
        return;
      }

      await this.tasksService.retryStep(fileId, filePath, lastEventStep as TaskStatus);
      this.success(res, null, 'Task retry initiated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  handleProcess = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileId, event } = req.body;

      if (!fileId || !event) {
        this.error(res, 'fileId and event are required', 400);
        return;
      }

      if (!['pause', 'resume', 'stop'].includes(event)) {
        this.error(res, 'Event must be pause, resume, or stop', 400);
        return;
      }

      await this.tasksService.handleProcess(fileId, event);
      this.success(res, null, 'Process handled successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  restart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileId } = req.body;

      if (!fileId) {
        this.error(res, 'fileId is required', 400);
        return;
      }

      const task = await this.tasksService.restartTask(fileId);
      if (!task) {
        this.error(res, 'Task not found', 404);
        return;
      }

      this.success(res, task, 'Task restarted successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  deleteWithFiles = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileId } = req.body;

      if (!fileId) {
        this.error(res, 'fileId is required', 400);
        return;
      }

      const deleted = await this.tasksService.deleteTaskWithFiles(fileId);
      if (!deleted) {
        this.error(res, 'Task not found', 404);
        return;
      }

      this.success(res, null, 'Task and associated files deleted successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };
}

