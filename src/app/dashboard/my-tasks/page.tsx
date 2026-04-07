"use client";

import Table from "@/components/ui/data-table";
import { useGetTasksQuery } from "@/redux/features/task/taskApi";
import { useAppSelector } from "@/redux/hooks";
import type { Task, TaskStatus } from "@/types";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Card, Col, Input, Row, Select, Tag } from "antd";
import type { ColumnType } from "antd/es/table";
import { useMemo, useState } from "react";

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

function renderStatus(status: TaskStatus) {
  if (status === "DONE") {
    return <Tag color="success">Done</Tag>;
  }

  if (status === "IN_PROGRESS") {
    return <Tag color="processing">In Progress</Tag>;
  }

  return <Tag color="default">Pending</Tag>;
}

export default function MyTasksPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const userId = authUser?.id;

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({
    1: undefined,
  });

  const currentCursor = pageCursors[page];

  const { data, isLoading, isFetching } = useGetTasksQuery(
    userId
      ? {
          limit,
          cursor: currentCursor,
          status: statusFilter === "all" ? undefined : (statusFilter as TaskStatus),
          search: searchText || undefined,
          assignedUserId: userId,
        }
      : undefined,
  );

  const payload = data?.data;
  const tasks = useMemo(() => payload?.data ?? [], [payload?.data]);
  const nextCursor = payload?.meta?.nextCursor ?? null;
  const hasMore = payload?.meta?.hasMore ?? false;
  const syntheticTotal = hasMore ? page * limit + 1 : (page - 1) * limit + tasks.length;

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
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "PENDING").length,
      inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      done: tasks.filter((task) => task.status === "DONE").length,
    }),
    [tasks],
  );

  const columns: ColumnType<Task>[] = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <div>
          <p className="font-semibold text-slate-900">{record.title}</p>
          <p className="mt-1 text-sm text-slate-500">
            {record.description || "No description"}
          </p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: TaskStatus) => renderStatus(value),
      filters: statusOptions.map((option) => ({
        text: option.label,
        value: option.value,
      })),
    },
    {
      title: "Created By",
      key: "createdBy",
      render: (_, record) =>
        record.createdBy?.name || record.createdBy?.email || "Unknown",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) =>
        new Date(value).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  const resetPagination = (nextLimit = limit) => {
    setPage(1);
    setLimit(nextLimit);
    setPageCursors({ 1: undefined });
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    resetPagination();
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    resetPagination();
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Tasks</h1>
        <p className="text-muted-foreground">
          Review the tasks assigned to you and keep track of your workload.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" className="glass-panel shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned Tasks</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{stats.total}</p>
              </div>
              <ClockCircleOutlined className="text-xl text-[var(--primary)]" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" className="glass-panel shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{stats.inProgress}</p>
              </div>
              <SyncOutlined className="text-xl text-sky-500" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" className="glass-panel shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{stats.done}</p>
              </div>
              <CheckCircleOutlined className="text-xl text-emerald-500" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm border-border/40 bg-card backdrop-blur-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search my tasks..."
              prefix={<SearchOutlined className="text-muted-foreground" />}
              value={searchText}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="w-full sm:w-[320px]"
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              style={{ width: 170 }}
              className="shrink-0"
              classNames={{
                popup: {
                  root: "glass-dropdown",
                },
              }}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="DONE">Done</Select.Option>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl bg-white">
          <Table<Task>
            columns={columns}
            data={tasks}
            meta={meta}
            isLoading={isLoading}
            isFetching={isFetching}
            page={page}
            setPage={handlePageChange}
            limit={limit}
            setLimit={handleLimitChange}
            setStatus={(value) => handleStatusChange(value ?? "all")}
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
