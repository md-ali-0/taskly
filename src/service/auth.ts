"use client";

import { clearSession } from "@/lib/session";

export async function signout() {
  await clearSession();
}
