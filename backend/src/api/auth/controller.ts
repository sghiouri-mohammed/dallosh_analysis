import { Response } from 'express';
import { BaseController } from '@common/controllers/BaseController';
import { AuthService } from './service';
import { AuthRequest } from '@common/middleware/auth';

export class AuthController extends BaseController {
  private authService: AuthService;

  constructor(db: any) {
    super(db);
    this.authService = new AuthService(db);
  }

  register = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password, roleId } = req.body;

      if (!email || !password) {
        this.error(res, 'Email and password are required', 400);
        return;
      }

      const result = await this.authService.register(email, password, roleId);
      this.success(res, { user: result.user, token: result.token }, 'User registered successfully', 201);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        this.error(res, 'Email and password are required', 400);
        return;
      }

      const result = await this.authService.login(email, password);
      this.success(res, { user: result.user, token: result.token }, 'Login successful');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  me = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        this.error(res, 'User not authenticated', 401);
        return;
      }

      const user = await this.authService.getMe(req.user.uid);
      if (!user) {
        this.error(res, 'User not found', 404);
        return;
      }

      // Remove password from response
      const { password, ...userData } = user.data;
      this.success(res, { ...user, data: userData }, 'User retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  updateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        this.error(res, 'User not authenticated', 401);
        return;
      }

      const updates = req.body;
      const user = await this.authService.updateAccount(req.user.uid, updates, req.user.uid);

      if (!user) {
        this.error(res, 'User not found', 404);
        return;
      }

      const { password, ...userData } = user.data;
      this.success(res, { ...user, data: userData }, 'Account updated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        this.error(res, 'User not authenticated', 401);
        return;
      }

      const deleted = await this.authService.deleteAccount(req.user.uid);
      if (!deleted) {
        this.error(res, 'User not found', 404);
        return;
      }

      this.success(res, null, 'Account deleted successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        this.error(res, 'User not authenticated', 401);
        return;
      }

      const token = await this.authService.refreshToken(req.user.uid);
      this.success(res, { token }, 'Token refreshed successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };
}

