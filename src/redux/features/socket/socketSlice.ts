import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SocketState = {
  connected: boolean;
  error: boolean;
};

const initialState: SocketState = {
  connected: false,
  error: false,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.error = action.payload;
    },
  },
});

export const { setConnected, setError } = socketSlice.actions;
export default socketSlice.reducer;
