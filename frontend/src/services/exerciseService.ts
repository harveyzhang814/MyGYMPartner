import api from './api';
import { Exercise, PaginatedResponse, PaginationParams } from '../types';

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
  }
};
