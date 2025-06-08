import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl:
    "https://attendance-git-main-eslam-razeens-projects.vercel.app/api/attendanceQRCode",
  prepareHeaders: (headers) => {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage.getItem("token")?.replace(/"/g, "") || "";
      console.log("Token in Headers:", token);
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

export const sessionApiSlice = createApi({
  reducerPath: "sessionApi",
  baseQuery,
  tagTypes: ["Session"], // Cache tag for re-fetching

  endpoints: (builder) => ({
    createSession: builder.mutation({
      query: (session) => ({
        url: "/sessions",
        method: "POST",
        body: session,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Session"],
    }),

    getQrCode: builder.mutation({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}/qrcode`,
        method: "GET",
      }),
      providesTags: ["Session"],
    }),

    endSession: builder.mutation({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}/end`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: (response, result) => {
          return true;
        },
      }),
      transformResponse: (response, meta, arg) => {
        if (meta?.response?.ok) {
          return response;
        }
        return {
          error: true,
          status: meta?.response?.status,
          message: "Failed to end session"
        };
      },
      invalidatesTags: ["Session"],
    }),

    // New endpoint to get all sessions for a course
    getCourseSessions: builder.query({
      query: (courseId) => {
        if (!courseId) {
          throw new Error("Course ID is required");
        }
        return `/sessionsCourse/${courseId}`;
      },
      providesTags: ["Session"],
      transformResponse: (response) => {
        // Assuming the response is an object with a 'data' array
        return response && Array.isArray(response.data) ? response.data : [];
      },
      transformErrorResponse: (response) => {
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to fetch course sessions'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),
  }),
});

export const { useCreateSessionMutation, useGetQrCodeMutation, useEndSessionMutation, useGetCourseSessionsQuery } =
  sessionApiSlice; 