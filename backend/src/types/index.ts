import { Request } from 'express';
import { User } from '@prisma/client';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth types
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

// Training Group types
export interface CreateTrainingGroupRequest {
  name: string;
  exerciseId: string;
  description?: string;
  sets: number;
  repsMin?: number;
  repsMax?: number;
  weightMin?: number;
  weightMax?: number;
  restTimeSeconds?: number;
  notes?: string;
  tags?: string[];
}

export interface UpdateTrainingGroupRequest extends Partial<CreateTrainingGroupRequest> {
  id: string;
}

// Exercise Session types
export interface CreateExerciseSessionRequest {
  name: string;
  sessionDate: string;
  notes?: string;
}

export interface CreateExerciseRecordRequest {
  trainingGroupId: string;
  exerciseId: string;
  orderIndex: number;
  notes?: string;
  sets: Array<{
    setNumber: number;
    reps?: number;
    weight?: number;
    restTimeSeconds?: number;
    isCompleted?: boolean;
    notes?: string;
  }>;
}

// Exercise types
export interface BasicExercise {
  id: string;
  name: string;
  nameZh?: string;
  muscleGroups: string[];
  equipment?: string;
  difficultyLevel?: string;
  category?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
