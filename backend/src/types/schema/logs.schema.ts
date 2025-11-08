export type LogMethod = 'post' | 'get' | 'patch' | 'delete';

export interface LogData {
  method: LogMethod;
  path: string;
  response: any;
  requested_by: string | null;
}

export interface Log {
  uid: string;
  data: LogData;
  createdAt: Date;
  createdBy: 'system';
}

