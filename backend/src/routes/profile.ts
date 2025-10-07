import { Router } from 'express';
import { updateProfile, changePassword, getProfile } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';
import { Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 获取个人资料
router.get('/', getProfile);

// 更新个人资料
router.put('/', updateProfile);

// 修改密码
router.put('/password', changePassword);

// 头像上传 - 根据环境变量控制
if (process.env.NODE_ENV === 'development' && process.env.AVATAR_UPLOAD_ENABLED === 'true') {
  router.post('/upload-avatar', uploadAvatar, async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ 
          success: false, 
          error: '没有上传文件' 
        });
        return;
      }

      // 生成可访问的URL
      const avatarUrl = `http://localhost:3001/uploads/avatars/${req.file.filename}`;
      
      // 更新用户头像
      const userId = (req as any).user.id;
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl }
      });
      
      console.log('数据库更新结果:', {
        userId,
        avatarUrl,
        updatedUser: {
          id: updatedUser.id,
          avatarUrl: updatedUser.avatarUrl
        }
      });

      res.json({
        success: true,
        data: { url: avatarUrl },
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
} else {
  // 生产环境返回功能未启用
  router.post('/upload-avatar', (req: Request, res: Response): void => {
    res.status(503).json({
      success: false,
      error: '头像上传功能暂未启用'
    });
  });
}

export default router;

