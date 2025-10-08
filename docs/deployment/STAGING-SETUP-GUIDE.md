# MyGYMPartner Staging 环境配置指南

本指南将帮助您在已有生产环境的基础上，配置一个完整的 Staging（预发布）环境。

## 目录
- [架构概览](#架构概览)
- [前置条件](#前置条件)
- [第一步：配置 Railway Staging 环境](#第一步配置-railway-staging-环境)
- [第二步：配置 Vercel Staging 环境](#第二步配置-vercel-staging-环境)
- [第三步：配置 Supabase Staging 存储桶](#第三步配置-supabase-staging-存储桶)
- [第四步：验证部署](#第四步验证部署)
- [环境变量对照表](#环境变量对照表)
- [分支管理策略](#分支管理策略)
- [常见问题](#常见问题)

---

## 架构概览

### 生产环境 (Production)
- **前端**: Vercel (`main` 分支)
- **后端**: Railway (`main` 分支)
- **数据库**: Railway PostgreSQL (生产数据库)
- **存储**: Supabase Storage (生产存储桶)

### 预发布环境 (Staging)
- **前端**: Vercel (`staging` 分支)
- **后端**: Railway (`staging` 分支)
- **数据库**: Railway PostgreSQL (独立的测试数据库)
- **存储**: Supabase Storage (独立的测试存储桶)

---

## 前置条件

### 已有资源
- ✅ GitHub 仓库，包含 `main` 和 `staging` 分支
- ✅ Vercel 账号，已部署生产环境前端
- ✅ Railway 账号，已部署生产环境后端
- ✅ Supabase 账号，已配置生产环境存储

### 需要准备的信息
- [ ] Supabase 项目 URL 和 API Keys
- [ ] 生产环境的环境变量（用作参考）
- [ ] 新的 JWT Secret（用于 staging）

---

## 第一步：配置 Railway Staging 环境

### 1.1 创建 Staging 服务

#### 方式一：在现有项目中创建新服务（推荐）
1. 打开您的 Railway 项目 (如: `mygympartner`)
2. 点击 **"+ New"** → **"GitHub Repo"**
3. 选择您的仓库
4. 配置服务：
   - **Service Name**: `backend-staging`
   - **Root Directory**: `backend`
   - **Branch**: `staging`
   - **Environment**: 创建新环境 `staging`

#### 方式二：创建独立项目
1. 在 Railway 中点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择您的仓库
4. 项目名称: `mygympartner-staging`
5. 配置：
   - **Root Directory**: `backend`
   - **Branch**: `staging`

### 1.2 创建 Staging 数据库

1. 在 Railway 项目中，点击 **"+ New"** → **"Database"** → **"PostgreSQL"**
2. 数据库名称: `postgres-staging`
3. 等待数据库创建完成
4. 点击数据库服务，进入 **"Variables"** 标签
5. 复制 `DATABASE_URL` 的值（格式类似）:
   ```
   postgresql://postgres:xxx@xxx.railway.app:5432/railway
   ```

### 1.3 配置 Staging 环境变量

在 `backend-staging` 服务的 **Settings** → **Variables** 中添加以下环境变量：

#### 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `staging` | 环境标识 |
| `PORT` | `3001` | 服务端口（Railway 会自动映射） |
| `DATABASE_URL` | `postgresql://postgres:xxx@xxx.railway.app:5432/railway` | Staging 数据库连接字符串 |
| `JWT_SECRET` | `your-staging-jwt-secret-key` | JWT 密钥（生成新的，不要与生产环境相同） |
| `CORS_ORIGIN` | `https://your-app-staging.vercel.app` | Staging 前端域名（稍后配置） |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | `eyJxxx...` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx...` | Supabase 服务角色密钥 |
| `SUPABASE_STORAGE_BUCKET` | `avatars-staging` | Staging 存储桶名称 |

#### 生成 JWT Secret
```bash
# 在本地终端运行
openssl rand -base64 32
```

#### 可选的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `LOG_LEVEL` | `debug` | 日志级别（staging 可以更详细） |
| `AVATAR_UPLOAD_ENABLED` | `true` | 启用头像上传 |
| `MAX_FILE_SIZE` | `5242880` | 最大文件大小（5MB） |

### 1.4 配置部署设置

1. 在 `backend-staging` 服务的 **Settings** → **Deploy** 中：
   - **Build Command**: 自动检测（使用 `package.json` 中的 `build` 脚本）
   - **Start Command**: `npm run start`
   - **Watch Paths**: `backend/**`
   - **Root Directory**: `backend`

2. 配置 Railway.toml（已存在 `backend/railway.staging.toml`）:
   ```toml
   [build]
   builder = "nixpacks"

   [deploy]
   startCommand = "npm run start"
   healthcheckPath = "/health"
   healthcheckTimeout = 300
   restartPolicyType = "on_failure"
   restartPolicyMaxRetries = 10

   [env]
   NODE_ENV = "staging"
   ```

### 1.5 初始化 Staging 数据库

1. 在 Railway 项目中，点击 `backend-staging` 服务
2. 进入 **Deployments** 标签，找到最新的部署
3. 点击 **"View Logs"**，等待部署完成
4. 点击 **"Shell"** 或使用 Railway CLI 运行：
   ```bash
   # 运行数据库迁移
   npx prisma migrate deploy
   
   # 生成 Prisma Client
   npx prisma generate
   
   # （可选）填充测试数据
   npm run seed
   ```

### 1.6 获取 Staging 后端 URL

1. 在 `backend-staging` 服务的 **Settings** → **Networking** 中
2. 复制生成的域名（格式类似）:
   ```
   https://backend-staging-production-xxxx.up.railway.app
   ```
3. 记录此 URL，后续配置前端时需要使用

---

## 第二步：配置 Vercel Staging 环境

### 2.1 创建 Staging 项目

#### 方式一：在现有项目中配置 Staging 环境（推荐）
1. 打开您的 Vercel 项目（如: `mygympartner-frontend`）
2. 进入 **Settings** → **Git**
3. 在 **Production Branch** 下方，找到 **Preview Branches**
4. 确保 `staging` 分支被包含在预览分支中

#### 方式二：创建独立项目
1. 在 Vercel 中点击 **"Add New..."** → **"Project"**
2. 选择您的 GitHub 仓库
3. 配置项目：
   - **Project Name**: `mygympartner-staging`
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Production Branch**: `staging`

### 2.2 配置 Staging 环境变量

在 Vercel 项目的 **Settings** → **Environment Variables** 中添加：

#### 方式一：直接设置环境变量（推荐）

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_API_URL` | `https://backend-staging-production-xxxx.up.railway.app/api` | Preview (staging) |

配置步骤：
1. 点击 **"Add New"**
2. **Name**: `VITE_API_URL`
3. **Value**: 您的 Railway Staging 后端 URL + `/api`
4. **Environment**: 
   - ✅ **Preview** (选择 `staging` 分支)
   - ⬜ Production
   - ⬜ Development
5. 点击 **"Save"**

#### 方式二：使用 vercel.staging.json（如果使用独立项目）

确保 `frontend/vercel.staging.json` 文件内容正确：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://backend-staging-production-xxxx.up.railway.app/api"
  }
}
```

### 2.3 配置构建设置

在 **Settings** → **Build & Development Settings**：
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `frontend`

### 2.4 部署 Staging 前端

#### 如果使用现有项目的预览环境
1. 推送代码到 `staging` 分支：
   ```bash
   git checkout staging
   git push origin staging
   ```
2. Vercel 会自动为 `staging` 分支创建预览部署
3. 在 Vercel 仪表板的 **Deployments** 中找到 staging 分支的部署
4. 复制预览 URL（格式类似）:
   ```
   https://mygympartner-frontend-git-staging-yourname.vercel.app
   ```

#### 如果创建了独立项目
1. 点击 **"Deploy"**
2. 等待部署完成
3. 复制生产 URL（格式类似）:
   ```
   https://mygympartner-staging.vercel.app
   ```

### 2.5 更新后端 CORS 配置

1. 回到 Railway 的 `backend-staging` 服务
2. 进入 **Variables** 标签
3. 更新 `CORS_ORIGIN` 环境变量为您的 Vercel Staging 前端 URL
4. 保存后，服务会自动重新部署

---

## 第三步：配置 Supabase Staging 存储桶

### 3.1 创建 Staging 存储桶

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择您的项目
3. 进入 **Storage** → **Buckets**
4. 点击 **"Create a new bucket"**
5. 配置存储桶：
   - **Name**: `avatars-staging`
   - **Public bucket**: ✅ 勾选（允许公开访问）
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
6. 点击 **"Create bucket"**

### 3.2 配置存储桶策略

1. 点击 `avatars-staging` 存储桶
2. 进入 **Policies** 标签
3. 点击 **"New Policy"**

#### 策略 1: 允许认证用户上传自己的头像
```sql
-- Policy name: Allow authenticated users to upload their own avatar
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 策略 2: 允许认证用户更新自己的头像
```sql
-- Policy name: Allow authenticated users to update their own avatar
-- Operation: UPDATE
-- Target roles: authenticated

CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 策略 3: 允许认证用户删除自己的头像
```sql
-- Policy name: Allow authenticated users to delete their own avatar
-- Operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars-staging' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 策略 4: 允许公开读取
```sql
-- Policy name: Allow public read access
-- Operation: SELECT
-- Target roles: public, authenticated

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public, authenticated
USING (bucket_id = 'avatars-staging');
```

### 3.3 验证 Supabase 配置

1. 在 Supabase Dashboard 中，进入 **Settings** → **API**
2. 确认以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJxxx...`
   - **service_role key**: `eyJxxx...` (保密，仅用于后端)

3. 确保这些值已正确配置在 Railway 的 `backend-staging` 环境变量中

---

## 第四步：验证部署

### 4.1 健康检查

#### 后端健康检查
```bash
# 访问后端健康检查端点
curl https://backend-staging-production-xxxx.up.railway.app/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2024-10-08T12:00:00.000Z",
  "environment": "staging"
}
```

#### 数据库连接检查
```bash
# 在 Railway Shell 中运行
npx prisma db execute --stdin <<< "SELECT 1;"
```

### 4.2 前端访问测试

1. 访问 Staging 前端 URL
2. 测试基本功能：
   - ✅ 页面加载正常
   - ✅ 可以访问登录页面
   - ✅ API 请求正常（检查浏览器控制台）

### 4.3 完整功能测试

#### 注册和登录
1. 创建测试账号
2. 登录系统
3. 验证 JWT Token 生成

#### 头像上传测试
1. 登录后进入个人资料页面
2. 上传头像图片
3. 验证图片上传到 Supabase `avatars-staging` 存储桶
4. 刷新页面，确认头像持久化

#### API 测试
```bash
# 测试注册
curl -X POST https://backend-staging-production-xxxx.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123456"
  }'

# 测试登录
curl -X POST https://backend-staging-production-xxxx.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

---

## 环境变量对照表

### 后端环境变量对照

| 变量名 | 生产环境 (Production) | 预发布环境 (Staging) |
|--------|----------------------|---------------------|
| `NODE_ENV` | `production` | `staging` |
| `DATABASE_URL` | 生产数据库 URL | Staging 数据库 URL |
| `JWT_SECRET` | 生产密钥 | Staging 密钥（不同） |
| `CORS_ORIGIN` | `https://harveygympartner814.vercel.app` | `https://mygympartner-staging.vercel.app` |
| `SUPABASE_URL` | `https://xxx.supabase.co` | `https://xxx.supabase.co`（相同） |
| `SUPABASE_ANON_KEY` | `eyJxxx...` | `eyJxxx...`（相同） |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx...` | `eyJxxx...`（相同） |
| `SUPABASE_STORAGE_BUCKET` | `avatars` | `avatars-staging` |

### 前端环境变量对照

| 变量名 | 生产环境 (Production) | 预发布环境 (Staging) |
|--------|----------------------|---------------------|
| `VITE_API_URL` | `https://mygympartner-production.up.railway.app/api` | `https://backend-staging-production-xxxx.up.railway.app/api` |

---

## 分支管理策略

### Git 工作流

```
main (生产环境)
  ↑
  | merge after testing
  |
staging (预发布环境)
  ↑
  | merge feature branches
  |
feature/* (功能分支)
```

### 开发流程

1. **开发新功能**
   ```bash
   # 从 staging 创建功能分支
   git checkout staging
   git pull origin staging
   git checkout -b feature/new-feature
   
   # 开发并提交
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

2. **合并到 Staging**
   ```bash
   # 创建 Pull Request: feature/new-feature → staging
   # 代码审查通过后合并
   git checkout staging
   git pull origin staging
   
   # Vercel 和 Railway 自动部署到 staging 环境
   ```

3. **测试 Staging 环境**
   - 访问 Staging 前端 URL
   - 执行完整的功能测试
   - 验证数据库迁移
   - 检查日志和错误

4. **发布到生产环境**
   ```bash
   # 测试通过后，创建 Pull Request: staging → main
   # 最终审查后合并
   git checkout main
   git pull origin main
   
   # Vercel 和 Railway 自动部署到生产环境
   ```

### 分支保护规则（推荐）

在 GitHub 仓库设置中配置：

#### Main 分支保护
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

#### Staging 分支保护
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

---

## 常见问题

### 1. Railway 部署失败

**问题**: Staging 后端部署失败，提示找不到配置文件

**解决方案**:
```bash
# 确保 railway.staging.toml 存在
ls backend/railway.staging.toml

# 在 Railway 项目设置中指定配置文件
# Settings → Deploy → Railway Config File: railway.staging.toml
```

### 2. 数据库连接失败

**问题**: 后端无法连接到 Staging 数据库

**解决方案**:
1. 检查 `DATABASE_URL` 环境变量格式：
   ```
   postgresql://postgres:password@host:port/database
   ```
2. 在 Railway Shell 中测试连接：
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1;"
   ```
3. 确保数据库服务正在运行

### 3. CORS 错误

**问题**: 前端请求后端 API 时出现 CORS 错误

**解决方案**:
1. 检查后端 `CORS_ORIGIN` 环境变量是否包含前端 URL
2. 确保 URL 格式正确（不要包含尾部斜杠）
3. 重新部署后端服务使配置生效

### 4. Vercel 环境变量未生效

**问题**: 前端无法连接到 Staging 后端

**解决方案**:
1. 确认环境变量设置在正确的环境（Preview/staging）
2. 检查 `VITE_API_URL` 值是否正确
3. 重新部署前端：
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push origin staging
   ```

### 5. Supabase 存储桶权限错误

**问题**: 头像上传失败，提示权限不足

**解决方案**:
1. 检查存储桶策略是否正确配置
2. 确认 `SUPABASE_STORAGE_BUCKET` 环境变量值为 `avatars-staging`
3. 验证 JWT Token 中包含正确的用户 ID
4. 在 Supabase Dashboard 中测试策略：
   - Storage → Buckets → avatars-staging → Policies → Test policy

### 6. 数据库迁移问题

**问题**: Prisma 迁移失败或数据库结构不正确

**解决方案**:
```bash
# 在 Railway Shell 中运行
# 1. 重置数据库（警告：会删除所有数据）
npx prisma migrate reset --force

# 2. 或者只运行待执行的迁移
npx prisma migrate deploy

# 3. 重新生成 Prisma Client
npx prisma generate
```

### 7. 环境混淆问题

**问题**: Staging 环境连接到了生产数据库

**解决方案**:
1. 仔细检查所有环境变量
2. 使用不同的命名约定：
   - 生产: `mygympartner-production`
   - Staging: `mygympartner-staging`
3. 在代码中添加环境标识日志：
   ```typescript
   console.log('Environment:', process.env.NODE_ENV);
   console.log('Database:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
   ```

---

## 监控和维护

### 日志查看

#### Railway 日志
1. 进入 Railway 项目
2. 选择 `backend-staging` 服务
3. 点击 **Deployments** → 选择部署 → **View Logs**

#### Vercel 日志
1. 进入 Vercel 项目
2. 点击 **Deployments** → 选择 staging 分支的部署
3. 点击 **View Function Logs**

### 性能监控

#### Railway 监控
- CPU 使用率
- 内存使用率
- 网络流量
- 响应时间

#### Vercel 监控
- 构建时间
- 部署频率
- 函数执行时间
- 带宽使用

### 定期维护任务

- [ ] 每周检查 Staging 环境状态
- [ ] 每月清理 Staging 数据库测试数据
- [ ] 每月清理 Supabase Staging 存储桶中的测试文件
- [ ] 定期同步生产环境配置到 Staging
- [ ] 定期更新依赖包

---

## 成本估算

### Railway Staging 环境
- **后端服务**: ~$5-10/月（根据使用量）
- **PostgreSQL 数据库**: ~$5/月（Hobby Plan）
- **总计**: ~$10-15/月

### Vercel Staging 环境
- **Hobby Plan**: 免费（预览部署包含在内）
- **Pro Plan**: $20/月（如果需要更多功能）

### Supabase
- **Free Plan**: 免费（包含 1GB 存储）
- **Pro Plan**: $25/月（如果需要更多存储和功能）

---

## 安全检查清单

- [ ] Staging 和生产环境使用不同的 JWT Secret
- [ ] Staging 数据库与生产数据库完全隔离
- [ ] Supabase 存储桶策略正确配置
- [ ] 环境变量中不包含硬编码的敏感信息
- [ ] CORS 配置仅允许特定域名
- [ ] 数据库连接使用 SSL
- [ ] API 端点启用 HTTPS
- [ ] 定期更新依赖包以修复安全漏洞

---

## 下一步

配置完成后，您可以：

1. **设置 CI/CD 自动化测试**
   - 在 GitHub Actions 中配置自动化测试
   - 合并到 staging 分支时自动运行测试

2. **配置监控和告警**
   - 集成 Sentry 进行错误追踪
   - 配置 Uptime 监控服务

3. **优化部署流程**
   - 配置自动回滚策略
   - 设置部署审批流程

4. **文档和培训**
   - 为团队成员提供 Staging 环境使用培训
   - 编写测试用例文档

---

## 参考资源

- [Railway 官方文档](https://docs.railway.app/)
- [Vercel 官方文档](https://vercel.com/docs)
- [Supabase 官方文档](https://supabase.com/docs)
- [Prisma 官方文档](https://www.prisma.io/docs)
- [项目部署文档](./DEPLOYMENT.md)

---

**配置完成后，您的 Staging 环境将可以通过以下地址访问：**
- 前端: `https://mygympartner-staging.vercel.app` 或预览 URL
- 后端 API: `https://backend-staging-production-xxxx.up.railway.app/api`
- 健康检查: `https://backend-staging-production-xxxx.up.railway.app/health`

如有任何问题，请参考本文档的常见问题部分或联系项目维护团队。
