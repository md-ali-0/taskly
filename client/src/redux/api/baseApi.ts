import config from "@/config";
import { getSession } from "@/lib/session";
import { tagTypes } from "@/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.host}/api/v1`,
    credentials: "include",
    prepareHeaders: async (headers, { getState }) => {
      const state = getState() as {
        auth?: {
          accessToken?: string | null;
        };
      };

      const persistedSession = await getSession();
      const accessToken =
        state.auth?.accessToken || persistedSession?.accessToken || null;

      if (accessToken) {
        headers.set("authorization", `Bearer ${accessToken}`);
      }

      return headers;
    },
  }),
  tagTypes,
  endpoints: () => ({}),
});
