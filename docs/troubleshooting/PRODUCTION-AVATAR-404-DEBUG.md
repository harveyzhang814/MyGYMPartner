# 生产环境头像获取404错误诊断

## 问题现象
- 错误类型：`AxiosError: Request failed with status code 404`
- 错误来源：`index-CXnsIv 4.js:482`
- 影响：用户无法获取头像，显示默认图标

## 诊断步骤

### 1. 检查API端点部署状态

#### 1.1 验证后端健康状态
```bash
# 检查后端服务是否正常运行
curl https://your-backend.railway.app/health

# 预期响应：{"status":"ok","timestamp":"..."}
```

#### 1.2 检查头像API端点
```bash
# 测试头像获取端点（需要认证）
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.railway.app/api/profile/avatar/USER_ID

# 预期响应：{"success":true,"data":{"url":"..."}}
```

#### 1.3 检查路由注册
```bash
# 检查所有注册的路由
curl https://your-backend.railway.app/api/profile

# 应该返回用户资料信息
```

### 2. 检查Supabase配置

#### 2.1 验证环境变量
在Railway项目设置中确认以下环境变量：
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

#### 2.2 检查Supabase连接
```bash
# 查看Railway日志
# 在Railway Dashboard中查看应用日志
# 查找Supabase连接相关的错误信息
```

#### 2.3 验证存储桶配置
在Supabase Dashboard中检查：
- `avatars` bucket是否存在
- bucket是否为公开（应该是false）
- RLS策略是否正确配置

### 3. 检查文件路径问题

#### 3.1 数据库中的头像URL格式
```sql
-- 在Supabase SQL Editor中执行
SELECT id, avatar_url FROM auth.users 
WHERE avatar_url IS NOT NULL 
LIMIT 5;
```

#### 3.2 检查文件路径解析
头像URL应该包含以下信息：
- 开发环境：`http://localhost:3001/uploads/avatars/filename`
- 生产环境：`https://your-project.supabase.co/storage/v1/object/public/avatars/filename`

### 4. 检查RLS策略

#### 4.1 验证存储策略
```sql
-- 检查现有策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

#### 4.2 测试策略有效性
```sql
-- 检查当前用户认证状态
SELECT auth.uid() as current_user_id;

-- 检查文件访问权限
SELECT * FROM storage.objects 
WHERE bucket_id = 'avatars' 
LIMIT 5;
```

## 修复方案

### 方案1：修复API路由问题

#### 1.1 检查路由注册
确保在 `backend/src/index.ts` 中正确注册了profile路由：
```typescript
import profileRoutes from './routes/profile';
app.use('/api/profile', profileRoutes);
```

#### 1.2 重新部署后端
```bash
# 在Railway中触发重新部署
# 或者推送代码到main分支
git add .
git commit -m "fix: 修复头像API路由问题"
git push origin main
```

### 方案2：修复Supabase配置

#### 2.1 重新配置环境变量
在Railway项目设置中：
1. 删除现有的Supabase环境变量
2. 重新添加正确的环境变量
3. 重新部署服务

#### 2.2 验证Supabase连接
```typescript
// 在backend/src/config/supabase.ts中添加调试日志
console.log('Supabase配置检查:', {
  url: process.env.SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
  isConfigured: isSupabaseConfigured
});
```

### 方案3：修复文件路径问题

#### 3.1 检查文件路径解析逻辑
```typescript
// 在backend/src/routes/profile.ts中添加调试日志
console.log('头像URL分析:', {
  originalUrl: user.avatarUrl,
  isLocal: user.avatarUrl.includes('localhost') || user.avatarUrl.includes('uploads'),
  isSupabase: user.avatarUrl.includes('supabase'),
  urlParts: user.avatarUrl.split('/'),
  filename: urlParts[urlParts.length - 1].split('?')[0]
});
```

#### 3.2 修复文件路径提取
```typescript
// 改进文件路径提取逻辑
const urlParts = user.avatarUrl.split('/');
const filename = urlParts[urlParts.length - 1].split('?')[0];
const filePath = `avatars/${filename}`;

console.log('文件路径信息:', {
  originalUrl: user.avatarUrl,
  filename,
  filePath
});
```

### 方案4：修复RLS策略

#### 4.1 重新创建存储策略
```sql
-- 删除所有现有策略
DROP POLICY IF EXISTS "Users can only access their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 重新创建策略
CREATE POLICY "Users can only access their own avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');
```

#### 4.2 设置存储桶为公开（临时方案）
```sql
-- 临时设置存储桶为公开，用于测试
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';
```

## 测试验证

### 1. 本地测试
```bash
# 启动本地开发环境
npm run dev

# 测试头像获取
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/profile/avatar/USER_ID
```

### 2. 生产环境测试
```bash
# 测试生产环境
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.railway.app/api/profile/avatar/USER_ID
```

### 3. 前端测试
1. 打开浏览器开发者工具
2. 访问生产环境应用
3. 登录用户账户
4. 查看网络请求标签页
5. 检查头像请求的响应

## 监控和维护

### 1. 日志监控
- Railway应用日志
- Supabase存储日志
- 浏览器控制台日志

### 2. 性能监控
- 头像加载时间
- API响应时间
- 错误率统计

### 3. 定期检查
- 环境变量配置
- Supabase连接状态
- 存储桶配置
- RLS策略有效性
