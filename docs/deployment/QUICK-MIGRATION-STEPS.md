# 快速迁移步骤 - Railway Staging & Production

## 🚀 Staging 环境迁移（5分钟）

### 1. 检查数据库状态

在 Railway Dashboard → Staging → Database → Query 中运行：

```sql
-- 复制粘贴 backend/scripts/railway-check.sql 的内容
```

### 2. 清理旧数据

```sql
-- 复制粘贴 backend/scripts/railway-cleanup.sql 的内容
-- 注意：这会删除所有训练计划数据！
```

### 3. 部署代码

```bash
# 本地执行
git checkout staging
git merge fea-plan-connect-record
git push origin staging
```

### 4. 验证部署

等待 Railway 自动部署完成（约2-3分钟），然后：

1. 查看 Railway 部署日志，确认 Prisma 迁移成功
2. 访问 staging 前端，测试创建训练计划
3. 测试"开始训练"功能
4. 测试关联信息显示

---

## 🎯 Production 环境迁移（10分钟）

⚠️ **请在低流量时段操作**

### 1. 确认 Staging 测试通过

确保在 staging 环境已完整测试所有功能。

### 2. 备份 Production 数据

在 Railway Dashboard → Production → Database → Query 中运行：

```sql
-- 创建备份表
CREATE TABLE training_plans_backup_20251010 AS SELECT * FROM training_plans;
CREATE TABLE training_plan_groups_backup_20251010 AS SELECT * FROM training_plan_groups;

-- 验证备份
SELECT COUNT(*) FROM training_plans_backup_20251010;
SELECT COUNT(*) FROM training_plan_groups_backup_20251010;
```

### 3. 清理旧数据

```sql
-- 运行清理脚本
DELETE FROM training_plan_groups;
DELETE FROM training_plans;

-- 验证清理
SELECT COUNT(*) FROM training_plans;  -- 应该返回 0
SELECT COUNT(*) FROM training_plan_groups;  -- 应该返回 0
```

### 4. 部署代码

```bash
# 本地执行
git checkout production
git merge staging  # 从已验证的 staging 合并
git push origin production
```

### 5. 验证部署

1. 查看 Railway 部署日志
2. 运行检查脚本验证表结构
3. 测试所有核心功能
4. 监控应用日志

---

## 📋 迁移检查清单

### Staging
- [ ] 运行 `railway-check.sql` 检查当前状态
- [ ] 运行 `railway-cleanup.sql` 清理数据
- [ ] 合并并推送代码到 staging 分支
- [ ] 等待自动部署完成
- [ ] 运行 `railway-check.sql` 验证新结构
- [ ] 测试创建训练计划
- [ ] 测试开始训练功能
- [ ] 测试编辑模式切换
- [ ] 测试关联信息显示

### Production
- [ ] 确认 Staging 所有测试通过
- [ ] 选择低流量时段（建议凌晨2-4点）
- [ ] 备份数据库数据
- [ ] 清理旧数据
- [ ] 合并并推送代码到 production 分支
- [ ] 等待自动部署完成
- [ ] 立即验证核心功能
- [ ] 监控错误日志（前30分钟）
- [ ] 确认用户可正常使用

---

## 🔧 常用命令

### Railway CLI（如果已安装）

```bash
# 查看 Staging 日志
railway logs -e staging

# 查看 Production 日志
railway logs -e production

# 连接到数据库
railway connect -e staging
```

### Git 命令

```bash
# 查看分支差异
git log staging..fea-plan-connect-record --oneline

# 查看文件变更
git diff staging..fea-plan-connect-record --stat

# 查看迁移文件
git diff staging..fea-plan-connect-record -- backend/prisma/migrations/
```

---

## ⚠️ 紧急回滚

如果部署后发现严重问题：

### 代码回滚

```bash
git revert HEAD
git push origin staging  # 或 production
```

### 数据恢复（仅 Production）

```sql
-- 恢复训练计划数据
DROP TABLE training_plans;
ALTER TABLE training_plans_backup_20251010 RENAME TO training_plans;

DROP TABLE training_plan_groups;
ALTER TABLE training_plan_groups_backup_20251010 RENAME TO training_plan_groups;

-- ⚠️ 注意：还需要删除新创建的表
DROP TABLE IF EXISTS training_plan_exercises;
DROP TABLE IF EXISTS training_plan_exercise_sets;
```

---

## 📞 故障排查

### 问题：迁移没有自动运行

**检查**：
- Railway 部署日志中是否有 `prisma migrate deploy`
- `package.json` 中是否有正确的构建脚本

**解决**：
```bash
# 手动触发迁移（如果有 Railway CLI）
railway run --environment staging npx prisma migrate deploy
```

### 问题：前端显示错误

**检查**：
- 浏览器控制台错误
- Network 标签查看 API 响应
- Backend 日志中的错误信息

**常见错误**：
- `500 Internal Server Error` → 检查 backend 日志
- `Column not found` → 确认迁移是否成功运行
- 空白页面 → 检查浏览器控制台

### 问题：创建训练计划失败

**检查**：
- Backend 日志中的详细错误
- 数据库表结构是否正确
- API 请求数据格式

---

## 📚 相关文档

- 详细迁移指南：`docs/deployment/RAILWAY-MIGRATION-GUIDE.md`
- 数据模型变更：`docs/deployment/TRAINING-PLAN-RESTRUCTURE.md`
- Prisma 迁移文件：`backend/prisma/migrations/`

---

## ✅ 完成！

迁移完成后，用户可以：
- 创建新的训练计划（单一日期）
- 直接在计划中添加动作和组数
- 从训练计划快速开始训练
- 查看训练记录与计划的关联关系
- 在详情页和编辑页之间自由切换

