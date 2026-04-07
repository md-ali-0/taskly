export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export type TaskUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedUserId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignedUser: TaskUser | null;
  createdBy: TaskUser;
};
