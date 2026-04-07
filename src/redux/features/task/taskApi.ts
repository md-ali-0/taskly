import { tags } from "@/constants";
import { baseApi } from "../../api/baseApi";

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

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type TaskListPayload = {
  data: Task[];
  meta: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
};

type GetTasksParams = {
  limit?: number;
  cursor?: string;
  status?: TaskStatus;
  search?: string;
};

type CreateTaskPayload = {
  title: string;
  description?: string;
  status?: TaskStatus;
};

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<ApiResponse<TaskListPayload>, GetTasksParams | void>({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        params,
      }),
      providesTags: [tags.taskTag],
    }),
    createTask: builder.mutation<ApiResponse<Task>, CreateTaskPayload>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: [tags.taskTag],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateTaskMutation, useGetTasksQuery } = taskApi;
