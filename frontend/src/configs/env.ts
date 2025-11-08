/**
 * Environment configuration for the frontend application
 */
export const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5006/api',
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),

  // RabbitMQ Configuration
  RABBITMQ_URL: process.env.NEXT_PUBLIC_RABBITMQ_URL || 'amqp://localhost:5672',
  RABBITMQ_TOPIC_TASKS: process.env.NEXT_PUBLIC_RABBITMQ_TOPIC_TASKS || 'tasks',

  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Dallosh Analysis',
} as const;

