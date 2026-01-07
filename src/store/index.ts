/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import poemsReducer from './slices/poemsSlice';
import playbackReducer from './slices/playbackSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    poems: poemsReducer,
    playback: playbackReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser', 'poems/setCurrentPoem', 'playback/setCurrentPoem'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'payload.lastLoginAt'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'poems.poems', 'poems.currentPoem', 'playback.currentPoem'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
