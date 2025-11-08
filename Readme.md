# Dallosh Analysis

> An innovative data analysis platform for automating customer reclamation/complaint processing for Telecom Companies using AI-powered sentiment analysis and data visualization.

## ��� Table of Contents

- [Description](#description)
- [Features](#features)
- [Requirements](#requirements)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Team](#team)
- [License](#license)

## ��� Description

Dallosh Analysis is a comprehensive data analysis application designed to automate the processing of customer complaint datasets for Telecom Companies. The platform enables data analysts to upload CSV files containing Twitter posts, automatically processes them through AI-powered sentiment analysis, and provides intuitive visualizations including charts, pie diagrams, and KPIs.

The application processes Twitter datasets with columns such as `id`, `created_at`, `full_text`, `media`, `screen_name`, and various engagement metrics. After processing through the backend and microservices, additional columns are added: `sentiment`, `priority`, and `topic`.

### Key Workflow

1. **Upload**: Data analysts upload CSV files through the web interface
2. **Queue**: Files are added to a processing queue
3. **Process**: Automated background processing includes:
   - Data cleaning (removing emojis, special characters)
   - Sentiment analysis (negative, neutral, positive)
   - Priority classification (0, 1, 2)
   - Topic extraction
   - Column appending and file saving
4. **Visualize**: Results are displayed with interactive charts and KPIs

## ✨ Features

### Frontend
- **Modern UI**: Built with Next.js 16, React 19, and Tailwind CSS
- **Theme Support**: Red theme with light/dark mode switching
- **Role-Based Access Control**: Separate dashboards for admins and data analysts
- **Real-time Updates**: Live task progression tracking via RabbitMQ events
- **Data Visualization**: Interactive charts and diagrams using Recharts
- **Responsive Design**: Mobile-first approach with modern UX

### Backend
- **RESTful API**: Express.js server with modular architecture
- **JWT Authentication**: Secure token-based authentication
- **File Management**: CSV upload, preview, and download
- **Task Management**: Queue management for dataset processing
- **Activity Logging**: Comprehensive logging system
- **Settings Management**: Configurable AI models and storage options

### Microservices
- **Automated Processing**: Celery-based task processing
- **AI Integration**: Ollama LLM for sentiment analysis and topic extraction
- **Data Cleaning**: Intelligent text cleaning while preserving important data
- **Event-Driven**: RabbitMQ-based event communication
- **Resumable Tasks**: Pause, resume, and retry capabilities
- **Error Handling**: Robust error handling with retry mechanisms

## ��� Requirements

### Prerequisites
- **Node.js** 18+ (for backend and frontend)
- **Python** 3.10+ (for microservices)
- **MongoDB** 7.0+ (running on localhost:27017)
- **RabbitMQ** 3.x (running on localhost:5672)
- **Ollama** (for LLM processing)
- **Docker** & **Docker Compose** (optional, for containerized deployment)

### System Requirements
- Minimum 4GB RAM
- 10GB free disk space
- Internet connection (for downloading dependencies and models)

## ��� Technologies

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Accessible component library
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **AMQP Lib** - RabbitMQ client for real-time updates
- **PapaParse** - CSV parsing

### Backend
- **Express.js 5** - Web application framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **JWT** - Authentication
- **Multer** - File upload handling
- **AMQP Lib** - RabbitMQ integration
- **bcryptjs** - Password hashing
- **PapaParse** - CSV parsing

### Microservices
- **Python 3.10+** - Programming language
- **Celery** - Distributed task queue
- **RabbitMQ** - Message broker
- **Pandas** - Data manipulation
- **Ollama** - LLM API client
- **Pika** - RabbitMQ Python client
- **PyMongo** - MongoDB driver
- **Pytest** - Testing framework

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Traefik** - Reverse proxy (production)
- **MongoDB** - Database
- **RabbitMQ** - Message broker
- **Ollama** - LLM server

## ��� Project Structure

\`\`\`
dalloh_analysis/
├── .github/
│   └── workflows/          # CI/CD pipeline configurations
├── backend/                # Express.js backend server
│   ├── src/
│   │   ├── api/           # API routes (auth, users, roles, files, tasks, logs, settings)
│   │   ├── common/        # Shared middleware and base classes
│   │   ├── configs/       # Configuration files
│   │   ├── core/          # Core server setup
│   │   ├── lib/           # Custom libraries (database adapter)
│   │   ├── scripts/       # Initialization scripts
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── test/              # Tests
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── admin/     # Admin dashboard pages
│   │   │   ├── home/      # User dashboard pages
│   │   │   ├── auth/      # Authentication pages
│   │   │   └── landing/   # Landing page
│   │   ├── components/    # React components
│   │   ├── guards/        # Route protection guards
│   │   ├── services/      # API client services
│   │   ├── stores/        # Zustand state stores
│   │   ├── types/         # TypeScript type definitions
│   │   └── configs/       # Configuration files
│   ├── test/              # Tests
│   ├── Dockerfile
│   └── package.json
├── microservices/
│   └── auto_processing_datasets/  # Python microservice for dataset processing
│       ├── src/
│       │   ├── celery_app.py     # Celery application
│       │   ├── configs/          # Configuration files
│       │   ├── events/           # RabbitMQ event listener
│       │   ├── lib/              # Database adapters
│       │   ├── services/         # Processing services
│       │   ├── tasks/            # Celery task definitions
│       │   └── utils/            # Utility functions
│       ├── test/                 # Tests
│       ├── main.py               # Entry point
│       ├── requirements.txt      # Python dependencies
│       └── Dockerfile
├── storage/                # Shared storage directory
│   ├── datasets/          # Original uploaded files
│   ├── cleaned/           # Cleaned dataset files
│   └── analysed/          # Processed dataset files
├── models/                 # Local model storage
│   └── ollama/            # Ollama models
├── docs/                   # Project documentation
├── docker-compose.yaml     # Local development setup
├── docker-compose.production.yaml  # Production setup
└── README.md
\`\`\`

## ��� Getting Started

### Quick Start with Docker Compose (Recommended)

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd dalloh_analysis
   \`\`\`

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` in each service directory:
     - `backend/.env.example` → `backend/.env`
     - `frontend/.env.local.example` → `frontend/.env.local`
     - `microservices/auto_processing_datasets/.env.example` → `microservices/auto_processing_datasets/.env`

3. **Start all services:**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

4. **Access the application:**
   - Frontend: http://localhost:3006
   - Backend API: http://localhost:5006
   - RabbitMQ Management: http://localhost:15672 (admin/admin123)
   - MongoDB: localhost:27019

### Manual Setup

#### 1. Backend Setup

\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
\`\`\`

#### 2. Frontend Setup

\`\`\`bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your API URL
npm run dev
\`\`\`

#### 3. Microservice Setup

\`\`\`bash
cd microservices/auto_processing_datasets
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration

# Terminal 1 - Start Celery Worker
celery -A src.celery_app:celery_app worker --loglevel=info --queues=celery_processing_queue --pool=solo --concurrency=1

# Terminal 2 - Start Event Listener
python main.py
\`\`\`

### Default Credentials

- **Admin User:**
  - Email: `admin@free.com`
  - Password: `admin123`

- **Analyst User:**
  - Email: `user@free.com`
  - Password: `user123`

**⚠️ Important:** Change default passwords in production!

### Database Setup

The application will automatically create the following collections on first run:
- `users` - User accounts
- `roles` - User roles and permissions
- `files` - Uploaded dataset files
- `tasks` - Processing tasks
- `logs` - Activity logs
- `settings` - Application settings

### Environment Variables

#### Backend (.env)
\`\`\`env
NODE_ENV=development
PORT=5006
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_NAME=dallosh_analysis
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
RABBITMQ_URL=amqp://localhost:5672
STORAGE_PATH=../../storage
RABBITMQ_TOPIC_TASKS=tasks
\`\`\`

#### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5006
NODE_ENV=development
\`\`\`

#### Microservice (.env)
\`\`\`env
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_NAME=dallosh_analysis
STORAGE_DATASETS=./storage/datasets
STORAGE_CLEANED=./storage/cleaned
STORAGE_ANALYSED=./storage/analysed
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin123
CELERY_BROKER_URL=amqp://admin:admin123@localhost:5672//
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
\`\`\`

## ��� Team

- **Ivan Joel SOBGUI**
- **Cyrile**
- **Pascal**
- **Ben Lol**
- **Mohammed**

## ��� License

This project is licensed under the MIT License.

---

## ��� Additional Resources

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Microservice README](./microservices/auto_processing_datasets/README.md)

## ��� Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ��� Support

For issues and questions, please open an issue on the GitHub repository.
