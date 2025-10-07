import { Router } from 'express';
import { updateProfile, changePassword, getProfile } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 获取个人资料
router.get('/', getProfile);

// 更新个人资料
router.put('/', updateProfile);

// 修改密码
router.put('/password', changePassword);

export default router;

