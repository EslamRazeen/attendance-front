import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApiSlice = createApi({
  reducerPath: "attendanceApi",
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
  tagTypes: ["Attendance", "Apology"],
  endpoints: (builder) => ({
    getAllAttendances: builder.query({
      query: (courseId) => {
        if (!courseId) {
          throw new Error("Course ID is required");
        }
        return `/showStudent/${courseId}`;
      },
      providesTags: ["Attendance"],
      transformResponse: (response) => {
        if (!response || !response.students) {
          return { students: [] };
        }
        return response;
      },
      transformErrorResponse: (response) => {
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to fetch attendance data'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),

    getStudentsByDate: builder.query({
      query: ({ courseId, date }) => {
        if (!courseId) {
          throw new Error("Course ID is required");
        }
        const body = date ? { date } : {}; // Include date in body if provided
        return {
          url: `/showStudent/${courseId}`,
          method: "POST",
          body: body,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      providesTags: ["Attendance"],
      transformResponse: (response, meta, arg) => {
        // Determine which array to return based on whether a date was sent
        if (arg.date) {
           // If a date was sent, return the presntsINDate array
           return response && response.presntsINDate ? response.presntsINDate : [];
        } else {
           // If no date was sent, return the students array
           return response && response.students ? response.students : [];
        }
      },
      transformErrorResponse: (response) => {
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to fetch student data'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),

    getAttendanceStats: builder.query({
      query: () => {
        return `/stats`;
      },
      transformResponse: (response) => {
        if (!response) {
          return null;
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.log("Stats endpoint error:", response);
        return null;
      },
    }),

    getInstructorStats: builder.query({
      query: (instructorId) => {
        if (!instructorId) {
          throw new Error("Instructor ID is required");
        }
        return `/staffDoctorReport/${instructorId}`;
      },
      transformResponse: (response) => {
        if (!response) {
          return {
            totalResults: 0,
            absentCount: 0,
            presentCount: 0,
            attendanceRate: 0
          };
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.log("Instructor stats endpoint error:", response);
        return {
          totalResults: 0,
          absentCount: 0,
          presentCount: 0,
          attendanceRate: 0
        };
      },
    }),

    getManualAttendance: builder.query({
      query: (sessionId) => {
        let courseId = null;
        if (typeof window !== "undefined") {
          const selectedCourse = JSON.parse(localStorage.getItem("selectedCourse") || "{}");
          courseId = selectedCourse._id;
        }
        
        if (!courseId) {
          throw new Error("Course ID is required");
        }
        
        if (sessionId) {
          console.log("Fetching manual attendance for session:", sessionId);
          return `/manualAttendace/${sessionId}`;
        }
        
        console.log("Using course ID for manual attendance:", courseId);
        return `/showStudent/${courseId}`;
      },
      providesTags: ["Attendance"],
      transformResponse: (response) => {
        console.log("Manual attendance API response:", response);
        
        // Handle the new response format
        if (response && response.data && Array.isArray(response.data)) {
          console.log("Processing new response format with data array");
          
          // Transform the data to match the expected format in the component
          const students = response.data.map(item => {
            return {
              _id: item._id,
              student: {
                _id: item.student._id,
                name: item.student.name,
                department: item.student.department,
                level: item.student.level,
                studentID: item.student._id.substring(0, 8) // Using part of _id as studentID if not available
              },
              attendanceStatus: item.attendanceStatus,
              courseId: item.courseId,
              sessionType: item.sessionType,
              scanDate: item.scanDate
            };
          });
          
          console.log("Transformed students:", students.length);
          return { students };
        }
        
        // Handle the original response format
        if (!response || !response.students) {
          console.error("Empty response or no students");
          return { students: [] };
        }
        
        try {
          const students = response.students.map(student => {
            return {
              ...student,
              studentAttendanc: student.attendanceStatus || "Not recorded"
            };
          });
          
          console.log("Found students:", students.length);
          return { students };
        } catch (error) {
          console.error("Error transforming manual attendance data:", error);
          return { students: [] };
        }
      },
      transformErrorResponse: (response) => {
        console.error("Manual attendance API error:", response);
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to fetch session attendance data'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),

    addStudentAttendance: builder.mutation({
      query: ({ courseId, newUser }) => {
        if (!courseId) {
          throw new Error("Course ID is required");
        }
        if (!newUser || !newUser.student || !newUser.sessionID) {
          throw new Error("Attendance data is incomplete");
        }
        
        return {
          url: `/attendances`,
          method: "POST",
          body: newUser,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["Attendance"],
      transformErrorResponse: (response) => {
        if (response.status === 409) {
          return { status: 409, message: 'Student attendance already recorded' };
        }
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to record attendance'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),
    
    addStudentsSheet: builder.mutation({
      query: (users) => {
        if (!users || !Array.isArray(users)) {
          throw new Error("Student data is invalid");
        }
        return {
          url: `/studentInfo`,
          method: "POST",
          body: users,
        };
      },
      invalidatesTags: ["Attendance"],
      transformErrorResponse: (response) => {
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to add students'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),

    getAllApologies: builder.query({
      query: () => 'apology',
      providesTags: ["Apology"],
      transformResponse: (response) => {
        // Assuming the API returns an array of apologies directly or within a 'data' field
        return response.data || response;
      },
      transformErrorResponse: (response) => {
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to fetch apologies'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),

    updateApologyStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `apology/${id}`,
        method: 'PUT',
        body: { status, reason },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Apology"],
      transformErrorResponse: (response) => {
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to update apology status'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),

    getInstructorApologies: builder.query({
      query: () => `/apology/instructor`,
      providesTags: ["Apology"],
      transformResponse: (response) => {
        // Assuming the API returns an object with a 'data' property containing the array
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return []; // Return empty array if data is not as expected
      },
      transformErrorResponse: (response) => {
        console.error("Instructor apologies endpoint error:", response);
        return [];
      },
    }),
  }),
});

export const { 
  useGetAllAttendancesQuery, 
  useGetManualAttendanceQuery,
  useGetAttendanceStatsQuery,
  useGetInstructorStatsQuery,
  useAddStudentAttendanceMutation, 
  useAddStudentsSheetMutation,
  useGetStudentsByDateQuery,
  useGetAllApologiesQuery,
  useUpdateApologyStatusMutation,
  useGetInstructorApologiesQuery
} = attendanceApiSlice;
