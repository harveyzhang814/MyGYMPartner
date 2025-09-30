# MyGYMPartner 💪

> 专业的健身训练计划管理应用 - 科学规划、记录和跟踪你的健身之旅

## 📖 项目简介

MyGYMPartner是一款专为健身爱好者设计的Web端训练计划管理应用，帮助用户科学规划、记录和跟踪个人健身训练进度。

### 🎯 核心价值
- 🏋️‍♂️ 提供个性化的训练计划管理
- 📊 科学记录训练数据
- 🎯 基于动作库的标准化训练
- 📈 可视化的训练进度跟踪

## 🚀 主要功能

### 👤 用户认证
- 邮箱注册/登录
- 密码管理（重置、修改）
- 第三方登录（Google、微信等）

### 📅 日程管理
- 多视图日历（月/周/日视图）
- 训练计划创建与编辑
- 训练组导入
- 计划模板保存
- 移动端优化（触摸手势支持）

### 🏋️‍♀️ 训练组管理
- 基于动作库创建训练组
- 组数、重量、次数配置
- 训练组分类（按身体部位、训练类型）
- 训练组编辑、删除、复制

### 📝 训练记录
- 实时训练记录
- 计划vs实际完成对比
- 训练总结和历史记录
- 移动端优化（大按钮、语音输入）

### 🎯 动作库管理
- 集成exercisedb-api
- 动作搜索和分类
- 动作详情（描述、图片、视频）
- 动作收藏功能

### 📊 数据统计
- 训练统计（次数、时长、重量）
- 进度跟踪图表
- 身体部位训练频率
- 目标达成情况

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **状态管理**: Redux Toolkit + RTK Query
- **UI组件库**: Ant Design 5.x
- **路由**: React Router v6
- **图表库**: Chart.js / Recharts
- **日历组件**: FullCalendar
- **构建工具**: Vite
- **样式**: CSS Modules + Less
- **PWA支持**: Service Worker + Web App Manifest

### 后端
- **框架**: Node.js + Express.js
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: JWT + Passport.js
- **API文档**: Swagger/OpenAPI
- **文件存储**: AWS S3 / 阿里云OSS
- **缓存**: Redis

### 部署
- **容器化**: Docker + Docker Compose
- **云服务**: AWS / 阿里云 / 腾讯云
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana

## 🎨 设计特色

- **响应式设计**: 支持桌面端、平板、手机端
- **移动优先**: 专为移动端优化的触摸体验
- **现代UI**: 基于Ant Design的健身风格设计
- **数据可视化**: 直观的图表和进度展示

## 📱 兼容性

- **浏览器**: Chrome、Safari、Firefox、Edge
- **移动端**: iOS Safari 12+、Android Chrome 70+
- **屏幕适配**: 支持不同屏幕尺寸和分辨率

## 🚦 开发计划

### 第一阶段（MVP - 4周）
- [x] 项目规划与设计
- [ ] 用户认证系统
- [ ] 基础训练组管理
- [ ] 简单训练记录
- [ ] 基础动作库集成

### 第二阶段（功能完善 - 4周）
- [ ] 日程管理功能
- [ ] 数据统计和可视化
- [ ] 训练计划模板
- [ ] 移动端适配

### 第三阶段（优化增强 - 2周）
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 高级功能（目标设定、社交功能等）

## 📋 系统要求

- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- PostgreSQL >= 13.0
- Redis >= 6.0

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/your-username/MyGYMPartner.git

# 进入项目目录
cd MyGYMPartner

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📄 文档

- [产品需求文档 (PRD)](./PRD.md)
- [设计文档](./Design-Document.md)
- [设计系统](./Design-System.md)
- [页面布局](./Page-Layouts.md)

## 🤝 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目！

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 邮箱: your-email@example.com
- 项目地址: https://github.com/your-username/MyGYMPartner

---

⭐ 如果这个项目对你有帮助，请给我们一个Star！