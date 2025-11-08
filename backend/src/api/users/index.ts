import { Router } from 'express';
import { UsersController } from './controller';
import { authMiddleware } from '@common/middleware/auth';

export const createUsersRoutes = (db: any): Router => {
  const router = Router();
  const controller = new UsersController(db);

  router.use(authMiddleware);

  router.post('/', controller.create);
  router.get('/', controller.findAll);
  router.get('/:uid', controller.findOne);
  router.patch('/:uid', controller.update);
  router.delete('/:uid', controller.delete);

  return router;
};

