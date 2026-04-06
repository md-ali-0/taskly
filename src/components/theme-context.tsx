"use client";

import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, theme as antTheme } from "antd";
import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light";

export interface ThemeTokens {
  colorPrimary: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
  colorTextBase: string;
  colorTextSecondary: string;
  colorBgContainer: string;
  colorBgLayout: string;
  colorBorder: string;
  fontSizeBase: number;
  fontFamily: string;
  borderRadius: number;
  buttonRadius: number;
}

interface ThemeContextType {
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readCssVar(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function loadTokensFromCss(): ThemeTokens {
  return {
    colorPrimary: readCssVar("--primary"),
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: readCssVar("--primary"),
    colorInfo: readCssVar("--primary"),
    colorTextBase: readCssVar("--foreground"),
    colorTextSecondary: readCssVar("--muted-foreground"),
    colorBgContainer: readCssVar("--card"),
    colorBgLayout: readCssVar("--background"),
    colorBorder: readCssVar("--border"),
    fontSizeBase: 14,
    fontFamily:
      "var(--font-body), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderRadius: parseFloat(readCssVar("--radius")) * 6 || 6,
    buttonRadius: 12,
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<ThemeTokens | null>(null);

  useEffect(() => {
    setTokens(loadTokensFromCss());
  }, []);

  const defaultTokens = useMemo<ThemeTokens>(
    () => ({
      colorPrimary: "#1677ff",
      colorSuccess: "#52c41a",
      colorWarning: "#faad14",
      colorError: "#ff4d4f",
      colorInfo: "#1677ff",
      colorTextBase: "#122033",
      colorTextSecondary: "#526074",
      colorBgContainer: "#ffffff",
      colorBgLayout: "#f5f7fb",
      colorBorder: "#d9d9d9",
      fontSizeBase: 14,
      fontFamily: "var(--font-body), -apple-system, sans-serif",
      borderRadius: 6,
      buttonRadius: 12,
    }),
    [],
  );

  const antDesignTheme = useMemo(() => {
    const activeTokens = tokens || defaultTokens;

    return {
      algorithm: antTheme.defaultAlgorithm,
      token: {
        colorPrimary: activeTokens.colorPrimary,
        colorSuccess: activeTokens.colorSuccess,
        colorWarning: activeTokens.colorWarning,
        colorError: activeTokens.colorError,
        colorInfo: activeTokens.colorInfo,
        colorText: activeTokens.colorTextBase,
        colorTextSecondary: activeTokens.colorTextSecondary,
        colorBgContainer: activeTokens.colorBgContainer,
        colorBgLayout: activeTokens.colorBgLayout,
        colorBorder: activeTokens.colorBorder,
        borderRadius: activeTokens.borderRadius,
        fontFamily: activeTokens.fontFamily,
        fontSize: activeTokens.fontSizeBase,
        controlOutline: "transparent",
        controlOutlineWidth: 0,
      },
      components: {
        Button: {
          borderRadius: activeTokens.buttonRadius,
        },
        Tabs: {
          colorPrimary: activeTokens.colorPrimary,
          inkBarColor: activeTokens.colorPrimary,
        },
      },
    };
  }, [tokens, defaultTokens]);

  const value = useMemo(
    () => ({ tokens: tokens || defaultTokens }),
    [tokens, defaultTokens],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StyleProvider layer>
        <ConfigProvider theme={antDesignTheme}>{children}</ConfigProvider>
      </StyleProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
