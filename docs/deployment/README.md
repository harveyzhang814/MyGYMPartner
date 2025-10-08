# 部署文档目录

本目录包含 MyGYMPartner 项目的所有部署相关文档。

## 📚 文档索引

### 主要部署指南

1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 生产环境部署完整指南
   - Vercel + Railway 部署架构说明
   - 详细的部署步骤
   - 环境变量配置
   - 常见问题解决方案

2. **[STAGING-SETUP-GUIDE.md](./STAGING-SETUP-GUIDE.md)** - Staging 环境配置详细指南 ⭐ 新增
   - 在已有生产环境基础上配置 Staging 环境
   - Railway Staging 环境配置
   - Vercel Staging 环境配置
   - Supabase Staging 存储桶配置
   - 完整的验证测试流程
   - 分支管理策略

3. **[STAGING-ENV-CHECKLIST.md](./STAGING-ENV-CHECKLIST.md)** - Staging 环境配置清单 ⭐ 新增
   - 快速参考清单
   - 逐步检查项
   - 确保不遗漏任何配置步骤

4. **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** - 部署配置完成总结
   - 项目部署配置概览
   - 新增文件列表
   - 代码调整总结

### 配置模板

5. **[staging-env-template.txt](./staging-env-template.txt)** - Staging 环境变量模板 ⭐ 新增
   - Railway 环境变量模板
   - Vercel 环境变量模板
   - Supabase 存储桶策略 SQL
   - 快速验证命令
   - 可直接复制粘贴使用

## 🚀 快速开始

### 首次部署（生产环境）

如果您是第一次部署项目，请按以下顺序阅读：

1. 阅读 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解整体架构
2. 按照文档步骤部署后端到 Railway
3. 按照文档步骤部署前端到 Vercel
4. 完成验证测试

### 配置 Staging 环境

如果您已有生产环境，需要配置预发布环境：

1. **快速配置**（推荐）
   - 打开 [STAGING-ENV-CHECKLIST.md](./STAGING-ENV-CHECKLIST.md)
   - 按照清单逐项配置
   - 使用 [staging-env-template.txt](./staging-env-template.txt) 复制环境变量

2. **详细了解**
   - 阅读 [STAGING-SETUP-GUIDE.md](./STAGING-SETUP-GUIDE.md)
   - 了解每个配置步骤的详细说明
   - 参考常见问题解决方案

## 📋 部署架构

### 生产环境 (Production)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   Railway       │
│   (前端)        │◄──►│   (后端 API)    │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • main 分支     │    │ • main 分支     │    │ • 生产数据库    │
│ • 生产域名      │    │ • 生产环境变量  │    │ • 生产存储桶    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 预发布环境 (Staging)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   Railway       │
│   (前端)        │◄──►│   (后端 API)    │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • staging 分支  │    │ • staging 分支  │    │ • 测试数据库    │
│ • 预览域名      │    │ • staging 环境  │    │ • 测试存储桶    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Git 工作流

```
feature/* (功能分支)
    ↓
    merge
    ↓
staging (预发布分支)
    ↓
    测试验证
    ↓
    merge
    ↓
main (生产分支)
```

### 开发流程

1. **开发新功能**
   ```bash
   git checkout staging
   git checkout -b feature/new-feature
   # 开发...
   git push origin feature/new-feature
   ```

2. **合并到 Staging**
   - 创建 Pull Request: `feature/new-feature` → `staging`
   - 代码审查
   - 合并后自动部署到 Staging 环境

3. **在 Staging 环境测试**
   - 访问 Staging 前端 URL
   - 执行完整功能测试
   - 验证数据库迁移
   - 检查日志和性能

4. **发布到生产环境**
   - 创建 Pull Request: `staging` → `main`
   - 最终审查
   - 合并后自动部署到生产环境

## 🔧 配置文件说明

### Railway 配置
- `backend/railway.toml` - 生产环境配置
- `backend/railway.staging.toml` - Staging 环境配置

### Vercel 配置
- `frontend/vercel.json` - 生产环境配置
- `frontend/vercel.staging.json` - Staging 环境配置

### 环境变量模板
- `backend/env.local.template` - 后端本地开发环境变量模板
- `frontend/env.local.template` - 前端本地开发环境变量模板
- `docs/deployment/staging-env-template.txt` - Staging 环境变量模板

## 🔐 环境变量概览

### 后端必需变量

| 变量名 | 生产环境 | Staging | 本地开发 |
|--------|---------|---------|---------|
| `NODE_ENV` | production | staging | development |
| `DATABASE_URL` | 生产数据库 | 测试数据库 | 本地数据库 |
| `JWT_SECRET` | 生产密钥 | 测试密钥 | 开发密钥 |
| `CORS_ORIGIN` | 生产前端URL | Staging前端URL | localhost:5173 |
| `SUPABASE_STORAGE_BUCKET` | avatars | avatars-staging | avatars-dev |

### 前端必需变量

| 变量名 | 生产环境 | Staging | 本地开发 |
|--------|---------|---------|---------|
| `VITE_API_URL` | 生产后端URL/api | Staging后端URL/api | localhost:3001/api |

## ✅ 部署检查清单

### 生产环境部署前
- [ ] 所有功能在 Staging 环境测试通过
- [ ] 数据库迁移脚本已验证
- [ ] 环境变量已正确配置
- [ ] CORS 配置正确
- [ ] 备份策略已就绪

### Staging 环境配置
- [ ] Railway Staging 服务已创建
- [ ] Staging 数据库已创建并初始化
- [ ] Vercel Staging 环境已配置
- [ ] Supabase Staging 存储桶已创建
- [ ] 所有环境变量已配置
- [ ] 基本功能测试通过

## 📞 获取帮助

### 遇到问题？

1. **查看文档**
   - 检查相关部署指南
   - 查看常见问题部分

2. **检查日志**
   - Railway: Deployments → View Logs
   - Vercel: Deployments → View Function Logs

3. **验证配置**
   - 使用 staging-env-template.txt 中的验证命令
   - 检查环境变量是否正确设置

4. **常见问题**
   - CORS 错误 → 检查 CORS_ORIGIN 配置
   - 数据库连接失败 → 验证 DATABASE_URL
   - 构建失败 → 检查依赖和构建脚本
   - 环境变量未生效 → 重新部署服务

## 🔗 相关资源

### 官方文档
- [Railway 文档](https://docs.railway.app/)
- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Prisma 文档](https://www.prisma.io/docs)

### 项目文档
- [项目结构](../../PROJECT-STRUCTURE.md)
- [快速开始](../../QUICK-START.md)
- [开发计划](../development/Development-Plan.md)
- [数据库设计](../design/Database-Design.md)

---

## 📝 文档维护

本文档目录由项目维护团队维护。如有更新或问题，请提交 Issue 或 Pull Request。

**最后更新**: 2024-10-08
