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
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    getAllAttendances: builder.query({
      query: (courseId) => {
        if (!courseId) {
          throw new Error("Course ID is required");
        }
        return {
          url: `/showStudent/${courseId}`,
          method: 'POST',
        };
      },
      providesTags: ["Attendance"],
      transformResponse: (response) => {
        if (!response || !response.students) {
          return { students: [] };
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Error response from getAllAttendances:", JSON.stringify(response));
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
        
        if (date) {
          return {
            url: `/showStudent/${courseId}`,
            method: 'POST',
            body: { date }
          };
        }
        return {
          url: `/showStudent/${courseId}`,
          method: 'POST',
        };
      },
      providesTags: ["Attendance"],
      transformResponse: (response, meta, arg) => {
        if (arg.date) {
          return Array.isArray(response.presntsINDate) ? response.presntsINDate : [];
        }
        if (response.students && Array.isArray(response.students)) {
          return response.students;
        }
        return [];
      },
      transformErrorResponse: (response) => {
        console.error("Error response from getStudentsByDate:", JSON.stringify(response));
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to fetch students data'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),

    getAttendanceByDate: builder.query({
      query: ({ sessionId, date }) => {
        if (!sessionId) {
          throw new Error("Session ID is required");
        }
        return `/attendanceByDate/${sessionId}?date=${date || ''}`;
      },
      providesTags: ["Attendance"],
    }),

    getAttendanceByCourseAndDate: builder.query({
      query: ({ courseId, date }) => {
        if (!courseId) {
          throw new Error("Course ID is required");
        }
        return `/attendanceByCourse/${courseId}?date=${date || ''}`;
      },
      providesTags: ["Attendance"],
    }),
    
    markAttendance: builder.mutation({
      query: (attendanceData) => ({
        url: `/markAttendance`,
        method: "POST",
        body: attendanceData,
      }),
      invalidatesTags: ["Attendance"],
    }),
    
    deleteAttendance: builder.mutation({
      query: (attendanceId) => ({
        url: `/deleteAttendance/${attendanceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
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
        
        console.log("Using course ID for manual attendance:", courseId);
        return {
          url: `/showStudent/${courseId}`,
          method: 'POST',
        };
      },
      async onQueryStarted(sessionId, { dispatch, queryFulfilled }) {
        try {
          const { data: studentsData } = await queryFulfilled;
          
          if (sessionId) {
            console.log("Fetching attendance status for session:", sessionId);
            
            const baseUrl = "https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode";
            const token = localStorage.getItem("token")?.replace(/"/g, "");
            
            try {
              const response = await fetch(`${baseUrl}/manualAttendace/${sessionId}`, {
                headers: {
                  Authorization: token ? `Bearer ${token}` : "",
                }
              });
              
              if (response.ok) {
                const sessionAttendanceData = await response.json();
                console.log("Session attendance data:", sessionAttendanceData);
                
                const attendanceMap = {};
                
                const attendanceItems = Array.isArray(sessionAttendanceData) 
                  ? sessionAttendanceData 
                  : [sessionAttendanceData];
                
                attendanceItems.forEach(item => {
                  if (item && item.student && item.student._id) {
                    attendanceMap[item.student._id] = item.attendanceStatus;
                  }
                });
                
                console.log("Attendance map:", attendanceMap);
                
                dispatch(
                  attendanceApiSlice.util.updateQueryData(
                    'getManualAttendance', 
                    sessionId, 
                    draft => {
                      if (draft && draft.students) {
                        draft.students = draft.students.map(student => {
                          const studentId = student.student?._id;
                          if (studentId && attendanceMap[studentId]) {
                            return {
                              ...student,
                              studentAttendanc: attendanceMap[studentId]
                            };
                          }
                          return student;
                        });
                      }
                    }
                  )
                );
              }
            } catch (error) {
              console.error("Error fetching session attendance:", error);
            }
          }
        } catch (error) {
          console.error("Error in onQueryStarted:", error);
        }
      },
      providesTags: ["Attendance"],
      transformResponse: (response) => {
        console.log("Manual attendance API response:", response);
        
        if (!response || !response.students) {
          console.warn("Empty response or no students in manual attendance");
          return { students: [] };
        }
        
        try {
          const students = response.students.map(student => {
            return {
              ...student,
              studentAttendanc: student.attendanceStatus || "Not recorded"
            };
          });
          
          return { students };
        } catch (error) {
          console.error("Error transforming manual attendance data:", error);
          return { students: [] };
        }
      },
      transformErrorResponse: (response) => {
        console.error("Manual attendance API error:", JSON.stringify(response));
        
        if (Object.keys(response).length === 0) {
          return { 
            status: 'ERROR', 
            message: 'An unknown error occurred while fetching attendance data' 
          };
        }
        
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
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["Attendance"],
      transformErrorResponse: (response) => {
        if (response.status) {
          return {
            status: response.status,
            message: response.data?.message || 'Failed to load student file'
          };
        }
        return { status: 'NETWORK_ERROR', message: 'Failed to connect to server' };
      },
    }),
  }),
});

export const { 
  useGetAllAttendancesQuery, 
  useGetManualAttendanceQuery,
  useAddStudentAttendanceMutation, 
  useAddStudentsSheetMutation,
  useGetStudentsByDateQuery,
  useLazyGetAttendanceByDateQuery,
  useLazyGetAttendanceByCourseAndDateQuery,
  useMarkAttendanceMutation,
  useDeleteAttendanceMutation
} = attendanceApiSlice; 