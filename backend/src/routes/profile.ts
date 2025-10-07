import { Router } from 'express';
import { updateProfile, changePassword, getProfile } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';
import { Request, Response } from 'express';
import { prisma } from '../index';
import { storageService } from '../services/storageService';
import { isDevelopment } from '../config/supabase';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 获取个人资料
router.get('/', getProfile);

// 更新个人资料
router.put('/', updateProfile);

// 修改密码
router.put('/password', changePassword);

// 头像上传 - 支持开发和生产环境
router.post('/upload-avatar', uploadAvatar, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ 
        success: false, 
        error: '没有上传文件' 
      });
      return;
    }

    const userId = (req as any).user.id;
    
    // 使用统一的存储服务上传文件
    const uploadResult = await storageService.uploadAvatar(req.file, userId);
    
    if (!uploadResult.success) {
      res.status(500).json({
        success: false,
        error: uploadResult.error || '文件上传失败'
      });
      return;
    }

    // 更新用户头像URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: uploadResult.url }
    });
    
    console.log('头像上传成功:', {
      userId,
      avatarUrl: uploadResult.url,
      environment: isDevelopment() ? 'development' : 'production',
      storage: isDevelopment() ? 'local' : 'supabase'
    });

    res.json({
      success: true,
      data: { url: uploadResult.url },
      message: '头像上传成功'
    });
  } catch (error) {
    console.error('头像上传错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '上传失败' 
    });
  }
});

export default router;

