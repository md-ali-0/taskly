"use client";

import Table from "@/components/ui/data-table";
import { useGetAuditLogsQuery } from "@/redux/features/audit-log/auditLogApi";
import type { AuditAction, AuditLog } from "@/types";
import {
  AuditOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Card, Col, Input, Row, Select, Tag } from "antd";
import type { ColumnType } from "antd/es/table";
import { useMemo, useState } from "react";

const actionOptions: { label: string; value: AuditAction }[] = [
  { label: "Task Created", value: "TASK_CREATED" },
  { label: "Task Updated", value: "TASK_UPDATED" },
  { label: "Task Deleted", value: "TASK_DELETED" },
  { label: "Task Assigned", value: "TASK_ASSIGNED" },
  { label: "Status Changed", value: "TASK_STATUS_CHANGED" },
];

function renderActionTag(action: AuditAction) {
  switch (action) {
    case "TASK_CREATED":
      return <Tag color="success">Created</Tag>;
    case "TASK_UPDATED":
      return <Tag color="processing">Updated</Tag>;
    case "TASK_DELETED":
      return <Tag color="error">Deleted</Tag>;
    case "TASK_ASSIGNED":
      return <Tag color="purple">Assigned</Tag>;
    default:
      return <Tag color="gold">Status Changed</Tag>;
  }
}

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({
    1: undefined,
  });

  const currentCursor = pageCursors[page];
  const { data, isLoading, isFetching } = useGetAuditLogsQuery({
    limit,
    cursor: currentCursor,
    action:
      actionFilter === "all" ? undefined : (actionFilter as AuditAction),
  });

  const payload = data?.data;
  const logs = useMemo(() => {
    const rows = payload?.data ?? [];

    if (!searchText.trim()) {
      return rows;
    }

    const query = searchText.trim().toLowerCase();

    return rows.filter((log) => {
      const actor =
        log.actor?.name?.toLowerCase() ?? log.actor?.email?.toLowerCase() ?? "";
      const summary = log.summary?.toLowerCase() ?? "";
      const entityId = log.entityId.toLowerCase();

      return (
        actor.includes(query) ||
        summary.includes(query) ||
        entityId.includes(query)
      );
    });
  }, [payload?.data, searchText]);
  const nextCursor = payload?.meta?.nextCursor ?? null;
  const hasMore = payload?.meta?.hasMore ?? false;
  const syntheticTotal = hasMore
    ? page * limit + 1
    : (page - 1) * limit + logs.length;

  const meta = useMemo(
    () => ({
      limit,
      page,
      total: syntheticTotal,
      totalPage: Math.max(1, Math.ceil(syntheticTotal / limit)),
      hasMore,
      nextCursor,
    }),
    [hasMore, limit, nextCursor, page, syntheticTotal],
  );

  const stats = useMemo(
    () => ({
      total: logs.length,
      created: logs.filter((log) => log.action === "TASK_CREATED").length,
      updated: logs.filter((log) =>
        ["TASK_UPDATED", "TASK_STATUS_CHANGED", "TASK_ASSIGNED"].includes(
          log.action,
        ),
      ).length,
      deleted: logs.filter((log) => log.action === "TASK_DELETED").length,
    }),
    [logs],
  );

  const columns: ColumnType<AuditLog>[] = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (value: AuditAction) => renderActionTag(value),
    },
    {
      title: "Summary",
      key: "summary",
      render: (_, record) => (
        <div>
          <p className="font-medium text-slate-900">
            {record.summary || "No summary"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Task ID: {record.entityId}
          </p>
        </div>
      ),
    },
    {
      title: "Actor",
      key: "actor",
      render: (_, record) =>
        record.actor?.name || record.actor?.email || "System",
    },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) =>
        new Date(value).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  const resetPagination = (nextLimit = limit) => {
    setPage(1);
    setLimit(nextLimit);
    setPageCursors({ 1: undefined });
  };

  const handleActionChange = (value: string) => {
    setActionFilter(value);
    resetPagination();
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) {
      return;
    }

    if (nextPage > page && nextCursor) {
      setPageCursors((prev) => ({
        ...prev,
        [nextPage]: prev[nextPage] ?? nextCursor,
      }));
    }

    setPage(nextPage);
  };

  const handleLimitChange = (nextLimit: number) => {
    resetPagination(nextLimit);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Audit Logs
        </h1>
        <p className="text-muted-foreground">
          Review every important task action across creation, updates, deletes,
          assignments, and status changes.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="glass-panel shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visible Logs</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {stats.total}
                </p>
              </div>
              <AuditOutlined className="text-xl text-primary" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="glass-panel shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {stats.created}
                </p>
              </div>
              <AuditOutlined className="text-xl text-emerald-500" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="glass-panel shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Updated</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {stats.updated}
                </p>
              </div>
              <EditOutlined className="text-xl text-sky-500" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="glass-panel shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deleted</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {stats.deleted}
                </p>
              </div>
              <DeleteOutlined className="text-xl text-rose-500" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        variant="borderless"
        className="shadow-sm border-border/40 bg-card backdrop-blur-sm"
      >
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search actor, summary, task id..."
              prefix={<SearchOutlined className="text-muted-foreground" />}
              value={searchText}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="w-full sm:w-[320px]"
              allowClear
            />
            <Select
              value={actionFilter}
              onChange={handleActionChange}
              style={{ width: 190 }}
              className="shrink-0"
            >
              <Select.Option value="all">All Actions</Select.Option>
              {actionOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="rounded-2xl bg-white">
          <Table<AuditLog>
            columns={columns}
            data={logs}
            meta={meta}
            isLoading={isLoading}
            isFetching={isFetching}
            page={page}
            setPage={handlePageChange}
            limit={limit}
            setLimit={handleLimitChange}
            showSizeChanger
            urlParamsUpdate={false}
            isSerial
            enableBulkActions={false}
          />
        </div>
      </Card>
    </div>
  );
}
