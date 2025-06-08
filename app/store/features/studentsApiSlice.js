import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentsApiSlice = createApi({
  reducerPath: "studentsApi",
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
  tagTypes: ["Students", "StudentCourses"],
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: () => `/studentInfo`,
      providesTags: ["Students"],
      transformResponse: (response) => {
        console.log("Raw students response:", response);
        if (!response || !response.data) {
          console.warn("No students data in response");
          return { data: [] };
        }
        // تحويل البيانات إلى الشكل المطلوب
        const transformedData = {
          data: response.data.map(student => ({
            _id: student._id,
            name: student.name,
            email: student.email,
            level: student.level,
            department: student.department,
            courses: student.courses || []
          }))
        };
        console.log("Transformed students data:", transformedData);
        return transformedData;
      },
      transformErrorResponse: (response) => {
        console.error("Error in getStudents:", response);
        return { 
          status: response.status || "ERROR", 
          message: response.data?.message || "Failed to fetch students" 
        };
      },
    }),

    getStudentsByFilter: builder.query({
      query: ({ level, department }) => {
        const params = new URLSearchParams();
        if (level) params.append('level', level);
        if (department) params.append('department', department);
        return {
          url: `/studentInfo/filter?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result, error, { level, department }) => [
        { type: 'Students', id: `${level}-${department}` },
        'Students'
      ],
      transformResponse: (response) => {
        console.log("Raw filtered students response:", response);
        if (!response || !response.data) {
          console.warn("No filtered students data in response");
          return { data: [] };
        }
        // تحويل البيانات إلى الشكل المطلوب
        const transformedData = {
          data: response.data.map(student => ({
            _id: student._id,
            name: student.name,
            email: student.email,
            level: student.level,
            department: student.department,
            courses: student.courses || []
          }))
        };
        console.log("Transformed filtered students data:", transformedData);
        return transformedData;
      },
      transformErrorResponse: (response) => {
        console.error("Error in getStudentsByFilter:", response);
        return {
          status: response.status || "ERROR",
          message: response.data?.message || "Failed to fetch filtered students"
        };
      },
    }),

    getStudentById: builder.query({
      query: (studentId) => `/studentInfo/${studentId}`,
      providesTags: (result, error, studentId) => [
        { type: 'Students', id: studentId },
        'Students'
      ],
    }),

    updateStudent: builder.mutation({
      query: ({ studentId, data }) => ({
        url: `/studentInfo/${studentId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Students', id: studentId },
        'Students'
      ],
      transformResponse: (response) => {
        console.log("Update student response:", response);
        if (!response || response.error) {
          throw new Error(response?.error || "Failed to update student");
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Error updating student:", response);
        return {
          status: response.status || "ERROR",
          message: response.data?.message || "Failed to update student"
        };
      },
    }),

    deleteStudent: builder.mutation({
      query: (studentId) => ({
        url: `/studentInfo/${studentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
      transformResponse: (response) => {
        console.log("Delete student response:", response);
        if (!response || response.error) {
          throw new Error(response?.error || "Failed to delete student");
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Error deleting student:", response);
        return {
          status: response.status || "ERROR",
          message: response.data?.message || "Failed to delete student"
        };
      },
    }),

    // Course management for students
    addCourseToStudent: builder.mutation({
      query: ({ studentId, courseId }) => ({
        url: `/studentInfo/addCourse`,
        method: "POST",
        body: { studentId, courseId },
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Students', id: studentId },
        { type: 'StudentCourses', id: studentId },
        'Students'
      ],
      transformResponse: (response) => {
        console.log("Add course response:", response);
        if (!response || response.error) {
          throw new Error(response?.error || "Failed to add course");
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Error adding course:", response);
        return {
          status: response.status || "ERROR",
          message: response.data?.message || "Failed to add course"
        };
      },
    }),

    removeCourseFromStudent: builder.mutation({
      query: ({ studentId, courseId }) => ({
        url: `/studentInfo/removeCourse/${courseId}`,
        method: "DELETE",
        body: { studentId },
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Students', id: studentId },
        { type: 'StudentCourses', id: studentId },
        'Students'
      ],
      transformResponse: (response) => {
        console.log("Remove course response:", response);
        if (!response || response.error) {
          throw new Error(response?.error || "Failed to remove course");
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Error removing course:", response);
        return {
          status: response.status || "ERROR",
          message: response.data?.message || "Failed to remove course"
        };
      },
    }),

    // Batch operations
    importStudents: builder.mutation({
      query: (data) => ({
        url: `/studentInfo/import`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Students"],
    }),

    exportStudents: builder.query({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.level) params.append('level', filters.level);
        if (filters?.department) params.append('department', filters.department);
        return {
          url: `/studentInfo/export?${params.toString()}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentsByFilterQuery,
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useAddCourseToStudentMutation,
  useRemoveCourseFromStudentMutation,
  useImportStudentsMutation,
  useExportStudentsQuery,
} = studentsApiSlice; 