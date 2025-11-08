export interface FileData {
  filename: string;
  size: number;
  file_path: string;
  extension: string;
  type: string;
}

export interface File {
  uid: string;
  data: FileData;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

