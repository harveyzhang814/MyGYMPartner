#!/bin/bash

# MyGYMPartner 本地开发启动脚本
# 快速启动已配置好的开发环境

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 MyGYMPartner 本地开发环境启动${NC}"
echo "======================================"
echo ""

# 检查环境是否已设置
check_setup() {
    echo -e "${BLUE}🔍 检查开发环境...${NC}"
    
    # 检查环境配置文件
    if [ ! -f "backend/.env" ] || [ ! -f "frontend/.env.local" ]; then
        echo -e "${RED}❌ 环境配置不完整${NC}"
        echo -e "${YELLOW}💡 请先运行: ./setup-local.sh${NC}"
        exit 1
    fi
    
    # 检查依赖
    if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}⚠️ 依赖未安装，正在安装...${NC}"
        npm run install:all
    fi
    
    # 检查数据库
    if ! psql -lqt | cut -d \| -f 1 | grep -qw mygympartner_dev; then
        echo -e "${YELLOW}⚠️ 数据库不存在，正在创建...${NC}"
        createdb mygympartner_dev
        cd backend
        npx prisma db push
        npm run db:init
        cd ..
    fi
    
    echo -e "${GREEN}✅ 环境检查完成${NC}"
    echo ""
}

# 启动服务
start_services() {
    echo -e "${BLUE}🚀 启动开发服务器...${NC}"
    echo "📝 后端: http://localhost:3001"
    echo "📝 前端: http://localhost:5173"
    echo "📝 按 Ctrl+C 停止所有服务"
    echo ""
    
    # 使用 concurrently 启动服务
    if command -v npx &> /dev/null; then
        npx concurrently \
            --names "后端,前端" \
            --prefix-colors "blue,green" \
            "cd backend && npm run dev" \
            "cd frontend && npm run dev"
    else
        echo -e "${YELLOW}⚠️ 未找到 concurrently，将分别启动服务${NC}"
        echo "请在两个终端中分别运行："
        echo "终端1: cd backend && npm run dev"
        echo "终端2: cd frontend && npm run dev"
    fi
}

# 主函数
main() {
    check_setup
    start_services
}

# 运行主函数
main
