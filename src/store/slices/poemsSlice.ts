/**
 * Poems Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { firestoreService } from '@services/firebase';
import type { Poem, PoemFilter } from '@types';

interface PoemsState {
  poems: Poem[];
  filteredPoems: Poem[];
  favorites: Poem[];
  currentPoem: Poem | null;
  filters: PoemFilter;
  isLoading: boolean;
  error: string | null;
}

const initialState: PoemsState = {
  poems: [],
  filteredPoems: [],
  favorites: [],
  currentPoem: null,
  filters: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPoems = createAsyncThunk(
  'poems/fetchPoems',
  async (_, { rejectWithValue }) => {
    try {
      const poems = await firestoreService.getAllPoems();
      return poems;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFilteredPoems = createAsyncThunk(
  'poems/fetchFilteredPoems',
  async (filters: PoemFilter, { rejectWithValue }) => {
    try {
      const poems = await firestoreService.getFilteredPoems(filters);
      return poems;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'poems/fetchFavorites',
  async (userId: string, { rejectWithValue }) => {
    try {
      const favorites = await firestoreService.getUserFavorites(userId);
      return favorites;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'poems/addToFavorites',
  async ({ userId, poemId }: { userId: string; poemId: string }, { rejectWithValue }) => {
    try {
      await firestoreService.addToFavorites(userId, poemId);
      return poemId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'poems/removeFromFavorites',
  async ({ userId, poemId }: { userId: string; poemId: string }, { rejectWithValue }) => {
    try {
      await firestoreService.removeFromFavorites(userId, poemId);
      return poemId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const poemsSlice = createSlice({
  name: 'poems',
  initialState,
  reducers: {
    setCurrentPoem: (state, action: PayloadAction<Poem | null>) => {
      state.currentPoem = action.payload;
    },
    setFilters: (state, action: PayloadAction<PoemFilter>) => {
      state.filters = action.payload;
    },
    clearFilters: state => {
      state.filters = {};
      state.filteredPoems = state.poems;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch Poems
    builder.addCase(fetchPoems.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPoems.fulfilled, (state, action) => {
      state.isLoading = false;
      state.poems = action.payload;
      state.filteredPoems = action.payload;
    });
    builder.addCase(fetchPoems.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Filtered Poems
    builder.addCase(fetchFilteredPoems.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchFilteredPoems.fulfilled, (state, action) => {
      state.isLoading = false;
      state.filteredPoems = action.payload;
    });
    builder.addCase(fetchFilteredPoems.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Favorites
    builder.addCase(fetchFavorites.fulfilled, (state, action) => {
      state.favorites = action.payload;
    });

    // Add to Favorites
    builder.addCase(addToFavorites.fulfilled, (state, action) => {
      const poem = state.poems.find(p => p.id === action.payload);
      if (poem && !state.favorites.find(f => f.id === poem.id)) {
        state.favorites.push(poem);
      }
    });

    // Remove from Favorites
    builder.addCase(removeFromFavorites.fulfilled, (state, action) => {
      state.favorites = state.favorites.filter(f => f.id !== action.payload);
    });
  },
});

export const { setCurrentPoem, setFilters, clearFilters, clearError } = poemsSlice.actions;
export default poemsSlice.reducer;
