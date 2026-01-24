import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from './adminAPI';

// Async thunks
export const fetchMyReports = createAsyncThunk(
  'admin/fetchMyReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getMyReports(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllCompetitions = createAsyncThunk(
  'admin/fetchAllCompetitions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllCompetitions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCompetition = createAsyncThunk(
  'admin/updateCompetition',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateCompetition(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCompetition = createAsyncThunk(
  'admin/deleteCompetition',
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.deleteCompetition(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyFeedbacks = createAsyncThunk(
  'admin/fetchMyFeedbacks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getMyFeedbacks(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllFeedbacks = createAsyncThunk(
  'admin/fetchAllFeedbacks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllFeedbacks(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'admin/submitFeedback',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminAPI.submitFeedback(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resolveFeedback = createAsyncThunk(
  'admin/resolveFeedback',
  async ({ id, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.resolveFeedback(id, { adminNotes });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFeedback = createAsyncThunk(
  'admin/deleteFeedback',
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.deleteFeedback(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllComments = createAsyncThunk(
  'admin/fetchAllComments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllComments(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'admin/deleteComment',
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.deleteComment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  myReports: [],
  myReportsPage: 1,
  myReportsHasMore: true,
  myFeedbacks: [],
  myFeedbacksPage: 1,
  myFeedbacksHasMore: true,
  allFeedbacks: [],
  allComments: [],
  competitions: [],
  competitionsTotal: 0,
  competitionsPage: 1,
  isLoading: false,
  isError: false,
  error: null,
  competitionMessage: null,
  feedbackMessage: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearReportsError: (state) => {
      state.isError = false;
      state.error = null;
    },
    clearCompetitionMessage: (state) => {
      state.competitionMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Reports
      .addCase(fetchMyReports.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchMyReports.fulfilled, (state, action) => {
        state.isLoading = false;
        // Append reports if loading page > 1, otherwise replace
        if (action.payload.page > 1) {
          // Add new reports while avoiding duplicates
          const existingIds = new Set(state.myReports.map(r => r._id));
          const newReports = action.payload.reports.filter(r => !existingIds.has(r._id));
          state.myReports = [...state.myReports, ...newReports];
        } else {
          state.myReports = action.payload.reports;
        }
        state.myReportsPage = action.payload.page;
        state.myReportsHasMore = action.payload.hasMore;
        state.isError = false;
      })
      .addCase(fetchMyReports.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })
      // Fetch All Competitions
      .addCase(fetchAllCompetitions.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchAllCompetitions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.competitions = action.payload.competitions;
        state.competitionsTotal = action.payload.total;
        state.competitionsPage = action.payload.page;
        state.isError = false;
      })
      .addCase(fetchAllCompetitions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })
      // Update Competition
      .addCase(updateCompetition.fulfilled, (state, action) => {
        const index = state.competitions.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.competitions[index] = action.payload;
        }
        state.competitionMessage = 'Competition updated successfully';
      })
      .addCase(updateCompetition.rejected, (state, action) => {
        state.isError = true;
        state.error = action.payload;
      })
      // Delete Competition
      .addCase(deleteCompetition.fulfilled, (state, action) => {
        state.competitions = state.competitions.filter(c => c._id !== action.payload);
        state.competitionsTotal -= 1;
        state.competitionMessage = 'Competition deleted successfully';
      })
      .addCase(deleteCompetition.rejected, (state, action) => {
        state.isError = true;
        state.error = action.payload;
      })
      // Submit Feedback
      .addCase(submitFeedback.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myFeedbacks.unshift(action.payload.feedback);
        state.feedbackMessage = 'Feedback submitted successfully';
        state.isError = false;
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })
      // Fetch My Feedbacks
      .addCase(fetchMyFeedbacks.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchMyFeedbacks.fulfilled, (state, action) => {
        state.isLoading = false;
        // Append feedbacks if loading page > 1, otherwise replace
        if (action.payload.page > 1) {
          // Add new feedbacks while avoiding duplicates
          const existingIds = new Set(state.myFeedbacks.map(f => f._id));
          const newFeedbacks = action.payload.feedbacks.filter(f => !existingIds.has(f._id));
          state.myFeedbacks = [...state.myFeedbacks, ...newFeedbacks];
        } else {
          state.myFeedbacks = action.payload.feedbacks;
        }
        state.myFeedbacksPage = action.payload.page;
        state.myFeedbacksHasMore = action.payload.hasMore;
        state.isError = false;
      })
      .addCase(fetchMyFeedbacks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })
      // Fetch All Feedbacks (Admin)
      .addCase(fetchAllFeedbacks.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchAllFeedbacks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allFeedbacks = action.payload;
        state.isError = false;
      })
      .addCase(fetchAllFeedbacks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })
      // Resolve Feedback
      .addCase(resolveFeedback.fulfilled, (state, action) => {
        const index = state.allFeedbacks.findIndex(f => f._id === action.payload.feedback._id);
        if (index !== -1) {
          state.allFeedbacks[index] = action.payload.feedback;
        }
        state.feedbackMessage = 'Feedback resolved';
      })
      .addCase(resolveFeedback.rejected, (state, action) => {
        state.isError = true;
        state.error = action.payload;
      })
      // Delete Feedback
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.allFeedbacks = state.allFeedbacks.filter(f => f._id !== action.payload);
        state.feedbackMessage = 'Feedback deleted successfully';
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.isError = true;
        state.error = action.payload;
      })
      // Fetch All Comments (Admin)
      .addCase(fetchAllComments.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchAllComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allComments = action.payload;
        state.isError = false;
      })
      .addCase(fetchAllComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.allComments = state.allComments.filter(c => c._id !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isError = true;
        state.error = action.payload;
      });
  },
});

export const { clearReportsError, clearCompetitionMessage } = adminSlice.actions;
export default adminSlice.reducer;

