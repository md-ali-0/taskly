import type { TSession } from "@/types";

const SESSION_STORAGE_KEY = "taskly.session";

export async function getSession(): Promise<TSession> {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as TSession;
  } catch {
    return null;
  }
}
