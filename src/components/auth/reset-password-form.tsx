"use client";

import { useResetPasswordMutation } from "@/redux/features/auth/authApi";
import { App, Button, Form, Input } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      message.error("Reset token not found in the URL.");
      return;
    }

    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPassword({
        token,
        password: values.password,
      }).unwrap();

      message.success(response?.message || "Password reset successfully.");
      router.push("/auth/signin");
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to reset password";

      message.error(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
          New password
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a new secure password to continue.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="password"
          label="New password"
          rules={[
            { required: true, message: "Password is required" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
        >
          <Input.Password className="auth-input" placeholder="New password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm password"
          rules={[{ required: true, message: "Please confirm your password" }]}
        >
          <Input.Password
            className="auth-input"
            placeholder="Confirm password"
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
          Reset password
        </Button>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Return to{" "}
        <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
          sign in
        </Link>
      </p>
    </div>
  );
}
