"use client";

import DecorativeBackground from "@/components/auth/decorative-background";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const topRight =
    pathname.includes("signin")
      ? { label: "Sign up", href: "/auth/signup" }
      : pathname.includes("signup")
        ? { label: "Log in", href: "/auth/signin" }
        : { label: "Back to login", href: "/auth/signin" };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#edf4ff_46%,#e7f0ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <DecorativeBackground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <div className="flex items-center justify-between py-4">
          <Link href="/auth/signin" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-[0_18px_40px_-18px_rgba(29,78,216,0.9)]">
              T
            </span>
            <div>
              <p className="text-lg font-bold text-foreground">Taskly</p>
              <p className="text-xs text-muted-foreground">
                Secure workspace access
              </p>
            </div>
          </Link>

          <Link
            href={topRight.href}
            className="rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/35 hover:text-primary"
          >
            {topRight.label}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full max-w-5xl gap-8 xl:grid-cols-[1fr_460px] xl:items-center">
            <section className="hidden xl:flex xl:flex-col xl:justify-center">
              <span className="inline-flex w-fit rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80 backdrop-blur">
                Taskly workspace
              </span>
              <h2 className="mt-6 max-w-xl text-5xl font-extrabold leading-[1.02] text-foreground">
                Simple access to your dashboard.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                Sign in or create your account to continue.
              </p>
            </section>

            <main className="rounded-[2rem] border border-white/85 bg-white/92 p-8 shadow-[0_40px_90px_-42px_rgba(15,23,42,0.45)] backdrop-blur sm:p-10">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
