import { Router } from 'express';
import { SettingsController } from './controller';
import { authMiddleware } from '@common/middleware/auth';

export const createSettingsRoutes = (db: any): Router => {
  const router = Router();
  const controller = new SettingsController(db);

  router.use(authMiddleware);

  router.get('/', controller.get);
  router.patch('/', controller.update);
  router.patch('/general', controller.updateGeneral);
  router.patch('/ai', controller.updateAI);
  router.patch('/storage', controller.updateStorage);

  return router;
};

