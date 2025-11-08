# Dallosh Analysis Backend

Express.js backend server for the Dallosh Analysis platform.

## Features

- RESTful API with modular architecture
- JWT-based authentication
- MongoDB database with agnostic adapter pattern
- RabbitMQ integration for task processing
- File upload handling
- Role-based access control
- Activity logging

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB running on `localhost:27017`
- RabbitMQ running on `localhost:5672`

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

## Default Admin User

On first startup, the system creates a default admin user:
- Email: `admin@dallosh.com`
- Password: `admin123`

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

## Testing

Unit and E2E tests are located in the `test/` directory.

## License

ISC

