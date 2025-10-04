import api from './api';
import { 
  ExerciseSession, 
  CreateExerciseSessionRequest, 
  CreateExerciseRecordRequest,
  PaginatedResponse, 
  PaginationParams 
} from '../types';

export const exerciseSessionService = {
  // Get exercise sessions
  getExerciseSessions: async (params?: PaginationParams): Promise<PaginatedResponse<ExerciseSession>> => {
    const response = await api.get<{ success: boolean; data: ExerciseSession[]; pagination: any }>('/exercise-sessions', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  },

  // Get single exercise session
  getExerciseSession: async (id: string): Promise<ExerciseSession> => {
    const response = await api.get<{ success: boolean; data: ExerciseSession }>(`/exercise-sessions/${id}`);
    return response.data.data;
  },

  // Create exercise session
  createExerciseSession: async (data: CreateExerciseSessionRequest): Promise<ExerciseSession> => {
    const response = await api.post<{ success: boolean; data: ExerciseSession; message: string }>('/exercise-sessions', data);
    return response.data.data;
  },

  // Update exercise session
  updateExerciseSession: async (id: string, data: Partial<CreateExerciseSessionRequest>): Promise<ExerciseSession> => {
    const response = await api.put<{ success: boolean; data: ExerciseSession; message: string }>(`/exercise-sessions/${id}`, data);
    return response.data.data;
  },

  // Delete exercise session
  deleteExerciseSession: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(`/exercise-sessions/${id}`);
  },

  // Add exercise record to session
  addExerciseRecord: async (sessionId: string, data: CreateExerciseRecordRequest): Promise<any> => {
    const response = await api.post<{ success: boolean; data: any; message: string }>(`/exercise-sessions/${sessionId}/records`, data);
    return response.data.data;
  }
};
