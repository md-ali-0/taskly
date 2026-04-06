import Navbar from "@/components/shared/navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="app-shell py-10">{children}</main>
    </div>
  );
}
