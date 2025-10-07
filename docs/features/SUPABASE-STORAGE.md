# Supabase Storage 支持

## 概述

本项目现在支持在生产和开发环境中使用不同的存储方案：
- **开发环境**: 使用本地文件系统存储头像
- **生产环境**: 使用 Supabase Storage 存储头像

## 架构设计

### 统一存储服务接口

我们创建了一个统一的存储服务接口 `StorageService`，支持以下操作：
- `uploadAvatar(file, userId)`: 上传头像文件
- `deleteAvatar(url, userId)`: 删除头像文件

### 环境检测

系统通过 `NODE_ENV` 环境变量自动检测运行环境：
- `development`: 使用本地存储
- `production`: 使用 Supabase Storage

### 存储服务实现

#### 本地存储服务 (LocalStorageService)
- 将文件保存到 `backend/src/uploads/avatars/` 目录
- 生成本地访问URL: `http://localhost:3001/uploads/avatars/{filename}`
- 适用于开发环境

#### Supabase存储服务 (SupabaseStorageService)
- 将文件上传到 Supabase Storage 的 `avatars` bucket
- 生成公共访问URL
- 适用于生产环境

## 配置要求

### 开发环境
无需额外配置，系统自动使用本地存储。

### 生产环境
需要在环境变量中配置以下 Supabase 参数：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

## 文件类型支持

支持以下图片格式：
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

文件大小限制：5MB

## API 端点

### 头像上传
```
POST /api/profile/upload-avatar
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- avatar: 图片文件
```

响应：
```json
{
  "success": true,
  "data": {
    "url": "头像访问URL"
  },
  "message": "头像上传成功"
}
```

## 使用示例

### 后端使用
```typescript
import { storageService } from '../services/storageService';

// 上传头像
const result = await storageService.uploadAvatar(file, userId);
if (result.success) {
  console.log('头像URL:', result.url);
}

// 删除头像
const deleteResult = await storageService.deleteAvatar(avatarUrl, userId);
```

### 前端使用
```typescript
// 头像上传组件会自动根据环境使用正确的API端点
<Upload
  action={`${api.defaults.baseURL}/profile/upload-avatar`}
  // ... 其他配置
/>
```

## 部署注意事项

1. **Supabase Storage Bucket**: 确保在生产环境中创建了 `avatars` bucket
2. **权限配置**: 确保 Supabase Storage 有正确的读写权限
3. **环境变量**: 确保生产环境正确配置了 Supabase 相关环境变量

## 故障排除

### 开发环境问题
- 检查 `backend/src/uploads/avatars/` 目录是否存在
- 确保后端服务有文件系统写入权限

### 生产环境问题
- 检查 Supabase 环境变量是否正确配置
- 验证 Supabase Storage bucket 是否存在
- 检查网络连接和权限设置

## 日志

系统会记录详细的存储操作日志：
```
头像上传成功: {
  userId: "user-123",
  avatarUrl: "https://...",
  environment: "production",
  storage: "supabase"
}
```
