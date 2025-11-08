export type TaskStatus =
  | 'added'
  | 'in_queue'
  | 'reading_dataset'
  | 'reading_dataset_done'
  | 'process_cleaning'
  | 'process_cleaning_done'
  | 'sending_to_llm'
  | 'sending_to_llm_progression'
  | 'sending_to_llm_done'
  | 'appending_collumns'
  | 'appending_collumns_done'
  | 'saving_file'
  | 'saving_file_done'
  | 'done'
  | 'on_error'
  | 'paused'
  | 'stopped';

export interface TaskFileInfo {
  path: string | null;
  type: string | null;
}

export interface TaskData {
  file_id: string;
  file_path: string;
  status: TaskStatus;
  file_cleaned?: TaskFileInfo;
  file_analysed?: TaskFileInfo;
}

export interface Task {
  uid: string;
  data: TaskData;
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
  updatedBy: string;
}

export interface CreateTaskRequest {
  file_id: string;
  file_path: string;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  file_id?: string;
  file_path?: string;
  status?: TaskStatus;
  file_cleaned?: TaskFileInfo;
  file_analysed?: TaskFileInfo;
}

export interface ProceedTaskRequest {
  fileId: string;
  filePath: string;
}

export interface RetryTaskRequest {
  fileId: string;
  filePath: string;
  lastEventStep: TaskStatus;
}

export interface HandleProcessRequest {
  fileId: string;
  event: 'pause' | 'resume' | 'stop';
}

// RabbitMQ Event Types
export interface TaskEventMessage {
  file_id: string;
  event: TaskStatus;
}

export interface TaskProgressionEventMessage extends TaskEventMessage {
  pagination: number;
  index: number;
  total: number;
}

export type TaskEventCallback = (message: TaskEventMessage) => void;
export type TaskProgressionEventCallback = (message: TaskProgressionEventMessage) => void;

