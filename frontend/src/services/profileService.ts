import api from './api';
import { User } from '../types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  heightCm?: number;
  weightKg?: number;
  fitnessLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timezone?: string;
  language?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  // Get profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User; message: string }>('/profile');
    return response.data.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put<{ success: boolean; data: User; message: string }>('/profile', data);
    return response.data.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put<{ success: boolean; message: string }>('/profile/password', data);
  }
};

