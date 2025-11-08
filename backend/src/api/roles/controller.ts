import { Response } from 'express';
import { BaseController } from '@common/controllers/BaseController';
import { RolesService } from './service';
import { AuthRequest } from '@common/middleware/auth';

export class RolesController extends BaseController {
  private rolesService: RolesService;

  constructor(db: any) {
    super(db);
    this.rolesService = new RolesService(db);
  }

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const roleData = req.body;
      const createdBy = req.user?.uid || 'system';

      const role = await this.rolesService.create(roleData, createdBy);
      this.success(res, role, 'Role created successfully', 201);
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

      const roles = await this.rolesService.findAll(filter, options);
      this.success(res, roles, 'Roles retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  findOne = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const role = await this.rolesService.findOne(uid);

      if (!role) {
        this.error(res, 'Role not found', 404);
        return;
      }

      this.success(res, role, 'Role retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const updates = req.body;
      const updatedBy = req.user?.uid || 'system';

      const role = await this.rolesService.update(uid, updates, updatedBy);
      if (!role) {
        this.error(res, 'Role not found', 404);
        return;
      }

      this.success(res, role, 'Role updated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const deleted = await this.rolesService.delete(uid);

      if (!deleted) {
        this.error(res, 'Role not found', 404);
        return;
      }

      this.success(res, null, 'Role deleted successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };
}

