import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { competitionAPI } from './competitionAPI';

// Async thunks
export const createCompetition = createAsyncThunk(
  'competitions/createCompetition',
  async (competitionData, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.createCompetition(competitionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompetitions = createAsyncThunk(
  'competitions/fetchCompetitions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.getCompetitions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompetition = createAsyncThunk(
  'competitions/fetchCompetition',
  async (id, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.getCompetition(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const voteOnCompetition = createAsyncThunk(
  'competitions/voteOnCompetition',
  async ({ id, optionIndex }, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.voteOnCompetition(id, optionIndex);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompetitionResults = createAsyncThunk(
  'competitions/fetchCompetitionResults',
  async (id, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.getCompetitionResults(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCompetition = createAsyncThunk(
  'competitions/deleteCompetition',
  async (id, { rejectWithValue }) => {
    try {
      await competitionAPI.deleteCompetition(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  competitions: [],
  currentCompetition: null,
  totalPages: 1,
  total: 0,
  page: 1,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  error: null,
};

const competitionSlice = createSlice({
  name: 'competitions',
  initialState,
  reducers: {
    clearCurrentCompetition: (state) => {
      state.currentCompetition = null;
    },
    clearMessage: (state) => {
      state.message = '';
      state.isError = false;
      state.isSuccess = false;
    },
    clearError: (state) => {
      state.isError = false;
      state.error = null;
      state.message = '';
    },
    clearCompetitions: (state) => {
      state.competitions = [];
      state.currentCompetition = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Competition
      .addCase(createCompetition.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(createCompetition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Handle both nested competition object and flat object
        const competition = action.payload.competition || action.payload;
        state.competitions.unshift(competition);
        state.message = 'Competition created successfully!';
      })
      .addCase(createCompetition.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Competitions
      .addCase(fetchCompetitions.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchCompetitions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.competitions = action.payload.competitions;
        state.totalPages = action.payload.pages;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchCompetitions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.error = action.payload || 'Failed to load competitions';
      })
      // Fetch Single Competition
      .addCase(fetchCompetition.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCompetition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCompetition = action.payload;
      })
      .addCase(fetchCompetition.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Vote on Competition
      .addCase(voteOnCompetition.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(voteOnCompetition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update current competition with vote status and voted option
        if (state.currentCompetition?._id === action.payload.id) {
          state.currentCompetition.hasVoted = true;
          state.currentCompetition.votedOption = action.payload.votedOption;
        }
        // Update in competitions list
        const compIndex = state.competitions.findIndex(c => c._id === action.payload.id);
        if (compIndex !== -1) {
          state.competitions[compIndex].hasVoted = true;
          state.competitions[compIndex].votedOption = action.payload.votedOption;
        }
        state.message = 'Vote recorded successfully!';
      })
      .addCase(voteOnCompetition.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Results
      .addCase(fetchCompetitionResults.fulfilled, (state, action) => {
        state.currentCompetition = action.payload;
      })
      // Delete Competition
      .addCase(deleteCompetition.fulfilled, (state, action) => {
        state.competitions = state.competitions.filter(c => c._id !== action.payload);
        if (state.currentCompetition?._id === action.payload) {
          state.currentCompetition = null;
        }
        state.isSuccess = true;
        state.message = 'Competition deleted successfully!';
      });
  },
});

export const { 
  clearCurrentCompetition, 
  clearMessage, 
  clearError, 
  clearCompetitions 
} = competitionSlice.actions;

export default competitionSlice.reducer;

