# Dallosh Analysis - Auto Processing Datasets Microservice

This microservice handles automatic processing of CSV datasets using Celery for task management and RabbitMQ for event communication.

## Overview

The microservice is responsible for processing uploaded CSV datasets through a series of automated steps: data cleaning, AI-powered sentiment analysis, and result storage. It operates asynchronously using Celery workers and communicates with the backend through RabbitMQ events.

## Features

- **Celery-based Task Processing**: Asynchronous task processing with Celery workers
- **RabbitMQ Event Listener**: Listens to events from the backend and dispatches tasks
- **Data Cleaning**: Removes emojis and special characters while preserving @ mentions
- **AI Analysis**: Integrates with LLM (Ollama) for sentiment analysis and topic extraction
- **MongoDB Integration**: Updates task status and stores processed data
- **Resumable Tasks**: Support for pause, resume, and retry operations
- **Error Handling**: Robust error handling with retry mechanisms
- **Progress Tracking**: Real-time progress updates via RabbitMQ events
- **Pagination**: Handles large datasets with configurable pagination

## Prerequisites

- **Python** 3.10+ (recommended: Python 3.10 or higher)
- **RabbitMQ** 3.x server running
- **MongoDB** 7.0+ database running
- **Ollama** server running (for LLM processing)
- **Storage Directory** accessible for reading/writing CSV files

## Installation

### Using Docker (Recommended)

```bash
# Build the Docker image
docker build -t dallosh-microservice .

# Run the container
docker run -d \
  --name dallosh-microservice \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  dallosh-microservice
```

### Manual Installation

1. **Create virtual environment:**
```bash
python -m venv venv
```

2. **Activate virtual environment:**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_NAME=dallosh_analysis
DB_USER=
DB_PASSWORD=

# Storage Paths
STORAGE_DATASETS=./storage/datasets
STORAGE_CLEANED=./storage/cleaned
STORAGE_ANALYSED=./storage/analysed

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/

# Celery Configuration
CELERY_BROKER_URL=amqp://guest:guest@localhost:5672//
CELERY_RESULT_BACKEND=rpc://

# LLM Configuration (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b

# Task Processing Configuration
PAGINATION_ROWS_LIMIT=500
MAX_RETRY_ATTEMPTS=3
```

## Running the Microservice

The microservice consists of two components that need to run simultaneously:

### Option 1: Using Makefile

**Terminal 1 - Start Celery Worker:**
```bash
make worker
```

**Terminal 2 - Start Event Listener:**
```bash
make listener
```

### Option 2: Manual Commands

**Terminal 1 - Start Celery Worker:**
```bash
celery -A src.celery_app:celery_app worker \
  --loglevel=info \
  --queues=celery_processing_queue \
  --pool=solo \
  --concurrency=1
```

**Terminal 2 - Start Event Listener:**
```bash
python main.py
```

### Option 3: Using Docker Compose

See the main project's `docker-compose.yml` for orchestrated setup.

## Architecture

```
┌─────────────┐
│   Backend   │───(RabbitMQ Events)───┐
└─────────────┘                        │
                                       ▼
                              ┌─────────────────┐
                              │ Event Listener  │
                              └─────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Celery Worker   │
                              └─────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
            ┌───────────┐      ┌───────────┐      ┌───────────┐
            │  Clean    │      │   LLM     │      │   Save    │
            │  Data     │      │  Analysis │      │  Results  │
            └───────────┘      └───────────┘      └───────────┘
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       ▼
                              ┌─────────────────┐
                              │    MongoDB      │
                              └─────────────────┘
```

## Task Processing Flow

1. **Event Received**: Listener receives `proceed_task` event from RabbitMQ
2. **Task Dispatched**: Celery task is dispatched to worker
3. **Reading Dataset**: Reads CSV file from storage
4. **Cleaning Data**: Removes emojis, special characters (preserves @ mentions)
5. **LLM Analysis**: Sends data to Ollama for sentiment/topic analysis
6. **Appending Columns**: Adds processed columns (sentiment, priority, topic)
7. **Saving Results**: Saves cleaned and analyzed files
8. **Status Updates**: Updates task status in MongoDB at each step

## Logs

Logs are written to:
- `logs/worker.log` - Celery worker logs
- `logs/listener.log` - Event listener logs

## Stopping the Service

**Stop Celery Worker:**
```bash
make stop-worker
```

Or manually:
```bash
celery -A src.celery_app:celery_app control shutdown
```

**Stop Event Listener:**
Press `Ctrl+C` in the terminal running the listener.

## Troubleshooting

### Celery Worker Not Detected

If the listener shows "No Celery workers detected":
1. Ensure the worker is running in a separate terminal
2. Check RabbitMQ connection
3. Verify queue name matches: `celery_processing_queue`

### Database Connection Issues

1. Verify MongoDB is running
2. Check connection string in `.env`
3. Ensure database credentials are correct

### RabbitMQ Connection Issues

1. Verify RabbitMQ is running: `rabbitmqctl status`
2. Check connection parameters in `.env`
3. Ensure virtual host exists

## Development

### Running Tests

```bash
pytest tests/
```

### Code Structure

```
auto_processing_datasets/
├── src/
│   ├── celery_app.py          # Celery application configuration
│   ├── configs/               # Configuration files
│   ├── events/                 # RabbitMQ event listener
│   ├── lib/                    # Database adapters
│   ├── services/               # Processing services
│   ├── tasks/                  # Celery task definitions
│   └── utils/                  # Utility functions
├── main.py                     # Entry point
├── requirements.txt            # Python dependencies
└── Makefile                    # Development commands
```

## Technologies

- **Python 3.10+** - Programming language
- **Celery** - Distributed task queue
- **RabbitMQ** - Message broker (via Pika)
- **Pandas** - Data manipulation and analysis
- **Ollama** - LLM API client for AI processing
- **Pika** - RabbitMQ Python client
- **PyMongo** - MongoDB driver
- **Pytest** - Testing framework
- **NumPy** - Numerical computing
- **Requests** - HTTP library for API calls

## Task Processing Steps

The microservice processes datasets through the following steps:

1. **Reading Dataset**: Reads CSV file from storage and validates structure
2. **Cleaning Data**: 
   - Removes duplicates
   - Handles missing values
   - Removes emojis and special characters
   - Preserves @ mentions
3. **LLM Analysis**: 
   - Sends data to Ollama in paginated batches
   - Performs sentiment analysis (negative, neutral, positive)
   - Extracts priority levels (0, 1, 2)
   - Identifies main topics
4. **Appending Columns**: Adds processed columns to dataset:
   - `sentiment_score`
   - `sentiment_analysis`
   - `priority`
   - `main_topics`
5. **Saving Results**: Saves processed files to:
   - `storage/cleaned/` - Cleaned dataset
   - `storage/analysed/` - Final analyzed dataset

## Event System

### Events Received (from Backend)

- **proceed_task**: Start processing a task
- **retry_step**: Retry a failed step
- **handle_process**: Pause, resume, or stop a task

### Events Emitted (to Frontend/Backend)

- **added**: Task added to queue
- **in_queue**: Task in processing queue
- **reading_dataset**: Reading CSV file
- **reading_dataset_done**: Reading completed
- **process_cleaning**: Cleaning data
- **process_cleaning_done**: Cleaning completed
- **sending_to_llm**: Sending to LLM
- **sending_to_llm_progression**: Progress update (with pagination info)
- **sending_to_llm_done**: LLM processing completed
- **appending_columns**: Appending new columns
- **appending_columns_done**: Columns appended
- **saving_file**: Saving processed file
- **saving_file_done**: File saved
- **done**: Task completed
- **on_error**: Error occurred

## Configuration

### AI Model Selection

The microservice intelligently selects AI models based on settings:

1. Checks `settings.ai.preferences.mode`:
   - `automatic`: Uses default external model
   - `local`: Uses default local model
   - `external`: Uses external provider
2. Falls back to alternative models if primary fails
3. Retries with configured retry attempts

### Pagination

- Default: 500 rows per batch
- Configurable via `settings.ai.preferences.paginateRowsLimit`
- Maximum: 5000 rows per batch
- Processes sequentially to avoid rate limits

## Error Handling

- **Retry Mechanism**: Configurable retry attempts (default: 3)
- **Error Logging**: Comprehensive error logging to files
- **Status Updates**: Error status updates to MongoDB
- **Recovery**: Ability to retry from last successful step

## Logs

Logs are written to:
- `logs/worker.log` - Celery worker logs
- `logs/listener.log` - Event listener logs

Log levels: INFO, ERROR, DEBUG

## Development

### Code Structure

```
auto_processing_datasets/
├── src/
│   ├── celery_app.py          # Celery application configuration
│   ├── configs/               # Configuration files
│   │   ├── constants.py       # Constants and configuration
│   │   └── env.py             # Environment variables
│   ├── events/                # RabbitMQ event listener
│   │   └── listener.py        # Event listener implementation
│   ├── lib/                   # Database adapters
│   │   └── database/          # Database adapter pattern
│   ├── services/              # Processing services
│   │   ├── reading_file.py    # File reading service
│   │   ├── cleaning.py        # Data cleaning service
│   │   ├── calling_llm.py     # LLM API service
│   │   ├── appending_columns.py # Column appending service
│   │   ├── saving.py          # File saving service
│   │   └── retry_step.py      # Retry logic service
│   ├── tasks/                 # Celery task definitions
│   │   ├── manager.py         # Task manager
│   │   └── processor.py       # Main processor task
│   └── utils/                 # Utility functions
│       ├── helpers.py         # Helper functions
│       └── logger.py          # Logging utilities
├── main.py                    # Entry point (event listener)
├── requirements.txt           # Python dependencies
└── Makefile                   # Development commands
```

### Adding a New Processing Step

1. Create a new service in `src/services/`
2. Add the service to the task processor
3. Emit appropriate events for status updates
4. Update task status in MongoDB
5. Add error handling and retry logic

## Troubleshooting

### Celery Worker Not Starting

1. Verify RabbitMQ is running
2. Check Celery broker URL in `.env`
3. Verify queue name matches: `celery_processing_queue`
4. Check Python virtual environment is activated

### LLM Processing Fails

1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Check Ollama model is installed: `ollama list`
3. Verify model name in settings matches installed model
4. Check API rate limits
5. Verify network connectivity

### Database Connection Issues

1. Verify MongoDB is running
2. Check connection string in `.env`
3. Ensure database credentials are correct
4. Verify network connectivity

### File Processing Errors

1. Verify storage directories exist and are writable
2. Check file permissions
3. Verify CSV file format is valid
4. Check disk space availability

## Performance Optimization

- **Pagination**: Process large datasets in batches
- **Concurrency**: Adjust Celery worker concurrency
- **Caching**: Cache LLM responses for duplicate data
- **Parallel Processing**: Process multiple files concurrently (with proper resource management)

## License

MIT

