"use client";

import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { App, Button, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const { message } = App.useApp();
  const [register, { isLoading }] = useRegisterMutation();
  const [form] = Form.useForm();

  const onFinish = async (values: {
    full_name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await register(values).unwrap();

      message.success(
        response?.message ||
        `Registered successfully. Please sign in.`,
      );
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
          : "Registration failed";

      message.error(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <h1 className="text-[24px] font-extrabold text-foreground">
          Create your Taskly account
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Create your account to continue.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        size="large"
        className="space-y-0.5"
      >
        <Form.Item
          name="full_name"
          label="Full name"
          className="mb-3.5"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input className="auth-input" placeholder="Full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          className="mb-3.5"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input className="auth-input" placeholder="you@example.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          className="mb-3.5"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
        >
          <Input.Password className="auth-input" placeholder="Password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isLoading} block size="large" className="h-10 rounded-md font-semibold">
          Create account
        </Button>
      </Form>

      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
