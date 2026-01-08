# SprintLite - Folder Structure Documentation

## Overview
This document explains the complete folder structure of the SprintLite application, following Next.js 14+ App Router conventions with clear separation of concerns.

---

## Root Directory Structure

```
sprintlite/
├── app/                      # Next.js App Router (pages & API routes)
├── components/               # Reusable React components
├── lib/                      # Utility functions, actions, and helpers
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
├── scripts/                  # Utility scripts
├── .github/workflows/        # CI/CD pipelines
├── node_modules/             # Dependencies (git ignored)
├── .next/                    # Next.js build output (git ignored)
├── .env.*                    # Environment variables
├── docker-compose.yml        # Docker orchestration
├── Dockerfile                # Container definition
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
└── README.md                 # Project documentation
```

---

## App Directory (`app/`)

The `app/` directory follows Next.js App Router conventions with route groups for logical organization.

### Structure

```
app/
├── (auth)/                   # Authentication pages (no layout)
│   ├── layout.jsx           # Minimal layout for auth pages
│   ├── sign-in/
│   │   └── page.jsx         # Sign in page
│   └── sign-up/
│       └── page.jsx         # Sign up page
│
├── (main)/                   # Main application pages (with sidebar)
│   ├── layout.jsx           # Sidebar + header layout
│   ├── dashboard/
│   │   └── page.jsx         # Kanban board dashboard
│   ├── tasks/
│   │   ├── page.jsx         # All tasks table view
│   │   └── [id]/
│   │       └── page.jsx     # Task detail page
│   └── settings/
│       └── page.jsx         # Settings page
│
├── api/                      # API Routes
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.js     # POST /api/auth/login
│   │   ├── register/
│   │   │   └── route.js     # POST /api/auth/register
│   │   └── logout/
│   │       └── route.js     # POST /api/auth/logout
│   ├── tasks/
│   │   ├── route.js         # GET, POST /api/tasks
│   │   └── [id]/
│   │       └── route.js     # GET, PUT, DELETE /api/tasks/:id
│   └── users/
│       └── route.js         # GET /api/users
│
├── layout.jsx                # Root layout (global styles, fonts)
├── page.jsx                  # Home page (landing)
├── globals.css               # Global CSS styles
└── favicon.ico               # Favicon
```

### Route Groups Explained

**`(auth)` Group:**
- Pages without sidebar/navigation
- Simple centered layout
- Sign In, Sign Up pages

**`(main)` Group:**
- Pages with sidebar and header
- Full application layout
- Dashboard, Tasks, Settings

### Page Types

| Page | Path | Rendering | Description |
|------|------|-----------|-------------|
| Sign In | `/sign-in` | CSR | User login form |
| Sign Up | `/sign-up` | CSR | User registration form |
| Dashboard | `/dashboard` | SSR | Kanban board with live data |
| All Tasks | `/tasks` | SSR | Task table with filters |
| Task Detail | `/tasks/[id]` | SSR | Single task view with activity |
| Settings | `/settings` | CSR | Account and workspace settings |

---

## Components Directory (`components/`)

Reusable UI components following atomic design principles.

```
components/
├── TaskCard.jsx              # Task card for Kanban board
├── StatusBadge.jsx           # Status indicator (Todo, In Progress, Done)
├── PriorityBadge.jsx         # Priority indicator (Low, Medium, High)
├── UserAvatar.jsx            # User avatar with initials
├── Button.jsx                # Reusable button component
├── Modal.jsx                 # Modal dialog wrapper
├── Dropdown.jsx              # Dropdown menu component
└── LoadingSpinner.jsx        # Loading state indicator
```

### Component Usage

```jsx
// Example: Using TaskCard component
import { TaskCard } from '@/components/TaskCard';

<TaskCard 
  task={{
    title: "Design auth flow",
    status: "In Progress",
    priority: "High",
    assignee: {
      name: "Alex Chen",
      initials: "AC",
      avatarColor: "bg-blue-600"
    }
  }}
/>
```

---

## Lib Directory (`lib/`)

Business logic, utilities, and server actions.

```
lib/
├── db.js                     # Prisma client instance
├── db-actions.js             # Database helper functions
├── tasks/
│   └── index.js              # Task-related business logic
├── auth/
│   ├── session.js            # Session management
│   ├── password.js           # Password hashing/validation
│   └── middleware.js         # Auth middleware
├── utils/
│   ├── validation.js         # Input validation helpers
│   ├── formatting.js         # Data formatting utilities
│   └── constants.js          # App-wide constants
└── redis/
    └── client.js             # Redis client configuration
```

### Database Actions Example

```javascript
// lib/tasks/index.js
import { prisma } from '@/lib/db';

export async function getTasksByUser(userId) {
  return await prisma.task.findMany({
    where: { assigneeId: userId },
    include: { assignee: true, creator: true }
  });
}
```

---

## Prisma Directory (`prisma/`)

Database schema and migration files.

```
prisma/
├── schema.prisma             # Database schema definition
└── migrations/               # Migration history (auto-generated)
    └── YYYYMMDDHHMMSS_name/
        └── migration.sql
```

### Schema Overview

**Models:**
- `User` - Application users with authentication
- `Task` - Core task entity with status, priority, assignments
- `Comment` - Activity feed for tasks
- `Session` - User authentication sessions

---

## API Routes Structure

### Authentication Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/auth/login` | User login | `{ email, password }` |
| POST | `/api/auth/register` | User registration | `{ name, email, password }` |
| POST | `/api/auth/logout` | User logout | - |

### Task Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/tasks` | Get all tasks | Query: `?status=Todo&assignee=userId` |
| POST | `/api/tasks` | Create new task | `{ title, description, assigneeId, priority }` |
| GET | `/api/tasks/:id` | Get single task | - |
| PUT | `/api/tasks/:id` | Update task | `{ title, status, priority, etc. }` |
| DELETE | `/api/tasks/:id` | Delete task | - |

### User Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/users` | Get all users | - |
| GET | `/api/users/:id` | Get single user | - |
| PUT | `/api/users/:id` | Update user | `{ name, email, avatar }` |

---

## Environment Files

```
.env.development              # Local development environment
.env.staging                  # Staging environment
.env.production               # Production environment
.env.example                  # Template for environment variables
```

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/sprintlite"

# Redis
REDIS_URL="redis://localhost:6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Auth (JWT)
JWT_SECRET="your-secret-key"

# Email (SendGrid)
SENDGRID_API_KEY="your-api-key"

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="sprintlite-uploads"
```

---

## Docker Files

```
Dockerfile                    # Multi-stage container definition
docker-compose.yml            # Orchestration (app, DB, Redis)
.dockerignore                 # Files to exclude from Docker build
```

### Docker Services

1. **app** - Next.js application (port 3000)
2. **postgres** - PostgreSQL database (port 5432)
3. **redis** - Redis cache (port 6379)

---

## Scripts Directory (`scripts/`)

Utility scripts for development and testing.

```
scripts/
├── test-db.js                # Test database connection
├── verify-env.js             # Verify environment configuration
└── seed-db.js                # Seed database with sample data
```

---

## CI/CD Structure (`.github/workflows/`)

```
.github/
└── workflows/
    └── ci.yml                # CI/CD pipeline definition
```

### Pipeline Stages

1. Lint & Type Check
2. Database Validation
3. Docker Build
4. Application Build (dev, staging, prod)
5. Deployment

---

## File Naming Conventions

### Pages
- Use `page.jsx` for route pages
- Use `layout.jsx` for layout components
- Use `loading.jsx` for loading states
- Use `error.jsx` for error boundaries

### Components
- PascalCase: `TaskCard.jsx`, `UserAvatar.jsx`
- Descriptive names indicating purpose

### API Routes
- Use `route.js` for API endpoints
- RESTful naming: `/api/resource` and `/api/resource/[id]`

### Utilities
- camelCase: `validation.js`, `formatting.js`
- Group related utilities in folders

---

## Import Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/app/*": ["app/*"]
    }
  }
}
```

### Usage

```javascript
// Instead of: import { TaskCard } from '../../../components/TaskCard'
import { TaskCard } from '@/components/TaskCard';

// Instead of: import { getTasksByUser } from '../../../lib/tasks'
import { getTasksByUser } from '@/lib/tasks';
```

---

## Best Practices

### 1. Route Groups
- Use `(group)` for logical organization without affecting URLs
- Keep auth pages separate from main app pages

### 2. Server vs Client Components
- Default to Server Components for better performance
- Use `'use client'` only when needed (forms, interactive UI)

### 3. API Route Structure
- One file per resource
- Use dynamic segments `[id]` for specific resources
- Handle all HTTP methods in single route file

### 4. Component Organization
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use composition over prop drilling

### 5. Database Access
- Always use Prisma client from `lib/db.js`
- Never access database directly from components
- Use server actions or API routes

---

## Adding New Features

### Adding a New Page

1. Create file in appropriate route group:
   ```
   app/(main)/new-feature/page.jsx
   ```

2. Add navigation link in layout:
   ```jsx
   <Link href="/new-feature">New Feature</Link>
   ```

### Adding a New API Endpoint

1. Create route file:
   ```
   app/api/resource/route.js
   ```

2. Export HTTP method handlers:
   ```javascript
   export async function GET(request) { }
   export async function POST(request) { }
   ```

### Adding a New Component

1. Create component file:
   ```
   components/NewComponent.jsx
   ```

2. Export component:
   ```javascript
   export function NewComponent({ props }) { }
   ```

3. Use in pages:
   ```javascript
   import { NewComponent } from '@/components/NewComponent';
   ```

---

## Development Workflow

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Run with Docker:**
   ```bash
   docker-compose up -d
   ```

3. **Database migrations:**
   ```bash
   npm run db:push       # Push schema changes
   npm run db:migrate    # Create migration
   npm run db:studio     # Open Prisma Studio
   ```

4. **Code quality:**
   ```bash
   npm run lint          # Run ESLint
   npx tsc --noEmit      # Type check
   ```

---

## Deployment Structure

### Vercel (Recommended)
- Automatic deployments from Git
- Environment variables in dashboard
- Separate environments for branches

### Docker Deployment
- Build image: `docker build -t sprintlite .`
- Run container: `docker-compose up`
- Scale: `docker-compose up --scale app=3`

### AWS/Azure
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides

---

## Troubleshooting

### Common Issues

**1. Module not found:**
- Check import paths use `@/` alias
- Verify file exists in correct location

**2. Prisma errors:**
- Run `npm run db:generate` after schema changes
- Check DATABASE_URL is correct

**3. Page not found:**
- Ensure `page.jsx` exists in route folder
- Check route group parentheses don't affect URL

**4. Build errors:**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm ci`

---

## Summary

The SprintLite folder structure follows Next.js best practices with clear separation between:
- **Pages** (`app/`) - UI and routing
- **Components** (`components/`) - Reusable UI
- **Business Logic** (`lib/`) - Server actions and utilities
- **Database** (`prisma/`) - Schema and migrations
- **API** (`app/api/`) - Backend endpoints

This structure supports:
- ✅ Easy navigation and discoverability
- ✅ Clear separation of concerns
- ✅ Scalability as the project grows
- ✅ Team collaboration with minimal conflicts
- ✅ Type safety with TypeScript
- ✅ Performance optimization with Server Components

For more information, see [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md).
