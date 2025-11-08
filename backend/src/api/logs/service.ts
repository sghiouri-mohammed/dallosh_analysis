import { BaseService } from '@common/services/BaseService';
import { Log, LogData } from '@/types/schema/logs.schema';
import { generateUID } from '@utils';
import { COLLECTIONS } from '@configs/constants';

export class LogsService extends BaseService {
  async create(logData: LogData): Promise<Log> {
    const now = new Date();
    const log: Log = {
      uid: generateUID(),
      data: logData,
      createdAt: now,
      createdBy: 'system',
    };

    await this.db.insertOne(COLLECTIONS.LOGS, log);
    return log;
  }

  async findAll(filter: any = {}, options: any = {}): Promise<Log[]> {
    return (await this.db.findMany(COLLECTIONS.LOGS, filter, options)) as Log[];
  }

  async findOne(uid: string): Promise<Log | null> {
    return (await this.db.findOne(COLLECTIONS.LOGS, { uid })) as Log | null;
  }

  async delete(uid: string): Promise<boolean> {
    return await this.db.deleteOne(COLLECTIONS.LOGS, { uid });
  }
}

