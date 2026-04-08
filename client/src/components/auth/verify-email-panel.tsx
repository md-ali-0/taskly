"use client";

import {
  useResendVerificationEmailMutation,
  useVerifyEmailMutation,
} from "@/redux/features/auth/authApi";
import { App, Button, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { message } = App.useApp();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerificationEmail, { isLoading: isResending }] =
    useResendVerificationEmailMutation();

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await verifyEmail({ token }).unwrap();
        setStatus("success");
        message.success(response?.message || "Email verified successfully.");
      } catch (error: unknown) {
        setStatus("error");
        const errorMessage =
          typeof error === "object" &&
          error !== null &&
          "data" in error &&
          typeof error.data === "object" &&
          error.data !== null &&
          "message" in error.data
            ? String(error.data.message)
            : "Email verification failed";

        message.error(errorMessage);
      }
    };

    void runVerification();
  }, [message, token, verifyEmail]);

  const handleResend = async (values: { email: string }) => {
    try {
      const response = await resendVerificationEmail(values).unwrap();
      message.success(
        response?.message || "Verification email sent successfully.",
      );
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to resend verification email";

      message.error(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
          Email verification
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open the link from your inbox or request another verification email.
        </p>
      </div>

      {token ? (
        <div className="rounded-2xl border border-border bg-background/70 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            {isVerifying
              ? "Checking your verification token..."
              : status === "success"
                ? "Your email has been verified. You can sign in now."
                : status === "error"
                  ? "This verification link could not be verified."
                  : "Verification is pending."}
          </p>
        </div>
      ) : null}

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Resend email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Form layout="vertical" onFinish={handleResend} requiredMark={false} size="large">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input className="auth-input" placeholder="you@example.com" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isResending} block size="large">
          Resend verification email
        </Button>
      </Form>
    </div>
  );
}
