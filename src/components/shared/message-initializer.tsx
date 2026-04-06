"use client";

import { setMessageInstance } from "@/utils/message-service";
import { App } from "antd";
import { useEffect, useRef } from "react";

export function MessageInitializer() {
  const { message } = App.useApp();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setMessageInstance(message);
      initialized.current = true;
    }
  }, [message]);

  return null;
}
