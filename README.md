# Taskly

Taskly is a small full-stack task management system built for the assessment requirement of a role-based task manager with audit logging.

This repository contains both applications in one place:

- `client/` - Next.js frontend
- `server/` - NestJS backend

The focus of this project is clean architecture, maintainable code structure, role-based access control, and a usable audit trail for important task actions.

## Features

### Authentication

- JWT-based authentication
- Cookie and client-session aware frontend flow
- Sign in and sign up pages
- Protected dashboard routes with proxy-based route handling

### Role-Based Access

Two roles are supported:

- `ADMIN`
- `USER`

#### Admin can

- Create tasks
- Update tasks
- Delete tasks
- Assign or reassign tasks
- View all tasks
- View audit logs
- View users for assignment flow

#### User can

- View assigned tasks
- Update their own assigned task status

### Task Management

Each task includes:

- `title`
- `description`
- `status`
- `assigned user`
- `created by`
- `createdAt`
- `updatedAt`

Current status values used in the application:

- `PENDING`
- `IN_PROGRESS`
- `DONE`

### Audit Logging

Important task actions are logged automatically:

- Task creation
- Task update
- Task deletion
- Task assignment or unassignment
- Task status changes

Each audit log includes:

- Actor
- Action type
- Target entity
- Summary
- Before/after data
- Timestamp

## Tech Stack

### Frontend

- Next.js 16
- React 19
- Ant Design
- Redux Toolkit + RTK Query

### Backend

- NestJS
- Prisma 7
- PostgreSQL

### Dev and Runtime

- Docker
- Docker Compose
- PNPM

## Repository Structure

```text
.
├─ client/
│  ├─ src/
│  ├─ Dockerfile
│  └─ package.json
├─ server/
│  ├─ prisma/
│  ├─ src/
│  ├─ Dockerfile
│  ├─ docker-compose.yml
│  └─ package.json
├─ docker-compose.yml
└─ README.md
```

Important note:

- Root `docker-compose.yml` runs the full stack
- `server/docker-compose.yml` is also available for backend-only setup

## Demo Credentials

Pre-seeded demo users:

- Admin
  - Email: `admin@taskly.com`
  - Password: `Admin@123456`
- User
  - Email: `user@taskly.com`
  - Password: `User@123456`

## Run With Docker

From the repository root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on `5432`
- NestJS API on `5000`
- Next.js frontend on `3000`

After startup:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/health](http://localhost:5000/health)

## Run Locally Without Docker

### 1. Backend

```bash
cd server
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma:seed
pnpm start:dev
```

### 2. Frontend

In a new terminal:

```bash
cd client
pnpm install
pnpm dev
```

## Environment

### Backend

The backend uses:

- `.env`
- `.env.local`
- `.env.production`
- `.env.example`

Main backend variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SESSION_SECRET`
- `PORT`
- `API_PREFIX`
- `CORS_ORIGIN`

### Frontend

Main frontend variable:

- `NEXT_PUBLIC_API_URL`

## Main Application Routes

### Frontend routes

- `/auth/signin`
- `/auth/signup`
- `/dashboard`
- `/dashboard/tasks`
- `/dashboard/my-tasks`
- `/dashboard/audit-logs`

### Backend routes

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh-token`
- `GET /api/v1/users`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/my-tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id/assign`
- `PATCH /api/v1/tasks/:id/status`
- `DELETE /api/v1/tasks/:id`
- `GET /api/v1/audit-logs`
- `GET /health`

## What Was Prioritized

This implementation prioritizes:

- Clean NestJS module separation
- Shared request validation and error handling
- Reusable frontend dashboard shell
- Role-aware UI and route protection
- Cursor-based task and audit log listing
- Clear auditability for reviewer-facing flows

## AI Usage

AI assistance was used during development for:

- Migrating and organizing the backend into NestJS modules
- Refactoring frontend auth flow and dashboard structure
- Designing Docker setup and repository structure
- Improving Prisma model setup and API consistency

The final implementation, cleanup, and integration decisions were manually reviewed and adjusted to match the assignment scope.

## Submission Checklist

- Full source code in one repository
- Docker setup included
- Demo credentials included
- Audit logging implemented
- Role-based access implemented
- Frontend and backend connected

## Notes

- The project keeps the scope focused on the assignment instead of adding unnecessary extra services.
- `server/docker-compose.yml` can still be used independently for backend-only development.
- Root `docker compose up --build` is the recommended way to run the full submission.
