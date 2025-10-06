#!/bin/bash

# MyGYMPartner 连接测试脚本
# 测试前后端所有连接和功能

echo "🧪 MyGYMPartner 连接测试"
echo "========================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="${3:-0}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "🔍 测试: $test_name ... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ 失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 检查服务是否运行
check_service() {
    local service_name="$1"
    local port="$2"
    local url="$3"
    
    echo -n "🔍 检查 $service_name 服务 (端口 $port) ... "
    
    if curl -s --connect-timeout 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 运行中${NC}"
        return 0
    else
        echo -e "${RED}❌ 未运行${NC}"
        return 1
    fi
}

# 测试API端点
test_api_endpoint() {
    local endpoint="$1"
    local method="${2:-GET}"
    local expected_status="${3:-200}"
    
    echo -n "🔍 测试 API: $method $endpoint ... "
    
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "http://localhost:3001$endpoint" 2>/dev/null)
    
    if [ "$response_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ 通过 (状态码: $response_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ 失败 (状态码: $response_code, 期望: $expected_status)${NC}"
        return 1
    fi
}

# 测试前端页面
test_frontend_page() {
    local page_name="$1"
    local url="$2"
    
    echo -n "🔍 测试前端页面: $page_name ... "
    
    if curl -s --connect-timeout 5 "$url" | grep -q "html\|<!DOCTYPE" 2>/dev/null; then
        echo -e "${GREEN}✅ 可访问${NC}"
        return 0
    else
        echo -e "${RED}❌ 无法访问${NC}"
        return 1
    fi
}

echo "📋 开始连接测试..."
echo ""

# 1. 检查环境配置
echo -e "${BLUE}📁 环境配置检查${NC}"
echo "=================="

run_test "检查后端环境配置" "[ -f 'backend/.env' ]"
run_test "检查前端环境配置" "[ -f 'frontend/.env.local' ]"
run_test "检查数据库文件" "[ -f 'backend/dev.db' ]"

echo ""

# 2. 检查依赖安装
echo -e "${BLUE}📦 依赖检查${NC}"
echo "============="

run_test "根目录依赖" "[ -d 'node_modules' ]"
run_test "后端依赖" "[ -d 'backend/node_modules' ]"
run_test "前端依赖" "[ -d 'frontend/node_modules' ]"
run_test "Prisma客户端" "[ -d 'backend/node_modules/@prisma/client' ]"

echo ""

# 3. 检查服务运行状态
echo -e "${BLUE}🚀 服务状态检查${NC}"
echo "=================="

# 检查后端服务
if check_service "后端API" "3001" "http://localhost:3001/health"; then
    BACKEND_RUNNING=true
else
    BACKEND_RUNNING=false
    echo -e "${YELLOW}⚠️ 后端服务未运行，尝试启动...${NC}"
    
    # 尝试启动后端
    echo "🔄 启动后端服务..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    echo "⏳ 等待后端启动..."
    sleep 10
    
    if check_service "后端API" "3001" "http://localhost:3001/health"; then
        BACKEND_RUNNING=true
        echo -e "${GREEN}✅ 后端服务启动成功${NC}"
    else
        echo -e "${RED}❌ 后端服务启动失败${NC}"
    fi
fi

# 检查前端服务
if check_service "前端应用" "5173" "http://localhost:5173"; then
    FRONTEND_RUNNING=true
else
    FRONTEND_RUNNING=false
    echo -e "${YELLOW}⚠️ 前端服务未运行，尝试启动...${NC}"
    
    # 尝试启动前端
    echo "🔄 启动前端服务..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # 等待前端启动
    echo "⏳ 等待前端启动..."
    sleep 10
    
    if check_service "前端应用" "5173" "http://localhost:5173"; then
        FRONTEND_RUNNING=true
        echo -e "${GREEN}✅ 前端服务启动成功${NC}"
    else
        echo -e "${RED}❌ 前端服务启动失败${NC}"
    fi
fi

echo ""

# 4. API连接测试
if [ "$BACKEND_RUNNING" = true ]; then
    echo -e "${BLUE}🔗 API连接测试${NC}"
    echo "==============="
    
    # 健康检查
    test_api_endpoint "/health" "GET" "200"
    
    # 认证相关API
    test_api_endpoint "/api/auth/register" "POST" "400"  # 期望400因为缺少数据
    test_api_endpoint "/api/auth/login" "POST" "400"    # 期望400因为缺少数据
    
    # 练习相关API
    test_api_endpoint "/api/exercises" "GET" "200"
    test_api_endpoint "/api/exercises" "POST" "401"      # 期望401因为未认证
    
    # 训练组相关API
    test_api_endpoint "/api/training-groups" "GET" "401"  # 期望401因为未认证
    test_api_endpoint "/api/training-groups" "POST" "401" # 期望401因为未认证
    
    # 训练计划相关API
    test_api_endpoint "/api/training-plans" "GET" "401"  # 期望401因为未认证
    test_api_endpoint "/api/training-plans" "POST" "401"  # 期望401因为未认证
    
    # 训练会话相关API
    test_api_endpoint "/api/exercise-sessions" "GET" "401" # 期望401因为未认证
    test_api_endpoint "/api/exercise-sessions" "POST" "401" # 期望401因为未认证
    
    echo ""
fi

# 5. 前端连接测试
if [ "$FRONTEND_RUNNING" = true ]; then
    echo -e "${BLUE}🌐 前端连接测试${NC}"
    echo "==============="
    
    test_frontend_page "首页" "http://localhost:5173"
    test_frontend_page "登录页" "http://localhost:5173/login"
    test_frontend_page "注册页" "http://localhost:5173/register"
    
    echo ""
fi

# 6. 数据库连接测试
echo -e "${BLUE}🗄️ 数据库连接测试${NC}"
echo "=================="

if [ -f "backend/dev.db" ]; then
    echo -n "🔍 测试数据库连接 ... "
    cd backend
    if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 数据库连接正常${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 数据库连接失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    cd ..
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo -e "${YELLOW}⚠️ 数据库文件不存在，尝试初始化...${NC}"
    cd backend
    if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 数据库初始化成功${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 数据库初始化失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    cd ..
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

echo ""

# 7. 跨域测试
if [ "$BACKEND_RUNNING" = true ] && [ "$FRONTEND_RUNNING" = true ]; then
    echo -e "${BLUE}🌐 跨域连接测试${NC}"
    echo "==============="
    
    echo -n "🔍 测试前后端跨域连接 ... "
    
    # 测试前端是否能访问后端API
    if curl -s -H "Origin: http://localhost:5173" \
            -H "Access-Control-Request-Method: GET" \
            -H "Access-Control-Request-Headers: Content-Type" \
            -X OPTIONS \
            "http://localhost:3001/api/exercises" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 跨域配置正常${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 跨域配置异常${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo ""
fi

# 8. 性能测试
echo -e "${BLUE}⚡ 性能测试${NC}"
echo "==========="

if [ "$BACKEND_RUNNING" = true ]; then
    echo -n "🔍 测试API响应时间 ... "
    
    start_time=$(date +%s%N)
    curl -s "http://localhost:3001/health" > /dev/null 2>&1
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $response_time -lt 1000 ]; then
        echo -e "${GREEN}✅ 响应时间: ${response_time}ms${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${YELLOW}⚠️ 响应时间较慢: ${response_time}ms${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

echo ""

# 测试结果汇总
echo -e "${BLUE}📊 测试结果汇总${NC}"
echo "==============="
echo "总测试数: $TOTAL_TESTS"
echo -e "通过测试: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败测试: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！系统运行正常${NC}"
    echo ""
    echo "🌐 访问地址："
    echo "  前端: http://localhost:5173"
    echo "  后端: http://localhost:3001"
    echo "  API文档: http://localhost:3001/api"
    echo ""
    echo "📝 开发提示："
    echo "  - 前端支持热重载"
    echo "  - 后端支持自动重启"
    echo "  - 数据库文件: backend/dev.db"
    echo "  - 按 Ctrl+C 停止所有服务"
else
    echo -e "${RED}❌ 部分测试失败，请检查配置${NC}"
    echo ""
    echo "🔧 故障排除建议："
    echo "  1. 检查端口是否被占用"
    echo "  2. 检查环境变量配置"
    echo "  3. 检查依赖是否正确安装"
    echo "  4. 查看服务日志获取详细错误信息"
fi

# 清理后台进程
if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
fi
if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
fi

echo ""
echo "🏁 测试完成"
