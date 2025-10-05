# MyGYMPartner 测试脚本

这个文件夹包含了 MyGYMPartner 项目的所有测试脚本，用于验证部署、构建和功能。

## 📁 测试脚本列表

### 🚂 Railway 部署测试

#### `test-railway-deployment.sh`
**用途**: 全面测试 Railway 部署状态
**功能**:
- 健康检查测试
- API 端点测试
- 认证端点测试
- CORS 配置测试
- 错误处理测试
- 安全头测试
- SSL/TLS 测试

**使用方法**:
```bash
./tests/test-railway-deployment.sh
```

#### `test-fixes.sh`
**用途**: 验证修复后的功能
**功能**:
- 认证功能验证
- 错误处理验证
- API 端点验证
- 修复效果确认

**使用方法**:
```bash
./tests/test-fixes.sh
```

### 🔧 构建测试

#### `test-build.sh`
**用途**: 测试前后端构建过程
**功能**:
- 后端 TypeScript 构建
- 前端 Vite 构建
- 依赖安装验证
- 构建错误检查

**使用方法**:
```bash
./tests/test-build.sh
```

### 🔍 部署验证

#### `verify-railway-fix.sh`
**用途**: 验证 Railway 部署修复
**功能**:
- 文件结构检查
- 配置文件验证
- 构建测试
- 部署准备确认

**使用方法**:
```bash
./tests/verify-railway-fix.sh
```

## 🚀 快速开始

### 1. 运行所有测试
```bash
# 设置执行权限
chmod +x tests/*.sh

# 运行构建测试
./tests/test-build.sh

# 运行部署测试
./tests/test-railway-deployment.sh
```

### 2. 验证修复
```bash
# 运行修复验证
./tests/test-fixes.sh
```

### 3. 部署前检查
```bash
# 运行部署验证
./tests/verify-railway-fix.sh
```

## 📊 测试结果说明

### ✅ 成功指标
- **健康检查**: HTTP 200 响应
- **API 端点**: 正确的状态码响应
- **认证功能**: 注册/登录正常工作
- **CORS 配置**: 跨域请求正常
- **错误处理**: 正确的错误状态码
- **安全配置**: 安全头正确设置
- **SSL/TLS**: HTTPS 正常工作

### ❌ 常见问题
1. **认证端点 500 错误**: 检查路由配置和环境变量
2. **404 返回 500**: 检查错误处理中间件
3. **CORS 错误**: 检查 CORS 配置和域名设置
4. **构建失败**: 检查依赖和 TypeScript 配置

## 🔧 故障排除

### 测试失败时的步骤
1. 检查 Railway 部署日志
2. 验证环境变量配置
3. 确认数据库连接
4. 检查网络连接
5. 重新运行测试

### 获取帮助
- Railway 项目仪表板: https://railway.app/dashboard
- 部署日志: Railway 项目 → Deployments → 查看日志
- 环境变量: Railway 项目 → Variables

## 📝 测试环境

### 生产环境
- **后端**: https://mygympartner-production.up.railway.app
- **前端**: https://mygympartner.vercel.app (待部署)

### 测试环境
- **后端**: https://mygympartner-staging.up.railway.app (待配置)
- **前端**: https://mygympartner-staging.vercel.app (待配置)

## 🎯 测试覆盖范围

### 功能测试
- [x] 用户注册
- [x] 用户登录
- [x] 基础练习列表
- [x] 训练组管理
- [x] 训练计划管理
- [x] 运动会话管理

### 安全测试
- [x] JWT 认证
- [x] CORS 配置
- [x] 安全头设置
- [x] SSL/TLS 配置
- [x] 错误处理

### 性能测试
- [x] 响应时间
- [x] 并发处理
- [x] 资源使用

## 📋 维护说明

### 定期运行测试
建议在以下情况运行测试：
- 部署新版本后
- 修改配置后
- 添加新功能后
- 每周定期检查

### 更新测试脚本
当添加新功能或修改现有功能时，记得更新相应的测试脚本。

---

**注意**: 所有测试脚本都设计为在项目根目录运行。确保在运行测试前已正确配置环境变量和部署设置。
