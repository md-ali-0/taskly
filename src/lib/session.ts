import type { TSession } from "@/types";

const SESSION_STORAGE_KEY = "taskly.session";
const COOKIE_PATH = "path=/; SameSite=Lax";

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; ${COOKIE_PATH}${secure}`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; ${COOKIE_PATH}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

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

export async function setSession(session: TSession) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    clearCookie("accessToken");
    clearCookie("refreshToken");
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

  if (session.accessToken) {
    setCookie("accessToken", session.accessToken);
  } else {
    clearCookie("accessToken");
  }

  if (session.refreshToken) {
    setCookie("refreshToken", session.refreshToken);
  } else {
    clearCookie("refreshToken");
  }
}

export async function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  clearCookie("accessToken");
  clearCookie("refreshToken");
}
