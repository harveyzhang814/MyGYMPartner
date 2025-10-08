import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// 检查 Supabase 配置是否完整
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey && supabaseAnonKey;

// 服务端客户端（用于后端操作）
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// 匿名客户端（用于前端操作）
export const supabaseAnon = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// 环境检测函数
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isStaging = () => process.env.NODE_ENV === 'staging';
export const isDevelopment = () => process.env.NODE_ENV === 'development';

// 是否使用 Supabase 存储（生产环境和 Staging 环境）
export const useSupabaseStorage = () => isProduction() || isStaging();

// 存储配置
export const STORAGE_CONFIG = {
  // 支持通过环境变量配置存储桶名称
  // 生产环境: avatars
  // Staging 环境: avatars-staging
  // 开发环境: avatars-dev
  BUCKET_NAME: process.env.SUPABASE_STORAGE_BUCKET || 'avatars',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

export default supabase;
