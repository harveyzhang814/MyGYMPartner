import { supabase, isProduction, STORAGE_CONFIG } from '../config/supabase';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { smartCompressImage, shouldCompress } from '../utils/imageCompression';

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
      // 在开发环境中，文件已经保存到磁盘，需要读取文件内容
      let fileBuffer: Buffer;
      let compressionInfo = '';

      if (file.buffer) {
        // 生产环境：文件在内存中
        fileBuffer = file.buffer;
      } else {
        // 开发环境：文件已保存到磁盘，需要读取
        fileBuffer = fs.readFileSync(file.path);
      }

      // 检查是否需要压缩
      if (shouldCompress(fileBuffer.length)) {
        const compressionResult = await smartCompressImage(fileBuffer);
        
        if (compressionResult.success && compressionResult.buffer) {
          fileBuffer = compressionResult.buffer;
          compressionInfo = ` (压缩: ${compressionResult.compressionRatio}%)`;
          console.log(`头像压缩成功: ${compressionResult.originalSize} -> ${compressionResult.compressedSize} bytes${compressionInfo}`);
        } else {
          console.warn('头像压缩失败，使用原始文件:', compressionResult.error);
        }
      }

      const ext = path.extname(file.originalname);
      const filename = `avatar-${userId}-${Date.now()}${ext}`;
      const filepath = path.join(this.uploadDir, filename);
      
      // 写入文件
      fs.writeFileSync(filepath, fileBuffer);
      
      // 如果原始文件在磁盘上，删除临时文件
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
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

      let finalBuffer = file.buffer;
      let compressionInfo = '';

      // 检查是否需要压缩
      if (shouldCompress(file.buffer.length)) {
        const compressionResult = await smartCompressImage(file.buffer);
        
        if (compressionResult.success && compressionResult.buffer) {
          finalBuffer = compressionResult.buffer;
          compressionInfo = ` (压缩: ${compressionResult.compressionRatio}%)`;
          console.log(`头像压缩成功: ${compressionResult.originalSize} -> ${compressionResult.compressedSize} bytes${compressionInfo}`);
        } else {
          console.warn('头像压缩失败，使用原始文件:', compressionResult.error);
        }
      }

      const ext = path.extname(file.originalname);
      // 使用UUID作为文件名，不暴露用户ID
      const filename = `${uuidv4()}${ext}`;
      const filePath = `avatars/${filename}`;

      // 上传文件到Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .upload(filePath, finalBuffer, {
          contentType: 'image/jpeg', // 压缩后统一为JPEG格式
          upsert: true
        });

      if (error) {
        console.error('Supabase上传失败:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // 生成带签名的临时URL（24小时有效期）
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .createSignedUrl(filePath, 24 * 60 * 60); // 24小时

      if (signedUrlError) {
        console.error('生成签名URL失败:', signedUrlError);
        return {
          success: false,
          error: '生成访问链接失败'
        };
      }

      return {
        success: true,
        url: signedUrlData.signedUrl
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