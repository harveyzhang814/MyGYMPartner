import { Router } from 'express';
import { updateProfile, changePassword, getProfile } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';
import { Request, Response } from 'express';
import { prisma } from '../index';
import { storageService } from '../services/storageService';
import { isDevelopment, supabase, STORAGE_CONFIG } from '../config/supabase';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 获取个人资料
router.get('/', getProfile);

// 更新个人资料
router.put('/', updateProfile);

// 修改密码
router.put('/password', changePassword);

// 获取头像 - 安全访问头像文件
router.get('/avatar/:userId', async (req: Request, res: Response): Promise<void> => {
  console.log('🔍 头像获取请求:', {
    userId: req.params.userId,
    currentUserId: (req as any).user.id,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
  
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;
    
    // 只有用户本人可以访问自己的头像
    if (userId !== currentUserId) {
      res.status(403).json({
        success: false,
        error: '无权访问此头像'
      });
      return;
    }

    // 从数据库获取用户头像URL
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true }
    });

    console.log('📊 数据库查询结果:', {
      userId,
      hasUser: !!user,
      hasAvatarUrl: !!user?.avatarUrl,
      avatarUrl: user?.avatarUrl
    });

    if (!user || !user.avatarUrl) {
      console.log('❌ 头像不存在');
      res.status(404).json({
        success: false,
        error: '头像不存在'
      });
      return;
    }

    // 如果是本地存储，直接返回URL
    if (user.avatarUrl.includes('localhost') || user.avatarUrl.includes('uploads')) {
      res.json({
        success: true,
        data: { url: user.avatarUrl }
      });
      return;
    }

    // 如果是Supabase存储，生成新的签名URL
    if (user.avatarUrl.includes('supabase')) {
      console.log('🔧 处理Supabase存储头像');
      
      if (!supabase) {
        console.log('❌ Supabase未配置');
        res.status(500).json({
          success: false,
          error: 'Supabase未配置'
        });
        return;
      }

      // 从URL中提取文件路径
      const urlParts = user.avatarUrl.split('/');
      const filename = urlParts[urlParts.length - 1].split('?')[0]; // 移除查询参数
      const filePath = `avatars/${filename}`;

      console.log('📁 文件路径信息:', {
        originalUrl: user.avatarUrl,
        urlParts,
        filename,
        filePath
      });

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .createSignedUrl(filePath, 24 * 60 * 60); // 24小时有效期

      if (signedUrlError) {
        console.error('❌ 生成签名URL失败:', signedUrlError);
        res.status(500).json({
          success: false,
          error: '获取头像失败'
        });
        return;
      }

      console.log('✅ 签名URL生成成功:', signedUrlData.signedUrl);
      res.json({
        success: true,
        data: { url: signedUrlData.signedUrl }
      });
      return;
    }

    // 其他情况直接返回URL
    res.json({
      success: true,
      data: { url: user.avatarUrl }
    });
  } catch (error) {
    console.error('获取头像错误:', error);
    res.status(500).json({
      success: false,
      error: '获取头像失败'
    });
  }
});

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

