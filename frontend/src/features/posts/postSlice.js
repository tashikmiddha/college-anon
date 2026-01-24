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
      // Check if this is an under review error
      if (error.isUnderReview) {
        return rejectWithValue({
          message: error.message,
          isUnderReview: true
        });
      }
      // Check if this is a rejected error
      if (error.isRejected) {
        return rejectWithValue({
          message: error.message,
          isRejected: true
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
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await postAPI.getMyPosts(params);
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

// Comments async thunks
export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async ({ postId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await postAPI.getComments(postId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createComment = createAsyncThunk(
  'posts/createComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await postAPI.createComment(postId, content);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeComment = createAsyncThunk(
  'posts/likeComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await postAPI.likeComment(commentId);
      return { commentId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await postAPI.deleteComment(commentId);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyComments = createAsyncThunk(
  'posts/fetchMyComments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await postAPI.getMyComments(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  myPosts: [],
  myPostsPage: 1,
  myPostsHasMore: true,
  myComments: [],
  myCommentsPage: 1,
  myCommentsHasMore: true,
  comments: [],
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
  needsModeration: false,
  moderationRejected: false,
  moderationReason: '',
  searchPerformed: false, // Track if initial posts have been loaded
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
        state.message = action.payload.message || 'Post created successfully!';
        state.needsModeration = action.payload.needsModeration || false;
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
        // Only clear posts on initial load (page 1) or when not appending
        if (state.page === 1 || !state.posts.length) {
          state.posts = [];
        }
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Append posts if loading page > 1, otherwise replace
        if (action.payload.page > 1) {
          // Add new posts while avoiding duplicates
          const existingIds = new Set(state.posts.map(p => p._id));
          const newPosts = action.payload.posts.filter(p => !existingIds.has(p._id));
          state.posts = [...state.posts, ...newPosts];
        } else {
          state.posts = action.payload.posts;
        }
        state.totalPages = action.payload.pages;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.isError = false;
        state.error = null;
        state.searchPerformed = true;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.error = action.payload || 'Failed to load posts';
        state.searchPerformed = true;
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
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
        state.message = '';
        state.moderationRejected = false;
        state.moderationReason = '';
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.posts.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
        state.isSuccess = true;
        state.message = action.payload.message || 'Post updated successfully!';
        // Handle moderation results
        state.needsModeration = action.payload.needsModeration || false;
        state.moderationRejected = action.payload.moderationRejected || false;
        state.moderationReason = action.payload.moderationReason || '';
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload || 'Failed to update post';
        state.message = action.payload;
        state.moderationRejected = false;
        state.moderationReason = '';
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
      .addCase(fetchMyPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Append posts if loading page > 1, otherwise replace
        if (action.payload.page > 1) {
          // Add new posts while avoiding duplicates
          const existingIds = new Set(state.myPosts.map(p => p._id));
          const newPosts = action.payload.posts.filter(p => !existingIds.has(p._id));
          state.myPosts = [...state.myPosts, ...newPosts];
        } else {
          state.myPosts = action.payload.posts;
        }
        state.myPostsPage = action.payload.page;
        state.myPostsHasMore = action.payload.hasMore;
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Report Post
      .addCase(reportPost.fulfilled, (state) => {
        state.isSuccess = true;
        state.message = 'Report submitted successfully! You can track the status in your Profile > My Reports.';
      })
      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments.unshift(action.payload);
        state.isSuccess = true;
        state.message = 'Comment added!';
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Like Comment
      .addCase(likeComment.fulfilled, (state, action) => {
        const comment = state.comments.find(c => c._id === action.payload.commentId);
        if (comment) {
          comment.likeCount = action.payload.likeCount;
          comment.isLiked = action.payload.isLiked;
        }
      })
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(c => c._id !== action.payload);
        state.myComments = state.myComments.filter(c => c._id !== action.payload);
        state.isSuccess = true;
        state.message = 'Comment deleted!';
      })
      // My Comments
      .addCase(fetchMyComments.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchMyComments.fulfilled, (state, action) => {
        state.isLoading = false;
        // Append comments if loading page > 1, otherwise replace
        if (action.payload.page > 1) {
          // Add new comments while avoiding duplicates
          const existingIds = new Set(state.myComments.map(c => c._id));
          const newComments = action.payload.comments.filter(c => !existingIds.has(c._id));
          state.myComments = [...state.myComments, ...newComments];
        } else {
          state.myComments = action.payload.comments;
        }
        state.myCommentsPage = action.payload.page;
        state.myCommentsHasMore = action.payload.hasMore;
      })
      .addCase(fetchMyComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { clearCurrentPost, clearMessage, clearPosts, clearError, clearUploadedImage } = postSlice.actions;
export default postSlice.reducer;

