import type { Metadata } from "next";
import { MessageInitializer } from "@/components/shared/message-initializer";
import { ThemeProvider } from "@/components/theme-context";
import ReduxProvider from "@/provider/redux-provider";
import { SessionProvider } from "@/provider/session-provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntdApp } from "antd";
import { Nunito } from "next/font/google";
import "../styles/globals.css";

const displayFont = Nunito({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const bodyFont = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Taskly",
  description: "Taskly frontend workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full`}
    >
      <body className="min-h-full">
        <AntdRegistry>
          <SessionProvider>
            <ReduxProvider>
              <ThemeProvider>
                <AntdApp>
                  <MessageInitializer />
                  {children}
                </AntdApp>
              </ThemeProvider>
            </ReduxProvider>
          </SessionProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
