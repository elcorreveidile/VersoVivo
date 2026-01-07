/**
 * Playback Redux Slice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlaybackMode, type PlaybackState, type Poem } from '../../types';

const initialState: PlaybackState = {
  currentPoem: null,
  mode: PlaybackMode.TEXT,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1.0,
};

const playbackSlice = createSlice({
  name: 'playback',
  initialState,
  reducers: {
    setCurrentPoem: (state, action: PayloadAction<Poem | null>) => {
      state.currentPoem = action.payload;
      state.currentTime = 0;
      state.duration = action.payload?.duration || 0;
    },
    setPlaybackMode: (state, action: PayloadAction<PlaybackMode>) => {
      state.mode = action.payload;
    },
    play: state => {
      state.isPlaying = true;
    },
    pause: state => {
      state.isPlaying = false;
    },
    stop: state => {
      state.isPlaying = false;
      state.currentTime = 0;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    seekTo: (state, action: PayloadAction<number>) => {
      state.currentTime = Math.max(0, Math.min(state.duration, action.payload));
    },
    reset: state => {
      return initialState;
    },
  },
});

export const {
  setCurrentPoem,
  setPlaybackMode,
  play,
  pause,
  stop,
  setCurrentTime,
  setDuration,
  setVolume,
  seekTo,
  reset,
} = playbackSlice.actions;

export default playbackSlice.reducer;
