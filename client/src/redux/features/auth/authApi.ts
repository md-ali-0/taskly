import { tags } from "@/constants";
import { baseApi } from "../../api/baseApi";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  roles: string[];
  status: string;
  emailVerified: boolean;
};

type AuthPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type AuthActionResponse = {
  message: string;
  data: AuthPayload;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthActionResponse>, { email: string; password: string }>({
      query: (data: { email: string; password: string }) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation<
      ApiResponse<AuthActionResponse>,
      { name: string; email: string; password: string }
    >({
      query: (data: {
        name: string;
        email: string;
        password: string;
      }) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tags.userTag],
    }),
    getMe: builder.query<ApiResponse<AuthUser>, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: [tags.userTag],
    }),
    logout: builder.mutation<ApiResponse<{ message?: string }>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    forgetPassword: builder.mutation({
      query: (data: { email: string }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data: { token: string; password: string }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (data: { token: string }) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: data,
      }),
    }),
    resendVerificationEmail: builder.mutation({
      query: (data: { email: string }) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useForgetPasswordMutation,
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useResendVerificationEmailMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} = authApi;
