import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const documentsApiSlice = createApi({
  reducerPath: "documentsApi",
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
  tagTypes: ["Documents", "UploadedData"],
  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: () => `/documents`,
      providesTags: ["Documents"],
      transformResponse: (response) => {
        if (!response || !response.data) {
          return { data: [] };
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Error in getDocuments:", response);
        return { 
          status: response.status || "ERROR", 
          message: response.data?.message || "Failed to fetch documents" 
        };
      },
    }),

    uploadDocument: builder.mutation({
      query: (formData) => ({
        url: `/documents/upload`,
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Documents", "UploadedData"],
      transformErrorResponse: (response) => {
        console.error("Error in uploadDocument:", response);
        return { 
          status: response.status || "ERROR", 
          message: response.data?.message || "Failed to upload document" 
        };
      },
    }),
    
    downloadDocument: builder.query({
      query: (documentId) => ({
        url: `/documents/download/${documentId}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
      transformErrorResponse: (response) => {
        console.error("Error in downloadDocument:", response);
        return { 
          status: response.status || "ERROR", 
          message: response.data?.message || "Failed to download document" 
        };
      },
    }),

    deleteDocument: builder.mutation({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Documents"],
      transformErrorResponse: (response) => {
        console.error("Error in deleteDocument:", response);
        return { 
          status: response.status || "ERROR", 
          message: response.data?.message || "Failed to delete document" 
        };
      },
    }),

    // For document edit page to save student data
    saveEditedData: builder.mutation({
      query: (data) => ({
        url: `/documents/edit`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Documents", "UploadedData"],
      transformErrorResponse: (response) => {
        console.error("Error in saveEditedData:", response);
        return { 
          status: response.status || "ERROR", 
          message: response.data?.message || "Failed to save edited data" 
        };
      },
    }),

    // Get uploaded data from redux store - this is a local query
    getUploadedData: builder.query({
      queryFn: () => {
        // For local state operations
        try {
          if (typeof window !== "undefined") {
            const data = JSON.parse(localStorage.getItem("uploadedData") || "[]");
            return { data };
          }
          return { data: [] };
        } catch (error) {
          return { error: "Failed to get uploaded data" };
        }
      },
      providesTags: ["UploadedData"],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useDownloadDocumentQuery,
  useDeleteDocumentMutation,
  useSaveEditedDataMutation,
  useGetUploadedDataQuery,
} = documentsApiSlice; 