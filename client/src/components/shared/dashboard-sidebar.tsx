/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { DashboardMenuItem } from "@/constants/sidebar-data";
import type { TSession } from "@/types";
import { SearchOutlined } from "@ant-design/icons";
import { Drawer, Input, Layout, Menu, type MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const { Sider } = Layout;

function extractLabelText(label: DashboardMenuItem["label"]) {
    if (typeof label === "string") {
        return label;
    }

    if (label && typeof label === "object" && "props" in label) {
        const maybeChildren = (label.props as { children?: unknown }).children;
        return typeof maybeChildren === "string" ? maybeChildren : "";
    }

    return "";
}

function filterByRole(
    items: DashboardMenuItem[],
    roles: string[],
): DashboardMenuItem[] {
    return items
        .filter((item) => {
            if (!item?.accessFor?.length) {
                return true;
            }

            return item.accessFor.some((role) =>
                roles.includes(role.toUpperCase()),
            );
        })
        .map((item) => {
            if (!item?.children?.length) {
                return item;
            }

            const filteredChildren = filterByRole(item.children, roles);
            return {
                ...item,
                children: filteredChildren,
            };
        })
        .filter((item) => !item?.children || item.children.length > 0);
}

function filterBySearch(
    items: DashboardMenuItem[],
    query: string,
): DashboardMenuItem[] {
    if (!query.trim()) {
        return items;
    }

    const lowerQuery = query.trim().toLowerCase();

    return items
        .map((item) => {
            const matches = extractLabelText(item.label)
                .toLowerCase()
                .includes(lowerQuery);

            if (!item.children?.length) {
                return matches ? item : null;
            }

            const filteredChildren = filterBySearch(item.children, query);

            if (matches || filteredChildren.length > 0) {
                return {
                    ...item,
                    children:
                        filteredChildren.length > 0
                            ? filteredChildren
                            : item.children,
                };
            }

            return null;
        })
        .filter(Boolean) as DashboardMenuItem[];
}

function stripCustomProps(
    items: DashboardMenuItem[],
): NonNullable<MenuProps["items"]> {
    return items.map((item) => {
        const { accessFor, children, ...rest } = item;

        return {
            ...rest,
            children: children?.length ? stripCustomProps(children) : undefined,
        };
    });
}

function SidebarContent({
    collapsed,
    pathname,
    search,
    setSearch,
    menuItems,
    defaultOpenKeys,
}: {
    collapsed: boolean;
    pathname: string;
    search: string;
    setSearch: (value: string) => void;
    menuItems: NonNullable<MenuProps["items"]>;
    defaultOpenKeys: string[];
}) {
    return (
        <>
            <div className="flex h-20 items-center border-b border-slate-200 px-5">
                <Link
                    href="/dashboard"
                    className="flex justify-center items-center gap-3 overflow-hidden"
                >
                    {!collapsed ? (
                        <span className="text-2xl mx-auto font-black tracking-tight text-slate-900">
                            Taskly
                        </span>
                    ) : (
                        <span className="text-2xl mx-auto font-black tracking-tight text-slate-900">
                            T
                        </span>
                    )}
                </Link>
            </div>

            <div className="flex h-[calc(100vh-80px)] flex-col">
                {!collapsed ? (
                    <div className="px-4 py-4">
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            prefix={
                                <SearchOutlined className="text-slate-400" />
                            }
                            placeholder="Search menu"
                            className="rounded-xl"
                            size="large"
                        />
                    </div>
                ) : null}

                <div className="flex-1 overflow-y-auto px-3 pb-4">
                    <Menu
                        mode="inline"
                        selectedKeys={[pathname]}
                        defaultOpenKeys={defaultOpenKeys}
                        items={menuItems}
                        className="border-none bg-transparent [&_.ant-menu-item]:mb-1 [&_.ant-menu-item]:rounded-xl [&_.ant-menu-item]:font-medium [&_.ant-menu-item-selected]:bg-blue-50 [&_.ant-menu-item-selected]:text-blue-700 [&_.ant-menu-submenu-title]:rounded-xl [&_.ant-menu-submenu-title]:font-medium"
                    />
                </div>
            </div>
        </>
    );
}

export default function DashboardSidebar({
    collapsed,
    session,
    items,
    isMobile,
    setCollapsed,
}: {
    collapsed: boolean;
    session: TSession;
    items: DashboardMenuItem[];
    isMobile: boolean;
    setCollapsed: (value: boolean) => void;
}) {
    const pathname = usePathname();
    const [search, setSearch] = useState("");

    const roles = useMemo(() => {
        const values = session?.user?.roles?.length
            ? session.user.roles
            : [session?.user?.role].filter(Boolean);

        if (values.length === 0) {
            return ["ADMIN", "USER"];
        }

        return values.map((role) => String(role).toUpperCase());
    }, [session]);

    const filteredItems = useMemo(() => {
        const roleAwareItems = filterByRole(items, roles);
        return filterBySearch(roleAwareItems, search);
    }, [items, roles, search]);

    const menuItems = useMemo(
        () => stripCustomProps(filteredItems),
        [filteredItems],
    );
    const defaultOpenKeys =
        pathname.startsWith("/dashboard/tasks") ||
        pathname.startsWith("/dashboard/my-tasks")
            ? ["tasks"]
            : [];

    if (isMobile) {
        return (
            <Drawer
                open={!collapsed}
                onClose={() => setCollapsed(true)}
                placement="left"
                width={280}
                closable={false}
                styles={{
                    body: {
                        padding: 0,
                        background: "#fff",
                    },
                    content: {
                        overflow: "hidden",
                    },
                }}
            >
                <SidebarContent
                    collapsed={false}
                    pathname={pathname}
                    search={search}
                    setSearch={setSearch}
                    menuItems={menuItems}
                    defaultOpenKeys={defaultOpenKeys}
                />
            </Drawer>
        );
    }

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={280}
            collapsedWidth={88}
            theme="light"
            className="fixed! inset-y-0 left-0 z-50 overflow-hidden border-r border-slate-200 bg-white shadow-[0_22px_55px_-34px_rgba(15,23,42,0.45)]"
        >
            <SidebarContent
                collapsed={collapsed}
                pathname={pathname}
                search={search}
                setSearch={setSearch}
                menuItems={menuItems}
                defaultOpenKeys={defaultOpenKeys}
            />
        </Sider>
    );
}
