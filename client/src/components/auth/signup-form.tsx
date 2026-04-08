"use client";

import { useSession } from "@/provider/session-provider";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { login } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { App, Button, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { setIsLoading, setSession } = useSession();
  const [register, { isLoading }] = useRegisterMutation();
  const [form] = Form.useForm();

  const onFinish = async (values: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
  }) => {
    setIsLoading(true);

    try {
      const response = await register({
        name: values.full_name,
        email: values.email,
        password: values.password,
      }).unwrap();

      const data = response?.data?.data || response?.data || response;

      if (!data?.accessToken || !data?.refreshToken || !data?.user) {
        throw new Error("Registration payload is missing");
      }

      dispatch(
        login({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          profile: null,
        }),
      );

      setSession({
        isAuth: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        profile: null,
      });

      message.success(response?.data?.message || response?.message || "Registration successful.");
      form.resetFields();
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
            : "Registration failed";

      message.error(errorMessage);
    } finally {
      setIsLoading(false);
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

        <Form.Item
          name="confirm_password"
          label="Confirm password"
          className="mb-3.5"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password className="auth-input" placeholder="Confirm password" />
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
