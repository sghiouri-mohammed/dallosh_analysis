import { Response } from 'express';
import { BaseController } from '@common/controllers/BaseController';
import { UsersService } from './service';
import { AuthRequest } from '@common/middleware/auth';

export class UsersController extends BaseController {
  private usersService: UsersService;

  constructor(db: any) {
    super(db);
    this.usersService = new UsersService(db);
  }

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const createdBy = req.user?.uid || 'system';

      const user = await this.usersService.create(userData, createdBy);
      const { password, ...userDataWithoutPassword } = user.data;
      this.success(res, { ...user, data: userDataWithoutPassword }, 'User created successfully', 201);
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

      const users = await this.usersService.findAll(filter, options);
      const usersWithoutPasswords = users.map((user) => {
        const { password, ...userData } = user.data;
        return { ...user, data: userData };
      });

      this.success(res, usersWithoutPasswords, 'Users retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  findOne = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const user = await this.usersService.findOne(uid);

      if (!user) {
        this.error(res, 'User not found', 404);
        return;
      }

      const { password, ...userData } = user.data;
      this.success(res, { ...user, data: userData }, 'User retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const updates = req.body;
      const updatedBy = req.user?.uid || 'system';

      const user = await this.usersService.update(uid, updates, updatedBy);
      if (!user) {
        this.error(res, 'User not found', 404);
        return;
      }

      const { password, ...userData } = user.data;
      this.success(res, { ...user, data: userData }, 'User updated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const deleted = await this.usersService.delete(uid);

      if (!deleted) {
        this.error(res, 'User not found', 404);
        return;
      }

      this.success(res, null, 'User deleted successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };
}

