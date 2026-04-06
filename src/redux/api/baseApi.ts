import config from "@/config";
import { tagTypes } from "@/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.host}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as {
        auth?: {
          accessToken?: string | null;
        };
      };

      const accessToken = state.auth?.accessToken;

      if (accessToken) {
        headers.set("authorization", accessToken);
      }

      return headers;
    },
  }),
  tagTypes,
  endpoints: () => ({}),
});
