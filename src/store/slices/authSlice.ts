/**
 * Authentication Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@services/firebase';
import type { AuthState, User, LoginCredentials, SignupCredentials } from '@types/index';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.signUpWithEmail(credentials);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.signInWithEmail(credentials);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.signInWithGoogle();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
  },
  extraReducers: builder => {
    // Sign Up
    builder.addCase(signUp.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Sign In
    builder.addCase(signIn.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Sign In with Google
    builder.addCase(signInWithGoogle.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signInWithGoogle.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(signInWithGoogle.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Sign Out
    builder.addCase(signOut.fulfilled, state => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Get Current User
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
