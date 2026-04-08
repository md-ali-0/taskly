"use client";

import { getSession, setSession as persistSession } from "@/lib/session";
import type { TSession } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext<{
  session: TSession;
  setSession: (session: TSession) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<TSession>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const updateSession = (value: TSession) => {
    setSession(value);
    void persistSession(value);
  };

  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      const currentSession = await getSession();
      if (mounted) {
        setSession(currentSession);
        setIsLoading(false);
      }
    };

    fetchSession();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{ session, setSession: updateSession, isLoading, setIsLoading }}
    >
      {children}
    </SessionContext.Provider>
  );
};
