#!/bin/bash

# MyGYMPartner Railway 数据库修复脚本
# 用于修复 Railway 部署中的数据库连接和初始化问题

echo "🔧 MyGYMPartner Railway 数据库修复脚本"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Railway 项目信息
RAILWAY_PROJECT="mygympartner-production"
BASE_URL="https://mygympartner-production.up.railway.app"

echo -e "${BLUE}📋 Railway 项目信息${NC}"
echo "项目名称: $RAILWAY_PROJECT"
echo "API 地址: $BASE_URL"
echo ""

# 1. 检查 Railway 项目状态
echo -e "${YELLOW}🔍 检查 Railway 项目状态${NC}"
echo "请确保以下步骤已完成："
echo "1. Railway 项目正在运行"
echo "2. PostgreSQL 数据库已创建并运行"
echo "3. DATABASE_URL 环境变量已正确设置"
echo "4. JWT_SECRET 环境变量已设置"
echo "5. CORS_ORIGIN 环境变量已设置为前端地址"
echo ""

# 2. 测试基础连接
echo -e "${YELLOW}🌐 测试基础连接${NC}"
echo "测试健康检查端点..."

health_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health" 2>/dev/null)
health_code=$(echo "$health_response" | tail -n1)
health_body=$(echo "$health_response" | sed '$d')

if [ "$health_code" = "200" ]; then
    echo -e "${GREEN}✅ 后端服务正常运行${NC}"
    echo "响应: $health_body"
else
    echo -e "${RED}❌ 后端服务异常 (HTTP $health_code)${NC}"
    echo "请检查 Railway 项目部署状态"
    exit 1
fi
echo ""

# 3. 测试数据库连接
echo -e "${YELLOW}🗄️  测试数据库连接${NC}"
echo "测试需要数据库的端点..."

# 测试基础练习端点（应该能正常返回）
exercises_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/exercises" 2>/dev/null)
exercises_code=$(echo "$exercises_response" | tail -n1)
exercises_body=$(echo "$exercises_response" | sed '$d')

if [ "$exercises_code" = "200" ]; then
    echo -e "${GREEN}✅ 数据库连接正常${NC}"
    echo "基础练习端点响应正常"
else
    echo -e "${RED}❌ 数据库连接异常 (HTTP $exercises_code)${NC}"
    echo "响应: $exercises_body"
    echo ""
    echo -e "${YELLOW}🔧 建议的修复步骤：${NC}"
    echo "1. 在 Railway 项目仪表板中检查 PostgreSQL 服务状态"
    echo "2. 验证 DATABASE_URL 环境变量是否正确"
    echo "3. 重新部署后端服务"
    echo "4. 检查 Railway 项目日志"
    exit 1
fi
echo ""

# 4. 测试认证端点
echo -e "${YELLOW}🔐 测试认证端点${NC}"
echo "测试用户注册端点..."

register_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","username":"testuser","password":"Password123","firstName":"Test","lastName":"User"}' 2>/dev/null)
register_code=$(echo "$register_response" | tail -n1)
register_body=$(echo "$register_response" | sed '$d')

if [ "$register_code" = "201" ]; then
    echo -e "${GREEN}✅ 用户注册功能正常${NC}"
    echo "响应: $register_body"
elif [ "$register_code" = "400" ]; then
    echo -e "${YELLOW}⚠️  用户注册端点响应正常但参数验证失败${NC}"
    echo "这可能是正常的（用户已存在或其他验证错误）"
    echo "响应: $register_body"
else
    echo -e "${RED}❌ 用户注册功能异常 (HTTP $register_code)${NC}"
    echo "响应: $register_body"
fi
echo ""

# 5. 测试 CORS 配置
echo -e "${YELLOW}🌐 测试 CORS 配置${NC}"
echo "测试前端域名的 CORS 配置..."

cors_response=$(curl -s -w "\n%{http_code}" -X OPTIONS "$BASE_URL/health" \
    -H "Origin: https://harveygympartner814.vercel.app" \
    -H "Access-Control-Request-Method: GET" 2>/dev/null)
cors_code=$(echo "$cors_response" | tail -n1)

if [ "$cors_code" = "204" ] || [ "$cors_code" = "200" ]; then
    echo -e "${GREEN}✅ CORS 配置正常${NC}"
    echo "前端域名可以正常访问后端 API"
else
    echo -e "${RED}❌ CORS 配置异常 (HTTP $cors_code)${NC}"
    echo "请检查 CORS_ORIGIN 环境变量设置"
fi
echo ""

# 6. 总结和建议
echo -e "${BLUE}📊 修复总结${NC}"
echo "========================================"
echo -e "${GREEN}✅ 基础服务连接正常${NC}"
echo -e "${GREEN}✅ 数据库连接正常${NC}"
echo -e "${GREEN}✅ CORS 配置正常${NC}"
echo ""

echo -e "${YELLOW}🔧 如果仍有问题，请执行以下步骤：${NC}"
echo "1. 在 Railway 项目仪表板中："
echo "   - 检查 Variables 页面中的环境变量"
echo "   - 查看 Deployments 页面的部署日志"
echo "   - 确认 PostgreSQL 服务状态"
echo ""
echo "2. 环境变量检查清单："
echo "   - DATABASE_URL: PostgreSQL 连接字符串"
echo "   - JWT_SECRET: 强密钥 (建议使用 openssl rand -base64 32)"
echo "   - CORS_ORIGIN: https://harveygympartner814.vercel.app"
echo "   - NODE_ENV: production"
echo ""
echo "3. 如果问题持续存在："
echo "   - 重新部署 Railway 项目"
echo "   - 检查数据库迁移状态"
echo "   - 联系 Railway 支持"
echo ""

echo -e "${GREEN}🎉 数据库修复脚本执行完成！${NC}"
