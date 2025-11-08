import { DatabaseAdapter } from './base/BaseAdapter';
import { MongoDatabase } from './mongodb/MongoDatabase';
import { DatabaseConfig } from './types';

export class DatabaseService {
  private adapter: DatabaseAdapter;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    
    // Initialize adapter based on type
    switch (this.config.type) {
      case 'mongodb':
        this.adapter = new MongoDatabase(this.config);
        break;
      default:
        throw new Error(`Unsupported database type: ${this.config.type}`);
    }
  }

  async connect(): Promise<void> {
    await this.adapter.connect();
  }

  async disconnect(): Promise<void> {
    await this.adapter.disconnect();
  }

  getAdapter(): DatabaseAdapter {
    return this.adapter;
  }

  getConfig(): DatabaseConfig {
    return { ...this.config };
  }
}

// Export types
export * from './types';

