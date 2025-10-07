import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { UpdateProfileRequest, ChangePasswordRequest } from '../types';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const updateData: UpdateProfileRequest = req.body;

    console.log('接收到的更新数据:', updateData); // 调试日志

    // 验证日期格式
    if (updateData.dateOfBirth) {
      const date = new Date(updateData.dateOfBirth);
      console.log('日期解析结果:', date, '是否有效:', !isNaN(date.getTime())); // 调试日志
      if (isNaN(date.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid date format for dateOfBirth'
        });
        return;
      }
    }

    // 验证数值范围
    if (updateData.heightCm !== undefined && updateData.heightCm !== null && (updateData.heightCm < 50 || updateData.heightCm > 300)) {
      res.status(400).json({
        success: false,
        error: 'Height must be between 50 and 300 cm'
      });
      return;
    }

    if (updateData.weightKg !== undefined && updateData.weightKg !== null && (updateData.weightKg < 20 || updateData.weightKg > 500)) {
      res.status(400).json({
        success: false,
        error: 'Weight must be between 20 and 500 kg'
      });
      return;
    }

    // 准备更新数据
    const dataToUpdate: any = {};
    
    if (updateData.firstName !== undefined) dataToUpdate.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) dataToUpdate.lastName = updateData.lastName;
    if (updateData.avatarUrl !== undefined) dataToUpdate.avatarUrl = updateData.avatarUrl;
    if (updateData.dateOfBirth !== undefined && updateData.dateOfBirth !== null) {
      dataToUpdate.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    if (updateData.gender !== undefined && updateData.gender !== null) {
      dataToUpdate.gender = updateData.gender;
    }
    if (updateData.heightCm !== undefined && updateData.heightCm !== null) {
      dataToUpdate.heightCm = updateData.heightCm;
    }
    if (updateData.weightKg !== undefined && updateData.weightKg !== null) {
      dataToUpdate.weightKg = updateData.weightKg;
    }
    if (updateData.fitnessLevel !== undefined && updateData.fitnessLevel !== null) {
      dataToUpdate.fitnessLevel = updateData.fitnessLevel;
    }
    if (updateData.timezone !== undefined) dataToUpdate.timezone = updateData.timezone;
    if (updateData.language !== undefined) dataToUpdate.language = updateData.language;

    // 更新用户资料
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        dateOfBirth: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        fitnessLevel: true,
        timezone: true,
        language: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword }: ChangePasswordRequest = req.body;

    // 验证新密码长度
    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
      return;
    }

    // 获取用户当前密码
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
      return;
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      res.status(400).json({
        success: false,
        error: 'New password must be different from current password'
      });
      return;
    }

    // 加密新密码
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        dateOfBirth: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        fitnessLevel: true,
        timezone: true,
        language: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

