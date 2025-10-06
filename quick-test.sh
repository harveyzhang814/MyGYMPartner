#!/bin/bash

# MyGYMPartner 快速连接测试
echo "🚀 MyGYMPartner 快速连接测试"
echo "============================"

# 检查服务状态
check_service() {
    local name="$1"
    local port="$2"
    local url="$3"
    
    echo -n "🔍 检查 $name (端口 $port) ... "
    
    if curl -s --connect-timeout 3 "$url" > /dev/null 2>&1; then
        echo "✅ 运行中"
        return 0
    else
        echo "❌ 未运行"
        return 1
    fi
}

# 测试API端点
test_api() {
    local endpoint="$1"
    local method="${2:-GET}"
    local expected="${3:-200}"
    
    echo -n "🔍 测试 $method $endpoint ... "
    
    local code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "http://localhost:3001$endpoint" 2>/dev/null)
    
    if [ "$code" = "$expected" ]; then
        echo "✅ 通过 ($code)"
    else
        echo "❌ 失败 ($code, 期望: $expected)"
    fi
}

echo "📋 开始快速测试..."
echo ""

# 1. 检查服务
echo "🚀 服务状态"
echo "==========="
check_service "后端API" "3001" "http://localhost:3001/health"
check_service "前端应用" "5173" "http://localhost:5173"

echo ""

# 2. 测试API连接
echo "🔗 API测试"
echo "=========="
test_api "/health" "GET" "200"
test_api "/api/exercises" "GET" "200"
test_api "/api/auth/register" "POST" "400"

echo ""

# 3. 测试前端页面
echo "🌐 前端测试"
echo "=========="
echo -n "🔍 测试前端首页 ... "
if curl -s --connect-timeout 3 "http://localhost:5173" | grep -q "html" 2>/dev/null; then
    echo "✅ 可访问"
else
    echo "❌ 无法访问"
fi

echo ""
echo "🏁 测试完成"
echo ""
echo "🌐 访问地址："
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:3001"
