# MyGYMPartner - 健身伙伴应用

## 项目概述

MyGYMPartner是一款专为健身爱好者设计的Web端训练计划管理应用，帮助用户科学规划、记录和跟踪个人健身训练进度。

## 功能特性

### Phase 1 MVP功能
- ✅ 用户注册登录系统
- ✅ 基础训练组管理
- ✅ 简单训练记录功能
- ✅ 基础动作库（5个常用动作）
- ✅ 训练历史查看

### 计划功能
- 📅 日程管理（训练计划）
- 📊 数据统计和可视化
- 🏋️ 完整动作库集成
- 🎯 训练目标设定
- 👥 社交功能

## 技术栈

### 后端
- **框架**: Node.js + Express.js
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: JWT
- **语言**: TypeScript

### 前端
- **框架**: React 18 + TypeScript
- **状态管理**: Redux Toolkit
- **UI组件库**: Ant Design 5.x
- **路由**: React Router v6
- **构建工具**: Vite

### 部署
- **云平台**: Railway (后端) + Vercel (前端)
- **数据库**: PostgreSQL 15

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 15+
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd MyGYMPartner
```

2. **配置环境变量**
```bash
# 复制环境变量模板
cp env.template .env

# 编辑环境变量文件，配置数据库连接等
```

3. **启动开发服务器**
```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端 (新终端)
cd frontend
npm install
npm run dev
```

4. **访问应用**
- 前端应用: http://localhost:5173
- 后端API: http://localhost:3001
- API文档: http://localhost:3001/health

### 本地开发

#### 后端开发
```bash
cd backend
npm install
npm run dev
```

#### 前端开发
```bash
cd frontend
npm install
npm run dev
```

#### 数据库操作
```bash
cd backend
# 生成Prisma客户端
npx prisma generate

# 推送数据库schema
npx prisma db push

# 打开Prisma Studio
npx prisma studio
```

## 📚 项目文档

项目文档已按功能分类整理到 `docs/` 目录：

- **[📋 需求文档](./docs/requirements/)** - 产品需求、功能规格
- **[🎨 设计文档](./docs/design/)** - UI/UX设计、数据库设计
- **[💻 开发文档](./docs/development/)** - 开发计划、技术规范
- **[🚀 部署文档](./docs/deployment/)** - 部署指南、运维文档

详细文档请查看各个分类目录

## 项目结构

```
MyGYMPartner/
├── backend/                 # 后端API
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   ├── services/       # 业务逻辑
│   │   ├── utils/          # 工具函数
│   │   └── types/          # 类型定义
│   ├── prisma/             # 数据库schema
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/         # 页面
│   │   ├── store/         # Redux store
│   │   ├── services/      # API服务
│   │   └── types/         # 类型定义
│   └── package.json
├── docs/                   # 项目文档
│   ├── design/            # 设计文档
│   ├── development/       # 开发文档
│   ├── deployment/        # 部署文档
│   └── requirements/      # 需求文档
└── README.md
```

## API接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 训练组相关
- `GET /api/training-groups` - 获取训练组列表
- `POST /api/training-groups` - 创建训练组
- `GET /api/training-groups/:id` - 获取训练组详情
- `PUT /api/training-groups/:id` - 更新训练组
- `DELETE /api/training-groups/:id` - 删除训练组

### 训练记录相关
- `GET /api/exercise-sessions` - 获取训练记录列表
- `POST /api/exercise-sessions` - 创建训练记录
- `GET /api/exercise-sessions/:id` - 获取训练记录详情
- `PUT /api/exercise-sessions/:id` - 更新训练记录
- `DELETE /api/exercise-sessions/:id` - 删除训练记录

### 动作库相关
- `GET /api/exercises` - 获取动作列表
- `GET /api/exercises/:id` - 获取动作详情
- `GET /api/exercises/favorites/list` - 获取收藏动作
- `POST /api/exercises/favorites` - 添加收藏
- `DELETE /api/exercises/favorites/:id` - 取消收藏

## 数据库设计

### 核心表结构
- **users** - 用户信息表
- **exercises** - 动作库表
- **training_groups** - 训练组表
- **exercise_sessions** - 训练会话表
- **exercise_records** - 训练记录表
- **exercise_set_records** - 训练组记录表

详细设计请参考 [数据库设计文档](./docs/design/Database-Design.md)

## 开发计划

### Phase 1: 核心功能MVP (4周) ✅
- [x] 用户认证系统
- [x] 基础训练组管理
- [x] 简单训练记录
- [x] 基础动作库集成

### Phase 2: 功能完善 (4周)
- [ ] 训练计划管理
- [ ] 日程管理功能
- [ ] 数据统计和可视化
- [ ] 完整动作库集成

### Phase 3: 体验优化 (2周)
- [ ] 性能优化
- [ ] UI/UX优化
- [ ] 响应式设计完善

### Phase 4: 高级功能 (2周)
- [ ] 训练目标设定
- [ ] 社交功能
- [ ] 数据导出
- [ ] 高级统计

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目负责人: MyGYMPartner Team
- 邮箱: team@mygympartner.com
- 项目地址: https://github.com/your-username/MyGYMPartner

---

**注意**: 这是一个开发中的项目，当前版本为 Phase 1 MVP。更多功能正在开发中，敬请期待！