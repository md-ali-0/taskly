"use client";

import { useForgetPasswordMutation } from "@/redux/features/auth/authApi";
import { App, Button, Form, Input } from "antd";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();

  const handleSubmit = async (values: { email: string }) => {
    try {
      const response = await forgetPassword(values).unwrap();
      message.success(
        response?.message || "Reset link request submitted successfully.",
      );
      form.resetFields();
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to send reset link";

      message.error(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
          Password recovery
        </p>
        <h1 className="mt-1.5 text-[24px] font-extrabold text-foreground">
          Forgot your password?
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Enter your email and we will send you a reset link.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
        className="space-y-0.5"
      >
        <Form.Item
          name="email"
          label="Email"
          className="mb-3.5"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input className="auth-input" placeholder="you@example.com" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isLoading} block size="large" className="h-10 rounded-md font-semibold">
          Send reset link
        </Button>
      </Form>

      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
