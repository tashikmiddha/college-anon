import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postAPI } from './postAPI';

// Async thunks
export const uploadImage = createAsyncThunk(
  'posts/uploadImage',
  async (file, { rejectWithValue }) => {
    try {
      const response = await postAPI.uploadImage(file);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postAPI.createPost(postData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await postAPI.getPosts(params);
      return response;
    } catch (error) {
      // Ensure we always have a meaningful error message
      const errorMessage = error.message || 'Failed to load posts';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (id, { rejectWithValue }) => {
    try {
      const response = await postAPI.getPost(id);
      return response;
    } catch (error) {
      // Check if this is an access denied error (college restriction)
      if (error.accessDenied) {
        return rejectWithValue({
          message: error.message,
          accessDenied: true,
          college: error.college
        });
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await postAPI.updatePost(id, postData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      await postAPI.deletePost(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (id, { rejectWithValue }) => {
    try {
      const response = await postAPI.likePost(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyPosts = createAsyncThunk(
  'posts/fetchMyPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await postAPI.getMyPosts();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reportPost = createAsyncThunk(
  'posts/reportPost',
  async ({ id, reportData }, { rejectWithValue }) => {
    try {
      await postAPI.reportPost(id, reportData);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  myPosts: [],
  totalPages: 1,
  total: 0,
  page: 1,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  error: null, // Add explicit error field for detailed error messages
  uploadProgress: 0,
  uploadedImage: null,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearMessage: (state) => {
      state.message = '';
      state.isError = false;
      state.isSuccess = false;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.currentPost = null;
    },
    clearError: (state) => {
      state.isError = false;
      state.error = null;
      state.message = '';
    },
    clearUploadedImage: (state) => {
      state.uploadedImage = null;
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Image
      .addCase(uploadImage.pending, (state) => {
        state.uploadProgress = 0;
        state.isError = false;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploadProgress = 100;
        state.uploadedImage = action.payload;
        state.isError = false;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploadProgress = 0;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.posts.unshift(action.payload);
        state.message = 'Post created successfully!';
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.totalPages = action.payload.pages;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.error = action.payload || 'Failed to load posts';
      })
      // Fetch Single Post
      .addCase(fetchPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
        state.isSuccess = true;
        state.message = 'Post updated successfully!';
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
        state.myPosts = state.myPosts.filter(p => p._id !== action.payload);
        state.isSuccess = true;
        state.message = 'Post deleted successfully!';
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.id);
        if (post) {
          post.likeCount = action.payload.likeCount;
        }
        if (state.currentPost?._id === action.payload.id) {
          state.currentPost.likeCount = action.payload.likeCount;
        }
      })
      // My Posts
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.myPosts = action.payload;
      })
      // Report Post
      .addCase(reportPost.fulfilled, (state) => {
        state.isSuccess = true;
        state.message = 'Post reported successfully!';
      });
  },
});

export const { clearCurrentPost, clearMessage, clearPosts, clearError, clearUploadedImage } = postSlice.actions;
export default postSlice.reducer;

