#!/bin/bash

# MyGYMPartner 本地开发环境设置脚本
# 适用于新用户首次设置本地开发环境

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 MyGYMPartner 本地开发环境设置${NC}"
echo "=========================================="
echo ""

# 检查系统要求
check_requirements() {
    echo -e "${BLUE}📋 检查系统要求...${NC}"
    
    # 检查操作系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "✅ macOS 系统"
        OS="macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "✅ Linux 系统"
        OS="linux"
    else
        echo -e "${RED}❌ 不支持的操作系统: $OSTYPE${NC}"
        exit 1
    fi
    
    # 检查 Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "✅ Node.js: $NODE_VERSION"
        
        # 检查版本是否 >= 18
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            echo -e "${RED}❌ Node.js 版本过低，需要 18+ 版本${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ 未找到 Node.js，请先安装 Node.js 18+${NC}"
        echo "   安装地址: https://nodejs.org/"
        exit 1
    fi
    
    # 检查 npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo "✅ npm: $NPM_VERSION"
    else
        echo -e "${RED}❌ 未找到 npm${NC}"
        exit 1
    fi
    
    # 检查 PostgreSQL
    if command -v psql &> /dev/null; then
        echo "✅ PostgreSQL 已安装"
    else
        echo -e "${YELLOW}⚠️ 未找到 PostgreSQL，将尝试安装...${NC}"
        install_postgresql
    fi
    
    echo ""
}

# 安装 PostgreSQL
install_postgresql() {
    if [[ "$OS" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            echo "📦 使用 Homebrew 安装 PostgreSQL..."
            brew install postgresql@15
            brew services start postgresql@15
            echo "✅ PostgreSQL 安装完成"
        else
            echo -e "${RED}❌ 请先安装 Homebrew: https://brew.sh/${NC}"
            exit 1
        fi
    elif [[ "$OS" == "linux" ]]; then
        echo "📦 安装 PostgreSQL..."
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        echo "✅ PostgreSQL 安装完成"
    fi
}

# 设置数据库
setup_database() {
    echo -e "${BLUE}🗄️ 设置数据库...${NC}"
    
    # 创建数据库
    if [[ "$OS" == "macos" ]]; then
        export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
    fi
    
    # 检查数据库是否存在
    if psql -lqt | cut -d \| -f 1 | grep -qw mygympartner_dev; then
        echo "✅ 数据库 mygympartner_dev 已存在"
    else
        echo "📝 创建数据库 mygympartner_dev..."
        createdb mygympartner_dev
        echo "✅ 数据库创建成功"
    fi
    
    echo ""
}

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}📦 安装项目依赖...${NC}"
    
    # 安装根目录依赖
    echo "📦 安装根目录依赖..."
    npm install
    
    # 安装后端依赖
    echo "📦 安装后端依赖..."
    cd backend
    npm install
    cd ..
    
    # 安装前端依赖
    echo "📦 安装前端依赖..."
    cd frontend
    npm install
    cd ..
    
    echo "✅ 所有依赖安装完成"
    echo ""
}

# 配置环境变量
setup_environment() {
    echo -e "${BLUE}🔧 配置环境变量...${NC}"
    
    # 后端环境配置
    if [ ! -f "backend/.env" ]; then
        echo "📝 创建后端环境配置..."
        cp backend/env.local.template backend/.env
        
        # 替换数据库URL中的用户名
        if [[ "$OS" == "macos" ]]; then
            sed -i '' "s/\$(whoami)/$(whoami)/g" backend/.env
        else
            sed -i "s/\$(whoami)/$(whoami)/g" backend/.env
        fi
        
        echo "✅ 后端环境配置已创建"
    else
        echo "✅ 后端环境配置已存在"
    fi
    
    # 前端环境配置
    if [ ! -f "frontend/.env.local" ]; then
        echo "📝 创建前端环境配置..."
        cp frontend/env.local.template frontend/.env.local
        echo "✅ 前端环境配置已创建"
    else
        echo "✅ 前端环境配置已存在"
    fi
    
    echo ""
}

# 初始化数据库
init_database() {
    echo -e "${BLUE}🗄️ 初始化数据库...${NC}"
    
    cd backend
    
    # 生成 Prisma 客户端
    echo "🔧 生成 Prisma 客户端..."
    npx prisma generate
    
    # 推送数据库模式
    echo "📊 推送数据库模式..."
    npx prisma db push
    
    # 初始化基础数据
    echo "📝 初始化基础数据..."
    npm run db:init
    
    cd ..
    
    echo "✅ 数据库初始化完成"
    echo ""
}

# 验证设置
verify_setup() {
    echo -e "${BLUE}🧪 验证设置...${NC}"
    
    # 检查后端健康状态
    echo -n "🔍 检查后端服务... "
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 运行中${NC}"
    else
        echo -e "${YELLOW}⚠️ 后端服务未运行${NC}"
    fi
    
    # 检查前端服务
    echo -n "🔍 检查前端服务... "
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 运行中${NC}"
    else
        echo -e "${YELLOW}⚠️ 前端服务未运行${NC}"
    fi
    
    echo ""
}

# 显示使用说明
show_usage() {
    echo -e "${GREEN}🎉 本地开发环境设置完成！${NC}"
    echo ""
    echo -e "${BLUE}📋 启动方法：${NC}"
    echo "  方法一: ./start-dev.sh"
    echo "  方法二: npm run dev"
    echo "  方法三: 分别启动前后端"
    echo ""
    echo -e "${BLUE}🌐 访问地址：${NC}"
    echo "  前端应用: http://localhost:5173"
    echo "  后端API: http://localhost:3001"
    echo "  健康检查: http://localhost:3001/health"
    echo ""
    echo -e "${BLUE}🧪 测试命令：${NC}"
    echo "  ./quick-test.sh     # 快速测试"
    echo "  ./test-connections.sh  # 完整测试"
    echo ""
    echo -e "${BLUE}📚 更多信息：${NC}"
    echo "  查看 README.md 了解详细说明"
    echo "  查看 LOCAL-DEV.md 了解开发指南"
    echo ""
}

# 主函数
main() {
    check_requirements
    setup_database
    install_dependencies
    setup_environment
    init_database
    verify_setup
    show_usage
}

# 运行主函数
main
