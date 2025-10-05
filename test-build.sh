#!/bin/bash

# MyGYMPartner 构建测试脚本

echo "🧪 MyGYMPartner 构建测试"
echo "================================"

# 检查是否在正确的目录
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📦 测试后端构建..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi

npm run build
if [ $? -eq 0 ]; then
    echo "✅ 后端构建成功"
else
    echo "❌ 后端构建失败"
    exit 1
fi

cd ..

echo "📦 测试前端构建..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi

npm run build
if [ $? -eq 0 ]; then
    echo "✅ 前端构建成功"
else
    echo "❌ 前端构建失败"
    exit 1
fi

cd ..

echo ""
echo "🎉 所有构建测试通过！"
echo ""
echo "📋 下一步操作："
echo "1. 查看 DEPLOYMENT.md 了解详细部署步骤"
echo "2. 配置环境变量"
echo "3. 部署到 Railway (后端) 和 Vercel (前端)"
echo ""
echo "🚀 准备就绪，可以开始部署了！"
