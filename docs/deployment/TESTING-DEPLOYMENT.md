# MyGYMPartner 测试环境部署指南

## 测试环境部署流程

本指南将帮助您部署 MyGYMPartner 到测试环境，使用 Vercel + Railway 架构。

### 前置要求

1. **GitHub 账户** - 用于代码托管
2. **Railway 账户** - 用于后端部署和数据库
3. **Vercel 账户** - 用于前端部署
4. **Node.js 18+** - 本地开发环境

### 第一步：准备代码

1. **创建测试分支**
```bash
git checkout -b staging
git push origin staging
```

2. **验证本地构建**
```bash
./test-build.sh
```

### 第二步：部署后端到 Railway

#### 2.1 创建 Railway 项目
1. 访问 [Railway](https://railway.app/)
2. 登录并点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. **重要**: 选择 `backend` 文件夹作为根目录

#### 2.2 配置数据库
1. 在 Railway 项目中，点击 "New" -> "Database" -> "PostgreSQL"
2. 等待数据库创建完成
3. 复制数据库连接字符串 (DATABASE_URL)

#### 2.3 配置环境变量
在 Railway 项目设置中添加：

```bash
NODE_ENV=staging
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-test-jwt-secret-key
CORS_ORIGIN=https://your-staging-frontend.vercel.app
```

**生成 JWT_SECRET**:
```bash
openssl rand -base64 32
```

#### 2.4 部署后端
1. Railway 会自动检测到 `railway.toml` 配置
2. 点击 "Deploy" 开始部署
3. 等待部署完成，记录后端地址 (如: `https://mygympartner-backend-staging.railway.app`)

### 第三步：部署前端到 Vercel

#### 3.1 创建 Vercel 项目
1. 访问 [Vercel](https://vercel.com/)
2. 登录并点击 "New Project"
3. 导入 GitHub 仓库
4. **重要**: 选择 `frontend` 文件夹作为根目录

#### 3.2 配置环境变量
在 Vercel 项目设置中添加：

```bash
VITE_API_URL=https://your-backend-staging.railway.app/api
```

#### 3.3 配置构建设置
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 3.4 部署前端
1. 点击 "Deploy" 开始部署
2. 等待部署完成，记录前端地址 (如: `https://mygympartner-staging.vercel.app`)

### 第四步：更新配置

#### 4.1 更新后端 CORS
1. 回到 Railway 项目设置
2. 更新 `CORS_ORIGIN` 为你的 Vercel 前端地址
3. 重新部署后端服务

#### 4.2 验证连接
1. 访问后端健康检查: `https://your-backend.railway.app/health`
2. 访问前端应用: `https://your-frontend.vercel.app`

### 第五步：数据库初始化

#### 5.1 运行数据库迁移
在 Railway 项目的终端中运行：
```bash
npx prisma migrate deploy
```

#### 5.2 验证数据库
```bash
npx prisma db push
```

### 测试环境验证清单

- [ ] 后端健康检查返回 200 状态
- [ ] 前端应用正常加载
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 训练组创建功能正常
- [ ] 训练记录功能正常
- [ ] 动作库功能正常
- [ ] API 响应时间 < 2 秒
- [ ] 无 CORS 错误
- [ ] 数据库连接正常

### 常见问题解决

#### 1. CORS 错误
**症状**: 前端无法访问后端 API
**解决**: 
- 检查后端 `CORS_ORIGIN` 环境变量
- 确保包含完整的前端 URL (包括 https://)
- 重新部署后端服务

#### 2. 数据库连接失败
**症状**: 后端启动失败，数据库连接错误
**解决**:
- 检查 `DATABASE_URL` 环境变量
- 确保数据库服务已启动
- 验证数据库凭据

#### 3. 前端构建失败
**症状**: Vercel 部署失败
**解决**:
- 检查 `package.json` 依赖
- 确保构建命令正确
- 查看 Vercel 构建日志

#### 4. 环境变量未生效
**症状**: 应用行为不符合预期
**解决**:
- 验证环境变量名称
- 确保变量值正确
- 重新部署服务

### 监控和维护

#### Railway 监控
- 访问项目仪表板查看服务状态
- 监控资源使用情况
- 查看应用日志

#### Vercel 监控
- 查看部署状态
- 监控性能指标
- 查看函数日志

### 下一步：生产环境部署

测试环境验证通过后，可以按照以下步骤部署到生产环境：

1. **合并代码到 main 分支**
2. **创建生产环境项目**
   - Railway: `mygympartner-backend-prod`
   - Vercel: `mygympartner-prod`
3. **配置生产环境变量**
4. **部署生产环境**
5. **配置域名和 SSL**

### 支持

如果在部署过程中遇到问题：

1. 查看本文档的常见问题部分
2. 检查 Railway 和 Vercel 的官方文档
3. 查看项目日志和错误信息
4. 联系项目维护团队

---

**测试环境地址示例**:
- 前端: `https://mygympartner-staging.vercel.app`
- 后端: `https://mygympartner-backend-staging.railway.app/api`
- 健康检查: `https://mygympartner-backend-staging.railway.app/health`
