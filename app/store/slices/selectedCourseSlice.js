import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  course: null,
};

export const selectedCourseSlice = createSlice({
  name: "selectedCourse",
  initialState,
  reducers: {
    hydrate: (state) => {
      if (typeof window !== "undefined") {
        state.course = JSON.parse(localStorage.getItem("selectedCourse") || "null");
      }
    },
    setSelectedCourse: (state, action) => {
      state.course = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedCourse", JSON.stringify(action.payload));
      }
    },
  },
});

export const { setSelectedCourse, hydrate } = selectedCourseSlice.actions;
export default selectedCourseSlice.reducer;
