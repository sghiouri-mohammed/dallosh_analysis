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
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

