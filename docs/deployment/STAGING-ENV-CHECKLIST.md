# Staging 环境配置清单

这是一个快速参考清单，帮助您配置 Staging 环境时不遗漏任何关键步骤。

## 📋 配置前检查清单

- [ ] 已创建 `staging` 分支并推送到远程
- [ ] 已有 Vercel 生产环境项目
- [ ] 已有 Railway 生产环境项目
- [ ] 已有 Supabase 项目和存储配置
- [ ] 准备好生成新的 JWT Secret

---

## 🚂 Railway Staging 配置清单

### 1. 创建服务
- [ ] 在 Railway 项目中创建新服务 `backend-staging`
- [ ] 设置 Root Directory 为 `backend`
- [ ] 设置分支为 `staging`

### 2. 创建数据库
- [ ] 创建新的 PostgreSQL 数据库 `postgres-staging`
- [ ] 复制 `DATABASE_URL` 连接字符串

### 3. 配置环境变量

```bash
# 必需变量
NODE_ENV=staging
PORT=3001
DATABASE_URL=postgresql://postgres:xxx@xxx.railway.app:5432/railway
JWT_SECRET=<运行: openssl rand -base64 32>
CORS_ORIGIN=<稍后填写 Vercel Staging URL>
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_STORAGE_BUCKET=avatars-staging

# 可选变量
LOG_LEVEL=debug
AVATAR_UPLOAD_ENABLED=true
MAX_FILE_SIZE=5242880
```

- [ ] 所有环境变量已配置
- [ ] JWT_SECRET 已生成并配置
- [ ] DATABASE_URL 指向 Staging 数据库

### 4. 部署和初始化
- [ ] 触发部署
- [ ] 等待部署完成
- [ ] 在 Shell 中运行 `npx prisma migrate deploy`
- [ ] 在 Shell 中运行 `npx prisma generate`
- [ ] 复制后端 URL（如: `https://backend-staging-production-xxxx.up.railway.app`）
- [ ] 测试健康检查端点: `/health`

---

## ▲ Vercel Staging 配置清单

### 方式一：使用预览环境（推荐）

- [ ] 在现有项目的 Settings → Git 中确认 `staging` 分支包含在预览分支中
- [ ] 在 Settings → Environment Variables 中添加：
  - Name: `VITE_API_URL`
  - Value: `https://backend-staging-production-xxxx.up.railway.app/api`
  - Environment: ✅ Preview (选择 staging 分支)
- [ ] 推送代码到 `staging` 分支触发部署
- [ ] 复制预览 URL

### 方式二：创建独立项目

- [ ] 创建新项目 `mygympartner-staging`
- [ ] 设置 Root Directory 为 `frontend`
- [ ] 设置 Production Branch 为 `staging`
- [ ] 配置环境变量 `VITE_API_URL`
- [ ] 触发部署
- [ ] 复制生产 URL

### 更新后端 CORS
- [ ] 回到 Railway，更新 `CORS_ORIGIN` 为 Vercel Staging URL
- [ ] 等待后端重新部署

---

## 🗄️ Supabase Staging 配置清单

### 1. 创建存储桶
- [ ] 在 Supabase Dashboard 中创建新存储桶
- [ ] 名称: `avatars-staging`
- [ ] 设置为 Public bucket
- [ ] 文件大小限制: 5 MB
- [ ] 允许的 MIME 类型: `image/jpeg, image/png, image/webp, image/gif`

### 2. 配置存储桶策略

- [ ] 策略 1: 允许认证用户上传自己的头像 (INSERT)
```sql
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

- [ ] 策略 2: 允许认证用户更新自己的头像 (UPDATE)
```sql
CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

- [ ] 策略 3: 允许认证用户删除自己的头像 (DELETE)
```sql
CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

- [ ] 策略 4: 允许公开读取 (SELECT)
```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public, authenticated
USING (bucket_id = 'avatars-staging');
```

### 3. 验证配置
- [ ] 在 Supabase Dashboard 中测试策略
- [ ] 确认存储桶可见且可访问

---

## ✅ 验证测试清单

### 后端验证
- [ ] 访问健康检查端点返回正确响应
```bash
curl https://backend-staging-production-xxxx.up.railway.app/health
```

- [ ] 测试注册 API
```bash
curl -X POST https://backend-staging-production-xxxx.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123456"}'
```

- [ ] 测试登录 API
```bash
curl -X POST https://backend-staging-production-xxxx.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

- [ ] 数据库连接正常
```bash
# 在 Railway Shell 中
npx prisma db execute --stdin <<< "SELECT 1;"
```

### 前端验证
- [ ] 访问 Staging 前端 URL
- [ ] 页面加载正常，无控制台错误
- [ ] 可以访问登录页面
- [ ] API 请求指向正确的后端 URL（检查 Network 标签）

### 功能验证
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] JWT Token 生成和验证正常
- [ ] 头像上传功能正常
- [ ] 头像显示正常
- [ ] 刷新页面后头像持久化
- [ ] 其他核心功能正常

---

## 🔒 安全检查清单

- [ ] Staging 和生产环境使用不同的 JWT Secret
- [ ] Staging 数据库与生产数据库完全隔离
- [ ] `DATABASE_URL` 指向正确的 Staging 数据库
- [ ] `SUPABASE_STORAGE_BUCKET` 设置为 `avatars-staging`
- [ ] CORS 配置仅允许 Staging 前端域名
- [ ] 所有敏感信息存储在环境变量中，未硬编码
- [ ] Supabase 存储桶策略正确配置，不会泄露数据

---

## 📝 文档更新清单

- [ ] 更新 `vercel.staging.json` 中的 API URL
- [ ] 更新 `railway.staging.toml` 配置
- [ ] 记录 Staging 环境的访问 URL
- [ ] 更新团队文档，告知 Staging 环境地址
- [ ] 创建 Staging 环境使用指南

---

## 🔄 Git 工作流检查清单

- [ ] `staging` 分支已创建
- [ ] `staging` 分支已推送到远程
- [ ] 配置 GitHub 分支保护规则（可选）
- [ ] 团队成员了解新的工作流程：
  - `feature/*` → `staging` → `main`

---

## 📊 监控设置清单（可选）

- [ ] 配置 Railway 告警通知
- [ ] 配置 Vercel 部署通知
- [ ] 设置 Uptime 监控服务
- [ ] 集成错误追踪工具（如 Sentry）
- [ ] 配置日志聚合服务

---

## 🎯 最终确认

完成所有配置后，请确认：

- [ ] **后端 Staging URL**: `https://backend-staging-production-xxxx.up.railway.app`
- [ ] **前端 Staging URL**: `https://mygympartner-staging.vercel.app` 或预览 URL
- [ ] **数据库**: 独立的 Staging PostgreSQL 数据库
- [ ] **存储**: Supabase `avatars-staging` 存储桶
- [ ] **环境变量**: 所有必需的环境变量已正确配置
- [ ] **功能测试**: 核心功能全部通过测试
- [ ] **文档**: 相关文档已更新

---

## 📞 遇到问题？

如果遇到问题，请参考：
1. [Staging 环境配置详细指南](./STAGING-SETUP-GUIDE.md)
2. [部署指南](./DEPLOYMENT.md)
3. Railway 和 Vercel 的部署日志
4. 项目维护团队

---

**配置完成！** 🎉

您的 Staging 环境现在已准备就绪，可以开始测试新功能了。

记住工作流程：
```
开发功能 → 合并到 staging → 测试 → 合并到 main → 生产发布
```
