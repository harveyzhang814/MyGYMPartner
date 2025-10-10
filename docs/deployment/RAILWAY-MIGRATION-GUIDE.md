# Railway 数据库迁移指南 - 训练计划重构

## ⚠️ 重要警告

本次更新包含**破坏性数据库变更**，会导致现有训练计划数据不兼容。请在生产环境部署前仔细阅读本指南。

## 数据库变更概览

### 1. TrainingPlan 表变更
- ❌ 删除 `start_date` 字段
- ❌ 删除 `end_date` 字段  
- ✅ 添加 `plan_date` 字段（单一日期）

### 2. 新增表
- ✅ `training_plan_exercises` - 训练计划的动作记录
- ✅ `training_plan_exercise_sets` - 训练计划动作的组数记录

### 3. 删除表
- ❌ `training_plan_groups` - 训练计划与训练组的关联表

### 4. ExerciseRecord 表变更
- 🔄 `training_group_id` 改为可选（`NOT NULL` → `NULL`）

## 迁移策略

### 选项 A: 清空旧数据（推荐用于测试环境）

如果 staging 环境的训练计划数据不重要，可以直接清空：

```sql
-- 1. 删除所有训练计划相关数据
DELETE FROM training_plan_groups;
DELETE FROM training_plans;

-- 2. 运行迁移
-- Railway 会自动运行 Prisma 迁移
```

### 选项 B: 备份后清空（推荐用于生产环境）

```sql
-- 1. 备份现有数据
CREATE TABLE training_plans_backup AS SELECT * FROM training_plans;
CREATE TABLE training_plan_groups_backup AS SELECT * FROM training_plan_groups;

-- 2. 删除旧数据
DELETE FROM training_plan_groups;
DELETE FROM training_plans;

-- 3. 之后运行迁移
```

### 选项 C: 数据迁移（如需保留数据）

⚠️ 注意：旧的训练计划结构与新结构不兼容，无法自动迁移。需要手动重建。

## Railway 部署步骤

### 准备工作

1. **检查当前数据库状态**

登录 Railway Dashboard → 选择项目 → Database → Query

```sql
-- 检查是否有训练计划数据
SELECT COUNT(*) as plan_count FROM training_plans;
SELECT COUNT(*) as plan_group_count FROM training_plan_groups;
```

2. **决定迁移策略**

- 如果 `plan_count = 0`：可以直接合并部署 ✅
- 如果 `plan_count > 0`：需要先清空数据 ⚠️

### Staging 环境部署

#### 步骤 1: 备份数据（可选）

在 Railway Database Query 中执行：

```sql
-- 创建备份表
CREATE TABLE IF NOT EXISTS training_plans_backup AS SELECT * FROM training_plans;
CREATE TABLE IF NOT EXISTS training_plan_groups_backup AS SELECT * FROM training_plan_groups;
```

#### 步骤 2: 清空旧数据

```sql
-- 删除旧数据（重要：必须按此顺序）
DELETE FROM training_plan_groups;
DELETE FROM training_plans WHERE is_active = true;
```

#### 步骤 3: 合并代码到 staging 分支

```bash
# 1. 切换到 staging 分支
git checkout staging

# 2. 合并 fea-plan-connect-record 分支
git merge fea-plan-connect-record

# 3. 推送到远程
git push origin staging
```

#### 步骤 4: Railway 自动部署

- Railway 会检测到代码变更并自动部署
- 在部署日志中查看 Prisma 迁移执行情况
- 查找 `prisma migrate deploy` 日志

#### 步骤 5: 验证迁移

在 Railway Database Query 中检查：

```sql
-- 检查新表是否创建
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('training_plan_exercises', 'training_plan_exercise_sets');

-- 检查 training_plans 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'training_plans'
ORDER BY ordinal_position;

-- 确认应该看到 plan_date 字段，不应该有 start_date/end_date
```

### Production 环境部署

⚠️ **生产环境部署前的额外注意事项**

1. **通知用户**
   - 提前通知用户系统维护时间
   - 告知训练计划功能会重置

2. **低流量时段部署**
   - 选择用户活跃度最低的时间段
   - 建议：凌晨 2:00 - 4:00

3. **完整备份**

```sql
-- 在 Railway Production Database 中执行
CREATE TABLE training_plans_backup_20251010 AS SELECT * FROM training_plans;
CREATE TABLE training_plan_groups_backup_20251010 AS SELECT * FROM training_plan_groups;
CREATE TABLE exercise_sessions_backup_20251010 AS SELECT * FROM exercise_sessions;
CREATE TABLE exercise_records_backup_20251010 AS SELECT * FROM exercise_records;
```

4. **部署流程**（与 Staging 相同）

```bash
git checkout production
git merge staging  # 从已验证的 staging 合并
git push origin production
```

5. **部署后验证**

- 测试创建训练计划
- 测试从训练计划开始训练
- 测试查看训练记录关联
- 检查所有API端点

## 数据清理脚本

如果需要手动清理 Railway 数据库中的不兼容数据，使用以下脚本：

```sql
-- =============================================
-- Railway 数据库清理脚本
-- 用途：清除与训练计划相关的旧数据
-- =============================================

-- 1. 删除训练计划与训练组的关联（必须先删除）
DELETE FROM training_plan_groups;

-- 2. 删除所有训练计划
DELETE FROM training_plans;

-- 3. （可选）如果训练记录与旧训练计划关联，可以清除关联
UPDATE exercise_sessions 
SET training_plan_id = NULL 
WHERE training_plan_id IS NOT NULL;

-- 4. 验证清理结果
SELECT 
  (SELECT COUNT(*) FROM training_plans) as plan_count,
  (SELECT COUNT(*) FROM training_plan_groups) as plan_group_count,
  (SELECT COUNT(*) FROM exercise_sessions WHERE training_plan_id IS NOT NULL) as linked_sessions;

-- 预期结果：plan_count = 0, plan_group_count = 0
```

## 回滚方案

如果部署后发现严重问题：

### 代码回滚

```bash
# 回滚到上一个版本
git revert HEAD
git push origin staging  # 或 production
```

### 数据库回滚

⚠️ **注意**：数据库迁移不容易回滚，建议提前做好备份

```sql
-- 如果已创建备份表，可以恢复
DROP TABLE training_plans;
ALTER TABLE training_plans_backup RENAME TO training_plans;

DROP TABLE training_plan_groups;
ALTER TABLE training_plan_groups_backup RENAME TO training_plan_groups;

-- 重新添加外键约束（根据原始schema）
-- 需要手动执行 ALTER TABLE 语句
```

## 常见问题

### Q: Railway 会自动运行迁移吗？

A: 是的，如果你的 `package.json` 中有 `postinstall` 或 `build` 脚本包含 `prisma migrate deploy`，Railway 会自动运行。

### Q: 如何确认迁移成功？

A: 
1. 查看 Railway 部署日志
2. 在 Database Query 中检查表结构
3. 测试前端功能

### Q: 用户已有的训练记录会受影响吗？

A: 训练记录（exercise_sessions）不会受影响，但如果记录关联了旧的训练计划，关联关系会保留（通过 training_plan_id）。

### Q: 如果我想保留现有训练计划怎么办？

A: 旧的训练计划结构已完全改变，无法自动迁移。建议用户重新创建训练计划。

## 迁移检查清单

### Staging 环境
- [ ] 备份数据库数据
- [ ] 检查训练计划数据量
- [ ] 执行清理SQL
- [ ] 合并代码到 staging 分支
- [ ] 推送并等待自动部署
- [ ] 验证数据库表结构
- [ ] 测试创建训练计划
- [ ] 测试从计划开始训练
- [ ] 测试关联信息显示

### Production 环境
- [ ] 确认 Staging 测试通过
- [ ] 通知用户维护时间
- [ ] 创建完整数据备份
- [ ] 选择低流量时段
- [ ] 执行清理SQL
- [ ] 合并代码到 production 分支
- [ ] 推送并等待自动部署
- [ ] 立即验证核心功能
- [ ] 监控错误日志
- [ ] 确认用户可正常使用

## 技术支持

如遇到问题，请检查：
1. Railway 部署日志
2. Backend 应用日志
3. Frontend 控制台错误
4. 数据库查询结果

记录错误信息后联系开发团队。

## 更新日志

- 2024-10-10: 初始版本
- 训练计划数据模型重构
- 从日期范围改为单一日期
- 添加直接存储动作和组数的功能

