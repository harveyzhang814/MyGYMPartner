-- =============================================
-- Railway 数据库完全重置脚本
-- 用途：解决 P3005 错误 - 数据库不为空
-- 警告：这会删除所有训练计划数据！
-- =============================================

-- 步骤 1: 删除数据（保持表结构）
BEGIN;

-- 删除训练计划相关数据
DELETE FROM training_plan_groups WHERE true;
DELETE FROM training_plans WHERE true;

-- 如果新表已存在，也清空
DELETE FROM training_plan_exercises WHERE true;
DELETE FROM training_plan_exercise_sets WHERE true;

-- 清除训练记录中的训练计划关联
UPDATE exercise_sessions 
SET training_plan_id = NULL 
WHERE training_plan_id IS NOT NULL;

COMMIT;

-- 步骤 2: 删除迁移历史表（让 Prisma 重新创建）
DROP TABLE IF EXISTS _prisma_migrations;

-- 步骤 3: 验证清理结果
SELECT 
  'training_plans' as table_name,
  COUNT(*) as count
FROM training_plans
UNION ALL
SELECT 
  'training_plan_groups',
  COUNT(*)
FROM training_plan_groups
UNION ALL
SELECT 
  '_prisma_migrations',
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = '_prisma_migrations'
    ) THEN 1
    ELSE 0
  END;

-- 预期结果：
-- training_plans: 0
-- training_plan_groups: 0
-- _prisma_migrations: 0 (表不存在)

-- =============================================
-- 完成！现在可以重新部署，Prisma 会：
-- 1. 创建 _prisma_migrations 表
-- 2. 运行所有迁移
-- 3. 创建新的表结构
-- =============================================

-- 如果上面的脚本执行成功，Railway 会自动重新部署
-- 或者手动触发：
--   git commit --allow-empty -m "trigger redeploy"
--   git push origin staging

