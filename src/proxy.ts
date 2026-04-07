import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type DecryptedSession = {
  userId?: string;
  email?: string;
  role?: string;
  roles?: string[];
  exp?: number;
};

function decodeToken(token: string | undefined): DecryptedSession | null {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(atob(padded)) as DecryptedSession;

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const session = decodeToken(accessToken);

  const isAuthRoute = pathname.startsWith("/auth");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isAuthRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  if (isDashboardRoute && !session?.userId) {
    const loginUrl = new URL(`/auth/signin?redirect=${pathname}`, req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
