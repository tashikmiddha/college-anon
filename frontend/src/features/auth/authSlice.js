import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from './authAPI';

// Get user from localStorage with null safety
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

// Validate stored token exists before setting user state
let user = null;
if (storedUser && storedUser !== 'undefined' && storedToken) {
  try {
    user = JSON.parse(storedUser);
    // Ensure token is valid format
    if (!storedToken || typeof storedToken !== 'string' || storedToken.length < 10) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      user = null;
    }
  } catch (e) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    user = null;
  }
}

const token = user ? storedToken : null;

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      console.log('Register response:', response);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      return response;
    } catch (error) {
      console.error('Register error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await authAPI.getMe(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await authAPI.updateProfile(token, userData);
      localStorage.setItem('user', JSON.stringify(response));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshAnonId = createAsyncThunk(
  'auth/refreshAnonId',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await authAPI.refreshAnonId(token);
      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      user.anonId = response.anonId;
      localStorage.setItem('user', JSON.stringify(user));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: user || null,
  token: token || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
    updateUserAnonId: (state, action) => {
      if (state.user) {
        state.user.anonId = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Refresh Anon ID
      .addCase(refreshAnonId.fulfilled, (state, action) => {
        if (state.user) {
          state.user.anonId = action.payload.anonId;
        }
      });
  },
});

export const { logout, clearError, updateUserAnonId } = authSlice.actions;
export default authSlice.reducer;

