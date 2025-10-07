import { supabase, isProduction, STORAGE_CONFIG } from '../config/supabase';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export interface StorageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface StorageService {
  uploadAvatar(file: Express.Multer.File, userId: string): Promise<StorageResult>;
  deleteAvatar(url: string, userId: string): Promise<StorageResult>;
}

// 本地存储服务实现
class LocalStorageService implements StorageService {
  private uploadDir = path.join(__dirname, '../uploads/avatars');

  constructor() {
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<StorageResult> {
    try {
      const ext = path.extname(file.originalname);
      const filename = `avatar-${userId}-${Date.now()}${ext}`;
      const filepath = path.join(this.uploadDir, filename);
      
      // 写入文件
      fs.writeFileSync(filepath, file.buffer);
      
      // 生成可访问的URL
      const url = `http://localhost:3001/uploads/avatars/${filename}`;
      
      return {
        success: true,
        url
      };
    } catch (error) {
      console.error('本地存储上传失败:', error);
      return {
        success: false,
        error: '文件上传失败'
      };
    }
  }

  async deleteAvatar(url: string, userId: string): Promise<StorageResult> {
    try {
      // 从URL中提取文件名
      const filename = path.basename(url);
      const filepath = path.join(this.uploadDir, filename);
      
      // 检查文件是否存在并删除
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('本地存储删除失败:', error);
      return {
        success: false,
        error: '文件删除失败'
      };
    }
  }
}

// Supabase存储服务实现
class SupabaseStorageService implements StorageService {
  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<StorageResult> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase未配置'
        };
      }

      const ext = path.extname(file.originalname);
      const filename = `avatar-${userId}-${uuidv4()}${ext}`;
      const filePath = `avatars/${filename}`;

      // 上传文件到Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) {
        console.error('Supabase上传失败:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // 获取公共URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Supabase存储上传失败:', error);
      return {
        success: false,
        error: '文件上传失败'
      };
    }
  }

  async deleteAvatar(url: string, userId: string): Promise<StorageResult> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase未配置'
        };
      }

      // 从URL中提取文件路径
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const filePath = `avatars/${filename}`;

      // 从Supabase Storage删除文件
      const { error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Supabase删除失败:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Supabase存储删除失败:', error);
      return {
        success: false,
        error: '文件删除失败'
      };
    }
  }
}

// 存储服务工厂
export class StorageServiceFactory {
  static create(): StorageService {
    if (isProduction()) {
      return new SupabaseStorageService();
    } else {
      return new LocalStorageService();
    }
  }
}

// 导出默认存储服务实例
export const storageService = StorageServiceFactory.create();