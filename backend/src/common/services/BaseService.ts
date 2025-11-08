import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';

export abstract class BaseService {
  protected db: DatabaseAdapter;

  constructor(db: DatabaseAdapter) {
    this.db = db;
  }
}

