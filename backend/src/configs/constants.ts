export const COLLECTIONS = {
  USERS: 'users',
  ROLES: 'roles',
  USER_ROLES: 'user_roles',
  FILES: 'files',
  TASKS: 'tasks',
  LOGS: 'logs',
  SETTINGS: 'settings',
} as const;

export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_DATASETS: 'manage_datasets',
  MANAGE_TASKS: 'manage_tasks',
  MANAGE_APP: 'manage_app',
  VIEW_OVERVIEW: 'view_overview',
  READ_USERS: 'read_users',
  READ_DATASETS: 'read_datasets',
  READ_TASKS: 'read_tasks',
} as const;

export const TASK_STATUS = {
  ADDED: 'added',
  IN_QUEUE: 'in_queue',
  READING_DATASET: 'reading_dataset',
  READING_DATASET_DONE: 'reading_dataset_done',
  PROCESS_CLEANING: 'process_cleaning',
  PROCESS_CLEANING_DONE: 'process_cleaning_done',
  SENDING_TO_LLM: 'sending_to_llm',
  SENDING_TO_LLM_PROGRESS: 'sending_to_llm_progression',
  SENDING_TO_LLM_DONE: 'sending_to_llm_done',
  APPENDING_COLUMNS: 'appending_collumns',
  APPENDING_COLUMNS_DONE: 'appending_collumns_done',
  SAVING_FILE: 'saving_file',
  SAVING_FILE_DONE: 'saving_file_done',
  DONE: 'done',
  ON_ERROR: 'on_error',
  PAUSED: 'paused',
  STOPPED: 'stopped',
} as const;

export const RABBITMQ_EVENTS = {
  PROCEED_TASK: 'proceed_task',
  RETRY_STEP: 'retry_step',
  HANDLE_PROCESS: 'handle_process',
} as const;

export const DEFAULT_ADMIN_EMAIL = 'admin@free.com';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

