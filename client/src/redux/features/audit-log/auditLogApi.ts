import { tags } from "@/constants";
import type { AuditAction, AuditLog, TMeta, TResponse } from "@/types";
import { baseApi } from "../../api/baseApi";

type AuditLogsListPayload = {
  data: AuditLog[];
  meta: TMeta;
};

type GetAuditLogsParams = {
  limit?: number;
  cursor?: string;
  action?: AuditAction;
};

export const auditLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      TResponse<AuditLogsListPayload>,
      GetAuditLogsParams | void
    >({
      query: (params) => ({
        url: "/audit-logs",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: [tags.auditLogTag],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery } = auditLogApi;
