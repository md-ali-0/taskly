"use client";

import { clearAuth } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useSession } from "@/provider/session-provider";
import { signout } from "@/service/auth";
import { App, Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { session, setSession } = useSession();
  const authUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const currentUser = authUser || session?.user;

  const handleLogout = async () => {
    dispatch(clearAuth());
    setSession(null);
    await signout();
    message.success("Signed out successfully.");
    router.push("/auth/signin");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="site-shell flex h-[72px] items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
            T
          </span>
          <div>
            <p className="text-lg font-bold text-foreground">Taskly</p>
            <p className="text-xs text-muted-foreground">Frontend workspace</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/dashboard" className="transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="/auth/signin" className="transition-colors hover:text-primary">
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="transition-colors hover:text-primary"
          >
            Sign up
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {currentUser?.name || currentUser?.email || "Taskly User"}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {currentUser?.role || "Member"}
                </p>
              </div>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button>Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button type="primary">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
