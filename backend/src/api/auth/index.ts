import { Router } from 'express';
import { AuthController } from './controller';
import { authMiddleware } from '@common/middleware/auth';

export const createAuthRoutes = (db: any): Router => {
  const router = Router();
  const controller = new AuthController(db);

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', authMiddleware, controller.me);
  router.patch('/me', authMiddleware, controller.updateAccount);
  router.delete('/me', authMiddleware, controller.deleteAccount);
  router.post('/refresh', authMiddleware, controller.refreshToken);

  return router;
};

