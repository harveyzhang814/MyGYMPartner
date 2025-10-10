-- =============================================
-- Railway 数据库状态检查脚本
-- 用途：检查数据库是否已准备好迁移
-- =============================================

-- 1. 检查训练计划相关表的数据量
SELECT 
  'Data Count' as check_type,
  'training_plans' as table_name,
  COUNT(*) as count
FROM training_plans
UNION ALL
SELECT 
  'Data Count',
  'training_plan_groups',
  COUNT(*)
FROM training_plan_groups
UNION ALL
SELECT 
  'Data Count',
  'exercise_sessions (with plan)',
  COUNT(*)
FROM exercise_sessions
WHERE training_plan_id IS NOT NULL;

-- 2. 检查表结构 - training_plans 表的列
SELECT 
  'Column Check' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'training_plans'
  AND column_name IN ('start_date', 'end_date', 'plan_date')
ORDER BY column_name;

-- 预期结果（迁移前）：
-- - 应该看到 start_date 和 end_date 列
-- - 不应该看到 plan_date 列

-- 预期结果（迁移后）：
-- - 不应该看到 start_date 和 end_date 列
-- - 应该看到 plan_date 列

-- 3. 检查新表是否存在
SELECT 
  'Table Existence' as check_type,
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ) THEN 'EXISTS'
    ELSE 'NOT EXISTS'
  END as status
FROM (
  VALUES 
    ('training_plan_exercises'),
    ('training_plan_exercise_sets'),
    ('training_plan_groups')
) AS t(table_name);

-- 预期结果（迁移前）：
-- - training_plan_exercises: NOT EXISTS
-- - training_plan_exercise_sets: NOT EXISTS
-- - training_plan_groups: EXISTS

-- 预期结果（迁移后）：
-- - training_plan_exercises: EXISTS
-- - training_plan_exercise_sets: EXISTS
-- - training_plan_groups: NOT EXISTS

-- 4. 检查 exercise_records 表的 training_group_id 是否可空
SELECT 
  'Nullable Check' as check_type,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'exercise_records'
  AND column_name = 'training_group_id';

-- 预期结果（迁移后）：
-- is_nullable = 'YES'

-- 5. 列出所有相关表
SELECT 
  'All Related Tables' as check_type,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%training%'
ORDER BY table_name;

-- =============================================
-- 使用说明：
-- 1. 迁移前运行此脚本，记录当前状态
-- 2. 迁移后再次运行，对比结果
-- 3. 确认所有变更符合预期
-- =============================================

