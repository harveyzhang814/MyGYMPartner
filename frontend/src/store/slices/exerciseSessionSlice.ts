import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExerciseSession, CreateExerciseSessionRequest, CreateExerciseRecordRequest, PaginatedResponse, PaginationParams } from '../../types';
import { exerciseSessionService } from '../../services/exerciseSessionService';

interface ExerciseSessionState {
  exerciseSessions: ExerciseSession[];
  currentExerciseSession: ExerciseSession | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: ExerciseSessionState = {
  exerciseSessions: [],
  currentExerciseSession: null,
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
export const fetchExerciseSessions = createAsyncThunk(
  'exerciseSessions/fetchExerciseSessions',
  async (params: PaginationParams | undefined, { rejectWithValue }) => {
    try {
      const response = await exerciseSessionService.getExerciseSessions(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch exercise sessions');
    }
  }
);

export const fetchExerciseSession = createAsyncThunk(
  'exerciseSessions/fetchExerciseSession',
  async (id: string, { rejectWithValue }) => {
    try {
      const session = await exerciseSessionService.getExerciseSession(id);
      return session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch exercise session');
    }
  }
);

export const createExerciseSession = createAsyncThunk(
  'exerciseSessions/createExerciseSession',
  async (data: CreateExerciseSessionRequest, { rejectWithValue }) => {
    try {
      const session = await exerciseSessionService.createExerciseSession(data);
      return session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create exercise session');
    }
  }
);

export const updateExerciseSession = createAsyncThunk(
  'exerciseSessions/updateExerciseSession',
  async ({ id, data }: { id: string; data: Partial<CreateExerciseSessionRequest> }, { rejectWithValue }) => {
    try {
      const session = await exerciseSessionService.updateExerciseSession(id, data);
      return session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update exercise session');
    }
  }
);

export const deleteExerciseSession = createAsyncThunk(
  'exerciseSessions/deleteExerciseSession',
  async (id: string, { rejectWithValue }) => {
    try {
      await exerciseSessionService.deleteExerciseSession(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete exercise session');
    }
  }
);

export const addExerciseRecord = createAsyncThunk(
  'exerciseSessions/addExerciseRecord',
  async ({ sessionId, data }: { sessionId: string; data: CreateExerciseRecordRequest }, { rejectWithValue }) => {
    try {
      const record = await exerciseSessionService.addExerciseRecord(sessionId, data);
      return { sessionId, record };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add exercise record');
    }
  }
);

const exerciseSessionSlice = createSlice({
  name: 'exerciseSessions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentExerciseSession: (state) => {
      state.currentExerciseSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch exercise sessions
      .addCase(fetchExerciseSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExerciseSessions.fulfilled, (state, action: PayloadAction<PaginatedResponse<ExerciseSession>>) => {
        state.loading = false;
        state.exerciseSessions = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchExerciseSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single exercise session
      .addCase(fetchExerciseSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExerciseSession.fulfilled, (state, action: PayloadAction<ExerciseSession>) => {
        state.loading = false;
        state.currentExerciseSession = action.payload;
        state.error = null;
      })
      .addCase(fetchExerciseSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create exercise session
      .addCase(createExerciseSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExerciseSession.fulfilled, (state, action: PayloadAction<ExerciseSession>) => {
        state.loading = false;
        state.exerciseSessions.unshift(action.payload);
        state.error = null;
      })
      .addCase(createExerciseSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update exercise session
      .addCase(updateExerciseSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExerciseSession.fulfilled, (state, action: PayloadAction<ExerciseSession>) => {
        state.loading = false;
        const index = state.exerciseSessions.findIndex(session => session.id === action.payload.id);
        if (index !== -1) {
          state.exerciseSessions[index] = action.payload;
        }
        if (state.currentExerciseSession?.id === action.payload.id) {
          state.currentExerciseSession = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExerciseSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete exercise session
      .addCase(deleteExerciseSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExerciseSession.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.exerciseSessions = state.exerciseSessions.filter(session => session.id !== action.payload);
        if (state.currentExerciseSession?.id === action.payload) {
          state.currentExerciseSession = null;
        }
        state.error = null;
      })
      .addCase(deleteExerciseSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add exercise record
      .addCase(addExerciseRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExerciseRecord.fulfilled, (state, action) => {
        state.loading = false;
        const { sessionId, record } = action.payload;
        const sessionIndex = state.exerciseSessions.findIndex(session => session.id === sessionId);
        if (sessionIndex !== -1) {
          if (!state.exerciseSessions[sessionIndex].exerciseRecords) {
            state.exerciseSessions[sessionIndex].exerciseRecords = [];
          }
          state.exerciseSessions[sessionIndex].exerciseRecords!.push(record);
        }
        if (state.currentExerciseSession?.id === sessionId) {
          if (!state.currentExerciseSession.exerciseRecords) {
            state.currentExerciseSession.exerciseRecords = [];
          }
          state.currentExerciseSession.exerciseRecords.push(record);
        }
        state.error = null;
      })
      .addCase(addExerciseRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentExerciseSession } = exerciseSessionSlice.actions;
export default exerciseSessionSlice.reducer;
