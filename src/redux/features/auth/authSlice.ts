import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  profile: Record<string, unknown> | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  profile: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        accessToken?: string | null;
        refreshToken?: string | null;
        user?: AuthUser | null;
        profile?: Record<string, unknown> | null;
      }>,
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken || null;
      state.refreshToken = action.payload.refreshToken || null;
      state.user = action.payload.user || null;
      state.profile = action.payload.profile || null;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = Boolean(action.payload || state.user);
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.profile = null;
    },
  },
});

export const { clearAuth, login, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
