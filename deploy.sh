#!/bin/bash

# MyGYMPartner 快速部署脚本
# 用于测试环境部署

echo "🚀 MyGYMPartner 部署脚本"
echo "================================"

# 检查是否在正确的目录
if [ ! -f "package.json" ] && [ ! -f "backend/package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到 .env 文件"
    echo "请复制 env.template 为 .env 并填写必要的环境变量"
    echo ""
    read -p "是否现在创建 .env 文件? (y/n): " create_env
    if [ "$create_env" = "y" ] || [ "$create_env" = "Y" ]; then
        cp env.template .env
        echo "✅ 已创建 .env 文件，请编辑后重新运行脚本"
        exit 0
    fi
fi

echo "📋 部署选项:"
echo "1. 本地构建测试"
echo "2. 部署到测试环境"
echo "3. 部署到生产环境"
echo ""

read -p "请选择部署选项 (1-3): " deploy_option

case $deploy_option in
    1)
        echo "🔧 开始本地构建测试..."
        
        # 测试后端构建
        echo "构建后端..."
        cd backend
        npm install
        npm run build
        if [ $? -eq 0 ]; then
            echo "✅ 后端构建成功"
        else
            echo "❌ 后端构建失败"
            exit 1
        fi
        
        cd ..
        
        # 测试前端构建
        echo "构建前端..."
        cd frontend
        npm install
        npm run build
        if [ $? -eq 0 ]; then
            echo "✅ 前端构建成功"
        else
            echo "❌ 前端构建失败"
            exit 1
        fi
        
        cd ..
        
        echo "✅ 本地构建测试完成！"
        ;;
        
    2)
        echo "🚀 部署到测试环境..."
        echo ""
        echo "请按照以下步骤操作："
        echo "1. 确保已创建 staging 分支"
        echo "2. 推送代码到 staging 分支"
        echo "3. 在 Railway 中创建测试环境项目"
        echo "4. 在 Vercel 中创建测试环境项目"
        echo "5. 配置相应的环境变量"
        echo ""
        echo "详细步骤请参考 DEPLOYMENT.md 文档"
        ;;
        
    3)
        echo "🚀 部署到生产环境..."
        echo ""
        echo "请按照以下步骤操作："
        echo "1. 确保代码已合并到 main 分支"
        echo "2. 在 Railway 中创建生产环境项目"
        echo "3. 在 Vercel 中创建生产环境项目"
        echo "4. 配置生产环境变量"
        echo "5. 运行数据库迁移"
        echo ""
        echo "详细步骤请参考 DEPLOYMENT.md 文档"
        ;;
        
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "📖 更多信息请查看 DEPLOYMENT.md 文档"
