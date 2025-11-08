import { Response } from 'express';
import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';

export abstract class BaseController {
  protected db: DatabaseAdapter;

  constructor(db: DatabaseAdapter) {
    this.db = db;
  }

  protected success(res: Response, data: any, message?: string, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      message: message || 'Operation successful',
      data,
    });
  }

  protected error(res: Response, message: string, statusCode: number = 400, error?: any): void {
    res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error,
    });
  }

  protected handleError(error: any, res: Response): void {
    console.error('Controller error:', error);
    this.error(res, error.message || 'Internal server error', 500, error);
  }
}

