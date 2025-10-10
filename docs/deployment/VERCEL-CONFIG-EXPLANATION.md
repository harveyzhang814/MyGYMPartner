# Vercel 配置说明

## 为什么只有一个 `vercel.json` 文件？

本项目采用 **单一配置文件 + Dashboard 环境变量** 的方式来管理 Vercel 部署配置。

## 配置策略

### 📄 `vercel.json` - 通用构建配置

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
  ]
}
```

**包含内容：**
- ✅ 构建命令
- ✅ 输出目录
- ✅ 框架类型
- ✅ 路由重写规则（SPA 支持）

**不包含内容：**
- ❌ 环境变量（如 `VITE_API_URL`）
- ❌ 环境特定的配置

### ⚙️ Vercel Dashboard - 环境变量配置

在 Vercel 项目的 **Settings → Environment Variables** 中配置：

| 环境 | 变量名 | 值 | 说明 |
|------|--------|-----|------|
| **Production** | `VITE_API_URL` | `https://mygympartner-production.up.railway.app/api` | 生产环境后端 |
| **Preview** (staging) | `VITE_API_URL` | `https://backend-staging-production-xxxx.up.railway.app/api` | Staging 环境后端 |
| **Development** | `VITE_API_URL` | `http://localhost:3001/api` | 本地开发后端 |

## 为什么采用这种方式？

### ✅ 优点

1. **安全性更好**
   - 环境变量不会出现在代码仓库中
   - 避免意外泄露敏感信息
   - 符合安全最佳实践

2. **灵活性更高**
   - 可以随时在 Dashboard 修改环境变量
   - 不需要提交代码就能更改配置
   - 支持不同环境使用不同的值

3. **维护更简单**
   - 只需要维护一个 `vercel.json` 文件
   - 构建配置在版本控制中
   - 环境变量集中管理

4. **团队协作更好**
   - 团队成员可以看到构建配置
   - 环境变量可以按需授权访问
   - 避免配置冲突

5. **符合 Vercel 最佳实践**
   - Vercel 官方推荐的配置方式
   - 充分利用 Vercel 的环境管理功能
   - 与 Vercel 的工作流无缝集成

### ❌ 为什么不使用多个配置文件？

**问题 1：Vercel 不会自动使用 `vercel.staging.json`**
- Vercel 只识别 `vercel.json` 文件
- 如果要为不同分支使用不同配置，需要在代码中做分支判断
- 或者为每个环境创建独立的 Vercel 项目

**问题 2：环境变量硬编码在配置文件中**
```json
// ❌ 不推荐：硬编码在 vercel.json 中
{
  "env": {
    "VITE_API_URL": "https://backend-staging-production-xxxx.up.railway.app/api"
  }
}
```
- 敏感信息暴露在代码仓库中
- 修改需要提交代码
- 难以管理多个环境

**问题 3：维护成本高**
- 需要维护多个配置文件
- 配置可能不一致
- 容易出错

## 实际使用场景

### 场景 1：修改 Staging 后端 URL

**使用 Dashboard 配置（推荐）：**
1. 登录 Vercel Dashboard
2. 进入项目 Settings → Environment Variables
3. 找到 Preview 环境的 `VITE_API_URL`
4. 修改值
5. 重新部署 staging 分支
6. ✅ 完成，无需提交代码

**使用配置文件（不推荐）：**
1. 修改 `vercel.staging.json`
2. 提交代码
3. 推送到远程
4. 等待部署
5. ❌ 配置变更混在代码提交中，难以追踪

### 场景 2：添加新的环境变量

**使用 Dashboard 配置（推荐）：**
1. 在 Vercel Dashboard 中添加新变量
2. 为不同环境设置不同的值
3. 重新部署
4. ✅ 集中管理，清晰明了

**使用配置文件（不推荐）：**
1. 修改多个配置文件
2. 确保所有环境的配置都正确
3. 提交代码
4. ❌ 容易遗漏某个环境

### 场景 3：团队成员加入项目

**使用 Dashboard 配置（推荐）：**
1. 团队成员克隆代码仓库
2. 查看 `vercel.json` 了解构建配置
3. 在 Vercel Dashboard 查看环境变量（需要权限）
4. ✅ 构建配置公开，敏感信息受保护

**使用配置文件（不推荐）：**
1. 团队成员克隆代码仓库
2. 看到所有环境的 URL 和配置
3. ❌ 敏感信息暴露给所有有代码访问权限的人

## 如何配置环境变量

### 步骤 1：进入 Vercel 项目设置

1. 登录 [Vercel Dashboard](https://vercel.com/)
2. 选择您的项目
3. 点击 **Settings**
4. 选择 **Environment Variables**

### 步骤 2：添加环境变量

#### Production 环境
```
Name: VITE_API_URL
Value: https://mygympartner-production.up.railway.app/api
Environment: ✅ Production
```

#### Preview/Staging 环境
```
Name: VITE_API_URL
Value: https://backend-staging-production-xxxx.up.railway.app/api
Environment: ✅ Preview
Branch: staging (可选，留空则应用到所有预览分支)
```

#### Development 环境（可选）
```
Name: VITE_API_URL
Value: http://localhost:3001/api
Environment: ✅ Development
```

### 步骤 3：验证配置

1. 推送代码触发部署
2. 在部署日志中查看环境变量是否正确
3. 访问部署的应用，检查 API 请求是否指向正确的后端

## 常见问题

### Q1: 为什么删除了 `vercel.staging.json`？

**A:** 因为 Vercel 不会自动使用这个文件。Vercel 只识别 `vercel.json`。如果要为不同环境使用不同配置，应该使用 Vercel Dashboard 的环境变量功能，而不是创建多个配置文件。

### Q2: 如何在本地开发时使用正确的 API URL？

**A:** 本地开发使用 `frontend/.env.local` 文件：
```bash
VITE_API_URL=http://localhost:3001/api
```

这个文件不会被提交到代码仓库（已在 `.gitignore` 中）。

### Q3: 修改环境变量后需要重新部署吗？

**A:** 是的。环境变量在构建时注入，修改后需要重新部署才能生效。

### Q4: 如何查看当前使用的环境变量？

**A:** 有两种方式：
1. 在 Vercel Dashboard 的 Deployments 页面，选择一个部署，查看 "Environment Variables" 部分
2. 在部署日志中查看构建时的环境变量

### Q5: 可以为不同的预览分支设置不同的环境变量吗？

**A:** 可以。在添加环境变量时，选择 Preview 环境，然后在 "Branch" 字段指定分支名称。

### Q6: 如果我想在 `vercel.json` 中引用环境变量怎么办？

**A:** 可以使用 `@` 语法引用 Vercel Secrets：
```json
{
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

但需要先在 Dashboard 中创建名为 `api_url` 的 Secret。**不推荐这种方式**，因为：
- 增加了复杂性
- Secret 和环境变量是两个不同的概念
- 直接在 Dashboard 配置环境变量更简单

## 总结

| 配置项 | 位置 | 原因 |
|--------|------|------|
| 构建命令、输出目录、路由规则 | `vercel.json` | 所有环境通用，应该在版本控制中 |
| 环境变量（API URL 等） | Vercel Dashboard | 不同环境不同值，不应该在代码中 |

**推荐做法：**
- ✅ 使用单一的 `vercel.json` 存储通用构建配置
- ✅ 在 Vercel Dashboard 中管理环境变量
- ✅ 为不同环境（Production/Preview/Development）设置不同的环境变量值
- ✅ 利用 Vercel 的分支预览功能自动部署 staging 分支

这种方式既安全又灵活，是 Vercel 官方推荐的最佳实践。

## 参考资源

- [Vercel Environment Variables 文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Configuration 文档](https://vercel.com/docs/project-configuration)
- [Vite Environment Variables 文档](https://vitejs.dev/guide/env-and-mode.html)

---

**最后更新**: 2024-10-08
