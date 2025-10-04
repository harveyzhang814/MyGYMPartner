import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TrainingGroup, CreateTrainingGroupRequest, PaginatedResponse, PaginationParams } from '../../types';
import { trainingGroupService } from '../../services/trainingGroupService';

interface TrainingGroupState {
  trainingGroups: TrainingGroup[];
  currentTrainingGroup: TrainingGroup | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: TrainingGroupState = {
  trainingGroups: [],
  currentTrainingGroup: null,
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
export const fetchTrainingGroups = createAsyncThunk(
  'trainingGroups/fetchTrainingGroups',
  async (params: PaginationParams | undefined, { rejectWithValue }) => {
    try {
      const response = await trainingGroupService.getTrainingGroups(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch training groups');
    }
  }
);

export const fetchTrainingGroup = createAsyncThunk(
  'trainingGroups/fetchTrainingGroup',
  async (id: string, { rejectWithValue }) => {
    try {
      const trainingGroup = await trainingGroupService.getTrainingGroup(id);
      return trainingGroup;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch training group');
    }
  }
);

export const createTrainingGroup = createAsyncThunk(
  'trainingGroups/createTrainingGroup',
  async (data: CreateTrainingGroupRequest, { rejectWithValue }) => {
    try {
      const trainingGroup = await trainingGroupService.createTrainingGroup(data);
      return trainingGroup;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create training group');
    }
  }
);

export const updateTrainingGroup = createAsyncThunk(
  'trainingGroups/updateTrainingGroup',
  async ({ id, data }: { id: string; data: Partial<CreateTrainingGroupRequest> }, { rejectWithValue }) => {
    try {
      const trainingGroup = await trainingGroupService.updateTrainingGroup(id, data);
      return trainingGroup;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update training group');
    }
  }
);

export const deleteTrainingGroup = createAsyncThunk(
  'trainingGroups/deleteTrainingGroup',
  async (id: string, { rejectWithValue }) => {
    try {
      await trainingGroupService.deleteTrainingGroup(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete training group');
    }
  }
);

const trainingGroupSlice = createSlice({
  name: 'trainingGroups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTrainingGroup: (state) => {
      state.currentTrainingGroup = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch training groups
      .addCase(fetchTrainingGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingGroups.fulfilled, (state, action: PayloadAction<PaginatedResponse<TrainingGroup>>) => {
        state.loading = false;
        state.trainingGroups = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTrainingGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single training group
      .addCase(fetchTrainingGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingGroup.fulfilled, (state, action: PayloadAction<TrainingGroup>) => {
        state.loading = false;
        state.currentTrainingGroup = action.payload;
        state.error = null;
      })
      .addCase(fetchTrainingGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create training group
      .addCase(createTrainingGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrainingGroup.fulfilled, (state, action: PayloadAction<TrainingGroup>) => {
        state.loading = false;
        state.trainingGroups.unshift(action.payload);
        state.error = null;
      })
      .addCase(createTrainingGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update training group
      .addCase(updateTrainingGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrainingGroup.fulfilled, (state, action: PayloadAction<TrainingGroup>) => {
        state.loading = false;
        const index = state.trainingGroups.findIndex(tg => tg.id === action.payload.id);
        if (index !== -1) {
          state.trainingGroups[index] = action.payload;
        }
        if (state.currentTrainingGroup?.id === action.payload.id) {
          state.currentTrainingGroup = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTrainingGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete training group
      .addCase(deleteTrainingGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrainingGroup.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.trainingGroups = state.trainingGroups.filter(tg => tg.id !== action.payload);
        if (state.currentTrainingGroup?.id === action.payload) {
          state.currentTrainingGroup = null;
        }
        state.error = null;
      })
      .addCase(deleteTrainingGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentTrainingGroup } = trainingGroupSlice.actions;
export default trainingGroupSlice.reducer;
