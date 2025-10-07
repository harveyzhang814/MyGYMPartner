import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { STORAGE_CONFIG, isDevelopment } from '../config/supabase';

// 确保上传目录存在（仅开发环境需要）
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (isDevelopment() && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 根据环境选择存储方式
const storage = isDevelopment() 
  ? multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const userId = (req as any).user?.id || 'anonymous';
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        cb(null, `avatar-${userId}-${timestamp}${ext}`);
      }
    })
  : multer.memoryStorage(); // 生产环境使用内存存储，直接传递给Supabase

const upload = multer({
  storage,
  limits: {
    fileSize: STORAGE_CONFIG.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // 检查文件类型
    if (STORAGE_CONFIG.ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)'));
    }
  }
});

export const uploadAvatar = upload.single('avatar');
