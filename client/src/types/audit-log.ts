export type AuditAction =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED";

export type AuditEntityType = "TASK";

export type AuditLogActor = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
};

export type AuditLog = {
  id: string;
  actorId?: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  createdAt: string;
  actor?: AuditLogActor | null;
};
