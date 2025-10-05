#!/bin/bash

# Railway 构建脚本
echo "🚀 开始 Railway 构建..."

# 安装依赖
echo "📦 安装依赖..."
npm install

# 检查 Prisma schema 文件
echo "🔍 检查 Prisma schema..."
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ 错误: 找不到 prisma/schema.prisma 文件"
    echo "📁 当前目录内容:"
    ls -la
    echo "📁 prisma 目录内容:"
    ls -la prisma/ 2>/dev/null || echo "prisma 目录不存在"
    exit 1
fi

echo "✅ Prisma schema 文件存在"

# 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma 客户端生成失败"
    exit 1
fi

echo "✅ Prisma 客户端生成成功"

# 构建项目
echo "🏗️ 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

echo "✅ 项目构建成功"
echo "🎉 Railway 构建完成！"