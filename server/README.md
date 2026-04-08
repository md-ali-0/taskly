# Task Management System

This project is being built as a small task management system with role-based access control and audit logging.  
The goal of the assignment is to show clean architecture, maintainable code structure, and thoughtful backend design using NestJS and PostgreSQL.

## Assignment Goal

Build a task management system where:

- `Admin` can create, update, delete, and assign tasks
- `User` can view assigned tasks and update task status
- all important actions are stored in audit logs

The focus is not only feature completion, but also:

- architecture decisions
- code structure
- API design
- audit log quality
- maintainability

## Roles

### Admin

- Create tasks
- Update tasks
- Delete tasks
- Assign tasks to users
- View audit logs

### User

- View assigned tasks
- Update task status

## Authentication

The system uses predefined users.  
There is no public registration flow for this assignment.

Planned demo users:

- `admin@taskly.com`
- `user@taskly.com`

Default passwords:

- `Admin@123456`
- `User@123456`

## Task Model

Each task should include:

- `title`
- `description`
- `status`
- `assignedUser`
- `createdAt`
- `updatedAt`

Status values:

- `PENDING`
- `PROCESSING`
- `DONE`

## Audit Log Requirements

Audit logging is a core requirement of the assignment.

Important actions that must be logged:

- task creation
- task update
- task deletion
- task assignment changes
- task status changes

Each log should include:

- actor
- action type
- target entity
- relevant summary or before/after data

## Tech Stack

- Frontend: Next.js / React-based framework
- Backend: NestJS
- Database: PostgreSQL
- ORM: Prisma

## Repository Context

This repository currently contains the NestJS backend work inside:

- [taskly-server](C:\Users\Ali\Desktop\Projects\XE\taskly\taskly-server)

Other folders in the workspace:

- [client](C:\Users\Ali\Desktop\Projects\XE\taskly\client)
- [server](C:\Users\Ali\Desktop\Projects\XE\taskly\server) - previous backend reference

## Current Backend Structure

```text
src/
  common/
    auth/
    config/
    http/
  infrastructure/
    prisma/
  modules/
    auth/
    users/
    tasks/
    audit-logs/
    health/
    system/
prisma/
  models/
  schema.prisma
```

## Local Setup

Install dependencies:

```bash
corepack pnpm install
```

Generate Prisma client:

```bash
corepack pnpm prisma generate
```

Build the backend:

```bash
corepack pnpm build
```

Run the backend:

```bash
corepack pnpm start
```

Run in development mode:

```bash
corepack pnpm start:dev
```

## Environment Files

Environment handling is set up with:

- `.env`
- `.env.local`
- `.env.production`
- `.env.example`

The Prisma config and Nest runtime both read from the same environment file flow.

## Useful Commands

```bash
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma:seed
pnpm prisma studio
pnpm lint
pnpm build
pnpm start:dev
```

## Deliverables Checklist

The final submission is expected to include:

1. Source code repository
2. Docker setup so `docker compose up` can run the project
3. Demo credentials in the repository README
4. Short demo video
5. Major AI prompts used during development

## AI Usage

AI tools were used to speed up migration, refactoring, and architecture planning.  
For final submission, this section should include:

- the prompt
- why the prompt was used
- what part of the system it helped with

## Notes

- Keep the system simple but well-structured
- Clean design is preferred over unnecessary extra features
- Keep the backend focused on the assignment scope: auth, users, tasks, and audit logs
