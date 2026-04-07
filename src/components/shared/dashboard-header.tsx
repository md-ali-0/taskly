"use client";

import { dashboardProfileActions } from "@/constants/sidebar-data";
import { useSession } from "@/provider/session-provider";
import { clearAuth } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { signout } from "@/service/auth";
import {
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App, Avatar, Button, Dropdown, Layout } from "antd";
import { useRouter } from "next/navigation";

const { Header } = Layout;

function formatRoleLabel(role: string) {
    return role
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export default function DashboardHeader({
    collapsed,
    setCollapsed,
}: {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
}) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { message } = App.useApp();
    const { session, setSession, isLoading } = useSession();
    const authUser = useAppSelector((state) => state.auth.user);
    
    const currentUser = authUser || session?.user;
    const currentRole =
        currentUser?.roles?.[0] || currentUser?.role || "Workspace member";
    const displayName =
        currentUser?.name || currentUser?.email || "Taskly User";
    const displayRole = formatRoleLabel(currentRole);

    const menuItems = dashboardProfileActions?.map((item) =>
        item?.key === "logout"
            ? {
                  ...item,
                  label: <span onClick={handleLogout}>Logout</span>,
                  icon: <LogoutOutlined />,
              }
            : item,
    );

    async function handleLogout() {
        dispatch(clearAuth());
        setSession(null);
        await signout();
        message.success("Signed out successfully.");
        router.push("/auth/signin");
    }

    return (
        <Header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <Button
                    type="text"
                    icon={
                        collapsed ? (
                            <MenuUnfoldOutlined />
                        ) : (
                            <MenuFoldOutlined />
                        )
                    }
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex h-11 w-11 items-center justify-center"
                />
            </div>

            <div className="flex items-center gap-3">
                {isLoading ? (
                    <div className="flex h-[54px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm">
                        <div className="h-[38px] w-[38px] animate-pulse rounded-full bg-slate-200" />
                        <div className="hidden min-w-[112px] sm:block">
                            <div className="h-3.5 w-24 animate-pulse rounded-full bg-slate-200" />
                            <div className="mt-2 h-2.5 w-12 animate-pulse rounded-full bg-slate-200" />
                        </div>
                        <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-slate-100 sm:flex">
                            <DownOutlined className="text-xs text-slate-300" />
                        </div>
                    </div>
                ) : (
                    <Dropdown
                        menu={{ items: menuItems }}
                        placement="bottomRight"
                        trigger={["click"]}
                    >
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            <Avatar
                                size={38}
                                icon={<UserOutlined />}
                                className="bg-primary text-primary-foreground"
                            />
                            <div className="hidden min-w-0 text-left sm:block">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                    {displayName}
                                </p>
                                <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                                    {displayRole}
                                </p>
                            </div>
                            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 sm:flex">
                                <DownOutlined className="text-xs" />
                            </div>
                        </button>
                    </Dropdown>
                )}
            </div>
        </Header>
    );
}
