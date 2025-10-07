import sharp from 'sharp';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressionResult {
  success: boolean;
  buffer?: Buffer;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}

/**
 * 压缩图片文件
 * @param inputBuffer 原始图片缓冲区
 * @param options 压缩选项
 * @returns 压缩结果
 */
export async function compressImage(
  inputBuffer: Buffer, 
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  try {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 80,
      format = 'jpeg'
    } = options;

    const originalSize = inputBuffer.length;

    // 使用Sharp压缩图片
    const compressedBuffer = await sharp(inputBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality,
        progressive: true,
        mozjpeg: true // 使用更好的JPEG压缩算法
      })
      .toBuffer();

    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      success: true,
      buffer: compressedBuffer,
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100
    };
  } catch (error) {
    console.error('图片压缩失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '图片压缩失败'
    };
  }
}

/**
 * 智能压缩图片 - 根据文件大小自动调整压缩参数
 * @param inputBuffer 原始图片缓冲区
 * @returns 压缩结果
 */
export async function smartCompressImage(inputBuffer: Buffer): Promise<CompressionResult> {
  const fileSizeKB = inputBuffer.length / 1024;
  
  // 根据文件大小选择不同的压缩策略
  let options: CompressionOptions;
  
  if (fileSizeKB > 2000) { // 大于2MB
    options = {
      maxWidth: 600,
      maxHeight: 600,
      quality: 60,
      format: 'jpeg'
    };
  } else if (fileSizeKB > 1000) { // 大于1MB
    options = {
      maxWidth: 700,
      maxHeight: 700,
      quality: 70,
      format: 'jpeg'
    };
  } else if (fileSizeKB > 500) { // 大于500KB
    options = {
      maxWidth: 800,
      maxHeight: 800,
      quality: 80,
      format: 'jpeg'
    };
  } else {
    // 小于500KB，轻微压缩
    options = {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 85,
      format: 'jpeg'
    };
  }

  return compressImage(inputBuffer, options);
}

/**
 * 检查是否需要压缩
 * @param fileSize 文件大小（字节）
 * @param threshold 阈值（字节，默认500KB）
 * @returns 是否需要压缩
 */
export function shouldCompress(fileSize: number, threshold: number = 500 * 1024): boolean {
  return fileSize > threshold;
}

/**
 * 获取压缩建议
 * @param fileSize 文件大小（字节）
 * @returns 压缩建议
 */
export function getCompressionSuggestion(fileSize: number): {
  shouldCompress: boolean;
  suggestedQuality: number;
  suggestedMaxSize: number;
  reason: string;
} {
  const fileSizeKB = fileSize / 1024;
  
  if (fileSizeKB > 2000) {
    return {
      shouldCompress: true,
      suggestedQuality: 60,
      suggestedMaxSize: 600,
      reason: '文件过大，建议大幅压缩'
    };
  } else if (fileSizeKB > 1000) {
    return {
      shouldCompress: true,
      suggestedQuality: 70,
      suggestedMaxSize: 700,
      reason: '文件较大，建议适度压缩'
    };
  } else if (fileSizeKB > 500) {
    return {
      shouldCompress: true,
      suggestedQuality: 80,
      suggestedMaxSize: 800,
      reason: '文件适中，建议轻微压缩'
    };
  } else {
    return {
      shouldCompress: false,
      suggestedQuality: 90,
      suggestedMaxSize: 1000,
      reason: '文件较小，无需压缩'
    };
  }
}
