# Dallosh Analysis Frontend

Next.js frontend application for the Dallosh Analysis platform. Built with React, TypeScript, and Tailwind CSS.

## Overview

The frontend is a modern, responsive web application that provides an intuitive interface for data analysts to manage datasets, monitor processing tasks, and visualize analysis results. It features role-based access control with separate dashboards for administrators and data analysts.

## Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom red theme
- **Zustand** for state management
- **Shadcn UI** components for accessible UI elements
- **Role-based Access Control** with permission-based navigation
- **Real-time Updates** via RabbitMQ events (AMQP)
- **Dark/Light Mode** support with theme switching
- **Responsive Design** (mobile-first approach)
- **Data Visualization** with Recharts
- **CSV Processing** with PapaParse
- **File Upload** with progress tracking
- **Task Management** with real-time status updates

## Prerequisites

- **Node.js** 20+ (recommended: Node.js 20.x or higher)
- **npm**, **yarn**, or **pnpm** package manager
- **Backend API** running on port 5006 (see [Backend README](../backend/README.md))
- **RabbitMQ** server for real-time event updates

## Installation

### Using Docker (Recommended)

```bash
# Build the Docker image
docker build -t dallosh-frontend .

# Run the container
docker run -d \
  --name dallosh-frontend \
  --env-file .env.local \
  -p 3000:3000 \
  dallosh-frontend
```

### Manual Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local` file:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5006

# Environment
NODE_ENV=development
```

**Note:** Make sure the API URL matches your backend server port (default: 5006).

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3006](http://localhost:3006) in your browser.

The development server runs on port 3006 by default (configured in `package.json`).

## Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── home/         # User dashboard pages
│   │   ├── auth/         # Authentication pages
│   │   └── landing/      # Landing page
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── layouts/      # Layout components
│   │   └── ui/           # Shadcn UI components
│   ├── guards/           # Route protection guards
│   ├── services/         # API client services
│   ├── stores/          # Zustand state stores
│   ├── types/           # TypeScript type definitions
│   └── configs/         # Configuration files
├── public/              # Static assets
└── docs/                # Documentation and design files
```

## Key Features

### Authentication & Authorization

- **AuthGuard**: Protects routes requiring authentication
- **AdminGuard**: Protects admin-only routes
- **RoleGuard**: Protects routes based on user permissions
- **GuestGuard**: Protects guest-only routes (login/register)

### Pages

#### Admin Dashboard (`/admin`)
- Overview: System metrics and charts
- Users: User and role management
- Datasets: File upload and management
- Tasks: Task monitoring and management
- Analysis: Data visualization and insights
- Logs: Activity logs
- Settings: System configuration

#### User Dashboard (`/home`)
- Overview: Personal metrics
- Datasets: User's uploaded datasets
- Tasks: User's processing tasks
- Analysis: User's data analysis

### State Management

- **Auth Store**: User authentication state (Zustand with localStorage persistence)
- **API Client**: Axios-based HTTP client with token management

## Environment Variables

### Development (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5006

# Environment
NODE_ENV=development
```

### Production (.env.production)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Environment
NODE_ENV=production
```

**Important:** 
- `NEXT_PUBLIC_API_URL` must be set for the API client to work
- Use `NEXT_PUBLIC_` prefix for client-side accessible variables
- Never commit `.env.local` files to version control

## Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **Custom Theme**: Red primary color with dark/light mode support
- **Shadcn UI**: Accessible component library

## Permissions

The application supports the following permissions:
- `manage_roles` - Manage roles
- `manage_users` - Manage users
- `manage_datasets` - Manage datasets
- `manage_tasks` - Manage tasks
- `manage_app` - Full admin access
- `view_overview` - View overview dashboard
- `read_users` - Read user data
- `read_datasets` - Read dataset data
- `read_tasks` - Read task data
- `read_analysis` - Read analysis data

## Development Tips

### Adding a New Page

1. Create page in `src/app/[route]/page.tsx`
2. Add route guard if needed
3. Add navigation link in sidebar (if applicable)

### Adding a New Component

1. Create component in `src/components/`
2. Use TypeScript for props
3. Follow existing component patterns

### API Integration

- Use services in `src/services/` for API calls
- Services are automatically configured with authentication
- Handle errors appropriately

## Troubleshooting

### Build Errors

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Authentication Issues

- Check API URL in `.env.local`
- Verify backend is running
- Check browser console for errors

### Styling Issues

- Ensure Tailwind CSS is properly configured
- Check `globals.css` for theme variables
- Verify dark mode toggle is working

## Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Accessible component library
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API requests
- **Recharts** - Data visualization library
- **AMQP Lib** - RabbitMQ client for real-time events
- **PapaParse** - CSV parsing library
- **Lucide React** - Icon library
- **Next Themes** - Theme management (dark/light mode)
- **Sonner** - Toast notifications

## Real-time Features

The frontend connects to RabbitMQ to receive real-time task updates:

- **Task Status Updates**: Real-time task progression (in_queue → processing → done)
- **Progress Tracking**: Live progress bars and activity logs
- **Event Listening**: Listens to task events via AMQP
- **Activity Logs**: Real-time activity log updates

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── overview/       # Admin overview dashboard
│   │   │   ├── users/          # User management
│   │   │   ├── datasets/       # Dataset management
│   │   │   ├── tasks/          # Task management
│   │   │   ├── analysis/       # Data analysis
│   │   │   ├── logs/           # Activity logs
│   │   │   └── settings/       # System settings
│   │   ├── home/               # User dashboard pages
│   │   │   ├── overview/       # User overview
│   │   │   ├── datasets/       # User datasets
│   │   │   ├── tasks/          # User tasks
│   │   │   └── analysis/       # User analysis
│   │   ├── auth/               # Authentication pages
│   │   ├── landing/            # Landing page
│   │   └── profile/            # User profile
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── layouts/            # Layout components (Sidebar, Navbar, Header)
│   │   ├── ui/                 # Shadcn UI components
│   │   └── auth/               # Authentication components
│   ├── guards/                 # Route protection guards
│   ├── services/               # API client services
│   ├── stores/                 # Zustand state stores
│   ├── types/                  # TypeScript type definitions
│   ├── configs/                # Configuration files
│   ├── hooks/                  # Custom React hooks
│   └── utils/                  # Utility functions
├── public/                     # Static assets
├── docs/                       # Documentation and design files
│   └── figma/                  # Figma design files
└── test/                       # Test files
```

## Key Components

### Guards
- **AuthGuard**: Protects routes requiring authentication
- **AdminGuard**: Protects admin-only routes
- **RoleGuard**: Protects routes based on user permissions
- **GuestGuard**: Protects guest-only routes (login/register)

### Services
- **AuthService**: Authentication and user management
- **FilesService**: File upload and management
- **TasksService**: Task management and monitoring
- **SettingsService**: Application settings
- **ClientService**: Base API client with authentication

### Stores (Zustand)
- **AuthStore**: User authentication state with localStorage persistence

## API Integration

The frontend communicates with the backend API through services in `src/services/`. All API requests are automatically authenticated using JWT tokens stored in the auth store.

### Example API Call

```typescript
import { filesService } from '@/services';

// Upload a file
const file = new FormData();
file.append('file', csvFile);

const response = await filesService.upload(file);
```

## Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **Custom Theme**: Red primary color (`#EF4444`) with dark/light mode support
- **Shadcn UI**: Accessible, customizable component library
- **CSS Variables**: Theme customization via CSS variables in `globals.css`

## Permissions

The application supports the following permissions:
- `manage_roles` - Manage roles
- `manage_users` - Manage users
- `manage_datasets` - Manage datasets
- `manage_tasks` - Manage tasks
- `manage_app` - Full admin access
- `view_overview` - View overview dashboard
- `read_users` - Read user data
- `read_datasets` - Read dataset data
- `read_tasks` - Read task data
- `read_analysis` - Read analysis data

## Development Tips

### Adding a New Page

1. Create page in `src/app/[route]/page.tsx`
2. Add route guard if needed (import from `@/guards`)
3. Add navigation link in sidebar (if applicable)
4. Update types if needed

### Adding a New Component

1. Create component in `src/components/`
2. Use TypeScript for props
3. Follow existing component patterns
4. Use Shadcn UI components when possible

### API Integration

- Use services in `src/services/` for API calls
- Services are automatically configured with authentication
- Handle errors appropriately with error boundaries
- Use loading states for better UX

### Styling Components

- Use Tailwind CSS classes
- Follow the red theme color scheme
- Support both dark and light modes
- Use Shadcn UI components as base

## Troubleshooting

### Build Errors

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

### Authentication Issues

- Check API URL in `.env.local`
- Verify backend is running on the correct port
- Check browser console for errors
- Verify JWT token is being stored correctly

### Styling Issues

- Ensure Tailwind CSS is properly configured
- Check `globals.css` for theme variables
- Verify dark mode toggle is working
- Clear browser cache

### Real-time Updates Not Working

- Verify RabbitMQ is running
- Check AMQP connection in browser console
- Verify event listeners are properly set up
- Check network connectivity

## Testing

Run tests with:
```bash
npm test
npm run test:watch
npm run test:coverage
```

## License

MIT
