"use client";

import config from "@/config";
import { getSession, clearSession } from "@/lib/session";

export async function signout() {
  const session = await getSession();

  try {
    await fetch(`${config.host}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: session?.accessToken
        ? {
            authorization: `Bearer ${session.accessToken}`,
          }
        : undefined,
    });
  } catch {
    // Local session should still be cleared even if the API is unreachable.
  }

  await clearSession();
}
