"use client";

import { useSession } from "@/provider/session-provider";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { login } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { App, Button, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { setIsLoading, setSession } = useSession();
  const [signin, { isLoading }] = useLoginMutation();

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);

    try {
      const response = await signin(values).unwrap();
      const data = response?.data || response;

      dispatch(
        login({
          accessToken: data?.accessToken,
          refreshToken: data?.refreshToken,
          user: data?.user,
          profile: data?.profile,
        }),
      );

      setSession({
        isAuth: true,
        accessToken: data?.accessToken || null,
        refreshToken: data?.refreshToken || null,
        user: data?.user || null,
        profile: data?.profile || null,
      });

      message.success("Welcome back. Login successful.");
      router.push("/");
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data
          ? String(error.data.message)
          : "Login failed";

      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground">
          Sign in to Taskly
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Continue with your workspace, tasks, and dashboard setup.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleLogin}
        requiredMark={false}
        size="large"
      >
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

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Password is required" }]}
        >
          <Input.Password className="auth-input" placeholder="Password" />
        </Form.Item>

        <div className="mb-5 flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
          Sign in
        </Button>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
