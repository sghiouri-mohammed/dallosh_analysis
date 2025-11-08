# Dallosh Analysis Backend

Express.js backend server for the Dallosh Analysis platform.

## Overview

The backend is a RESTful API server built with Express.js and TypeScript. It provides authentication, file management, task orchestration, and integrates with RabbitMQ for asynchronous task processing. The architecture is modular and follows SOLID principles with an agnostic database adapter pattern.

## Features

- **RESTful API** with modular architecture
- **JWT-based Authentication** with refresh tokens
- **MongoDB Database** with agnostic adapter pattern
- **RabbitMQ Integration** for task processing and event communication
- **File Upload Handling** with Multer for CSV files
- **Role-based Access Control** with permission system
- **Activity Logging** for audit trails
- **Settings Management** for AI models and storage configuration
- **TypeScript** for type safety
- **Modular Architecture** following SOLID principles

## Prerequisites

- **Node.js** 18+ (recommended: Node.js 18.x or higher)
- **npm** or **yarn** package manager
- **MongoDB** 7.0+ running on `localhost:27017` (or configured port)
- **RabbitMQ** 3.x running on `localhost:5672` (or configured port)
- **Storage Directory** for file uploads (shared with microservice)

## Installation

### Using Docker (Recommended)

```bash
# Build the Docker image
docker build -t dallosh-backend .

# Run the container
docker run -d \
  --name dallosh-backend \
  --env-file .env \
  -p 3001:3001 \
  -v $(pwd)/storage:/app/storage \
  -v $(pwd)/logs:/app/logs \
  dallosh-backend
```

### Manual Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
NODE_ENV=development
PORT=5006

# Database Configuration
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_NAME=dallosh_analysis
DB_USER=                    # Optional: MongoDB username
DB_PASSWORD=                # Optional: MongoDB password

# Legacy MongoDB URI (optional, for backward compatibility)
# MONGODB_URI=mongodb://localhost:27017/dallosh_analysis

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
RABBITMQ_URL=amqp://localhost:5672
STORAGE_PATH=../../storage
RABBITMQ_TOPIC_TASKS=tasks
```

**Database Configuration:**
- `DB_TYPE`: Database type (currently only 'mongodb' supported)
- `DB_HOST`: Database host (default: 'localhost')
- `DB_PORT`: Database port (default: 27017)
- `DB_NAME`: Database name (default: 'dallosh_analysis')
- `DB_USER`: Database username (optional)
- `DB_PASSWORD`: Database password (optional)

You can also use the legacy `MONGODB_URI` format for backward compatibility.

## Development

Run the development server:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)
- `PATCH /api/auth/me` - Update current user (requires auth)
- `DELETE /api/auth/me` - Delete current user (requires auth)
- `POST /api/auth/refresh` - Refresh JWT token (requires auth)

### Users (`/api/users`)
- `POST /api/users` - Create user (requires auth)
- `GET /api/users` - List users (requires auth)
- `GET /api/users/:uid` - Get user by ID (requires auth)
- `PATCH /api/users/:uid` - Update user (requires auth)
- `DELETE /api/users/:uid` - Delete user (requires auth)

### Roles (`/api/roles`)
- `POST /api/roles` - Create role (requires auth)
- `GET /api/roles` - List roles (requires auth)
- `GET /api/roles/:uid` - Get role by ID (requires auth)
- `PATCH /api/roles/:uid` - Update role (requires auth)
- `DELETE /api/roles/:uid` - Delete role (requires auth)

### Files (`/api/files`)
- `POST /api/files/upload` - Upload file (requires auth, multipart/form-data)
- `GET /api/files` - List files (requires auth)
- `GET /api/files/:uid` - Get file by ID (requires auth)
- `DELETE /api/files/:uid` - Delete file (requires auth)

### Tasks (`/api/tasks`)
- `POST /api/tasks` - Create task (requires auth)
- `GET /api/tasks` - List tasks (requires auth)
- `GET /api/tasks/:uid` - Get task by ID (requires auth)
- `PATCH /api/tasks/:uid` - Update task (requires auth)
- `DELETE /api/tasks/:uid` - Delete task (requires auth)
- `POST /api/tasks/proceed` - Start task processing (requires auth)
- `POST /api/tasks/retry` - Retry failed task (requires auth)
- `POST /api/tasks/handle-process` - Pause/resume/stop task (requires auth)

### Logs (`/api/logs`)
- `GET /api/logs` - List logs (requires auth)
- `GET /api/logs/:uid` - Get log by ID (requires auth)
- `DELETE /api/logs/:uid` - Delete log (requires auth)

### Settings (`/api/settings`)
- `GET /api/settings` - Get settings (requires auth)
- `PATCH /api/settings` - Update settings (requires auth)
- `PATCH /api/settings/general` - Update general settings (requires auth)
- `PATCH /api/settings/ai` - Update AI settings (requires auth)

## Default Credentials

On first startup, the system creates a default admin user:
- **Email**: `admin@free.com`
- **Password**: `admin123`

**Important:** Change the default password in production!

## Project Structure

```
src/
├── api/              # API routes (auth, users, roles, files, tasks, logs, settings)
├── common/           # Shared middleware and base classes
├── configs/          # Configuration files
├── core/             # Core server setup
├── lib/              # Custom libraries (database adapter)
├── scripts/          # Initialization scripts
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── index.ts          # Application entry point
```

## Architecture

The backend follows a modular architecture with:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and data operations
- **Database Adapter**: Agnostic database interface (currently MongoDB)
- **Middleware**: Authentication and request processing
- **Base Classes**: Reusable controller and service base classes

## Technologies

- **Express.js 5** - Web application framework
- **TypeScript** - Type safety
- **MongoDB** - NoSQL database
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload middleware
- **AMQP Lib** - RabbitMQ client for message queuing
- **bcryptjs** - Password hashing
- **PapaParse** - CSV parsing
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Architecture

The backend follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                 HTTP Request                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │   Middleware    │ (Auth, CORS, etc.)
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   Controller    │ (Request/Response handling)
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │    Service      │ (Business logic)
         └────────┬────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌──────────────┐
│   Database    │   │   RabbitMQ   │
│   Adapter     │   │   Publisher  │
└───────────────┘   └──────────────┘
```

### Key Components

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data operations
- **Database Adapter**: Agnostic database interface (currently MongoDB)
- **Middleware**: Authentication, error handling, logging
- **Base Classes**: Reusable controller and service base classes

## API Documentation

### Authentication Flow

1. **Register**: `POST /api/auth/register` - Create a new user account
2. **Login**: `POST /api/auth/login` - Authenticate and receive JWT token
3. **Refresh**: `POST /api/auth/refresh` - Refresh expired JWT token
4. **Me**: `GET /api/auth/me` - Get current user information

### File Upload Flow

1. **Upload**: `POST /api/files/upload` - Upload CSV file (multipart/form-data)
2. **Create Task**: Automatically creates a task for the uploaded file
3. **Proceed Task**: `POST /api/tasks/proceed` - Start processing the task
4. **Monitor**: Real-time updates via RabbitMQ events

### Task Processing Flow

1. User uploads file → Backend saves file and creates task
2. User clicks "Start" → Backend sends `proceed_task` event to RabbitMQ
3. Microservice receives event → Processes dataset
4. Microservice sends status updates → Backend updates task status
5. Frontend receives real-time updates via RabbitMQ

## Database Schema

### Collections

- **users**: User accounts with roles and permissions
- **roles**: Role definitions with permission arrays
- **files**: Uploaded file metadata
- **tasks**: Processing task status and metadata
- **logs**: Activity logs for audit trails
- **settings**: Application settings (AI models, storage config)

### Database Adapter

The backend uses an agnostic database adapter pattern, allowing easy switching between database providers. Currently, only MongoDB is implemented, but the architecture supports adding other databases.

## Environment Variables

### Required Variables

```env
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
```

### Optional Variables

```env
DB_USER=                    # MongoDB username (if authentication required)
DB_PASSWORD=                # MongoDB password (if authentication required)
MONGODB_URI=                # Legacy MongoDB URI (for backward compatibility)
DEFAULT_ADMIN_EMAIL=admin@free.com
DEFAULT_ADMIN_PASSWORD=admin123
HOST=0.0.0.0                # Server host (default: 0.0.0.0)
```

## Scripts

### Initialization Scripts

- **collections.ts**: Creates database collections if they don't exist
- **root.ts**: Creates default admin user if it doesn't exist

Run scripts on server startup through `main.ts`.

## Testing

### Unit Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

### E2E Tests

Located in `test/e2e/` directory.

### Workflow Tests

Located in `test/workflows/` directory for testing complete workflows.

## Troubleshooting

### Database Connection Issues

1. Verify MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
2. Check connection string in `.env`
3. Ensure database credentials are correct
4. Verify network connectivity

### RabbitMQ Connection Issues

1. Verify RabbitMQ is running: `rabbitmqctl status`
2. Check connection URL in `.env`
3. Verify virtual host exists
4. Check network connectivity

### File Upload Issues

1. Verify storage directory exists and is writable
2. Check file size limits in Multer configuration
3. Verify file type is CSV
4. Check disk space

### Authentication Issues

1. Verify JWT_SECRET is set in `.env`
2. Check token expiration settings
3. Verify token is being sent in Authorization header
4. Check token format (Bearer token)

## License

MIT

