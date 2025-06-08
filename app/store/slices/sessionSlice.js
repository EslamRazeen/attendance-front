import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sessionId: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    hydrate: (state) => {
      if (typeof window !== "undefined") {
        state.sessionId = localStorage.getItem("sessionId") || null;
      }
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("sessionId", action.payload);
      }
    },
    clearSessionId: (state) => {
      state.sessionId = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("sessionId");
      }
    },
  },
});

export const { setSessionId, clearSessionId, hydrate } = sessionSlice.actions;
export default sessionSlice.reducer; 