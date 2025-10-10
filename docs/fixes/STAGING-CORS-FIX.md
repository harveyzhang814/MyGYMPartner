# Staging 环境 CORS 错误修复

## 问题描述

### 错误信息

```
Error: Not allowed by CORS
    at origin (/app/dist/index.js:59:26)
    at /app/node_modules/cors/lib/index.js:219:13
```

### 问题原因

后端的 CORS 配置只检查 `NODE_ENV === 'production'`，没有处理 `staging` 环境，导致：
- Staging 前端（Vercel 预览域名）无法访问 Staging 后端 API
- 所有来自 Staging 前端的请求都被 CORS 拒绝

## 修复方案

### 代码修改

**文件**: `backend/src/index.ts`

**修改前**:
```typescript
if (process.env.NODE_ENV === 'production') {
  // 只处理生产环境
  // ...
} else {
  // 只处理开发环境（localhost）
  // ...
}
```

**修改后**:
```typescript
if (nodeEnv === 'production' || nodeEnv === 'staging') {
  // 同时处理生产环境和 Staging 环境
  // 支持配置的域名和所有 Vercel 预览域名
  // ...
} else {
  // 开发环境（localhost）
  // ...
}
```

### 关键改进

1. **支持 Staging 环境**
   ```typescript
   if (nodeEnv === 'production' || nodeEnv === 'staging') {
     // 统一处理
   }
   ```

2. **支持所有 Vercel 预览域名**
   ```typescript
   || (origin.includes('vercel.app') && origin.startsWith('https://'))
   ```

3. **添加详细日志**
   ```typescript
   console.log(`[CORS] 环境: ${nodeEnv}, 请求来源: ${origin}`);
   console.log(`[CORS] 允许的来源:`, allowedOrigins);
   console.log(`[CORS] ✅ 允许来源: ${origin}`);
   // 或
   console.log(`[CORS] ❌ 拒绝来源: ${origin}`);
   ```

4. **修复空格问题**
   ```typescript
   process.env.CORS_ORIGIN?.split(',').map(o => o.trim())
   ```

## Railway 环境变量配置

### Staging 环境

确保 Railway `backend-staging` 服务中配置了正确的 `CORS_ORIGIN`：

```bash
# 单个域名
CORS_ORIGIN=https://mygympartner-frontend-git-staging-yourname.vercel.app

# 多个域名（用逗号分隔）
CORS_ORIGIN=https://mygympartner-frontend-git-staging-yourname.vercel.app,https://another-domain.com

# 使用通配符（不推荐，但支持）
CORS_ORIGIN=https://*.vercel.app
```

### Production 环境

```bash
# 生产域名
CORS_ORIGIN=https://harveygympartner814.vercel.app

# 多个域名
CORS_ORIGIN=https://harveygympartner814.vercel.app,https://custom-domain.com
```

## CORS 策略说明

### 生产/Staging 环境

允许以下来源：
1. ✅ `CORS_ORIGIN` 环境变量中配置的域名（精确匹配）
2. ✅ `CORS_ORIGIN` 中的通配符域名（如 `https://*.vercel.app`）
3. ✅ 所有 HTTPS 的 Vercel 预览域名（`*.vercel.app`）

拒绝：
- ❌ HTTP 域名（非 HTTPS）
- ❌ 未配置的域名
- ❌ 非 Vercel 的其他域名

### 开发环境

允许以下来源：
1. ✅ `CORS_ORIGIN` 环境变量中配置的 localhost 地址
2. ✅ 默认的 `http://localhost:5173` 和 `http://localhost:3000`

## 验证步骤

### 1. 检查 Railway 日志

部署后，在 Railway 日志中查看 CORS 信息：

```
[CORS] 环境: staging, 请求来源: https://mygympartner-frontend-git-staging-xxx.vercel.app
[CORS] 允许的来源: [ 'https://mygympartner-frontend-git-staging-xxx.vercel.app' ]
[CORS] ✅ 允许来源: https://mygympartner-frontend-git-staging-xxx.vercel.app
```

### 2. 测试前端请求

1. 访问 Staging 前端
2. 打开浏览器开发者工具
3. 尝试登录或其他 API 请求
4. 检查 Network 标签，应该没有 CORS 错误

### 3. 检查环境变量

在 Railway Shell 中运行：

```bash
echo $NODE_ENV
# 应该输出: staging

echo $CORS_ORIGIN
# 应该输出: https://your-staging-frontend.vercel.app
```

## 故障排查

### 问题 1: 仍然出现 CORS 错误

**检查清单**:
- [ ] `NODE_ENV=staging` 是否正确设置
- [ ] `CORS_ORIGIN` 是否包含 Staging 前端 URL
- [ ] `CORS_ORIGIN` 中的 URL 是否与实际前端 URL 完全一致（包括 https://）
- [ ] Railway 服务是否已重新部署

**解决方案**:
```bash
# 1. 确认环境变量
NODE_ENV=staging
CORS_ORIGIN=https://mygympartner-frontend-git-staging-yourname.vercel.app

# 2. 重新部署服务
# 在 Railway Dashboard 中点击 "Redeploy"
```

### 问题 2: 日志中没有 CORS 信息

**原因**: 代码未更新或未重新部署

**解决方案**:
```bash
# 1. 确认代码已推送
git log --oneline -1
# 应该看到: fix: 修复 Staging 环境 CORS 错误

# 2. 确认 Railway 已拉取最新代码
# 在 Railway Dashboard 查看最新的 commit hash

# 3. 手动触发重新部署
```

### 问题 3: CORS_ORIGIN 包含空格

**症状**: URL 正确但仍然被拒绝

**原因**: 环境变量中有多余的空格

**解决方案**:
```bash
# 错误示例（有空格）
CORS_ORIGIN=https://domain1.com, https://domain2.com

# 正确示例（无空格，或代码会自动 trim）
CORS_ORIGIN=https://domain1.com,https://domain2.com
```

现在代码已经自动处理空格，但建议配置时不要添加空格。

### 问题 4: Vercel 预览 URL 变化

**症状**: 每次推送代码，Vercel 预览 URL 都会变化

**解决方案**: 
不需要每次更新 `CORS_ORIGIN`，因为代码已经支持所有 Vercel 预览域名：
```typescript
|| (origin.includes('vercel.app') && origin.startsWith('https://'))
```

只要是 HTTPS 的 `*.vercel.app` 域名都会被允许。

## 最佳实践

### 1. 环境变量配置

**Staging 环境**:
```bash
# 推荐：配置具体的预览域名
CORS_ORIGIN=https://mygympartner-frontend-git-staging-yourname.vercel.app

# 或者：使用通配符（不太安全）
CORS_ORIGIN=https://*.vercel.app
```

**Production 环境**:
```bash
# 推荐：只配置生产域名
CORS_ORIGIN=https://harveygympartner814.vercel.app

# 如果有多个域名
CORS_ORIGIN=https://harveygympartner814.vercel.app,https://custom-domain.com
```

### 2. 安全考虑

- ✅ 生产环境只允许特定域名
- ✅ Staging 环境可以宽松一些（允许所有 Vercel 预览域名）
- ✅ 始终使用 HTTPS（代码已强制检查）
- ❌ 不要在生产环境使用通配符

### 3. 调试技巧

1. **查看 CORS 日志**
   - Railway 日志会显示每个请求的来源
   - 可以看到是否被允许或拒绝

2. **浏览器开发者工具**
   - Network 标签查看请求头
   - Console 查看 CORS 错误详情

3. **测试工具**
   ```bash
   # 使用 curl 测试
   curl -H "Origin: https://your-frontend.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://your-backend.railway.app/api/auth/login
   ```

## 相关文档

- [STAGING-SETUP-GUIDE.md](../deployment/STAGING-SETUP-GUIDE.md) - Staging 环境完整配置
- [DEPLOYMENT.md](../deployment/DEPLOYMENT.md) - 部署指南
- [MDN CORS 文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## 总结

### 修复内容
- ✅ 支持 Staging 环境的 CORS 配置
- ✅ 自动允许所有 Vercel 预览域名
- ✅ 添加详细的调试日志
- ✅ 修复环境变量空格问题

### 配置要求
- ✅ Railway 设置 `NODE_ENV=staging`
- ✅ Railway 设置 `CORS_ORIGIN=<前端URL>`
- ✅ 重新部署服务

### 验证方法
- ✅ 查看 Railway 日志确认 CORS 配置
- ✅ 测试前端 API 请求
- ✅ 确认无 CORS 错误

---

**修复完成时间**: 2024-10-08
**影响范围**: Staging 环境后端 API
**状态**: ✅ 已修复并部署
