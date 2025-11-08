# Dallosh Analysis - Auto Processing Datasets Microservice

This microservice handles automatic processing of CSV datasets using Celery for task management and RabbitMQ for event communication.

## Features

- **Celery-based Task Processing**: Asynchronous task processing with Celery workers
- **RabbitMQ Event Listener**: Listens to events from the backend and dispatches tasks
- **Data Cleaning**: Removes emojis and special characters while preserving @ mentions
- **AI Analysis**: Integrates with LLM (Ollama) for sentiment analysis and topic extraction
- **MongoDB Integration**: Updates task status and stores processed data

## Prerequisites

- Python 3.10+
- RabbitMQ server
- MongoDB database
- Ollama (for LLM processing)

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
OLLAMA_MODEL=llama3.2
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

## License

ISC

