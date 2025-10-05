#!/bin/bash

# MyGYMPartner 修复验证脚本
# 测试地址: mygympartner-production.up.railway.app

echo "🔧 MyGYMPartner 修复验证测试"
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

# 测试 POST 请求函数
test_post_endpoint() {
    local test_name="$1"
    local url="$2"
    local data="$3"
    local expected_status="$4"
    local description="$5"
    
    echo -n "🔍 测试 $test_name: "
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # 执行 POST 请求
    response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null)
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

# 基础 URL
BASE_URL="https://mygympartner-production.up.railway.app"

echo -e "${BLUE}📋 开始验证修复...${NC}"
echo ""

# 1. 健康检查测试
echo -e "${YELLOW}🏥 健康检查测试${NC}"
test_endpoint "健康检查" "$BASE_URL/health" "200" "服务器健康状态检查"
echo ""

# 2. 认证端点测试
echo -e "${YELLOW}🔐 认证端点测试${NC}"
test_post_endpoint "用户注册" "$BASE_URL/api/auth/register" '{"email":"test2@example.com","username":"testuser2","password":"Password123"}' "201" "用户注册功能"
test_post_endpoint "用户登录" "$BASE_URL/api/auth/login" '{"email":"test2@example.com","password":"Password123"}' "200" "用户登录功能"
test_post_endpoint "重复注册" "$BASE_URL/api/auth/register" '{"email":"test2@example.com","username":"testuser2","password":"Password123"}' "400" "重复注册验证"
test_post_endpoint "无效登录" "$BASE_URL/api/auth/login" '{"email":"test2@example.com","password":"wrongpassword"}' "401" "无效密码验证"
echo ""

# 3. API 端点测试
echo -e "${YELLOW}🔗 API 端点测试${NC}"
test_endpoint "基础练习列表" "$BASE_URL/api/exercises" "200" "获取基础练习列表（无需认证）"
test_endpoint "训练组列表" "$BASE_URL/api/training-groups" "401" "获取训练组列表（需要认证）"
echo ""

# 4. 错误处理测试
echo -e "${YELLOW}⚠️  错误处理测试${NC}"
test_endpoint "404 错误" "$BASE_URL/api/nonexistent" "404" "测试不存在的端点"
echo ""

# 测试总结
echo -e "${BLUE}📊 测试总结${NC}"
echo "=================================="
echo "总测试数: $TOTAL_TESTS"
echo -e "通过测试: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败测试: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 所有测试通过！修复成功！${NC}"
    echo ""
    echo -e "${BLUE}📋 修复验证清单：${NC}"
    echo "✅ 认证路由正常工作"
    echo "✅ 用户注册功能正常"
    echo "✅ 用户登录功能正常"
    echo "✅ 错误处理正确"
    echo "✅ 404 错误状态码正确"
    echo ""
    echo -e "${GREEN}🚀 你的应用现在完全正常工作了！${NC}"
else
    echo ""
    echo -e "${RED}⚠️  有 $FAILED_TESTS 个测试失败，可能需要等待部署完成${NC}"
    echo ""
    echo -e "${YELLOW}🔧 建议：${NC}"
    echo "1. 等待 Railway 重新部署完成（通常需要 2-3 分钟）"
    echo "2. 检查 Railway 部署日志"
    echo "3. 重新运行此测试脚本"
fi

echo ""
echo -e "${BLUE}📖 更多信息：${NC}"
echo "- Railway 项目仪表板: https://railway.app/dashboard"
echo "- 部署状态: Railway 项目 → Deployments"
echo "- 实时日志: Railway 项目 → Deployments → 查看日志"
echo ""
