import { Prisma } from '@prisma/client';

export const taskUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
} satisfies Prisma.UserSelect;

export const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  assignedUserId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  assignedUser: {
    select: taskUserSelect,
  },
  createdBy: {
    select: taskUserSelect,
  },
} satisfies Prisma.TaskSelect;

export type TaskUserDto = Prisma.UserGetPayload<{
  select: typeof taskUserSelect;
}>;

export type TaskDto = Prisma.TaskGetPayload<{
  select: typeof taskSelect;
}>;
