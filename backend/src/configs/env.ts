import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5006', 10),
  HOST: process.env.HOST || '0.0.0.0',
  // Database configuration
  DB_TYPE: (process.env.DB_TYPE || 'mongodb') as 'mongodb',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '27017', 10),
  DB_NAME: process.env.DB_NAME || 'dallosh_analysis',
  DB_USER: process.env.DB_USER || undefined,
  DB_PASSWORD: process.env.DB_PASSWORD || undefined,

  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@free.com',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
  // Legacy MongoDB URI (for backward compatibility)
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  STORAGE_PATH: process.env.STORAGE_PATH || '../../storage',
  RABBITMQ_TOPIC_TASKS: process.env.RABBITMQ_TOPIC_TASKS || 'tasks',
} as const;

