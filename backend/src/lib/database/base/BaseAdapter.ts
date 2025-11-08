export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  createCollection(name: string): Promise<void>;
  collectionExists(name: string): Promise<boolean>;
  insertOne(collection: string, document: any): Promise<any>;
  insertMany(collection: string, documents: any[]): Promise<any[]>;
  findOne(collection: string, filter: any): Promise<any | null>;
  findMany(collection: string, filter?: any, options?: any): Promise<any[]>;
  updateOne(collection: string, filter: any, update: any): Promise<any>;
  updateMany(collection: string, filter: any, update: any): Promise<number>;
  deleteOne(collection: string, filter: any): Promise<boolean>;
  deleteMany(collection: string, filter: any): Promise<number>;
  count(collection: string, filter?: any): Promise<number>;
}

