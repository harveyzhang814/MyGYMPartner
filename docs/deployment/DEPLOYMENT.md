# MyGYMPartner 部署指南

## 部署架构

本项目采用 **Vercel + Railway** 的部署架构：
- **前端 (React + Vite)**: 部署到 Vercel
- **后端 (Node.js + Express)**: 部署到 Railway
- **数据库 (PostgreSQL)**: Railway 提供的 PostgreSQL 服务

## 部署步骤

### 第一步：部署后端到 Railway

#### 1.1 准备 Railway 项目
1. 访问 [Railway](https://railway.app/) 并登录
2. 点击 "New Project" 创建新项目
3. 选择 "Deploy from GitHub repo"
4. 选择你的 GitHub 仓库
5. 选择 `backend` 文件夹作为根目录

#### 1.2 配置数据库
1. 在 Railway 项目中，点击 "New" -> "Database" -> "PostgreSQL"
2. 等待数据库创建完成
3. 复制数据库连接字符串 (DATABASE_URL)

#### 1.3 配置环境变量
在 Railway 项目设置中添加以下环境变量：

```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://harveygympartner814.vercel.app
```

**重要说明**：
- `DATABASE_URL`: 使用 Railway 提供的 PostgreSQL 连接字符串
- `JWT_SECRET`: 生成一个强密钥，建议使用 `openssl rand -base64 32`
- `CORS_ORIGIN`: 替换为你的 Vercel 前端域名

#### 1.4 部署后端
1. Railway 会自动检测到 `railway.toml` 配置文件
2. 点击 "Deploy" 开始部署
3. 等待部署完成，记录后端 API 地址 (如: `https://mygympartner-backend.railway.app`)

### 第二步：部署前端到 Vercel

#### 2.1 准备 Vercel 项目
1. 访问 [Vercel](https://vercel.com/) 并登录
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 选择 `frontend` 文件夹作为根目录

#### 2.2 配置环境变量
有两种方式配置 Vercel 环境变量：

**方式一：直接在 Vercel 仪表板中设置**
1. 在 Vercel 项目设置中，进入 **Settings** → **Environment Variables**
2. 添加环境变量：
   - **Name**: `VITE_API_URL`
   - **Value**: `https://mygympartner-production.up.railway.app/api`
   - **Environment**: 选择 Production, Preview, Development
3. 点击 **Save**

**方式二：使用 Secret（推荐）**
1. 在 Vercel 项目设置中，进入 **Settings** → **Environment Variables**
2. 点击 **Create Secret**
3. 创建 Secret：
   - **Name**: `api_url`
   - **Value**: `https://mygympartner-production.up.railway.app/api`
   - **Environment**: 选择 Production, Preview, Development
4. 点击 **Save**
5. 确保 `vercel.json` 文件中的配置正确：
   ```json
   "env": {
     "VITE_API_URL": "@api_url"
   }
   ```

**重要说明**：
- 后端地址：`https://mygympartner-production.up.railway.app`
- 如果遇到 "Secret does not exist" 错误，请确保已创建对应的 Secret

#### 2.3 配置构建设置
Vercel 会自动检测 Vite 项目，构建设置如下：
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 2.4 部署前端
1. 点击 "Deploy" 开始部署
2. 等待部署完成，记录前端地址 (如: `https://harveygympartner814.vercel.app`)

### 第三步：更新 CORS 配置

#### 3.1 更新后端 CORS 设置
1. 回到 Railway 项目设置
2. 更新 `CORS_ORIGIN` 环境变量为你的 Vercel 前端地址
3. 重新部署后端服务

## 测试环境部署

### 创建测试分支
```bash
git checkout -b staging
git push origin staging
```

### 部署测试环境
1. **后端测试环境**:
   - 在 Railway 中创建新的项目 (如: `mygympartner-backend-staging`)
   - 配置相同的环境变量，但使用不同的数据库
   - 使用 `staging` 分支部署

2. **前端测试环境**:
   - 在 Vercel 中创建新的项目 (如: `mygympartner-staging`)
   - 配置 `VITE_API_URL` 指向测试后端地址
   - 使用 `staging` 分支部署

## 数据库迁移

### 初始化数据库
部署完成后，需要运行数据库迁移：

```bash
# 在 Railway 项目的终端中运行
npx prisma migrate deploy
```

### 验证数据库
```bash
# 检查数据库连接
npx prisma db push
```

## 监控和日志

### Railway 监控
- 访问 Railway 项目仪表板查看服务状态
- 查看日志: 项目 -> Deployments -> 选择部署 -> View Logs
- 监控资源使用情况

### Vercel 监控
- 访问 Vercel 项目仪表板查看部署状态
- 查看函数日志: Functions -> 选择函数 -> View Function Logs
- 监控性能指标

## 常见问题

### 1. CORS 错误
**问题**: 前端无法访问后端 API
**解决**: 检查后端 `CORS_ORIGIN` 环境变量是否包含前端域名

### 2. 数据库连接失败
**问题**: 后端无法连接数据库
**解决**: 检查 `DATABASE_URL` 环境变量是否正确

### 3. 构建失败
**问题**: 前端或后端构建失败
**解决**: 检查 `package.json` 中的依赖和构建脚本

### 4. 环境变量未生效
**问题**: 环境变量在运行时未生效
**解决**: 确保环境变量名称正确，并重新部署服务

### 5. Vercel Secret 不存在错误
**问题**: `Environment Variable "VITE_API_URL" references Secret "api_url", which does not exist`
**解决**: 
- 方法一：在 Vercel 仪表板中创建名为 `api_url` 的 Secret
- 方法二：修改 `vercel.json` 文件，直接设置环境变量值而不是引用 Secret
- 方法三：在 Vercel 项目设置中直接添加 `VITE_API_URL` 环境变量

## 安全注意事项

### 1. 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用强密钥作为 JWT_SECRET
- 定期轮换密钥

### 2. 数据库安全
- 使用强密码
- 启用 SSL 连接
- 定期备份数据

### 3. API 安全
- 启用 HTTPS
- 实施适当的 CORS 策略
- 添加请求频率限制

## 回滚策略

### 后端回滚
1. 在 Railway 项目中选择之前的部署版本
2. 点击 "Redeploy" 回滚到该版本

### 前端回滚
1. 在 Vercel 项目中选择之前的部署版本
2. 点击 "Promote to Production" 回滚到该版本

## 性能优化

### 前端优化
- 启用 Vercel 的 CDN 加速
- 配置缓存策略
- 使用 Vite 的代码分割

### 后端优化
- 配置 Railway 的自动扩缩容
- 优化数据库查询
- 启用 gzip 压缩

## 联系支持

如果在部署过程中遇到问题，请：
1. 检查本文档的常见问题部分
2. 查看 Railway 和 Vercel 的官方文档
3. 联系项目维护团队

---

**部署完成后，你的应用将可以通过以下地址访问：**
- 前端: `https://harveygympartner814.vercel.app`
- 后端 API: `https://mygympartner-production.up.railway.app/api`
- 健康检查: `https://mygympartner-production.up.railway.app/health`
