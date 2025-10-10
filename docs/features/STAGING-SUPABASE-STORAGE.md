# Staging 环境 Supabase 存储配置

## 概述

本文档说明如何配置 Staging 环境使用 Supabase 存储服务来管理用户头像。

## 存储策略

### 环境对照

| 环境 | 存储方式 | 存储桶名称 | 说明 |
|------|---------|-----------|------|
| **Development** | 本地文件系统 | N/A | 文件保存在 `backend/src/uploads/avatars/` |
| **Staging** | Supabase Storage | `avatars-staging` | 使用独立的测试存储桶 |
| **Production** | Supabase Storage | `avatars` | 使用生产存储桶 |

### 代码实现

#### 环境检测

```typescript
// backend/src/config/supabase.ts

// 环境检测函数
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isStaging = () => process.env.NODE_ENV === 'staging';
export const isDevelopment = () => process.env.NODE_ENV === 'development';

// 是否使用 Supabase 存储（生产环境和 Staging 环境）
export const useSupabaseStorage = () => isProduction() || isStaging();
```

#### 存储桶配置

```typescript
// backend/src/config/supabase.ts

export const STORAGE_CONFIG = {
  // 支持通过环境变量配置存储桶名称
  BUCKET_NAME: process.env.SUPABASE_STORAGE_BUCKET || 'avatars',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};
```

#### 存储服务选择

```typescript
// backend/src/services/storageService.ts

export class StorageServiceFactory {
  static create(): StorageService {
    // 生产环境和 Staging 环境使用 Supabase 存储
    // 开发环境使用本地存储
    if (useSupabaseStorage()) {
      console.log(`使用 Supabase 存储服务，存储桶: ${STORAGE_CONFIG.BUCKET_NAME}`);
      return new SupabaseStorageService();
    } else {
      console.log('使用本地存储服务');
      return new LocalStorageService();
    }
  }
}
```

## Railway Staging 环境变量配置

在 Railway `backend-staging` 服务中配置以下环境变量：

```bash
# 环境标识（必须设置为 staging）
NODE_ENV=staging

# Supabase 配置
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Staging 存储桶名称（重要！）
SUPABASE_STORAGE_BUCKET=avatars-staging
```

### 重要说明

⚠️ **必须设置 `SUPABASE_STORAGE_BUCKET=avatars-staging`**

- 如果不设置，将使用默认值 `avatars`（生产存储桶）
- Staging 和生产必须使用不同的存储桶，避免数据混淆
- 测试数据不会污染生产环境

## Supabase 存储桶配置

### 1. 创建 Staging 存储桶

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择您的项目
3. 进入 **Storage** → **Buckets**
4. 点击 **"Create a new bucket"**
5. 配置：
   - **Name**: `avatars-staging`
   - **Public bucket**: ✅ 勾选
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

### 2. 配置存储桶策略

#### 策略 1: 允许认证用户上传自己的头像

```sql
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = 'avatars'
);
```

#### 策略 2: 允许认证用户更新自己的头像

```sql
CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = 'avatars'
);
```

#### 策略 3: 允许认证用户删除自己的头像

```sql
CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = 'avatars'
);
```

#### 策略 4: 允许公开读取

```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public, authenticated
USING (bucket_id = 'avatars-staging');
```

## 工作流程

### 头像上传流程

1. **用户上传头像**
   - 前端发送文件到后端 API

2. **后端处理**
   - 检查环境：`NODE_ENV=staging`
   - 调用 `useSupabaseStorage()` → 返回 `true`
   - 使用 `SupabaseStorageService`
   - 读取 `SUPABASE_STORAGE_BUCKET` → `avatars-staging`

3. **上传到 Supabase**
   - 压缩图片（如果需要）
   - 生成唯一文件名（UUID）
   - 上传到 `avatars-staging` 存储桶
   - 路径：`avatars/[uuid].jpg`

4. **生成访问 URL**
   - 创建带签名的临时 URL（24小时有效）
   - 返回给前端

5. **前端显示**
   - 使用返回的 URL 显示头像
   - URL 示例：`https://xxx.supabase.co/storage/v1/object/sign/avatars-staging/avatars/xxx.jpg?token=xxx`

### 头像删除流程

1. **用户更新头像或删除账号**
   - 前端调用删除 API

2. **后端处理**
   - 从 URL 提取文件路径
   - 调用 Supabase Storage API 删除文件
   - 从 `avatars-staging` 存储桶删除

## 验证测试

### 1. 检查环境变量

```bash
# 在 Railway Shell 中运行
echo $NODE_ENV
# 应该输出: staging

echo $SUPABASE_STORAGE_BUCKET
# 应该输出: avatars-staging
```

### 2. 测试头像上传

1. 登录 Staging 前端
2. 进入个人资料页面
3. 上传头像图片
4. 检查 Railway 日志：
   ```
   使用 Supabase 存储服务，存储桶: avatars-staging
   头像压缩成功: xxx -> xxx bytes (压缩: xx%)
   ```

### 3. 验证 Supabase 存储

1. 登录 Supabase Dashboard
2. 进入 **Storage** → **avatars-staging**
3. 查看 `avatars/` 文件夹
4. 确认文件已上传

### 4. 测试头像显示

1. 刷新页面
2. 确认头像正常显示
3. 检查浏览器网络请求
4. URL 应该指向 Supabase：
   ```
   https://xxx.supabase.co/storage/v1/object/sign/avatars-staging/...
   ```

## 故障排查

### 问题 1: 头像上传失败

**症状**: 上传头像时返回错误

**检查清单**:
- [ ] `NODE_ENV=staging` 是否正确设置
- [ ] `SUPABASE_STORAGE_BUCKET=avatars-staging` 是否设置
- [ ] Supabase 配置（URL、Keys）是否正确
- [ ] `avatars-staging` 存储桶是否已创建
- [ ] 存储桶策略是否正确配置

**解决方案**:
```bash
# 在 Railway Shell 中检查配置
echo $NODE_ENV
echo $SUPABASE_URL
echo $SUPABASE_STORAGE_BUCKET

# 查看日志
# 应该看到: "使用 Supabase 存储服务，存储桶: avatars-staging"
```

### 问题 2: 头像显示 404

**症状**: 头像上传成功但无法显示

**可能原因**:
1. 存储桶策略未配置公开读取权限
2. URL 已过期（签名 URL 24小时有效）
3. 文件路径不正确

**解决方案**:
1. 检查存储桶策略 4（公开读取）
2. 重新上传头像获取新 URL
3. 检查 Railway 日志中的文件路径

### 问题 3: 使用了生产存储桶

**症状**: 文件上传到 `avatars` 而不是 `avatars-staging`

**原因**: 未设置 `SUPABASE_STORAGE_BUCKET` 环境变量

**解决方案**:
```bash
# 在 Railway backend-staging 服务中添加
SUPABASE_STORAGE_BUCKET=avatars-staging

# 重新部署服务
```

### 问题 4: 仍然使用本地存储

**症状**: 日志显示 "使用本地存储服务"

**原因**: `NODE_ENV` 不是 `staging` 或 `production`

**解决方案**:
```bash
# 确保设置正确
NODE_ENV=staging

# 不要使用其他值如 test、dev 等
```

## 环境变量完整清单

### Staging 环境必需变量

```bash
# 环境标识
NODE_ENV=staging

# Supabase 配置
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_STORAGE_BUCKET=avatars-staging

# 其他配置
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-staging-secret
CORS_ORIGIN=https://your-staging-frontend.vercel.app
AVATAR_UPLOAD_ENABLED=true
MAX_FILE_SIZE=5242880
```

## 最佳实践

### 1. 环境隔离

- ✅ Staging 和生产使用不同的存储桶
- ✅ 测试数据不会影响生产环境
- ✅ 可以安全地清空 Staging 存储桶

### 2. 存储桶命名

- 生产: `avatars`
- Staging: `avatars-staging`
- 开发: `avatars-dev`（如果需要）

### 3. 定期清理

```bash
# 定期清理 Staging 存储桶中的测试数据
# 在 Supabase Dashboard 中手动删除
# 或使用脚本批量删除旧文件
```

### 4. 监控和日志

- 检查 Railway 日志确认使用正确的存储服务
- 监控 Supabase 存储使用量
- 设置告警通知

## 相关文档

- [SUPABASE-STORAGE.md](./SUPABASE-STORAGE.md) - Supabase 存储配置详细说明
- [STAGING-SETUP-GUIDE.md](../deployment/STAGING-SETUP-GUIDE.md) - Staging 环境完整配置指南
- [IMAGE-COMPRESSION.md](./IMAGE-COMPRESSION.md) - 图片压缩功能说明

---

**最后更新**: 2024-10-08
