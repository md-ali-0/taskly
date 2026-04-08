import { tags } from "@/constants";
import type { TMeta, TResponse, User } from "@/types";
import { baseApi } from "../../api/baseApi";

type UsersListPayload = {
  data: User[];
  meta: TMeta & {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
};

type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<TResponse<UsersListPayload>, GetUsersParams | void>({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: [tags.userTag],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery } = usersApi;
