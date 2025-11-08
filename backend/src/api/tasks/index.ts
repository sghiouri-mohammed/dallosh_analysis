import { Router } from 'express';
import { TasksController } from './controller';
import { authMiddleware } from '@common/middleware/auth';

export const createTasksRoutes = (db: any): Router => {
  const router = Router();
  const controller = new TasksController(db);

  router.use(authMiddleware);

  router.post('/', controller.create);
  router.get('/', controller.findAll);
  router.get('/:uid', controller.findOne);
  router.patch('/:uid', controller.update);
  router.delete('/:uid', controller.delete);
  router.post('/proceed', controller.proceed);
  router.post('/retry', controller.retry);
  router.post('/handle-process', controller.handleProcess);
  router.post('/restart', controller.restart);
  router.post('/delete-with-files', controller.deleteWithFiles);

  return router;
};

