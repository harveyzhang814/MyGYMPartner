# Staging 环境 Supabase 存储配置清单

快速配置 Staging 环境的 Supabase 存储服务。

## 📋 配置步骤

### Step 1: 在 Supabase 创建 Staging 存储桶

- [ ] 登录 [Supabase Dashboard](https://app.supabase.com/)
- [ ] 选择项目
- [ ] 进入 **Storage** → **Buckets**
- [ ] 点击 **"Create a new bucket"**
- [ ] 配置存储桶：
  ```
  Name: avatars-staging
  Public bucket: ✅ 勾选
  File size limit: 5 MB
  Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
  ```
- [ ] 点击 **"Create bucket"**

### Step 2: 配置存储桶策略

在 Supabase Dashboard 的 SQL Editor 中运行以下 SQL：

```sql
-- 策略 1: 允许认证用户上传
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- 策略 2: 允许认证用户更新
CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- 策略 3: 允许认证用户删除
CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- 策略 4: 允许公开读取
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public, authenticated
USING (bucket_id = 'avatars-staging');
```

- [ ] 执行所有 4 个策略
- [ ] 确认策略创建成功

### Step 3: 配置 Railway Staging 环境变量

在 Railway `backend-staging` 服务的 **Variables** 中确认以下配置：

```bash
# 环境标识（必须）
NODE_ENV=staging

# Supabase 配置（必须）
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Staging 存储桶名称（必须！）
SUPABASE_STORAGE_BUCKET=avatars-staging
```

**检查清单：**
- [ ] `NODE_ENV` 设置为 `staging`（不是 production、development 或其他值）
- [ ] `SUPABASE_URL` 已配置
- [ ] `SUPABASE_ANON_KEY` 已配置
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已配置
- [ ] `SUPABASE_STORAGE_BUCKET` 设置为 `avatars-staging`（不是 avatars）

### Step 4: 重新部署 Staging 后端

- [ ] 在 Railway 中触发重新部署
- [ ] 或推送代码到 staging 分支自动部署

### Step 5: 验证配置

#### 5.1 检查日志

- [ ] 在 Railway Deployments 中查看日志
- [ ] 应该看到：`使用 Supabase 存储服务，存储桶: avatars-staging`
- [ ] 不应该看到：`使用本地存储服务`

#### 5.2 测试上传

- [ ] 登录 Staging 前端
- [ ] 进入个人资料页面
- [ ] 上传头像图片
- [ ] 上传成功

#### 5.3 验证存储

- [ ] 在 Supabase Dashboard 中查看 `avatars-staging` 存储桶
- [ ] 确认文件已上传到 `avatars/` 文件夹
- [ ] 文件名格式：`[uuid].jpg`

#### 5.4 测试显示

- [ ] 刷新页面
- [ ] 头像正常显示
- [ ] 检查浏览器网络请求
- [ ] URL 应该指向：`https://xxx.supabase.co/storage/v1/object/sign/avatars-staging/...`

## ⚠️ 常见错误

### 错误 1: 仍然使用本地存储

**症状**: 日志显示 "使用本地存储服务"

**原因**: `NODE_ENV` 不是 `staging`

**解决**:
```bash
# 确保设置为 staging（不是 test、dev 等）
NODE_ENV=staging
```

### 错误 2: 使用了生产存储桶

**症状**: 文件上传到 `avatars` 而不是 `avatars-staging`

**原因**: 未设置 `SUPABASE_STORAGE_BUCKET`

**解决**:
```bash
# 必须设置
SUPABASE_STORAGE_BUCKET=avatars-staging
```

### 错误 3: 上传失败

**症状**: 上传头像时返回错误

**检查**:
- [ ] Supabase 配置（URL、Keys）是否正确
- [ ] `avatars-staging` 存储桶是否已创建
- [ ] 存储桶策略是否正确配置
- [ ] 存储桶是否设置为 Public

### 错误 4: 头像显示 404

**症状**: 上传成功但无法显示

**检查**:
- [ ] 存储桶策略 4（公开读取）是否配置
- [ ] 存储桶是否设置为 Public bucket
- [ ] URL 是否正确

## 🎯 最终检查

完成配置后，确认以下所有项：

### Supabase
- [ ] ✅ `avatars-staging` 存储桶已创建
- [ ] ✅ 存储桶设置为 Public
- [ ] ✅ 4 个存储桶策略全部配置
- [ ] ✅ 策略中的 bucket_id 是 `avatars-staging`

### Railway Staging
- [ ] ✅ `NODE_ENV=staging`
- [ ] ✅ `SUPABASE_URL` 已配置
- [ ] ✅ `SUPABASE_ANON_KEY` 已配置
- [ ] ✅ `SUPABASE_SERVICE_ROLE_KEY` 已配置
- [ ] ✅ `SUPABASE_STORAGE_BUCKET=avatars-staging`
- [ ] ✅ 服务已重新部署

### 功能测试
- [ ] ✅ 日志显示使用 Supabase 存储
- [ ] ✅ 头像上传成功
- [ ] ✅ 文件出现在 Supabase `avatars-staging` 存储桶
- [ ] ✅ 头像正常显示
- [ ] ✅ 刷新页面后头像持久化

## 📊 环境对照

| 配置项 | 生产环境 | Staging 环境 |
|--------|----------|--------------|
| `NODE_ENV` | `production` | `staging` |
| `SUPABASE_STORAGE_BUCKET` | `avatars` | `avatars-staging` |
| 存储方式 | Supabase Storage | Supabase Storage |
| 存储桶 | avatars | avatars-staging |

## 📚 相关文档

- [STAGING-SUPABASE-STORAGE.md](../features/STAGING-SUPABASE-STORAGE.md) - 详细技术说明
- [STAGING-SETUP-GUIDE.md](./STAGING-SETUP-GUIDE.md) - 完整 Staging 环境配置
- [SUPABASE-STORAGE.md](../features/SUPABASE-STORAGE.md) - Supabase 存储配置

---

**配置完成后，Staging 环境将使用独立的 Supabase 存储桶，与生产环境完全隔离！** 🎉
