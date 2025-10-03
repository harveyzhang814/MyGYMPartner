# MyGYMPartner - 数据库设计文档

## 1. 数据库概述

### 1.1 数据库选择
- **数据库类型**：PostgreSQL 14+
- **选择理由**：
  - 支持复杂查询和JSON数据类型
  - 强大的索引支持
  - 良好的并发性能
  - 支持全文搜索
  - 开源且稳定

### 1.2 设计原则
- **规范化**：遵循第三范式，减少数据冗余
- **性能优化**：合理设计索引，优化查询性能
- **数据完整性**：使用外键约束和检查约束
- **扩展性**：支持未来功能扩展
- **安全性**：敏感数据加密存储

## 2. 数据库表设计

### 2.1 用户相关表

#### users - 用户信息表
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
    weight_kg DECIMAL(5,2) CHECK (weight_kg > 0 AND weight_kg < 500),
    fitness_level VARCHAR(20) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'zh-CN',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### user_profiles - 用户扩展信息表
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    goals JSONB, -- 训练目标 {"weight_loss": true, "muscle_gain": true, "endurance": false}
    preferences JSONB, -- 用户偏好 {"units": "metric", "theme": "light"}
    notifications JSONB, -- 通知设置 {"email": true, "push": true}
    privacy_settings JSONB, -- 隐私设置 {"profile_public": false}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

### 2.2 动作库相关表

#### exercises - 动作库表（缓存exercisedb-api数据）
```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(50) UNIQUE, -- exercisedb-api的ID
    name VARCHAR(255) NOT NULL,
    name_zh VARCHAR(255), -- 中文名称
    description TEXT,
    description_zh TEXT, -- 中文描述
    instructions TEXT[], -- 动作说明步骤
    instructions_zh TEXT[], -- 中文动作说明
    muscle_groups VARCHAR(50)[], -- 目标肌肉群 ["chest", "triceps"]
    equipment VARCHAR(50), -- 所需设备 ["barbell", "dumbbell", "bodyweight"]
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category VARCHAR(50), -- 动作分类 ["strength", "cardio", "flexibility"]
    images JSONB, -- 图片URL数组
    videos JSONB, -- 视频URL数组
    gif_url TEXT, -- GIF动图URL
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_exercises_name ON exercises(name);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_is_active ON exercises(is_active);
CREATE INDEX idx_exercises_external_id ON exercises(external_id);
```

#### user_favorite_exercises - 用户收藏动作表
```sql
CREATE TABLE user_favorite_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exercise_id)
);

-- 索引
CREATE INDEX idx_user_favorite_exercises_user_id ON user_favorite_exercises(user_id);
CREATE INDEX idx_user_favorite_exercises_exercise_id ON user_favorite_exercises(exercise_id);
```

### 2.3 训练组相关表

#### training_groups - 训练组表
```sql
CREATE TABLE training_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    description TEXT,
    sets INTEGER NOT NULL CHECK (sets > 0),
    reps_min INTEGER CHECK (reps_min > 0),
    reps_max INTEGER CHECK (reps_max > 0),
    weight_min DECIMAL(8,2) CHECK (weight_min >= 0),
    weight_max DECIMAL(8,2) CHECK (weight_max >= 0),
    rest_time_seconds INTEGER DEFAULT 120 CHECK (rest_time_seconds >= 0),
    notes TEXT,
    is_template BOOLEAN DEFAULT false, -- 是否为模板
    tags VARCHAR(50)[], -- 标签 ["chest", "strength"]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_training_groups_user_id ON training_groups(user_id);
CREATE INDEX idx_training_groups_exercise_id ON training_groups(exercise_id);
CREATE INDEX idx_training_groups_is_template ON training_groups(is_template);
CREATE INDEX idx_training_groups_tags ON training_groups USING GIN(tags);
CREATE INDEX idx_training_groups_created_at ON training_groups(created_at);
```

#### training_group_sets - 训练组详细设置表
```sql
CREATE TABLE training_group_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_group_id UUID NOT NULL REFERENCES training_groups(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL CHECK (set_number > 0),
    reps INTEGER CHECK (reps > 0),
    weight DECIMAL(8,2) CHECK (weight >= 0),
    rest_time_seconds INTEGER CHECK (rest_time_seconds >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(training_group_id, set_number)
);

-- 索引
CREATE INDEX idx_training_group_sets_training_group_id ON training_group_sets(training_group_id);
```

### 2.4 训练计划相关表

#### training_plans - 训练计划表
```sql
CREATE TABLE training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    plan_date DATE NOT NULL, -- 计划日期
    estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'completed', 'cancelled')),
    notes TEXT,
    is_template BOOLEAN DEFAULT false, -- 是否为模板
    template_name VARCHAR(255), -- 模板名称
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX idx_training_plans_plan_date ON training_plans(plan_date);
CREATE INDEX idx_training_plans_status ON training_plans(status);
CREATE INDEX idx_training_plans_is_template ON training_plans(is_template);
CREATE INDEX idx_training_plans_user_date ON training_plans(user_id, plan_date);
```

#### training_plan_groups - 训练计划-训练组关联表
```sql
CREATE TABLE training_plan_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    training_group_id UUID NOT NULL REFERENCES training_groups(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL CHECK (order_index > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(training_plan_id, order_index)
);

-- 索引
CREATE INDEX idx_training_plan_groups_training_plan_id ON training_plan_groups(training_plan_id);
CREATE INDEX idx_training_plan_groups_training_group_id ON training_plan_groups(training_group_id);
CREATE INDEX idx_training_plan_groups_order ON training_plan_groups(training_plan_id, order_index);
```

### 2.5 训练记录相关表

#### exercise_sessions - 训练会话表
```sql
CREATE TABLE exercise_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_plan_id UUID REFERENCES training_plans(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    total_duration_minutes INTEGER CHECK (total_duration_minutes >= 0),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_exercise_sessions_user_id ON exercise_sessions(user_id);
CREATE INDEX idx_exercise_sessions_training_plan_id ON exercise_sessions(training_plan_id);
CREATE INDEX idx_exercise_sessions_session_date ON exercise_sessions(session_date);
CREATE INDEX idx_exercise_sessions_status ON exercise_sessions(status);
CREATE INDEX idx_exercise_sessions_user_date ON exercise_sessions(user_id, session_date);
```

#### exercise_records - 训练记录表
```sql
CREATE TABLE exercise_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES exercise_sessions(id) ON DELETE CASCADE,
    training_group_id UUID NOT NULL REFERENCES training_groups(id) ON DELETE RESTRICT,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    order_index INTEGER NOT NULL CHECK (order_index > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_exercise_records_session_id ON exercise_records(session_id);
CREATE INDEX idx_exercise_records_training_group_id ON exercise_records(training_group_id);
CREATE INDEX idx_exercise_records_exercise_id ON exercise_records(exercise_id);
CREATE INDEX idx_exercise_records_order ON exercise_records(session_id, order_index);
```

#### exercise_set_records - 训练组记录表
```sql
CREATE TABLE exercise_set_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_record_id UUID NOT NULL REFERENCES exercise_records(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL CHECK (set_number > 0),
    reps INTEGER CHECK (reps > 0),
    weight DECIMAL(8,2) CHECK (weight >= 0),
    rest_time_seconds INTEGER CHECK (rest_time_seconds >= 0),
    is_completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exercise_record_id, set_number)
);

-- 索引
CREATE INDEX idx_exercise_set_records_exercise_record_id ON exercise_set_records(exercise_record_id);
CREATE INDEX idx_exercise_set_records_set_number ON exercise_set_records(exercise_record_id, set_number);
```

### 2.6 系统相关表

#### system_settings - 系统设置表
```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);
```

#### audit_logs - 审计日志表
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## 3. 数据库关系图

### 3.1 实体关系图
```
users (1) ──── (1) user_profiles
  │
  │ (1)
  │
  └─── (n) training_groups
  │      │
  │      │ (1)
  │      │
  │      └─── (n) training_group_sets
  │
  │ (1)
  │
  └─── (n) training_plans
  │      │
  │      │ (1)
  │      │
  │      └─── (n) training_plan_groups
  │             │
  │             │ (n)
  │             │
  │             └─── (1) training_groups
  │
  │ (1)
  │
  └─── (n) exercise_sessions
  │      │
  │      │ (1)
  │      │
  │      └─── (n) exercise_records
  │             │
  │             │ (1)
  │             │
  │             └─── (n) exercise_set_records
  │
  │ (1)
  │
  └─── (n) user_favorite_exercises
  │      │
  │      │ (n)
  │      │
  │      └─── (1) exercises

exercises (1) ──── (n) training_groups
exercises (1) ──── (n) exercise_records
```

### 3.2 关系说明
- **用户 → 训练组**：一对多，一个用户可以创建多个训练组
- **用户 → 训练计划**：一对多，一个用户可以创建多个训练计划
- **用户 → 训练会话**：一对多，一个用户可以有多个训练会话
- **训练计划 → 训练组**：多对多，通过training_plan_groups关联表
- **训练组 → 动作**：多对一，多个训练组可以对应同一个动作
- **训练会话 → 训练计划**：多对一，多个训练会话可以基于同一个训练计划
- **训练记录 → 训练组**：多对一，多个训练记录可以基于同一个训练组

## 4. 索引策略

### 4.1 主键索引
- 所有表都使用UUID作为主键，自动创建主键索引

### 4.2 唯一索引
- 用户邮箱、用户名
- 动作外部ID
- 用户收藏动作的组合唯一索引

### 4.3 普通索引
- 外键字段索引
- 查询频繁的字段索引
- 日期时间字段索引

### 4.4 复合索引
- 用户ID + 日期：用于查询用户特定日期的数据
- 会话ID + 顺序：用于查询训练记录的顺序

### 4.5 GIN索引
- JSONB字段：用户偏好、目标等
- 数组字段：肌肉群、标签等

## 5. 数据约束

### 5.1 检查约束
- 性别字段：只允许'male', 'female', 'other'
- 健身水平：只允许'beginner', 'intermediate', 'advanced'
- 身高体重：合理的数值范围
- 组数次数：必须大于0
- 重量：必须大于等于0

### 5.2 外键约束
- 所有外键都设置了适当的删除行为
- CASCADE：删除用户时删除相关数据
- RESTRICT：防止删除被引用的动作
- SET NULL：删除训练计划时保留训练记录

### 5.3 唯一约束
- 用户邮箱和用户名唯一
- 训练计划中的训练组顺序唯一
- 训练记录中的组数顺序唯一

## 6. 数据迁移策略

### 6.1 版本控制
- 使用数据库迁移文件管理schema变更
- 每个迁移文件包含版本号和描述
- 支持向前和向后迁移

### 6.2 数据备份
- 每日自动备份
- 重要操作前手动备份
- 备份文件加密存储

### 6.3 数据同步
- 动作库数据定期从exercisedb-api同步
- 增量同步机制
- 同步失败重试机制

## 7. 性能优化

### 7.1 查询优化
- 使用EXPLAIN分析查询计划
- 避免N+1查询问题
- 合理使用JOIN和子查询

### 7.2 分页查询
- 使用LIMIT和OFFSET进行分页
- 大数据量时使用游标分页
- 避免深分页问题

### 7.3 缓存策略
- 动作库数据缓存
- 用户统计数据缓存
- 查询结果缓存

## 8. 安全考虑

### 8.1 数据加密
- 密码使用bcrypt加密
- 敏感信息字段加密存储
- 传输过程使用HTTPS

### 8.2 访问控制
- 基于角色的访问控制
- 用户只能访问自己的数据
- API接口权限验证

### 8.3 审计日志
- 记录所有数据变更操作
- 记录用户登录和操作
- 定期审计日志分析

## 9. 监控和维护

### 9.1 性能监控
- 慢查询监控
- 数据库连接数监控
- 存储空间监控

### 9.2 数据清理
- 定期清理过期数据
- 归档历史数据
- 清理无效的审计日志

### 9.3 备份恢复
- 定期测试备份恢复
- 灾难恢复预案
- 数据一致性检查

---

**文档版本**：v1.0  
**创建日期**：2024年12月  
**最后更新**：2024年12月  
**负责人**：数据库团队
