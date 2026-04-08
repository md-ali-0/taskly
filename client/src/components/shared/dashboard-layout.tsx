"use client";

import DashboardHeader from "@/components/shared/dashboard-header";
import DashboardSidebar from "@/components/shared/dashboard-sidebar";
import { dashboardSidebarItems } from "@/constants/sidebar-data";
import { useSession } from "@/provider/session-provider";
import { useAppSelector } from "@/redux/hooks";
import { Grid, Layout } from "antd";
import { useState } from "react";

const { Content } = Layout;
const { useBreakpoint } = Grid;

function ResponsiveDashboardShell({
  children,
  collapsedByDefault,
  isMobile,
  resolvedSession,
}: {
  children: React.ReactNode;
  collapsedByDefault: boolean;
  isMobile: boolean;
  resolvedSession: {
    user?: {
      id?: string;
      email?: string;
      name?: string | null;
      role?: string;
      roles?: string[];
      status?: string;
      emailVerified?: boolean;
    } | null;
    isAuth?: boolean;
    accessToken?: string | null;
    refreshToken?: string | null;
    profile?: Record<string, unknown> | null;
  } | null;
}) {
  const [collapsed, setCollapsed] = useState(collapsedByDefault);

  return (
    <Layout className="min-h-screen bg-transparent">
      <DashboardSidebar
        collapsed={collapsed}
        session={resolvedSession}
        items={dashboardSidebarItems}
        isMobile={isMobile}
        setCollapsed={setCollapsed}
      />

      <Layout
        className="min-h-screen bg-transparent transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : collapsed ? 88 : 280 }}
      >
        <DashboardHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="px-4 py-6 sm:px-6 lg:px-8">{children}</Content>
      </Layout>
    </Layout>
  );
}

export default function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const screens = useBreakpoint();
  const { session } = useSession();
  const authUser = useAppSelector((state) => state.auth.user);

  const resolvedSession = authUser
    ? {
        ...(session ?? {}),
        user: {
          ...(session?.user ?? {}),
          ...authUser,
        },
      }
    : session;

  return (
    <ResponsiveDashboardShell
      key={screens.lg === false ? "mobile" : "desktop"}
      collapsedByDefault={screens.lg === false}
      isMobile={screens.lg === false}
      resolvedSession={resolvedSession}
    >
      {children}
    </ResponsiveDashboardShell>
  );
}
