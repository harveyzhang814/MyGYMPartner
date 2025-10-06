# 🚀 MyGYMPartner 快速启动指南

## 新用户必读

### 第一步：克隆项目
```bash
git clone <repository-url>
cd MyGYMPartner
```

### 第二步：一键设置
```bash
# 运行自动设置脚本
./setup-local.sh
```

### 第三步：启动开发
```bash
# 启动前后端服务
./start-dev.sh
```

### 第四步：访问应用
- 🌐 **前端**: http://localhost:5173
- 🔧 **后端**: http://localhost:3001

## 常用命令

### 开发命令
```bash
# 启动开发环境
./start-dev.sh

# 快速测试
./quick-test.sh

# 完整测试
./test-connections.sh
```

### 数据库命令
```bash
# 重置数据库
cd backend
npx prisma db push --force-reset
npm run db:init

# 查看数据库
npx prisma studio
```

### 构建命令
```bash
# 构建所有项目
npm run build

# 构建后端
npm run build:backend

# 构建前端
npm run build:frontend
```

## 故障排除

### 常见问题

1. **端口被占用**
```bash
# 检查端口占用
lsof -i :3001
lsof -i :5173

# 杀死占用进程
kill -9 <PID>
```

2. **数据库连接失败**
```bash
# 启动PostgreSQL
brew services start postgresql@15

# 检查数据库
psql -l
```

3. **依赖安装失败**
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm run install:all
```

4. **环境配置问题**
```bash
# 重新创建环境配置
rm backend/.env frontend/.env.local
./setup-local.sh
```

## 开发提示

- ✅ 前后端都支持热重载
- ✅ 数据库使用PostgreSQL，与生产环境一致
- ✅ 所有配置都已自动化
- ✅ 支持macOS和Linux系统

## 获取帮助

如果遇到问题：
1. 查看 [README.md](README.md) 详细文档
2. 查看 [LOCAL-DEV.md](LOCAL-DEV.md) 开发指南
3. 运行 `./test-connections.sh` 诊断问题
4. 检查终端错误日志

---

**提示**: 首次使用建议按照上述步骤操作，确保环境正确配置！
