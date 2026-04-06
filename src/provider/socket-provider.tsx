"use client";

import config from "@/config";
import { useSession } from "@/provider/session-provider";
import { baseApi } from "@/redux/api/baseApi";
import { setConnected, setError } from "@/redux/features/socket/socketSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { tags } from "@/redux/tag-types";
import { notification } from "antd";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { session } = useSession();
  const reduxToken = useAppSelector((state) => state.auth.accessToken);
  const token = reduxToken || session?.accessToken || null;
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token && !socketRef.current) {
      const socket = io(config.host, {
        auth: { token },
        path: "/socket.io",
      });

      socket.on("connect", () => {
        dispatch(setConnected(true));
      });

      socket.on("disconnect", () => {
        dispatch(setConnected(false));
      });

      socket.on("connect_error", () => {
        dispatch(setError(true));
        dispatch(setConnected(false));
      });

      socket.on("new-notification", (data) => {
        notification.info({
          message: data?.title || "New notification",
          description: data?.message || "You have a new update.",
          placement: "topRight",
        });
        dispatch(baseApi.util.invalidateTags([tags.notificationTag]));
      });

      socket.on("new-message", () => {
        dispatch(baseApi.util.invalidateTags([tags.chatTag]));
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        dispatch(setConnected(false));
      }
    };
  }, [token, dispatch]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
