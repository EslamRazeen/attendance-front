import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authReducer";
import dataUploadReducer from "./slices/dataUploadReducer";
import userRoleSlice from "./slices/userRole";
import { authApiSlice } from "./features/authApiSlice";
import { coursesApiSlice } from "./features/coursesApiSlice";
import selectedCourseReducer, { hydrate as hydrateSelectedCourse } from "./slices/selectedCourseSlice.js";
import { sessionApiSlice } from "./features/sessionApiSlice";
import { attendanceApiSlice } from "./features/attendanceApiSlice";
import { usersApiSlice } from "./features/usersApiSlice";
import { dashboardApiSlice } from "./features/dashboardApiSlice";
import { documentsApiSlice } from "./features/documentsApiSlice";
import { studentsApiSlice } from "./features/studentsApiSlice";
import sessionReducer, { hydrate as hydrateSession } from "./slices/sessionSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    dataUpload: dataUploadReducer,
    userRole: userRoleSlice,
    selectedCourse: selectedCourseReducer,
    session: sessionReducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [coursesApiSlice.reducerPath]: coursesApiSlice.reducer,
    [sessionApiSlice.reducerPath]: sessionApiSlice.reducer,
    [attendanceApiSlice.reducerPath]: attendanceApiSlice.reducer,
    [usersApiSlice.reducerPath]: usersApiSlice.reducer,
    [dashboardApiSlice.reducerPath]: dashboardApiSlice.reducer,
    [documentsApiSlice.reducerPath]: documentsApiSlice.reducer,
    [studentsApiSlice.reducerPath]: studentsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApiSlice.middleware,
      coursesApiSlice.middleware,
      sessionApiSlice.middleware,
      attendanceApiSlice.middleware,
      usersApiSlice.middleware,
      dashboardApiSlice.middleware,
      documentsApiSlice.middleware,
      studentsApiSlice.middleware
    ),
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

export const initializeStore = (preloadedState) => {
  if (preloadedState?.selectedCourse) {
    store.dispatch(hydrateSelectedCourse());
  }
  store.dispatch(hydrateSession());
};

export default store;
