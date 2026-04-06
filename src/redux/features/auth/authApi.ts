import { tags } from "@/constants";
import { baseApi } from "../../api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data: { email: string; password: string }) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data: {
        full_name: string;
        email: string;
        password: string;
      }) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tags.userTag],
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
  useLoginMutation,
  useRegisterMutation,
  useResendVerificationEmailMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} = authApi;
