import { Router } from 'express';
import { createAuthRoutes } from './auth';
import { createUsersRoutes } from './users';
import { createRolesRoutes } from './roles';
import { createFilesRoutes } from './files';
import { createTasksRoutes } from './tasks';
import { createLogsRoutes } from './logs';
import { createSettingsRoutes } from './settings';

export const createApiRoutes = (db: any): Router => {
  const router = Router();

  router.use('/auth', createAuthRoutes(db));
  router.use('/users', createUsersRoutes(db));
  router.use('/roles', createRolesRoutes(db));
  router.use('/files', createFilesRoutes(db));
  router.use('/tasks', createTasksRoutes(db));
  router.use('/logs', createLogsRoutes(db));
  router.use('/settings', createSettingsRoutes(db));

  return router;
};

