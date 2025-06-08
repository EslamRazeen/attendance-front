import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dashboardApiSlice = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode",
    credentials: "include",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")?.replace(/"/g, "");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["DashboardData"],
  endpoints: (builder) => ({
    getAdminDashboardData: builder.query({
      query: () => "/dashboardAdmin",
      providesTags: ["DashboardData"],
      keepUnusedDataFor: 300,
      transformResponse: (response) => {
        if (!response || !response.days || !Array.isArray(response.days)) {
          console.log("Invalid data format from API, returning empty array");
          return { days: [] };
        }
        console.log("Successfully retrieved dashboard data from API");
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Error response from getAdminDashboardData:", response);
        return {
          status: response.status || "ERROR",
          message: response.data?.message || "Failed to fetch dashboard data"
        };
      },
      onError: (error, { dispatch, getState, extra, queryFulfilled, endpoint, type, originalArgs, meta }) => {
        console.error('Dashboard API error occurred:', error);
      },
    }),
    
    getGradeLevelData: builder.query({
      query: ({ level, department }) => {
        if (!level) {
          throw new Error("Level is required");
        }
        
        let queryParams = `/studentInfo?level=${level}`;
        if (department) {
          queryParams += `&department=${department}`;
        }
        
        return queryParams;
      },
      providesTags: ["DashboardData"],
      keepUnusedDataFor: 300,
      transformResponse: (response) => {
        if (!response || !response.data) {
          return { data: [] };
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Error response from getGradeLevelData:", response);
        return {
          status: response.status || "ERROR",
          message: response.data?.message || "Failed to fetch grade level data"
        };
      },
    }),
    
    updateStudentGrade: builder.mutation({
      query: (data) => ({
        url: "/updateMyGrade",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["DashboardData"],
      transformErrorResponse: (response) => {
        console.error("Error response from updateStudentGrade:", response);
        return {
          status: response.status || "ERROR",
          message: response.data?.message || "Failed to update student grade"
        };
      },
    }),
  }),
});

export const {
  useGetAdminDashboardDataQuery,
  useGetGradeLevelDataQuery,
  useUpdateStudentGradeMutation,
} = dashboardApiSlice; 