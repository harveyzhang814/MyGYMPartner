# 头像上传功能

## 功能概述

个人中心头像上传功能，支持用户更换个人头像。

## 环境配置

### 开发环境（本地测试）
- **文件存储**：本地文件系统
- **存储路径**：`backend/uploads/avatars/`
- **访问URL**：`http://localhost:3001/uploads/avatars/`

### 生产环境
- **状态**：功能暂时禁用
- **原因**：等待云存储服务配置
- **返回**：503错误，提示"头像上传功能暂未启用"

## 环境变量

```bash
# 开发环境配置
NODE_ENV=development
AVATAR_UPLOAD_ENABLED=true

# 生产环境配置
NODE_ENV=production
AVATAR_UPLOAD_ENABLED=false  # 或未设置
```

## 技术实现

### 后端实现

1. **文件上传中间件** (`backend/src/middleware/upload.ts`)
   - 使用 multer 处理文件上传
   - 文件大小限制：5MB
   - 文件类型限制：仅图片文件
   - 文件命名：`avatar-{userId}-{timestamp}.{ext}`

2. **API端点** (`backend/src/routes/profile.ts`)
   - 路径：`POST /api/profile/upload-avatar`
   - 认证：需要Bearer token
   - 环境控制：仅在开发环境启用

3. **静态文件服务** (`backend/src/index.ts`)
   - 路径：`/uploads`
   - 环境控制：仅在开发环境启用

### 前端实现

1. **上传组件** (`frontend/src/pages/Profile.tsx`)
   - 使用 Ant Design Upload 组件
   - 文件验证：图片类型、5MB大小限制
   - 上传地址：`/api/profile/upload-avatar`
   - 认证头：`Authorization: Bearer {token}`

2. **状态管理**
   - 上传成功后更新用户状态
   - 显示成功/失败消息
   - 实时更新头像显示

## 文件结构

```
backend/
├── src/
│   ├── middleware/
│   │   └── upload.ts          # 文件上传中间件
│   └── routes/
│       └── profile.ts         # 头像上传API
├── uploads/                   # 上传文件存储目录
│   └── avatars/              # 头像文件存储
└── package.json

frontend/
└── src/
    └── pages/
        └── Profile.tsx       # 头像上传UI组件
```

## 使用说明

### 开发环境测试

1. **启动服务**
   ```bash
   # 后端
   cd backend
   npm run dev
   
   # 前端
   cd frontend
   npm run dev
   ```

2. **测试上传**
   - 访问：http://localhost:5173
   - 登录后进入个人中心
   - 点击"更换头像"按钮
   - 选择图片文件上传

3. **验证结果**
   - 检查 `backend/uploads/avatars/` 目录
   - 确认文件已保存
   - 验证头像在界面中显示

### 生产环境部署

1. **禁用功能**
   - 设置 `AVATAR_UPLOAD_ENABLED=false`
   - 或删除该环境变量

2. **配置云存储**（未来实现）
   - 集成 Cloudinary/AWS S3
   - 更新上传逻辑
   - 配置CDN加速

## 安全考虑

1. **文件类型验证**：仅允许图片文件
2. **文件大小限制**：最大5MB
3. **用户认证**：需要有效token
4. **环境隔离**：生产环境禁用本地存储

## 错误处理

- **文件类型错误**：提示"只能上传图片文件"
- **文件过大**：提示"图片大小不能超过5MB"
- **上传失败**：提示"头像上传失败，请重试"
- **生产环境**：提示"头像上传功能暂未启用"

## 未来改进

1. **云存储集成**
   - Cloudinary（推荐）
   - AWS S3
   - 阿里云OSS

2. **图片处理**
   - 自动压缩
   - 格式转换
   - 尺寸裁剪

3. **性能优化**
   - CDN加速
   - 缓存策略
   - 懒加载

## 测试脚本

运行测试脚本验证功能：

```bash
./test-avatar-upload.sh
```

该脚本会检查：
- 环境变量配置
- 依赖包安装
- 目录结构
- 服务运行状态
