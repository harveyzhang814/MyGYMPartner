import api from './api';
import { Exercise, PaginatedResponse, PaginationParams, CreateExerciseRequest } from '../types';

export const exerciseService = {
  // Get exercises
  getExercises: async (params?: PaginationParams & {
    search?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
  }): Promise<PaginatedResponse<Exercise>> => {
    const response = await api.get<{ success: boolean; data: Exercise[]; pagination: any }>('/exercises', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  },

  // Get single exercise
  getExercise: async (id: string): Promise<Exercise> => {
    const response = await api.get<{ success: boolean; data: Exercise }>(`/exercises/${id}`);
    return response.data.data;
  },

  // Get favorite exercises
  getFavoriteExercises: async (): Promise<Exercise[]> => {
    const response = await api.get<{ success: boolean; data: Exercise[] }>('/exercises/favorites/list');
    return response.data.data;
  },

  // Add to favorites
  addToFavorites: async (exerciseId: string): Promise<void> => {
    await api.post<{ success: boolean; message: string }>('/exercises/favorites', { exerciseId });
  },

  // Remove from favorites
  removeFromFavorites: async (exerciseId: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(`/exercises/favorites/${exerciseId}`);
  },

  // Create exercise
  createExercise: async (exerciseData: CreateExerciseRequest): Promise<Exercise> => {
    const response = await api.post<{ success: boolean; data: Exercise }>('/exercises', exerciseData);
    return response.data.data;
  },

  // Update exercise
  updateExercise: async (id: string, exerciseData: Partial<CreateExerciseRequest>): Promise<Exercise> => {
    const response = await api.put<{ success: boolean; data: Exercise }>(`/exercises/${id}`, exerciseData);
    return response.data.data;
  },

  // Delete exercise
  deleteExercise: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(`/exercises/${id}`);
  },

  // Get exercise templates
  getExerciseTemplates: async (): Promise<Exercise[]> => {
    const response = await api.get<{ success: boolean; data: Exercise[] }>('/exercises/templates');
    return response.data.data;
  }
};
