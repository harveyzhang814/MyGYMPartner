#!/bin/bash

# Railway 部署修复脚本

echo "🔧 Railway 部署修复脚本"
echo "================================"

# 检查是否在正确的目录
if [ ! -f "backend/package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📋 修复步骤："
echo "1. 检查 Railway 项目根目录设置"
echo "2. 验证文件结构"
echo "3. 推送修复代码"
echo ""

# 检查文件结构
echo "🔍 检查文件结构..."
if [ ! -f "backend/prisma/schema.prisma" ]; then
    echo "❌ 错误: backend/prisma/schema.prisma 文件不存在"
    exit 1
fi

if [ ! -f "backend/railway.toml" ]; then
    echo "❌ 错误: backend/railway.toml 文件不存在"
    exit 1
fi

if [ ! -f "backend/railway-build.sh" ]; then
    echo "❌ 错误: backend/railway-build.sh 文件不存在"
    exit 1
fi

echo "✅ 所有必要文件存在"

# 检查 package.json 配置
echo "🔍 检查 package.json 配置..."
if grep -q "prisma generate --schema=" backend/package.json; then
    echo "✅ package.json 已包含 schema 路径配置"
else
    echo "❌ 错误: package.json 缺少 schema 路径配置"
    exit 1
fi

# 本地构建测试
echo "🧪 本地构建测试..."
cd backend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ 本地构建成功"
else
    echo "❌ 本地构建失败"
    exit 1
fi

cd ..

# 显示修复总结
echo ""
echo "🎯 修复总结："
echo "✅ 文件结构正确"
echo "✅ package.json 配置正确"
echo "✅ 本地构建成功"
echo ""
echo "📋 下一步操作："
echo "1. 确保 Railway 项目根目录设置为 'backend' 文件夹"
echo "2. 推送代码到 GitHub:"
echo "   git add ."
echo "   git commit -m 'fix: Railway Prisma schema configuration'"
echo "   git push origin staging"
echo "3. 在 Railway 中重新部署项目"
echo "4. 验证部署: curl https://your-backend.railway.app/health"
echo ""
echo "🔗 详细指南: RAILWAY-DEPLOYMENT-GUIDE.md"
echo "🚀 准备就绪，可以重新部署了！"
