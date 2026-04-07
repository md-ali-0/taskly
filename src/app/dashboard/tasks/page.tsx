"use client";

import {
  useCreateTaskMutation,
  useGetTasksQuery,
  type Task,
  type TaskStatus,
} from "@/redux/features/task/taskApi";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

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

export default function TasksPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [pages, setPages] = useState<Task[]>([]);

  const { data, isFetching, isLoading } = useGetTasksQuery({
    limit: 10,
    cursor,
  });
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  const payload = data?.data;
  const tasks = cursor ? [...pages, ...(payload?.data ?? [])] : payload?.data ?? [];
  const nextCursor = payload?.meta?.nextCursor ?? null;
  const hasMore = payload?.meta?.hasMore ?? false;

  const columns: ColumnsType<Task> = [
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
    },
    {
      title: "Assigned To",
      key: "assignedUser",
      render: (_, record) =>
        record.assignedUser?.name || record.assignedUser?.email || "Unassigned",
    },
    {
      title: "Created By",
      key: "createdBy",
      render: (_, record) =>
        record.createdBy?.name || record.createdBy?.email || "Unknown",
    },
  ];

  const handleCreate = async (values: {
    title: string;
    description?: string;
    status?: TaskStatus;
  }) => {
    try {
      await createTask(values).unwrap();
      message.success("Task created successfully.");
      form.resetFields();
      setOpen(false);
      setCursor(undefined);
      setPages([]);
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to create task";

      message.error(errorMessage);
    }
  };

  const handleLoadMore = () => {
    if (!nextCursor) {
      return;
    }

    setPages(tasks);
    setCursor(nextCursor);
  };

  return (
    <div className="space-y-6">
      <section className="surface-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">
              Task Management
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
              Tasks
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create tasks from here and review the latest work items in a single table.
            </p>
          </div>

          <Button type="primary" size="large" onClick={() => setOpen(true)}>
            Create Task
          </Button>
        </div>
      </section>

      <section className="surface-card p-4 sm:p-6">
        <Table<Task>
          rowKey="id"
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={tasks}
          pagination={false}
        />

        <div className="mt-4 flex justify-end">
          <Button onClick={handleLoadMore} disabled={!hasMore || isFetching}>
            Load More
          </Button>
        </div>
      </section>

      <Modal
        open={open}
        title="Create Task"
        footer={null}
        onCancel={() => setOpen(false)}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ status: "PENDING" }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Task title" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} placeholder="Task description" />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select options={statusOptions} />
          </Form.Item>

          <Space className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isCreating}>
              Save Task
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
