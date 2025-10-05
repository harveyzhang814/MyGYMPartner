#!/bin/bash

# MyGYMPartner Railway 部署测试脚本
# 测试地址: mygympartner-production.up.railway.app

echo "🧪 MyGYMPartner Railway 部署测试"
echo "=================================="
echo "测试地址: https://mygympartner-production.up.railway.app"
echo ""

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
test_endpoint() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    local description="$4"
    
    echo -n "🔍 测试 $test_name: "
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # 执行请求
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ 通过${NC} (HTTP $http_code)"
        echo "   📝 $description"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ 失败${NC} (期望 HTTP $expected_status, 实际 HTTP $http_code)"
        echo "   📝 $description"
        echo "   📄 响应内容: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 测试 CORS 函数
test_cors() {
    local test_name="$1"
    local url="$2"
    local origin="$3"
    local description="$4"
    
    echo -n "🔍 测试 $test_name (CORS): "
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # 执行 CORS 预检请求
    response=$(curl -s -w "\n%{http_code}" -H "Origin: $origin" -H "Access-Control-Request-Method: GET" -X OPTIONS "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
        echo -e "${GREEN}✅ 通过${NC} (HTTP $http_code)"
        echo "   📝 $description"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ 失败${NC} (HTTP $http_code)"
        echo "   📝 $description"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 基础 URL
BASE_URL="https://mygympartner-production.up.railway.app"

echo -e "${BLUE}📋 开始测试 Railway 部署...${NC}"
echo ""

# 1. 健康检查测试
echo -e "${YELLOW}🏥 健康检查测试${NC}"
test_endpoint "健康检查" "$BASE_URL/health" "200" "服务器健康状态检查"
echo ""

# 2. API 端点测试
echo -e "${YELLOW}🔗 API 端点测试${NC}"
test_endpoint "基础练习列表" "$BASE_URL/api/exercises" "200" "获取基础练习列表（无需认证）"
test_endpoint "训练组列表" "$BASE_URL/api/training-groups" "401" "获取训练组列表（需要认证）"
test_endpoint "训练计划列表" "$BASE_URL/api/training-plans" "401" "获取训练计划列表（需要认证）"
test_endpoint "运动会话列表" "$BASE_URL/api/exercise-sessions" "401" "获取运动会话列表（需要认证）"
echo ""

# 3. 认证端点测试
echo -e "${YELLOW}🔐 认证端点测试${NC}"
test_endpoint "用户注册" "$BASE_URL/api/auth/register" "400" "用户注册端点（缺少必要参数）"
test_endpoint "用户登录" "$BASE_URL/api/auth/login" "400" "用户登录端点（缺少必要参数）"
echo ""

# 4. CORS 测试
echo -e "${YELLOW}🌐 CORS 测试${NC}"
test_cors "Vercel 前端 CORS" "$BASE_URL/health" "https://mygympartner.vercel.app" "测试 Vercel 前端的 CORS 配置"
test_cors "本地开发 CORS" "$BASE_URL/health" "http://localhost:5173" "测试本地开发的 CORS 配置"
echo ""

# 5. 错误处理测试
echo -e "${YELLOW}⚠️  错误处理测试${NC}"
test_endpoint "404 错误" "$BASE_URL/api/nonexistent" "404" "测试不存在的端点"
test_endpoint "方法不支持" "$BASE_URL/health" "200" "测试 GET 方法支持"
echo ""

# 6. 安全头测试
echo -e "${YELLOW}🛡️  安全头测试${NC}"
echo -n "🔍 测试安全头: "
TOTAL_TESTS=$((TOTAL_TESTS + 1))

headers=$(curl -s -I "$BASE_URL/health" 2>/dev/null)
if echo "$headers" | grep -q "strict-transport-security" && \
   echo "$headers" | grep -q "x-content-type-options" && \
   echo "$headers" | grep -q "x-frame-options"; then
    echo -e "${GREEN}✅ 通过${NC}"
    echo "   📝 安全头配置正确（HSTS, X-Content-Type-Options, X-Frame-Options）"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ 失败${NC}"
    echo "   📝 缺少必要的安全头"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# 7. SSL/TLS 测试
echo -e "${YELLOW}🔒 SSL/TLS 测试${NC}"
echo -n "🔍 测试 SSL 证书: "
TOTAL_TESTS=$((TOTAL_TESTS + 1))

ssl_info=$(curl -s -I "$BASE_URL/health" 2>/dev/null | head -1)
if [[ "$ssl_info" == *"HTTP/2 200"* ]]; then
    echo -e "${GREEN}✅ 通过${NC}"
    echo "   📝 SSL/TLS 配置正确，使用 HTTP/2"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ 失败${NC}"
    echo "   📝 SSL/TLS 配置可能有问题"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# 测试总结
echo -e "${BLUE}📊 测试总结${NC}"
echo "=================================="
echo "总测试数: $TOTAL_TESTS"
echo -e "通过测试: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败测试: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 所有测试通过！Railway 部署成功！${NC}"
    echo ""
    echo -e "${BLUE}📋 部署验证清单：${NC}"
    echo "✅ 服务器健康状态正常"
    echo "✅ API 端点响应正确"
    echo "✅ 认证机制工作正常"
    echo "✅ CORS 配置正确"
    echo "✅ 错误处理完善"
    echo "✅ 安全头配置正确"
    echo "✅ SSL/TLS 配置正确"
    echo ""
    echo -e "${GREEN}🚀 你的应用已经准备就绪！${NC}"
    echo "前端可以连接到: https://mygympartner-production.up.railway.app/api"
else
    echo ""
    echo -e "${RED}⚠️  有 $FAILED_TESTS 个测试失败，请检查部署配置${NC}"
    echo ""
    echo -e "${YELLOW}🔧 故障排除建议：${NC}"
    echo "1. 检查 Railway 项目日志"
    echo "2. 验证环境变量配置"
    echo "3. 确认数据库连接"
    echo "4. 检查 CORS 设置"
fi

echo ""
echo -e "${BLUE}📖 更多信息：${NC}"
echo "- Railway 项目仪表板: https://railway.app/dashboard"
echo "- 部署日志: Railway 项目 → Deployments → 查看日志"
echo "- 环境变量: Railway 项目 → Variables"
echo ""
