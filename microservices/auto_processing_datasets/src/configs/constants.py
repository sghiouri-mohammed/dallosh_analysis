"""Constants for task statuses and events."""

# Task statuses / primary events
TASK_STATUS_ADDED = 'added'
TASK_STATUS_IN_QUEUE = 'in_queue'
TASK_STATUS_READING_DATASET = 'reading_dataset'
TASK_STATUS_READING_DATASET_DONE = 'reading_dataset_done'
TASK_STATUS_PROCESS_CLEANING = 'process_cleaning'
TASK_STATUS_PROCESS_CLEANING_DONE = 'process_cleaning_done'
TASK_STATUS_SENDING_TO_LLM = 'sending_to_llm'
TASK_STATUS_SENDING_TO_LLM_PROGRESS = 'sending_to_llm_progression'
TASK_STATUS_SENDING_TO_LLM_DONE = 'sending_to_llm_done'
TASK_STATUS_APPENDING_COLUMNS = 'appending_collumns'
TASK_STATUS_APPENDING_COLUMNS_DONE = 'appending_collumns_done'
TASK_STATUS_SAVING_FILE = 'saving_file'
TASK_STATUS_SAVING_FILE_DONE = 'saving_file_done'
TASK_STATUS_DONE = 'done'
TASK_STATUS_ON_ERROR = 'on_error'
TASK_STATUS_PAUSED = 'paused'
TASK_STATUS_STOPPED = 'stopped'

# RabbitMQ events (must match backend constants)
EVENT_PROCEED_TASK = 'proceed_task'
EVENT_RETRY_STEP = 'retry_step'
EVENT_HANDLE_PROCESS = 'handle_process'

# Collections
COLLECTION_TASKS = 'tasks'
COLLECTION_FILES = 'files'
COLLECTION_LOGS = 'logs'

# AI modes
AI_MODE_LOCAL = 'local'
AI_MODE_EXTERNAL = 'external'
AI_MODE_AUTOMATIC = 'automatic'

