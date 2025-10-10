# 数据库迁移指南 - 训练计划日期字段改动

## 迁移概述

**迁移名称**: `20251010141950_change_training_plan_to_single_date`

**变更内容**: 将训练计划的日期字段从区间（startDate, endDate）改为单个日期（planDate）

**影响范围**: 
- 数据库表: `training_plans`
- 字段变更: 删除 `start_date`, `end_date`，新增 `plan_date`

## 部署步骤

### 方式一：自动部署（推荐）

#### Staging环境

1. **提交代码到staging分支**
   ```bash
   git add .
   git commit -m "feat: change training plan to single date"
   git push origin staging
   ```

2. **Railway自动部署**
   - Railway检测到代码变更后会自动触发部署
   - 部署过程中会执行 `npm start`，该命令包含 `prisma migrate deploy`
   - 迁移会自动应用到staging数据库

3. **验证迁移**
   - 登录Railway Dashboard
   - 进入Staging环境的Backend服务
   - 查看部署日志，确认看到类似输出：
     ```
     1 migration(s) found in prisma/migrations
     Applying migration `20251010141950_change_training_plan_to_single_date`
     The following migration(s) have been applied:
     migrations/
       └─ 20251010141950_change_training_plan_to_single_date/
         └─ migration.sql
     ```

#### Production环境

1. **合并到main分支**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. **Railway自动部署**
   - 同staging环境，Railway会自动应用迁移

3. **验证迁移**
   - 同staging环境的验证步骤

### 方式二：手动部署（备用方案）

如果自动部署失败或需要手动控制，可以使用以下方法：

#### 1. 通过Railway CLI

```bash
# 安装Railway CLI（如果还没安装）
npm install -g @railway/cli

# 登录
railway login

# 链接到项目
railway link

# 切换到staging环境
railway environment staging

# 运行迁移
railway run npm run db:deploy

# 切换到production环境并运行迁移
railway environment production
railway run npm run db:deploy
```

#### 2. 通过Railway Dashboard控制台

1. 登录Railway Dashboard
2. 选择项目和环境（Staging或Production）
3. 进入Backend服务
4. 点击 "Terminal" 或 "Shell"
5. 运行命令：
   ```bash
   cd /app
   npm run db:deploy
   ```

## 注意事项

### ⚠️ 数据丢失警告

**重要**: 此迁移会删除现有的 `start_date` 和 `end_date` 数据！

如果数据库中已有重要的训练计划数据，建议：

1. **在应用迁移前备份数据**
   ```bash
   # 通过Railway CLI连接数据库
   railway connect postgres
   
   # 或通过psql导出
   pg_dump -h <host> -U <user> -d <database> -t training_plans > backup.sql
   ```

2. **手动迁移现有数据**（如果需要保留开始日期）
   ```sql
   -- 在删除列之前，可以选择保留start_date作为plan_date
   -- 这需要修改迁移文件
   ```

### 数据影响评估

如果当前staging和production环境中的训练计划数据不重要（测试数据），可以直接应用迁移。

如果有重要数据，请考虑：
- 将 `start_date` 的值复制到新的 `plan_date` 字段
- 或者先清空表数据再应用迁移

## 修改后的迁移SQL（可选）

如果需要保留start_date的数据，可以修改迁移文件：

```sql
-- 备选方案：保留start_date的值
ALTER TABLE "training_plans" 
  ADD COLUMN "plan_date" DATE;

UPDATE "training_plans" 
  SET "plan_date" = "start_date"
  WHERE "start_date" IS NOT NULL;

ALTER TABLE "training_plans" 
  DROP COLUMN "start_date",
  DROP COLUMN "end_date";
```

## 回滚方案

如果迁移后出现问题，可以通过以下SQL回滚：

```sql
-- 警告：这会删除plan_date数据
ALTER TABLE "training_plans" 
  ADD COLUMN "start_date" DATE,
  ADD COLUMN "end_date" DATE;

ALTER TABLE "training_plans" 
  DROP COLUMN "plan_date";
```

## 验证清单

部署完成后，请验证：

- [ ] 数据库迁移成功应用
- [ ] Backend服务正常启动
- [ ] 可以创建新的训练计划
- [ ] 可以查看现有的训练计划
- [ ] 可以编辑训练计划
- [ ] 前端页面正常显示计划日期字段

## 常见问题

### Q: 迁移失败，提示"Migration already applied"
A: 迁移已经应用过了，这是正常的。检查数据库结构确认字段已更新。

### Q: 应用启动失败，提示"Unknown column plan_date"
A: Prisma客户端未更新。确保：
1. `postinstall`脚本正常执行
2. 手动运行 `npm run db:generate`

### Q: 前端显示日期区间选择器
A: 前端代码未更新。确保：
1. 前端代码已同步
2. 清除浏览器缓存
3. 重新构建前端

## 联系支持

如有问题，请：
1. 查看Railway部署日志
2. 检查数据库连接配置
3. 在项目仓库提交issue

