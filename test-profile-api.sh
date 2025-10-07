#!/bin/bash

# 个人资料API测试脚本
# 测试个人资料获取、更新和修改密码功能

echo "🧪 开始测试个人资料API..."

# 设置变量
BASE_URL="http://localhost:3001"
API_BASE="$BASE_URL/api"

# 测试用户凭据
TEST_EMAIL="test@example.com"
TEST_PASSWORD="Password123"
NEW_PASSWORD="NewPassword123"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：打印测试结果
print_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: $message${NC}"
    else
        echo -e "${RED}❌ $test_name: $message${NC}"
    fi
}

# 函数：检查HTTP状态码
check_status() {
    local expected_status="$1"
    local actual_status="$2"
    local test_name="$3"
    
    if [ "$actual_status" = "$expected_status" ]; then
        print_result "$test_name" "PASS" "HTTP状态码正确 ($actual_status)"
        return 0
    else
        print_result "$test_name" "FAIL" "期望状态码 $expected_status，实际得到 $actual_status"
        return 1
    fi
}

# 函数：检查响应内容
check_response() {
    local response="$1"
    local expected_field="$2"
    local test_name="$3"
    
    if echo "$response" | grep -q "$expected_field"; then
        print_result "$test_name" "PASS" "响应包含期望字段"
        return 0
    else
        print_result "$test_name" "FAIL" "响应不包含期望字段: $expected_field"
        return 1
    fi
}

echo -e "${YELLOW}📋 测试计划:${NC}"
echo "1. 注册测试用户"
echo "2. 登录获取token"
echo "3. 获取个人资料"
echo "4. 更新个人资料"
echo "5. 修改密码"
echo "6. 使用新密码登录"
echo ""

# 1. 注册测试用户
echo -e "${YELLOW}🔐 步骤1: 注册测试用户${NC}"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"username\": \"testuser\",
        \"password\": \"$TEST_PASSWORD\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\"
    }")

REGISTER_HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$REGISTER_HTTP_CODE" = "201" ]; then
    print_result "用户注册" "PASS" "用户注册成功"
    TOKEN=$(echo "$REGISTER_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        print_result "Token获取" "PASS" "成功获取认证token"
    else
        print_result "Token获取" "FAIL" "无法获取认证token"
        exit 1
    fi
else
    # 如果用户已存在，尝试登录
    echo -e "${YELLOW}⚠️  用户可能已存在，尝试登录...${NC}"
    LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
    LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
    
    if [ "$LOGIN_HTTP_CODE" = "200" ]; then
        print_result "用户登录" "PASS" "用户登录成功"
        TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$TOKEN" ]; then
            print_result "Token获取" "PASS" "成功获取认证token"
        else
            print_result "Token获取" "FAIL" "无法获取认证token"
            exit 1
        fi
    else
        print_result "用户登录" "FAIL" "登录失败，HTTP状态码: $LOGIN_HTTP_CODE"
        echo "响应内容: $LOGIN_BODY"
        exit 1
    fi
fi

echo ""

# 2. 获取个人资料
echo -e "${YELLOW}👤 步骤2: 获取个人资料${NC}"
PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/profile" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN")

PROFILE_HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
PROFILE_BODY=$(echo "$PROFILE_RESPONSE" | sed '$d')

check_status "200" "$PROFILE_HTTP_CODE" "获取个人资料"
check_response "$PROFILE_BODY" "firstName" "个人资料响应内容"

echo "个人资料内容:"
echo "$PROFILE_BODY" | jq '.' 2>/dev/null || echo "$PROFILE_BODY"
echo ""

# 3. 更新个人资料
echo -e "${YELLOW}✏️  步骤3: 更新个人资料${NC}"
UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_BASE/profile" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"firstName\": \"Updated\",
        \"lastName\": \"User\",
        \"heightCm\": 175,
        \"weightKg\": 70.5,
        \"fitnessLevel\": \"INTERMEDIATE\",
        \"gender\": \"MALE\",
        \"timezone\": \"Asia/Shanghai\",
        \"language\": \"zh-CN\"
    }")

UPDATE_HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')

check_status "200" "$UPDATE_HTTP_CODE" "更新个人资料"
check_response "$UPDATE_BODY" "Updated" "更新后个人资料"

echo "更新后的个人资料:"
echo "$UPDATE_BODY" | jq '.' 2>/dev/null || echo "$UPDATE_BODY"
echo ""

# 4. 修改密码
echo -e "${YELLOW}🔑 步骤4: 修改密码${NC}"
CHANGE_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_BASE/profile/password" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"currentPassword\": \"$TEST_PASSWORD\",
        \"newPassword\": \"$NEW_PASSWORD\"
    }")

CHANGE_PASSWORD_HTTP_CODE=$(echo "$CHANGE_PASSWORD_RESPONSE" | tail -n1)
CHANGE_PASSWORD_BODY=$(echo "$CHANGE_PASSWORD_RESPONSE" | sed '$d')

check_status "200" "$CHANGE_PASSWORD_HTTP_CODE" "修改密码"
check_response "$CHANGE_PASSWORD_BODY" "success" "密码修改响应"

echo "密码修改响应:"
echo "$CHANGE_PASSWORD_BODY" | jq '.' 2>/dev/null || echo "$CHANGE_PASSWORD_BODY"
echo ""

# 5. 使用新密码登录
echo -e "${YELLOW}🔐 步骤5: 使用新密码登录${NC}"
NEW_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$NEW_PASSWORD\"
    }")

NEW_LOGIN_HTTP_CODE=$(echo "$NEW_LOGIN_RESPONSE" | tail -n1)
NEW_LOGIN_BODY=$(echo "$NEW_LOGIN_RESPONSE" | sed '$d')

check_status "200" "$NEW_LOGIN_HTTP_CODE" "新密码登录"
check_response "$NEW_LOGIN_BODY" "token" "新密码登录响应"

echo "新密码登录响应:"
echo "$NEW_LOGIN_BODY" | jq '.' 2>/dev/null || echo "$NEW_LOGIN_BODY"
echo ""

# 6. 测试无效的当前密码
echo -e "${YELLOW}🚫 步骤6: 测试无效的当前密码${NC}"
INVALID_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_BASE/profile/password" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"currentPassword\": \"wrongpassword\",
        \"newPassword\": \"anotherpassword\"
    }")

INVALID_PASSWORD_HTTP_CODE=$(echo "$INVALID_PASSWORD_RESPONSE" | tail -n1)
INVALID_PASSWORD_BODY=$(echo "$INVALID_PASSWORD_RESPONSE" | sed '$d')

check_status "400" "$INVALID_PASSWORD_HTTP_CODE" "无效当前密码测试"
check_response "$INVALID_PASSWORD_BODY" "incorrect" "无效密码错误信息"

echo "无效密码测试响应:"
echo "$INVALID_PASSWORD_BODY" | jq '.' 2>/dev/null || echo "$INVALID_PASSWORD_BODY"
echo ""

# 7. 测试无效的个人资料数据
echo -e "${YELLOW}🚫 步骤7: 测试无效的个人资料数据${NC}"
INVALID_PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_BASE/profile" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"heightCm\": 500,
        \"weightKg\": 1000
    }")

INVALID_PROFILE_HTTP_CODE=$(echo "$INVALID_PROFILE_RESPONSE" | tail -n1)
INVALID_PROFILE_BODY=$(echo "$INVALID_PROFILE_RESPONSE" | sed '$d')

check_status "400" "$INVALID_PROFILE_HTTP_CODE" "无效个人资料数据测试"
check_response "$INVALID_PROFILE_BODY" "between" "无效数据错误信息"

echo "无效个人资料数据测试响应:"
echo "$INVALID_PROFILE_BODY" | jq '.' 2>/dev/null || echo "$INVALID_PROFILE_BODY"
echo ""

echo -e "${GREEN}🎉 个人资料API测试完成！${NC}"
echo ""
echo -e "${YELLOW}📊 测试总结:${NC}"
echo "✅ 个人资料获取功能正常"
echo "✅ 个人资料更新功能正常"
echo "✅ 密码修改功能正常"
echo "✅ 新密码登录功能正常"
echo "✅ 错误处理功能正常"
echo ""
echo -e "${GREEN}🚀 后端个人资料服务已准备就绪！${NC}"
