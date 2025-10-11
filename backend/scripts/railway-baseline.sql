-- =============================================
-- Railway Baseline 脚本
-- 用途：标记现有数据库为已迁移状态
-- =============================================

-- 步骤 1: 清除旧的迁移历史
DELETE FROM _prisma_migrations;

-- 步骤 2: 手动插入迁移记录
-- 注意：需要替换为你的实际迁移名称和时间戳

INSERT INTO _prisma_migrations (
  id, 
  checksum, 
  finished_at, 
  migration_name, 
  logs, 
  rolled_back_at, 
  started_at, 
  applied_steps_count
) VALUES 
-- 初始迁移
(
  '00000000-0000-0000-0000-000000000001',
  'checksum_placeholder',
  NOW(),
  '20241005000000_init',
  NULL,
  NULL,
  NOW(),
  1
),
-- 单一日期迁移
(
  '00000000-0000-0000-0000-000000000002',
  'checksum_placeholder',
  NOW(),
  '20251010141950_change_training_plan_to_single_date',
  NULL,
  NULL,
  NOW(),
  1
),
-- 数据模型重构迁移
(
  '00000000-0000-0000-0000-000000000003',
  'checksum_placeholder',
  NOW(),
  '20251010145716_restructure_training_plan_data_model',
  NULL,
  NULL,
  NOW(),
  1
),
-- 可选字段迁移
(
  '00000000-0000-0000-0000-000000000004',
  'checksum_placeholder',
  NOW(),
  '20251010150737_make_exercise_record_training_group_optional',
  NULL,
  NULL,
  NOW(),
  1
);

-- 步骤 3: 验证
SELECT migration_name, finished_at 
FROM _prisma_migrations 
ORDER BY finished_at;

-- =============================================
-- 完成！现在 Prisma 会认为所有迁移都已应用
-- =============================================

