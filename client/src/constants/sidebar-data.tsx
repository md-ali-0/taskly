"use client";

import {
  AppstoreOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";

type Role = string;

export type DashboardMenuItem = {
  key: string;
  icon?: ReactNode;
  label: ReactNode;
  accessFor?: Role[];
  children?: DashboardMenuItem[];
};

export const dashboardSidebarItems: DashboardMenuItem[] = [
  {
    key: "/dashboard",
    icon: <AppstoreOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
    accessFor: ["ADMIN", "USER"],
  },
  {
    key: "tasks",
    icon: <CheckSquareOutlined />,
    label: "Tasks",
    accessFor: ["ADMIN", "USER"],
    children: [
      {
        key: "/dashboard/tasks",
        label: <Link href="/dashboard/tasks">All Tasks</Link>,
        accessFor: ["ADMIN"],
      },
      {
        key: "/dashboard/my-tasks",
        label: <Link href="/dashboard/my-tasks">My Tasks</Link>,
        accessFor: ["ADMIN", "USER"],
      },
    ],
  },
  {
    key: "/dashboard/audit-logs",
    icon: <AuditOutlined />,
    label: <Link href="/dashboard/audit-logs">Audit Logs</Link>,
    accessFor: ["ADMIN"],
  },
];

export const dashboardQuickActions = [
  {
    key: "tasks",
    title: "Task Overview",
    description: "Track pending, processing, and done work from one place.",
    icon: <CheckSquareOutlined />,
  },
  {
    key: "users",
    title: "Team Access",
    description: "Keep admin and user responsibilities clearly separated.",
    icon: <TeamOutlined />,
  },
  {
    key: "logs",
    title: "Audit Trail",
    description: "Review important task actions with clean activity history.",
    icon: <AuditOutlined />,
  },
];

export const dashboardProfileActions: MenuProps["items"] = [
  {
    key: "profile",
    icon: <UserOutlined />,
    label: <Link href="/dashboard/profile">My Profile</Link>,
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Logout",
  },
];
