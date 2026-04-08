"use client";

import DecorativeBackground from "@/components/auth/decorative-background";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eff5ff_52%,#e9f1ff_100%)] px-4 sm:px-6">
      <DecorativeBackground />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl items-center justify-center py-4 sm:py-5">
        <div className="w-full max-w-md">
          <main className="w-full rounded-md border border-white/90 bg-white/94 p-5 shadow-[0_34px_80px_-46px_rgba(15,23,42,0.42)] backdrop-blur sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
