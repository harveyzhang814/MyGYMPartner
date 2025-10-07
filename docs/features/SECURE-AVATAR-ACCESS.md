# 安全头像访问控制

## 安全问题分析

### 原始问题
1. **文件路径暴露用户ID**: `avatar-${userId}-${uuidv4()}.ext`
2. **公共访问权限**: 任何人都可以通过URL直接访问头像
3. **无访问控制**: 没有验证访问者身份

## 安全解决方案

### 1. 文件命名安全化
```typescript
// 修改前：暴露用户ID
const filename = `avatar-${userId}-${uuidv4()}${ext}`;

// 修改后：仅使用UUID
const filename = `${uuidv4()}${ext}`;
```

### 2. 签名URL访问
```typescript
// 生成带签名的临时URL（24小时有效期）
const { data: signedUrlData } = await supabase.storage
  .from(STORAGE_CONFIG.BUCKET_NAME)
  .createSignedUrl(filePath, 24 * 60 * 60);
```

### 3. 权限验证API
```typescript
// 新增安全头像访问端点
GET /api/profile/avatar/:userId
- 验证访问者身份
- 只有用户本人可以访问自己的头像
- 自动生成新的签名URL
```

## Supabase RLS 策略配置

### 1. 创建安全的存储策略
```sql
-- 删除旧的公共访问策略
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- 创建新的安全策略
CREATE POLICY "Users can only access their own avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. 存储桶配置
```sql
-- 确保存储桶不是完全公开的
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';
```

## 前端安全组件

### SecureAvatar 组件
```typescript
// 自动处理头像访问权限
<SecureAvatar size={120} userId={currentUserId} />
```

### 功能特点
- 自动验证用户身份
- 动态获取签名URL
- 处理加载状态
- 错误处理

## 安全优势

### 1. 身份验证
- 只有登录用户可以访问头像
- 用户只能访问自己的头像
- 防止未授权访问

### 2. 临时访问
- 签名URL有24小时有效期
- 过期后需要重新生成
- 防止长期缓存攻击

### 3. 隐私保护
- 文件路径不暴露用户ID
- 无法通过URL猜测其他用户头像
- 防止用户信息泄露

### 4. 访问控制
- 服务端验证访问权限
- 数据库记录访问日志
- 支持访问审计

## 部署配置

### 1. Supabase 配置
```sql
-- 执行安全策略
-- 确保存储桶配置正确
-- 验证RLS策略生效
```

### 2. 环境变量
```env
# 确保Supabase配置正确
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### 3. 测试验证
```bash
# 测试头像访问权限
curl -H "Authorization: Bearer <token>" \
  https://your-api.com/api/profile/avatar/user-id

# 验证未授权访问被拒绝
curl https://your-api.com/api/profile/avatar/user-id
```

## 监控和维护

### 1. 访问日志
- 监控头像访问频率
- 检测异常访问模式
- 记录安全事件

### 2. 性能优化
- 缓存签名URL
- 优化图片加载
- 监控存储使用量

### 3. 安全审计
- 定期检查访问权限
- 验证RLS策略有效性
- 更新安全配置
