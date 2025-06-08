import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApiSlice = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      "https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode",
    credentials: "include", //
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
  tagTypes: ["Users", "InstructorCourses"],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => `/users`,
      providesTags: ["Users"],
    }),

    deleteStaffUser: builder.mutation({
      query: (staffId) => ({
        url: `/users/${staffId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    addStaffUser: builder.mutation({
      query: (user) => ({
        url: `/users`,
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["Users"],
    }),

    // New endpoints for instructor course management
    getInstructorStats: builder.query({
      query: (instructorId) => `/staffDoctorReport/${instructorId}`,
      providesTags: (result, error, instructorId) => [
        { type: 'Users', id: instructorId },
        'InstructorCourses',
      ],
    }),

    addCourseToInstructor: builder.mutation({
      query: ({ userId, courseId }) => ({
        url: `/users/addCourses`,
        method: "POST",
        body: { userId, courseId },
      }),
      invalidatesTags: ["Users", "InstructorCourses"],
    }),

    deleteCourseFromInstructor: builder.mutation({
      query: ({ userId, courseId }) => ({
        url: `/users/deleteCourses/${courseId}`,
        method: "DELETE",
        body: { userId },
      }),
      invalidatesTags: ["Users", "InstructorCourses"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useDeleteStaffUserMutation,
  useAddStaffUserMutation,
  useGetInstructorStatsQuery,
  useAddCourseToInstructorMutation,
  useDeleteCourseFromInstructorMutation,
} = usersApiSlice; 