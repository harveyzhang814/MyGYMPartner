import api from './api';
import { 
  TrainingGroup, 
  CreateTrainingGroupRequest, 
  PaginatedResponse, 
  PaginationParams 
} from '../types';

export const trainingGroupService = {
  // Get training groups
  getTrainingGroups: async (params?: PaginationParams): Promise<PaginatedResponse<TrainingGroup>> => {
    const response = await api.get<{ success: boolean; data: TrainingGroup[]; pagination: any }>('/training-groups', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  },

  // Get single training group
  getTrainingGroup: async (id: string): Promise<TrainingGroup> => {
    const response = await api.get<{ success: boolean; data: TrainingGroup }>(`/training-groups/${id}`);
    return response.data.data;
  },

  // Create training group
  createTrainingGroup: async (data: CreateTrainingGroupRequest): Promise<TrainingGroup> => {
    const response = await api.post<{ success: boolean; data: TrainingGroup; message: string }>('/training-groups', data);
    return response.data.data;
  },

  // Update training group
  updateTrainingGroup: async (id: string, data: Partial<CreateTrainingGroupRequest>): Promise<TrainingGroup> => {
    const response = await api.put<{ success: boolean; data: TrainingGroup; message: string }>(`/training-groups/${id}`, data);
    return response.data.data;
  },

  // Delete training group
  deleteTrainingGroup: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(`/training-groups/${id}`);
  }
};
