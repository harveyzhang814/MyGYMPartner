-- =============================================
-- Railway 数据库清理脚本
-- 用途：清除训练计划相关的旧数据，准备迁移
-- 时间：2024-10-10
-- =============================================

-- 步骤 1: 备份现有数据（可选，但强烈推荐）
-- 取消下面的注释来创建备份表
-- CREATE TABLE IF NOT EXISTS training_plans_backup AS SELECT * FROM training_plans;
-- CREATE TABLE IF NOT EXISTS training_plan_groups_backup AS SELECT * FROM training_plan_groups;

-- 步骤 2: 检查当前数据量
SELECT 
  'training_plans' as table_name,
  COUNT(*) as record_count
FROM training_plans
UNION ALL
SELECT 
  'training_plan_groups' as table_name,
  COUNT(*) as record_count
FROM training_plan_groups;

-- 步骤 3: 清除训练计划关联数据（必须先删除，有外键约束）
DELETE FROM training_plan_groups;

-- 步骤 4: 清除所有训练计划
DELETE FROM training_plans;

-- 步骤 5: 清除训练记录中的训练计划关联（可选）
-- 如果你想保留训练记录但移除与旧训练计划的关联，取消下面的注释
-- UPDATE exercise_sessions 
-- SET training_plan_id = NULL 
-- WHERE training_plan_id IS NOT NULL;

-- 步骤 6: 验证清理结果
SELECT 
  'After Cleanup' as status,
  (SELECT COUNT(*) FROM training_plans) as plans,
  (SELECT COUNT(*) FROM training_plan_groups) as plan_groups,
  (SELECT COUNT(*) FROM exercise_sessions WHERE training_plan_id IS NOT NULL) as linked_sessions;

-- 预期结果：
-- plans = 0
-- plan_groups = 0
-- linked_sessions = 0 (如果执行了步骤5) 或 保持原值

-- =============================================
-- 完成！现在可以部署新版本代码
-- Railway 会自动运行 Prisma 迁移创建新表
-- =============================================

