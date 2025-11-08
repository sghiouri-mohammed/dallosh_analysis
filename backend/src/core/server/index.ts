import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';

export interface AppRequest extends Request {
  db?: DatabaseAdapter;
}

export const createApp = (db: DatabaseAdapter): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Make database available to all routes
  app.use((req: AppRequest, _res: Response, next: NextFunction) => {
    req.db = db;
    next();
  });

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    
    // Log request body for POST/PATCH/PUT (excluding sensitive data)
    if (['POST', 'PATCH', 'PUT'].includes(req.method) && req.body) {
      const bodyToLog = { ...req.body };
      // Mask sensitive fields
      if (bodyToLog.password) bodyToLog.password = '***';
      if (bodyToLog.apiKey) bodyToLog.apiKey = '***';
      if (bodyToLog.token) bodyToLog.token = '***';
      console.log(`[${timestamp}] Request body:`, JSON.stringify(bodyToLog, null, 2));
    }
    
    // Log response
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${timestamp}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
};

