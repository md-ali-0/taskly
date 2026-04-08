"use client";

import Table from "@/components/ui/data-table";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "@/redux/hooks";
import {
  useAssignTaskMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "@/redux/features/task/taskApi";
import { useGetUsersQuery } from "@/redux/features/users/usersApi";
import type { Task, TaskStatus, User } from "@/types";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
} from "antd";
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

export default function TasksPage() {
    const { message } = App.useApp();
    const [createForm] = Form.useForm();
    const [assignForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [pageCursors, setPageCursors] = useState<
        Record<number, string | undefined>
    >({ 1: undefined });

    const currentCursor = pageCursors[page];
    const authUser = useAppSelector((state) => state.auth.user);
    const isAdmin = authUser?.role === "ADMIN";

    const { data, isFetching, isLoading } = useGetTasksQuery({
        limit,
        cursor: currentCursor,
        status:
            statusFilter === "all" ? undefined : (statusFilter as TaskStatus),
        search: searchText || undefined,
    });
    const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
    const [assignTask, { isLoading: isAssigning }] = useAssignTaskMutation();
    const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
    const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
    const { data: usersData, isLoading: isUsersLoading } = useGetUsersQuery(
        isAdmin
            ? {
                  page: 1,
                  limit: 100,
                  status: "ACTIVE",
              }
            : skipToken,
    );

    const payload = data?.data;
    const tasks = useMemo(() => payload?.data ?? [], [payload?.data]);
    const assignableUsers = useMemo(
        () => (usersData?.data?.data ?? []) as User[],
        [usersData?.data?.data],
    );
    const nextCursor = payload?.meta?.nextCursor ?? null;
    const hasMore = payload?.meta?.hasMore ?? false;
    const syntheticTotal = hasMore
        ? page * limit + 1
        : (page - 1) * limit + tasks.length;

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
            inProgress: tasks.filter((task) => task.status === "IN_PROGRESS")
                .length,
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
                    <p className="font-semibold text-slate-900">
                        {record.title}
                    </p>
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
            title: "Assigned To",
            key: "assignedUser",
            render: (_, record) =>
                record.assignedUser?.name ||
                record.assignedUser?.email ||
                "Unassigned",
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

    if (isAdmin) {
        columns.push({
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedTask(record);
                            setEditOpen(true);
                            editForm.setFieldsValue({
                                title: record.title,
                                description: record.description ?? "",
                                status: record.status,
                            });
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        icon={<UserSwitchOutlined />}
                        onClick={() => {
                            setSelectedTask(record);
                            setAssignOpen(true);
                            assignForm.setFieldsValue({
                                assignedUserId: record.assignedUserId ?? undefined,
                            });
                        }}
                    >
                        {record.assignedUserId ? "Reassign" : "Assign"}
                    </Button>
                    <Popconfirm
                        title="Delete this task?"
                        description="This action will remove the task from active lists."
                        okText="Delete"
                        cancelText="Cancel"
                        onConfirm={async () => {
                            setDeletingTaskId(record.id);
                            try {
                                await deleteTask({ taskId: record.id }).unwrap();
                                message.success("Task deleted successfully.");
                            } catch (error: unknown) {
                                const errorMessage =
                                    typeof error === "object" &&
                                    error !== null &&
                                    "data" in error &&
                                    typeof error.data === "object" &&
                                    error.data !== null &&
                                    "message" in error.data
                                        ? String(error.data.message)
                                        : "Failed to delete task";

                                message.error(errorMessage);
                            } finally {
                                setDeletingTaskId(null);
                            }
                        }}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            loading={isDeleting && deletingTaskId === record.id}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        });
    }

    const handleCreate = async (values: {
        title: string;
        description?: string;
        status?: TaskStatus;
        assignedUserId?: string;
    }) => {
        try {
            await createTask(values).unwrap();
            message.success("Task created successfully.");
            createForm.resetFields();
            setOpen(false);
            setPage(1);
            setPageCursors({ 1: undefined });
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

    const handleAssign = async (values: { assignedUserId?: string }) => {
        if (!selectedTask) {
            return;
        }

        try {
            await assignTask({
                taskId: selectedTask.id,
                assignedUserId: values.assignedUserId || null,
            }).unwrap();
            message.success("Task assignment updated successfully.");
            setAssignOpen(false);
            setSelectedTask(null);
            assignForm.resetFields();
        } catch (error: unknown) {
            const errorMessage =
                typeof error === "object" &&
                error !== null &&
                "data" in error &&
                typeof error.data === "object" &&
                error.data !== null &&
                "message" in error.data
                    ? String(error.data.message)
                    : "Failed to assign task";

            message.error(errorMessage);
        }
    };

    const handleEdit = async (values: {
        title: string;
        description?: string;
        status?: TaskStatus;
    }) => {
        if (!selectedTask) {
            return;
        }

        try {
            await updateTask({
                taskId: selectedTask.id,
                title: values.title,
                description: values.description,
                status: values.status,
            }).unwrap();
            message.success("Task updated successfully.");
            setEditOpen(false);
            setSelectedTask(null);
            editForm.resetFields();
        } catch (error: unknown) {
            const errorMessage =
                typeof error === "object" &&
                error !== null &&
                "data" in error &&
                typeof error.data === "object" &&
                error.data !== null &&
                "message" in error.data
                    ? String(error.data.message)
                    : "Failed to update task";

            message.error(errorMessage);
        }
    };

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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Tasks
                    </h1>
                    <p className="text-muted-foreground">
                        Manage work items, review progress, and create new tasks
                        from one place.
                    </p>
                </div>

                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => setOpen(true)}
                >
                    Create Task
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        variant="borderless"
                        className="glass-panel shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Visible Tasks
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {stats.total}
                                </p>
                            </div>
                            <FileTextOutlined className="text-xl text-primary" />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        variant="borderless"
                        className="glass-panel shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Pending
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {stats.pending}
                                </p>
                            </div>
                            <ClockCircleOutlined className="text-xl text-amber-500" />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        variant="borderless"
                        className="glass-panel shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    In Progress
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {stats.inProgress}
                                </p>
                            </div>
                            <SyncOutlined className="text-xl text-sky-500" />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        variant="borderless"
                        className="glass-panel shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Done
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {stats.done}
                                </p>
                            </div>
                            <CheckCircleOutlined className="text-xl text-emerald-500" />
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
                            placeholder="Search tasks..."
                            prefix={
                                <SearchOutlined className="text-muted-foreground" />
                            }
                            value={searchText}
                            onChange={(event) =>
                                handleSearchChange(event.target.value)
                            }
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
                            <Select.Option value="all">
                                All Status
                            </Select.Option>
                            <Select.Option value="PENDING">
                                Pending
                            </Select.Option>
                            <Select.Option value="IN_PROGRESS">
                                In Progress
                            </Select.Option>
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

            <Modal
                open={open}
                title="Create Task"
                footer={null}
                onCancel={() => {
                    setOpen(false);
                    createForm.resetFields();
                }}
                destroyOnHidden
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreate}
                    initialValues={{ status: "PENDING" }}
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[
                            { required: true, message: "Title is required" },
                        ]}
                    >
                        <Input placeholder="Task title" />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea
                            rows={4}
                            placeholder="Task description"
                        />
                    </Form.Item>

                    <Form.Item label="Status" name="status">
                        <Select options={statusOptions} />
                    </Form.Item>

                    <Form.Item label="Assign to" name="assignedUserId">
                        <Select
                            allowClear
                            loading={isUsersLoading}
                            placeholder="Select a user"
                            options={assignableUsers.map((user) => ({
                                label: user.name
                                    ? `${user.name} (${user.email})`
                                    : user.email,
                                value: user.id,
                            }))}
                        />
                    </Form.Item>

                    <Space className="flex justify-end">
                        <Button
                            onClick={() => {
                                setOpen(false);
                                createForm.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isCreating}
                        >
                            Save Task
                        </Button>
                    </Space>
                </Form>
            </Modal>

            <Modal
                open={assignOpen}
                title={selectedTask ? `Assign: ${selectedTask.title}` : "Assign Task"}
                footer={null}
                onCancel={() => {
                    setAssignOpen(false);
                    setSelectedTask(null);
                    assignForm.resetFields();
                }}
                destroyOnHidden
            >
                <Form form={assignForm} layout="vertical" onFinish={handleAssign}>
                    <Form.Item label="Assigned User" name="assignedUserId">
                        <Select
                            allowClear
                            loading={isUsersLoading}
                            placeholder="Select a user"
                            options={assignableUsers.map((user) => ({
                                label: user.name
                                    ? `${user.name} (${user.email})`
                                    : user.email,
                                value: user.id,
                            }))}
                        />
                    </Form.Item>

                    <Space className="flex justify-end">
                        <Button
                            onClick={() => {
                                setAssignOpen(false);
                                setSelectedTask(null);
                                assignForm.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={isAssigning}>
                            Save Assignment
                        </Button>
                    </Space>
                </Form>
            </Modal>

            <Modal
                open={editOpen}
                title={selectedTask ? `Edit: ${selectedTask.title}` : "Edit Task"}
                footer={null}
                onCancel={() => {
                    setEditOpen(false);
                    setSelectedTask(null);
                    editForm.resetFields();
                }}
                destroyOnHidden
            >
                <Form form={editForm} layout="vertical" onFinish={handleEdit}>
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
                        <Button
                            onClick={() => {
                                setEditOpen(false);
                                setSelectedTask(null);
                                editForm.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={isUpdating}>
                            Save Changes
                        </Button>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
}
