import { Response } from 'express';
import { BaseController } from '@common/controllers/BaseController';
import { LogsService } from './service';
import { AuthRequest } from '@common/middleware/auth';

export class LogsController extends BaseController {
  private logsService: LogsService;

  constructor(db: any) {
    super(db);
    this.logsService = new LogsService(db);
  }

  findAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};
      const options = {
        sort: req.query.sort ? JSON.parse(req.query.sort as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        skip: req.query.skip ? parseInt(req.query.skip as string) : undefined,
      };

      const logs = await this.logsService.findAll(filter, options);
      this.success(res, logs, 'Logs retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  findOne = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const log = await this.logsService.findOne(uid);

      if (!log) {
        this.error(res, 'Log not found', 404);
        return;
      }

      this.success(res, log, 'Log retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const deleted = await this.logsService.delete(uid);

      if (!deleted) {
        this.error(res, 'Log not found', 404);
        return;
      }

      this.success(res, null, 'Log deleted successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };
}

