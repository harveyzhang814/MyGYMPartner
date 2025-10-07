import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// 检查 Supabase 配置是否完整
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey && supabaseAnonKey;

// 添加调试日志
console.log('🔧 Supabase配置检查:', {
  url: supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  hasAnonKey: !!supabaseAnonKey,
  isConfigured: isSupabaseConfigured,
  environment: process.env.NODE_ENV
});

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
export const isDevelopment = () => process.env.NODE_ENV === 'development';

// 存储配置
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'avatars',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

export default supabase;
