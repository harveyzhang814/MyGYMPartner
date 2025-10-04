import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TrainingPlan, PaginatedResponse, TrainingPlanSearchParams, CreateTrainingPlanRequest } from '../../types';
import { trainingPlanService } from '../../services/trainingPlanService';

interface TrainingPlanState {
  trainingPlans: TrainingPlan[];
  currentTrainingPlan: TrainingPlan | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: TrainingPlanState = {
  trainingPlans: [],
  currentTrainingPlan: null,
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
export const fetchTrainingPlans = createAsyncThunk(
  'trainingPlans/fetchTrainingPlans',
  async (params: TrainingPlanSearchParams | undefined, { rejectWithValue }) => {
    try {
      const response = await trainingPlanService.getTrainingPlans(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch training plans');
    }
  }
);

export const fetchTrainingPlan = createAsyncThunk(
  'trainingPlans/fetchTrainingPlan',
  async (id: string, { rejectWithValue }) => {
    try {
      const plan = await trainingPlanService.getTrainingPlan(id);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch training plan');
    }
  }
);

export const createTrainingPlan = createAsyncThunk(
  'trainingPlans/createTrainingPlan',
  async (planData: CreateTrainingPlanRequest, { rejectWithValue }) => {
    try {
      const plan = await trainingPlanService.createTrainingPlan(planData);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create training plan');
    }
  }
);

export const updateTrainingPlan = createAsyncThunk(
  'trainingPlans/updateTrainingPlan',
  async ({ id, data }: { id: string; data: Partial<CreateTrainingPlanRequest> }, { rejectWithValue }) => {
    try {
      const plan = await trainingPlanService.updateTrainingPlan(id, data);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update training plan');
    }
  }
);

export const deleteTrainingPlan = createAsyncThunk(
  'trainingPlans/deleteTrainingPlan',
  async (id: string, { rejectWithValue }) => {
    try {
      await trainingPlanService.deleteTrainingPlan(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete training plan');
    }
  }
);

export const duplicateTrainingPlan = createAsyncThunk(
  'trainingPlans/duplicateTrainingPlan',
  async (id: string, { rejectWithValue }) => {
    try {
      const plan = await trainingPlanService.duplicateTrainingPlan(id);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to duplicate training plan');
    }
  }
);

const trainingPlanSlice = createSlice({
  name: 'trainingPlans',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTrainingPlan: (state) => {
      state.currentTrainingPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch training plans
      .addCase(fetchTrainingPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingPlans.fulfilled, (state, action: PayloadAction<PaginatedResponse<TrainingPlan>>) => {
        state.loading = false;
        state.trainingPlans = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTrainingPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single training plan
      .addCase(fetchTrainingPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingPlan.fulfilled, (state, action: PayloadAction<TrainingPlan>) => {
        state.loading = false;
        state.currentTrainingPlan = action.payload;
        state.error = null;
      })
      .addCase(fetchTrainingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create training plan
      .addCase(createTrainingPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrainingPlan.fulfilled, (state, action: PayloadAction<TrainingPlan>) => {
        state.loading = false;
        state.trainingPlans.unshift(action.payload);
        state.error = null;
      })
      .addCase(createTrainingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update training plan
      .addCase(updateTrainingPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrainingPlan.fulfilled, (state, action: PayloadAction<TrainingPlan>) => {
        state.loading = false;
        const index = state.trainingPlans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.trainingPlans[index] = action.payload;
        }
        if (state.currentTrainingPlan?.id === action.payload.id) {
          state.currentTrainingPlan = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTrainingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete training plan
      .addCase(deleteTrainingPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrainingPlan.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.trainingPlans = state.trainingPlans.filter(plan => plan.id !== action.payload);
        if (state.currentTrainingPlan?.id === action.payload) {
          state.currentTrainingPlan = null;
        }
        state.error = null;
      })
      .addCase(deleteTrainingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Duplicate training plan
      .addCase(duplicateTrainingPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateTrainingPlan.fulfilled, (state, action: PayloadAction<TrainingPlan>) => {
        state.loading = false;
        state.trainingPlans.unshift(action.payload);
        state.error = null;
      })
      .addCase(duplicateTrainingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentTrainingPlan } = trainingPlanSlice.actions;
export default trainingPlanSlice.reducer;
