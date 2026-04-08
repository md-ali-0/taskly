import DashboardLayoutShell from "@/components/shared/dashboard-layout";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
