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
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
  updatedBy: string;
}

export interface UploadFileResponse {
  file: File;
}

