import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApiSlice = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      "https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/auth",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (user) => ({
        url: "/login",
        method: "POST",
        body: user,
      }),
      transformErrorResponse: (response) => {
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'An error occurred while logging in'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to the server' };
      },
    }),
    signup: builder.mutation({
      query: (newUser) => ({
        url: "/signup",
        method: "POST",
        body: newUser,
      }),
      transformErrorResponse: (response) => {
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'An error occurred while creating the account'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to the server' };
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApiSlice; 