import { Response } from 'express';
import { BaseController } from '@common/controllers/BaseController';
import { SettingsService } from './service';
import { AuthRequest } from '@common/middleware/auth';

export class SettingsController extends BaseController {
  private settingsService: SettingsService;

  constructor(db: any) {
    super(db);
    this.settingsService = new SettingsService(db);
  }

  get = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const settings = await this.settingsService.getSettings();
      if (!settings) {
        this.error(res, 'Settings not found', 404);
        return;
      }

      this.success(res, settings, 'Settings retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const settingsData = req.body;
      const updatedBy = req.user?.uid || 'system';

      const settings = await this.settingsService.createOrUpdate(settingsData, updatedBy);
      this.success(res, settings, 'Settings updated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  updateGeneral = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const general = req.body;
      const updatedBy = req.user?.uid || 'system';

      const settings = await this.settingsService.updateGeneral(general, updatedBy);
      if (!settings) {
        this.error(res, 'Settings not found', 404);
        return;
      }

      this.success(res, settings, 'General settings updated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  updateAI = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const ai = req.body;
      const updatedBy = req.user?.uid || 'system';

      const settings = await this.settingsService.updateAI(ai, updatedBy);
      if (!settings) {
        this.error(res, 'Settings not found', 404);
        return;
      }

      this.success(res, settings, 'AI settings updated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  updateStorage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const storage = req.body;
      const updatedBy = req.user?.uid || 'system';

      const settings = await this.settingsService.updateStorage(storage, updatedBy);
      if (!settings) {
        this.error(res, 'Settings not found', 404);
        return;
      }

      this.success(res, settings, 'Storage settings updated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  };
}

