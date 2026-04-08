import { tags } from "@/constants";
import type { Task, TaskStatus, TResponse } from "@/types";
import { baseApi } from "../../api/baseApi";

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
  assignedUserId?: string;
  createdById?: string;
};

type CreateTaskPayload = {
  title: string;
  description?: string;
  status?: TaskStatus;
};

type UpdateTaskPayload = {
  taskId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
};

type AssignTaskPayload = {
  taskId: string;
  assignedUserId?: string | null;
};

type UpdateTaskStatusPayload = {
  taskId: string;
  status: TaskStatus;
};

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TResponse<TaskListPayload>, GetTasksParams | void>({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: [tags.taskTag],
    }),
    createTask: builder.mutation<TResponse<Task>, CreateTaskPayload>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: [tags.taskTag],
    }),
    updateTask: builder.mutation<TResponse<Task>, UpdateTaskPayload>({
      query: ({ taskId, ...body }) => ({
        url: `/tasks/${taskId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tags.taskTag],
    }),
    assignTask: builder.mutation<TResponse<Task>, AssignTaskPayload>({
      query: ({ taskId, assignedUserId }) => ({
        url: `/tasks/${taskId}/assign`,
        method: "PATCH",
        body: {
          assignedUserId: assignedUserId || null,
        },
      }),
      invalidatesTags: [tags.taskTag],
    }),
    deleteTask: builder.mutation<TResponse<{ message: string }>, { taskId: string }>({
      query: ({ taskId }) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: [tags.taskTag],
    }),
    updateTaskStatus: builder.mutation<TResponse<Task>, UpdateTaskStatusPayload>({
      query: ({ taskId, status }) => ({
        url: `/tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [tags.taskTag],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAssignTaskMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} = taskApi;
