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
      // Don't save token and user to localStorage - user must verify email first
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
      // Check if error indicates needs verification
      if (error.response?.data?.needsVerification) {
        return rejectWithValue(error.response.data.message || 'Please verify your email');
      }
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
      // Check if error indicates needs verification
      if (error.response?.data?.needsVerification) {
        return rejectWithValue(error.response.data.message || 'Please verify your email');
      }
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
      // Check if error indicates needs verification
      if (error.response?.data?.needsVerification) {
        return rejectWithValue(error.response.data.message || 'Please verify your email');
      }
      return rejectWithValue(error.message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.resendVerificationEmail(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkUserExists = createAsyncThunk(
  'auth/checkUserExists',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.checkUserExists(email);
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
  isBlocked: false,
  blockReason: '',
  passwordResetSent: false,
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
      state.needsVerification = false;
      state.passwordResetSent = false;
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
      state.isBlocked = false;
      state.blockReason = '';
    },
    updateUserAnonId: (state, action) => {
      if (state.user) {
        state.user.anonId = action.payload;
      }
    },
    clearPasswordResetSent: (state) => {
      state.passwordResetSent = false;
    },
    setNeedsVerification: (state, action) => {
      state.needsVerification = true;
      state.message = action.payload || 'Please verify your email to access this feature';
    },
    resetSuccess: (state) => {
      state.isSuccess = false;
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
        // Don't set user/token - user must verify email first before logging in
        state.message = action.payload.message;
        state.user = null;
        state.token = null;
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
        state.needsVerification = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.token = action.payload.token;
        state.needsVerification = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        // Extract isBlocked and blockReason from error response if available
        const errorData = action.error?.response?.data;
        state.message = action.payload;
        state.isBlocked = errorData?.isBlocked || false;
        state.blockReason = errorData?.blockReason || '';
        state.user = null;
        state.needsVerification = false;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        // Clear needsVerification flag when user is verified
        state.needsVerification = false;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        // Check if error indicates needs verification (from error.response.data)
        const errorData = action.error?.response?.data;
        if (errorData?.needsVerification || (action.payload && action.payload.includes('verify'))) {
          state.needsVerification = true;
          state.message = action.payload || errorData?.message || 'Please verify your email';
          // Don't logout immediately - keep user logged in but set flag
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          state.user = null;
          state.token = null;
          state.needsVerification = false;
        }
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.message = 'Profile updated successfully!';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to update profile';
      })
      // Refresh Anon ID
      .addCase(refreshAnonId.fulfilled, (state, action) => {
        if (state.user) {
          state.user.anonId = action.payload.anonId;
        }
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Resend Verification Email
      .addCase(resendVerificationEmail.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
        state.passwordResetSent = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.passwordResetSent = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.passwordResetSent = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { logout, clearError, updateUserAnonId, clearPasswordResetSent, setNeedsVerification, resetSuccess } = authSlice.actions;
export default authSlice.reducer;

