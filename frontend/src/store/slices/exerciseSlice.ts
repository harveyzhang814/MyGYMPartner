import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Exercise, PaginatedResponse, PaginationParams, CreateExerciseRequest } from '../../types';
import { exerciseService } from '../../services/exerciseService';

interface ExerciseState {
  exercises: Exercise[];
  favoriteExercises: Exercise[];
  currentExercise: Exercise | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: ExerciseState = {
  exercises: [],
  favoriteExercises: [],
  currentExercise: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchExercises = createAsyncThunk(
  'exercises/fetchExercises',
  async (params: (PaginationParams & {
    search?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
  }) | undefined, { rejectWithValue }) => {
    try {
      const response = await exerciseService.getExercises(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch exercises');
    }
  }
);

export const fetchExercise = createAsyncThunk(
  'exercises/fetchExercise',
  async (id: string, { rejectWithValue }) => {
    try {
      const exercise = await exerciseService.getExercise(id);
      return exercise;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch exercise');
    }
  }
);

export const fetchFavoriteExercises = createAsyncThunk(
  'exercises/fetchFavoriteExercises',
  async (_, { rejectWithValue }) => {
    try {
      const exercises = await exerciseService.getFavoriteExercises();
      return exercises;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch favorite exercises');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'exercises/addToFavorites',
  async (exerciseId: string, { rejectWithValue }) => {
    try {
      await exerciseService.addToFavorites(exerciseId);
      return exerciseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add to favorites');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'exercises/removeFromFavorites',
  async (exerciseId: string, { rejectWithValue }) => {
    try {
      await exerciseService.removeFromFavorites(exerciseId);
      return exerciseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove from favorites');
    }
  }
);

export const createExercise = createAsyncThunk(
  'exercises/createExercise',
  async (exerciseData: CreateExerciseRequest, { rejectWithValue }) => {
    try {
      const exercise = await exerciseService.createExercise(exerciseData);
      return exercise;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create exercise');
    }
  }
);

export const updateExercise = createAsyncThunk(
  'exercises/updateExercise',
  async ({ id, data }: { id: string; data: Partial<CreateExerciseRequest> }, { rejectWithValue }) => {
    try {
      const exercise = await exerciseService.updateExercise(id, data);
      return exercise;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update exercise');
    }
  }
);

export const deleteExercise = createAsyncThunk(
  'exercises/deleteExercise',
  async (id: string, { rejectWithValue }) => {
    try {
      await exerciseService.deleteExercise(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete exercise');
    }
  }
);

export const fetchExerciseTemplates = createAsyncThunk(
  'exercises/fetchExerciseTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const templates = await exerciseService.getExerciseTemplates();
      return templates;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch exercise templates');
    }
  }
);

const exerciseSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentExercise: (state) => {
      state.currentExercise = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch exercises
      .addCase(fetchExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action: PayloadAction<PaginatedResponse<Exercise>>) => {
        state.loading = false;
        state.exercises = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single exercise
      .addCase(fetchExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercise.fulfilled, (state, action: PayloadAction<Exercise>) => {
        state.loading = false;
        state.currentExercise = action.payload;
        state.error = null;
      })
      .addCase(fetchExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch favorite exercises
      .addCase(fetchFavoriteExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteExercises.fulfilled, (state, action: PayloadAction<Exercise[]>) => {
        state.loading = false;
        state.favoriteExercises = action.payload;
        state.error = null;
      })
      .addCase(fetchFavoriteExercises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to favorites
      .addCase(addToFavorites.fulfilled, (state, action: PayloadAction<string>) => {
        const exercise = state.exercises.find(ex => ex.id === action.payload);
        if (exercise && !state.favoriteExercises.find(fav => fav.id === action.payload)) {
          state.favoriteExercises.push(exercise);
        }
      })
      // Remove from favorites
      .addCase(removeFromFavorites.fulfilled, (state, action: PayloadAction<string>) => {
        state.favoriteExercises = state.favoriteExercises.filter(ex => ex.id !== action.payload);
      })
      // Create exercise
      .addCase(createExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExercise.fulfilled, (state, action: PayloadAction<Exercise>) => {
        state.loading = false;
        state.exercises.unshift(action.payload);
        state.error = null;
      })
      .addCase(createExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update exercise
      .addCase(updateExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExercise.fulfilled, (state, action: PayloadAction<Exercise>) => {
        state.loading = false;
        const index = state.exercises.findIndex(ex => ex.id === action.payload.id);
        if (index !== -1) {
          state.exercises[index] = action.payload;
        }
        if (state.currentExercise?.id === action.payload.id) {
          state.currentExercise = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete exercise
      .addCase(deleteExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExercise.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.exercises = state.exercises.filter(ex => ex.id !== action.payload);
        state.favoriteExercises = state.favoriteExercises.filter(ex => ex.id !== action.payload);
        if (state.currentExercise?.id === action.payload) {
          state.currentExercise = null;
        }
        state.error = null;
      })
      .addCase(deleteExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch exercise templates
      .addCase(fetchExerciseTemplates.fulfilled, (_state, _action: PayloadAction<Exercise[]>) => {
        // Templates are handled separately, could be stored in a separate state if needed
      });
  },
});

export const { clearError, clearCurrentExercise } = exerciseSlice.actions;
export default exerciseSlice.reducer;
