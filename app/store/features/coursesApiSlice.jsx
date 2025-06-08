import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const coursesApiSlice = createApi({
  reducerPath: "coursesApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      "https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode",
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
  tagTypes: ["Courses"],
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: () => "/courses",
      providesTags: ["Courses"],
      transformResponse: (response) => {
        console.log("Raw courses response:", response);
        if (!response || !response.data) {
          console.warn("No courses data in response");
          return { data: [] };
        }
        // تحويل البيانات إلى الشكل المطلوب
        const transformedData = {
          data: response.data.map(course => ({
            _id: course._id,
            name: course.courseName || course.name || `Course ${course.courseCode || ''}`.trim(),
            courseName: course.courseName || course.name || `Course ${course.courseCode || ''}`.trim(),
            courseCode: course.courseCode,
            code: course.courseCode || course.code,
            level: course.level,
            semester: course.semester,
            department: course.department
          }))
        };
        console.log("Transformed courses data:", transformedData);
        return transformedData;
      },
      transformErrorResponse: (response) => {
        console.error("Error fetching courses:", response);
        return {
          status: response.status || "ERROR",
          message: response.data?.message || "Failed to fetch courses"
        };
      }
    }),
    
    getCourseById: builder.query({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Courses", id }],
      transformResponse: (response) => {
        if (!response || !response.data) {
          return null;
        }
        return response.data;
      }
    })
  }),
});

export const { 
  useGetCoursesQuery,
  useGetCourseByIdQuery
} = coursesApiSlice; 