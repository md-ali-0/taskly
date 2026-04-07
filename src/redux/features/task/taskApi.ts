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
};

type CreateTaskPayload = {
  title: string;
  description?: string;
  status?: TaskStatus;
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
  }),
  overrideExisting: false,
});

export const { useCreateTaskMutation, useGetTasksQuery } = taskApi;
