#!/bin/bash

# 项目目录结构诊断脚本

echo "🔍 MyGYMPartner 项目目录结构诊断"
echo "=================================="

# 显示当前目录
echo "📍 当前工作目录: $(pwd)"
echo ""

# 显示项目根目录结构
echo "📁 项目根目录结构:"
echo "MyGYMPartner/"
ls -la | grep -E "(backend|frontend|docs)" | sed 's/^/├── /'
echo ""

# 检查 backend 目录
echo "📁 Backend 目录结构:"
echo "backend/"
ls -la backend/ | grep -E "(prisma|src|package.json|railway.toml)" | sed 's/^/├── /'
echo ""

# 检查 prisma 目录
echo "📁 Prisma 目录结构:"
echo "backend/prisma/"
ls -la backend/prisma/ | sed 's/^/├── /'
echo ""

# 检查 frontend 目录
echo "📁 Frontend 目录结构:"
echo "frontend/"
ls -la frontend/ | grep -E "(src|package.json|vercel.json)" | sed 's/^/├── /'
echo ""

# 验证关键文件
echo "🔍 关键文件检查:"
echo ""

# 检查 backend/prisma/schema.prisma
if [ -f "backend/prisma/schema.prisma" ]; then
    echo "✅ backend/prisma/schema.prisma - 存在"
else
    echo "❌ backend/prisma/schema.prisma - 不存在"
fi

# 检查 backend/package.json
if [ -f "backend/package.json" ]; then
    echo "✅ backend/package.json - 存在"
else
    echo "❌ backend/package.json - 不存在"
fi

# 检查 backend/railway.toml
if [ -f "backend/railway.toml" ]; then
    echo "✅ backend/railway.toml - 存在"
else
    echo "❌ backend/railway.toml - 不存在"
fi

# 检查 frontend/package.json
if [ -f "frontend/package.json" ]; then
    echo "✅ frontend/package.json - 存在"
else
    echo "❌ frontend/package.json - 不存在"
fi

# 检查 frontend/vercel.json
if [ -f "frontend/vercel.json" ]; then
    echo "✅ frontend/vercel.json - 存在"
else
    echo "❌ frontend/vercel.json - 不存在"
fi

echo ""
echo "🎯 Railway 部署配置建议:"
echo ""
echo "1. 后端部署 (Railway):"
echo "   - 项目根目录: backend/"
echo "   - 应该看到的结构:"
echo "     /app (Railway 工作目录)"
echo "     ├── prisma/"
echo "     │   └── schema.prisma"
echo "     ├── src/"
echo "     ├── package.json"
echo "     └── railway.toml"
echo ""
echo "2. 前端部署 (Vercel):"
echo "   - 项目根目录: frontend/"
echo "   - 应该看到的结构:"
echo "     /app (Vercel 工作目录)"
echo "     ├── src/"
echo "     ├── package.json"
echo "     ├── vercel.json"
echo "     └── vite.config.ts"
echo ""
echo "🚨 常见错误:"
echo "   - Railway 根目录设置为项目根目录 (MyGYMPartner/)"
echo "   - 应该设置为 backend/ 文件夹"
echo ""
echo "📋 正确的 Railway 项目设置:"
echo "   1. 进入 Railway 项目设置"
echo "   2. Root Directory 设置为: backend"
echo "   3. 不是: ./backend 或 backend/"
echo "   4. 就是: backend"
