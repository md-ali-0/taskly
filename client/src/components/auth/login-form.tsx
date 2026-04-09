"use client";

import { useSession } from "@/provider/session-provider";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { login } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { App, Button, Dropdown, Form, Input, type MenuProps } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { setIsLoading, setSession } = useSession();
  const [signin, { isLoading }] = useLoginMutation();

  const fillCredentials = (role: "admin" | "user") => {
    const credentials = {
      admin: {
        email: "admin@taskly.com",
        password: "Admin@123456",
      },
      user: {
        email: "user@taskly.com",
        password: "User@123456",
      },
    }[role];

    form.setFieldsValue(credentials);
    message.info(`Filled with ${role} credentials`);
  };

  const devItems: MenuProps["items"] = [
    {
      key: "admin",
      label: "Admin Account",
      onClick: () => fillCredentials("admin"),
    },
    {
      key: "user",
      label: "User Account",
      onClick: () => fillCredentials("user"),
    },
  ];

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);

    try {
      const response = await signin(values).unwrap();
      const data = response?.data?.data || response?.data || response;

      if (!data?.accessToken || !data?.refreshToken || !data?.user) {
        throw new Error("Authentication payload is missing");
      }

      dispatch(
        login({
          accessToken: data?.accessToken,
          refreshToken: data?.refreshToken,
          user: data?.user,
          profile: null,
        }),
      );

      setSession({
        isAuth: true,
        accessToken: data?.accessToken || null,
        refreshToken: data?.refreshToken || null,
        user: data?.user || null,
        profile: null,
      });

      message.success("Welcome back. Login successful.");
      router.push("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
          error !== null &&
          "data" in error &&
          typeof error.data === "object" &&
          error.data !== null &&
          "message" in error.data
          ? String(error.data.message)
          : error instanceof Error
            ? error.message
            : "Login failed";

      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
          Welcome back
        </p>
        <h1 className="mt-1.5 text-[24px] font-extrabold text-foreground">
          Sign in to Taskly
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Continue to your dashboard.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleLogin}
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

        <Form.Item
          name="password"
          label="Password"
          className="mb-3.5"
          rules={[{ required: true, message: "Password is required" }]}
        >
          <Input.Password className="auth-input" placeholder="Password" />
        </Form.Item>

        <div className="mb-3 flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mb-3.5">
          <Dropdown menu={{ items: devItems }} placement="bottom" trigger={["click"]}>
            <Button
              block
              className="border-amber-200 bg-amber-50 font-semibold text-amber-700 hover:border-amber-300 hover:bg-amber-100"
            >
              Fill Credentials
            </Button>
          </Dropdown>
        </div>

        <Button type="primary" htmlType="submit" loading={isLoading} block size="large" className="h-10 rounded-md font-semibold">
          Sign in
        </Button>
      </Form>

      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        Need an account?{" "}
        <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
