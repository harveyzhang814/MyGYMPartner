import api from './api';
import { TrainingPlan, PaginatedResponse, CreateTrainingPlanRequest, TrainingPlanSearchParams } from '../types';

export const trainingPlanService = {
  // Get training plans
  getTrainingPlans: async (params?: TrainingPlanSearchParams): Promise<PaginatedResponse<TrainingPlan>> => {
    const response = await api.get<{ success: boolean; data: TrainingPlan[]; pagination: any }>('/training-plans', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  },

  // Get single training plan
  getTrainingPlan: async (id: string): Promise<TrainingPlan> => {
    const response = await api.get<{ success: boolean; data: TrainingPlan }>(`/training-plans/${id}`);
    return response.data.data;
  },

  // Create training plan
  createTrainingPlan: async (planData: CreateTrainingPlanRequest): Promise<TrainingPlan> => {
    const response = await api.post<{ success: boolean; data: TrainingPlan }>('/training-plans', planData);
    return response.data.data;
  },

  // Update training plan
  updateTrainingPlan: async (id: string, planData: Partial<CreateTrainingPlanRequest>): Promise<TrainingPlan> => {
    const response = await api.put<{ success: boolean; data: TrainingPlan }>(`/training-plans/${id}`, planData);
    return response.data.data;
  },

  // Delete training plan
  deleteTrainingPlan: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(`/training-plans/${id}`);
  },

  // Duplicate training plan
  duplicateTrainingPlan: async (id: string): Promise<TrainingPlan> => {
    const response = await api.post<{ success: boolean; data: TrainingPlan }>(`/training-plans/${id}/duplicate`);
    return response.data.data;
  }
};
