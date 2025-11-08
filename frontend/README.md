# Dallosh Analysis Frontend

Next.js frontend application for the Dallosh Analysis platform. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom theme
- **Zustand** for state management
- **Shadcn UI** components
- **Role-based Access Control** with permission-based navigation
- **Real-time Updates** via Server-Sent Events (SSE)
- **Dark/Light Mode** support
- **Responsive Design** (mobile-first)

## Prerequisites

- Node.js 20+
- npm, yarn, or pnpm

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
NEXT_PUBLIC_API_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

### Real-time Features

- **Task Events**: Server-Sent Events (SSE) for real-time task updates
- **Activity Logs**: Live task progression tracking

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

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

## License

ISC
