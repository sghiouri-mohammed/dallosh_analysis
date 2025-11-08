/**
 * Application constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    UPDATE_ACCOUNT: '/auth/me',
    DELETE_ACCOUNT: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (uid: string) => `/users/${uid}`,
  },
  ROLES: {
    BASE: '/roles',
    BY_ID: (uid: string) => `/roles/${uid}`,
  },
  FILES: {
    BASE: '/files',
    UPLOAD: '/files/upload',
    BY_ID: (uid: string) => `/files/${uid}`,
    DOWNLOAD: (uid: string) => `/files/${uid}/download`,
  },
  TASKS: {
    BASE: '/tasks',
    BY_ID: (uid: string) => `/tasks/${uid}`,
    PROCEED: '/tasks/proceed',
    RETRY: '/tasks/retry',
    HANDLE_PROCESS: '/tasks/handle-process',
    RESTART: '/tasks/restart',
    DELETE_WITH_FILES: '/tasks/delete-with-files',
  },
  LOGS: {
    BASE: '/logs',
    BY_ID: (uid: string) => `/logs/${uid}`,
  },
  SETTINGS: {
    BASE: '/settings',
    GENERAL: '/settings/general',
    AI: '/settings/ai',
    STORAGE: '/settings/storage',
  },
} as const;

// Task Event Types
export const TASK_EVENTS = {
  ADDED: 'added',
  IN_QUEUE: 'in_queue',
  READING_DATASET: 'reading_dataset',
  READING_DATASET_DONE: 'reading_dataset_done',
  PROCESS_CLEANING: 'process_cleaning',
  PROCESS_CLEANING_DONE: 'process_cleaning_done',
  SENDING_TO_LLM: 'sending_to_llm',
  SENDING_TO_LLM_PROGRESSION: 'sending_to_llm_progression',
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

// Task Process Events
export const TASK_PROCESS_EVENTS = {
  PAUSE: 'pause',
  RESUME: 'resume',
  STOP: 'stop',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const;

