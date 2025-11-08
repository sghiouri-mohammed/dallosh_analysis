import { Router } from 'express';
import { LogsController } from './controller';
import { authMiddleware } from '@common/middleware/auth';

export const createLogsRoutes = (db: any): Router => {
  const router = Router();
  const controller = new LogsController(db);

  router.use(authMiddleware);

  router.get('/', controller.findAll);
  router.get('/:uid', controller.findOne);
  router.delete('/:uid', controller.delete);

  return router;
};

