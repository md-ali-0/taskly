import { Prisma } from '@prisma/client';

export const auditActorSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
} satisfies Prisma.UserSelect;

export const auditLogSelect = {
  id: true,
  actorId: true,
  action: true,
  entityType: true,
  entityId: true,
  summary: true,
  before: true,
  after: true,
  createdAt: true,
  actor: {
    select: auditActorSelect,
  },
} satisfies Prisma.AuditLogSelect;

export type AuditLogActorDto = Prisma.UserGetPayload<{
  select: typeof auditActorSelect;
}>;

export type AuditLogDto = Prisma.AuditLogGetPayload<{
  select: typeof auditLogSelect;
}>;
