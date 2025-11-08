import { Router } from 'express';
import multer from 'multer';
import { FilesController } from './controller';
import { authMiddleware } from '@common/middleware/auth';

const upload = multer({ storage: multer.memoryStorage() });

export const createFilesRoutes = (db: any): Router => {
  const router = Router();
  const controller = new FilesController(db);

  router.use(authMiddleware);

  router.post('/upload', upload.single('file'), controller.upload);
  router.get('/', controller.findAll);
  router.get('/:uid/download', controller.download); // Must come before /:uid to avoid route conflict
  router.get('/:uid', controller.findOne);
  router.delete('/:uid', controller.delete);

  return router;
};

