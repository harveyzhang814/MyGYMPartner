# 训练计划数据模型重构

## 变更概述

将训练计划的数据模型从"引用训练组"改为"直接存储动作和训练数据"，使其与训练记录（ExerciseSession）的数据结构保持一致。

## 新的数据结构

### 之前（已废弃）
```
TrainingPlan
  └─ TrainingPlanGroup (关联表)
       └─ TrainingGroup (引用)
```

### 现在（新结构）
```
TrainingPlan
  └─ TrainingPlanExercise (直接存储)
       ├─ exerciseId (动作ID)
       ├─ trainingGroupId (可选，标记来源)
       └─ TrainingPlanExerciseSet[] (训练组数据)
```

## 数据库变更

### 新增表

1. **training_plan_exercises**
   - id: 主键
   - training_plan_id: 训练计划ID
   - exercise_id: 动作ID
   - training_group_id: 训练组ID（可选，表示来自哪个训练组）
   - order_index: 顺序索引
   - notes: 备注
   - created_at, updated_at: 时间戳

2. **training_plan_exercise_sets**
   - id: 主键
   - training_plan_exercise_id: 训练计划动作ID
   - set_number: 组号
   - reps: 次数
   - weight: 重量
   - rest_time_seconds: 休息时间
   - notes: 备注
   - created_at: 创建时间

### 删除表

- **training_plan_groups** (已废弃，不再使用)

## 新功能特性

1. **独立存储动作数据**
   - 训练计划不再仅仅引用训练组
   - 可以直接在计划中添加和编辑动作
   - 动作数据独立于训练组

2. **标记数据来源**
   - `trainingGroupId`字段标记该动作是否来自训练组
   - 如果有值：表示从训练组导入
   - 如果为null：表示手动创建

3. **灵活性提升**
   - 支持混合使用：既可以导入训练组，也可以手动添加
   - 修改计划中的动作不影响原训练组
   - 编辑模式下可以自由调整所有参数

## API变更

### 创建训练计划

**请求体结构变更**

之前：
```json
{
  "name": "训练计划名称",
  "trainingGroupIds": ["group-id-1", "group-id-2"]
}
```

现在：
```json
{
  "name": "训练计划名称",
  "exercises": [
    {
      "exerciseId": "exercise-id",
      "trainingGroupId": "group-id" | null,
      "orderIndex": 0,
      "sets": [
        {
          "setNumber": 1,
          "reps": 10,
          "weight": 50,
          "restTimeSeconds": 60
        }
      ]
    }
  ]
}
```

### 获取训练计划

**响应体结构变更**

之前：
```json
{
  "id": "plan-id",
  "name": "训练计划",
  "trainingPlanGroups": [
    {
      "trainingGroup": { ... }
    }
  ]
}
```

现在：
```json
{
  "id": "plan-id",
  "name": "训练计划",
  "trainingPlanExercises": [
    {
      "id": "exercise-record-id",
      "exerciseId": "exercise-id",
      "trainingGroupId": "group-id" | null,
      "orderIndex": 0,
      "exercise": { ... },
      "trainingGroup": { ... } | null,
      "trainingPlanExerciseSets": [
        {
          "setNumber": 1,
          "reps": 10,
          "weight": 50,
          "restTimeSeconds": 60
        }
      ]
    }
  ]
}
```

## 前端变更

### CreateTrainingPlan.tsx

1. **数据结构调整**
   - `exerciseRecords` 状态不再需要区分是否有`trainingGroupId`
   - 所有动作都直接保存到训练计划中
   - 保存时发送完整的动作和组数数据

2. **导入训练组逻辑**
   - 导入时保留`trainingGroupId`，标记来源
   - 复制训练组的所有数据到计划中
   - 后续编辑不影响原训练组

3. **手动添加动作**
   - `trainingGroupId`为`null`
   - 直接在计划中创建和编辑

## 迁移步骤

1. ✅ 更新Prisma Schema
2. ✅ 创建数据库迁移
3. ✅ 应用迁移到本地数据库
4. ✅ 生成Prisma Client
5. ⏳ 更新后端类型定义
6. ⏳ 更新后端Controller
7. ⏳ 更新前端类型定义
8. ⏳ 更新前端页面逻辑
9. ⏳ 测试本地环境
10. ⏳ 部署到Staging
11. ⏳ 部署到Production

## 注意事项

⚠️ **数据丢失警告**

此变更会删除 `training_plan_groups` 表，所有现有的训练计划关联数据将丢失。

建议：
- 在staging和production环境应用此迁移前，确保数据已备份
- 或者在迁移脚本中添加数据迁移逻辑（将旧数据转换为新格式）

## 优势

1. **数据独立性**：训练计划的数据独立存储，不受训练组变更影响
2. **灵活性**：可以自由编辑计划中的任何参数
3. **清晰的数据来源**：通过`trainingGroupId`清楚标记数据来源
4. **一致的数据模型**：与训练记录（ExerciseSession）保持相同的结构
5. **简化逻辑**：前端和后端逻辑更加统一和简单

