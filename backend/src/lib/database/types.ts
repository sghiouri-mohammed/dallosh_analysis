export type DatabaseType = 'mongodb';

export interface DatabaseAuth {
  username?: string;
  password?: string;
}

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  dbname: string;
  auth?: DatabaseAuth;
  options?: Record<string, any>;
}

