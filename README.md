# Todo App

A minimal three-tier TypeScript application with Next.js frontend, Express API, and PostgreSQL database managed by Prisma.

## Architecture

- **Frontend**: Next.js 14 with App Router (TypeScript)
- **API**: Express.js with Prisma ORM (TypeScript)
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **Future Deployment**: Kubernetes with ArgoCD

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Run with Docker Compose

1. **Clone and navigate to the project:**
   ```bash
   cd todo-app
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8080
   - API Health: http://localhost:8080/healthz
   - Frontend Health: http://localhost:3000/api/healthz

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start database only:**
   ```bash
   docker-compose up db -d
   ```

3. **Set up environment files:**
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/frontend/.env.example apps/frontend/.env.local
   ```

4. **Run database migrations:**
   ```bash
   cd apps/api
   npm run prisma:migrate
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

## Project Structure

```
todo-app/
├── package.json              # Root workspace configuration
├── tsconfig.base.json        # Shared TypeScript config
├── docker-compose.yml        # Multi-service orchestration
├── .env.example              # Environment variables template
├── apps/
│   ├── api/                  # Express.js API service
│   │   ├── src/
│   │   │   ├── index.ts      # Server bootstrap
│   │   │   ├── health.ts     # Health check endpoints
│   │   │   ├── routes/
│   │   │   │   └── todos.ts  # CRUD endpoints
│   │   │   ├── lib/
│   │   │   │   └── prisma.ts # Database client
│   │   │   ├── middleware/
│   │   │   │   └── error.ts  # Error handling
│   │   │   └── types.ts      # TypeScript interfaces
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── Dockerfile        # API container config
│   └── frontend/             # Next.js frontend service
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx     # Root layout
│       │   │   ├── page.tsx       # Home page (redirects)
│       │   │   └── todos/
│       │   │       ├── actions.ts # Server actions
│       │   │       └── page.tsx   # Todo list page
│       │   ├── lib/
│       │   │   └── api.ts         # API client
│       │   ├── pages/api/
│       │   │   └── healthz.ts     # Health endpoint
│       │   └── types.ts           # TypeScript interfaces
│       └── Dockerfile             # Frontend container config
```

## Features

- ✅ **Full CRUD Operations**: Create, read, update, delete todos
- ✅ **Server-Side Rendering**: Next.js App Router with SSR
- ✅ **Server Actions**: Form handling with React Server Components
- ✅ **Type Safety**: TypeScript throughout the stack
- ✅ **Database Migrations**: Prisma schema and migration management
- ✅ **Health Checks**: Health and readiness endpoints for both services
- ✅ **Docker Support**: Containerized services with proper orchestration
- ✅ **Graceful Shutdown**: Proper signal handling and cleanup

## API Endpoints

- `GET /todos` - List all todos
- `POST /todos` - Create a new todo
- `PATCH /todos/:id` - Update/toggle a todo
- `DELETE /todos/:id` - Delete a todo
- `GET /healthz` - Health check
- `GET /readyz` - Readiness check (includes DB connectivity)

## Data Model

```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## Environment Variables

### Root (.env)
```env
POSTGRES_USER=todo
POSTGRES_PASSWORD=todo
POSTGRES_DB=todo
DATABASE_URL=postgresql://todo:todo@localhost:5432/todo?schema=public
API_PORT=8080
FRONTEND_PORT=3000
API_BASE_URL_INTERNAL=http://api:8080
```

### API (apps/api/.env)
```env
DATABASE_URL=postgresql://todo:todo@localhost:5432/todo?schema=public
PORT=8080
NODE_ENV=development
```

### Frontend (apps/frontend/.env.local)
```env
API_BASE_URL_INTERNAL=http://api:8080
```

## Scripts

```bash
# Development
npm run dev              # Start both API and frontend in dev mode
npm run build            # Build both services
npm run start            # Start both services in production mode

# Docker
npm run docker:build    # Build Docker images
npm run docker:up       # Start with docker-compose
npm run docker:down     # Stop containers

# Utilities
npm run clean           # Clean build artifacts
npm run type-check      # Run TypeScript checks
```

## Database Management

```bash
# Generate Prisma client
cd apps/api && npm run prisma:generate

# Create and run migrations
cd apps/api && npm run prisma:migrate

# Deploy migrations (production)
cd apps/api && npm run prisma:deploy

# Open Prisma Studio
cd apps/api && npm run prisma:studio

# Reset database
cd apps/api && npm run prisma:reset
```

## Future Kubernetes Deployment

This application is designed for easy Kubernetes deployment:

**Planned Architecture:**
- **Namespace**: `todo-dev`
- **Workloads**: 
  - `Deployment` for frontend
  - `Deployment` for API
  - `StatefulSet` for PostgreSQL
- **Services**: `frontend-svc`, `api-svc`, `postgres-svc`
- **Configuration**: 
  - `Secret` for DATABASE_URL
  - `ConfigMap` for API_BASE_URL_INTERNAL
- **Health Probes**: Wired to existing health endpoints
- **Migrations**: Init container or Job for `prisma migrate deploy`
- **Management**: ArgoCD Application for GitOps deployment

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8080, and 5432 are available
2. **Database connection**: Check if PostgreSQL is running and accessible
3. **Migrations**: Run `npm run prisma:migrate` if database schema is outdated
4. **Dependencies**: Run `npm install` in root and ensure workspace setup is correct

### Health Checks

- API: `curl http://localhost:8080/healthz`
- API Readiness: `curl http://localhost:8080/readyz`
- Frontend: `curl http://localhost:3000/api/healthz`

### Logs

```bash
# Docker logs
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f db

# Development logs
npm run dev  # Shows both API and frontend logs
```

## License

MIT
