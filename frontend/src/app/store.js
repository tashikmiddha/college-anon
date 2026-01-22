import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postReducer from '../features/posts/postSlice';
import competitionReducer from '../features/competitions/competitionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    competitions: competitionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

