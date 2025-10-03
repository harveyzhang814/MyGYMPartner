// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  heightCm?: number;
  weightKg?: number;
  fitnessLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timezone: string;
  language: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Exercise types
export interface Exercise {
  id: string;
  name: string;
  nameZh?: string;
  description?: string;
  descriptionZh?: string;
  instructions?: string[];
  instructionsZh?: string[];
  muscleGroups: string[];
  equipment?: string;
  difficultyLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category?: string;
  images?: any;
  videos?: any;
  gifUrl?: string;
}

// Training Group types
export interface TrainingGroup {
  id: string;
  userId: string;
  name: string;
  exerciseId: string;
  description?: string;
  sets: number;
  repsMin?: number;
  repsMax?: number;
  weightMin?: number;
  weightMax?: number;
  restTimeSeconds: number;
  notes?: string;
  isTemplate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  exercise: Exercise;
}

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

// Exercise Session types
export interface ExerciseSession {
  id: string;
  userId: string;
  trainingPlanId?: string;
  name: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  totalDurationMinutes?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  exerciseRecords?: ExerciseRecord[];
}

export interface ExerciseRecord {
  id: string;
  sessionId: string;
  trainingGroupId: string;
  exerciseId: string;
  orderIndex: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  exercise: Exercise;
  trainingGroup: TrainingGroup;
  exerciseSetRecords: ExerciseSetRecord[];
}

export interface ExerciseSetRecord {
  id: string;
  exerciseRecordId: string;
  setNumber: number;
  reps?: number;
  weight?: number;
  restTimeSeconds?: number;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
}

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

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
