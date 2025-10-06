# 📁 MyGYMPartner 项目结构

## 🎯 核心文件

### 启动脚本
- `setup-local.sh` - 新用户首次设置脚本
- `start-dev.sh` - 快速启动开发环境
- `quick-test.sh` - 快速连接测试
- `test-connections.sh` - 完整连接测试
- `test-build.sh` - 构建测试

### 配置文件
- `package.json` - 根目录依赖管理
- `railway.toml` - Railway部署配置
- `deploy.sh` - 部署脚本

### 文档
- `README.md` - 项目主文档
- `QUICK-START.md` - 快速启动指南

## 🏗️ 后端结构 (backend/)

```
backend/
├── src/                    # TypeScript源码
│   ├── controllers/        # 控制器
│   ├── routes/            # 路由
│   ├── middleware/        # 中间件
│   ├── utils/            # 工具函数
│   └── types/            # 类型定义
├── prisma/               # 数据库配置
│   ├── schema.prisma     # 数据库模式
│   └── migrations/       # 数据库迁移
├── scripts/              # 脚本文件
│   └── init-db.js        # 数据库初始化
├── env.local.template    # 环境变量模板
├── package.json          # 后端依赖
└── tsconfig.json         # TypeScript配置
```

## 🎨 前端结构 (frontend/)

```
frontend/
├── src/                  # React源码
│   ├── components/       # 通用组件
│   ├── pages/           # 页面组件
│   ├── services/        # API服务
│   ├── store/           # Redux状态管理
│   ├── contexts/        # React上下文
│   ├── locales/         # 国际化
│   └── types/           # 类型定义
├── public/              # 静态资源
├── env.local.template   # 环境变量模板
├── package.json         # 前端依赖
└── vite.config.ts       # Vite配置
```

## 📚 文档结构 (docs/)

```
docs/
├── requirements/         # 需求文档
│   └── PRD.md          # 产品需求文档
├── design/             # 设计文档
│   ├── Design-Document.md
│   ├── Database-Design.md
│   ├── Design-System.md
│   └── Page-Layouts.md
├── development/        # 开发文档
│   └── Development-Plan.md
└── deployment/         # 部署文档
    ├── DEPLOYMENT.md
    └── DEPLOYMENT-SUMMARY.md
```

## 🚀 快速开始

### 新用户
```bash
git clone <repository-url>
cd MyGYMPartner
./setup-local.sh
./start-dev.sh
```

### 开发命令
```bash
# 启动开发环境
./start-dev.sh

# 快速测试
./quick-test.sh

# 完整测试
./test-connections.sh

# 构建测试
./test-build.sh
```

## 📝 重要说明

- ✅ 所有构建输出已从Git中排除
- ✅ 环境变量文件不会被提交
- ✅ 项目结构简洁清晰
- ✅ 文档完整且易于理解

---

**提示**: 首次使用请运行 `./setup-local.sh` 进行环境设置！
