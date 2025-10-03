# MyGYMPartner - 设计系统规范

## 1. 设计系统概述

### 1.1 设计理念
- **现代简约**：简洁的视觉语言，突出内容本身
- **健身活力**：体现运动的力量感和活力
- **数据驱动**：清晰的数据展示和可视化
- **用户友好**：降低学习成本，提高使用效率

### 1.2 设计原则
- **一致性**：统一的视觉语言和交互模式
- **可访问性**：支持不同能力的用户使用
- **响应式**：适配不同设备和屏幕尺寸
- **可扩展性**：支持功能迭代和扩展

## 2. 色彩系统

### 2.1 主色调

#### 品牌色彩
```css
/* 主品牌色 - 活力橙色 */
--primary-50: #FFF7ED;   /* 最浅色 */
--primary-100: #FFEDD5;  /* 很浅色 */
--primary-200: #FED7AA;  /* 浅色 */
--primary-300: #FDBA74;  /* 中浅色 */
--primary-400: #FB923C;  /* 中色 */
--primary-500: #F97316;  /* 主色 */
--primary-600: #EA580C;  /* 中深色 */
--primary-700: #C2410C;  /* 深色 */
--primary-800: #9A3412;  /* 很深色 */
--primary-900: #7C2D12;  /* 最深色 */

/* 辅助色 - 科技蓝 */
--secondary-50: #EFF6FF;
--secondary-100: #DBEAFE;
--secondary-200: #BFDBFE;
--secondary-300: #93C5FD;
--secondary-400: #60A5FA;
--secondary-500: #3B82F6;  /* 主色 */
--secondary-600: #2563EB;
--secondary-700: #1D4ED8;
--secondary-800: #1E40AF;
--secondary-900: #1E3A8A;
```

#### 功能色彩
```css
/* 成功色 - 绿色 */
--success-50: #F0FDF4;
--success-500: #22C55E;
--success-600: #16A34A;
--success-700: #15803D;

/* 警告色 - 黄色 */
--warning-50: #FFFBEB;
--warning-500: #F59E0B;
--warning-600: #D97706;
--warning-700: #B45309;

/* 错误色 - 红色 */
--error-50: #FEF2F2;
--error-500: #EF4444;
--error-600: #DC2626;
--error-700: #B91C1C;

/* 信息色 - 蓝色 */
--info-50: #F0F9FF;
--info-500: #0EA5E9;
--info-600: #0284C7;
--info-700: #0369A1;
```

### 2.2 中性色彩

#### 灰度系统
```css
/* 中性色 - 灰色 */
--gray-50: #F9FAFB;   /* 背景色 */
--gray-100: #F3F4F6;  /* 浅背景 */
--gray-200: #E5E7EB;  /* 边框色 */
--gray-300: #D1D5DB;  /* 分割线 */
--gray-400: #9CA3AF;  /* 占位符 */
--gray-500: #6B7280;  /* 次要文字 */
--gray-600: #4B5563;  /* 主要文字 */
--gray-700: #374151;  /* 标题文字 */
--gray-800: #1F2937;  /* 深色文字 */
--gray-900: #111827;  /* 最深文字 */
```

#### 语义色彩
```css
/* 文字颜色 */
--text-primary: #111827;      /* 主要文字 */
--text-secondary: #6B7280;    /* 次要文字 */
--text-disabled: #9CA3AF;     /* 禁用文字 */
--text-inverse: #FFFFFF;      /* 反色文字 */

/* 背景颜色 */
--bg-primary: #FFFFFF;        /* 主背景 */
--bg-secondary: #F9FAFB;      /* 次背景 */
--bg-tertiary: #F3F4F6;       /* 第三背景 */
--bg-overlay: rgba(0, 0, 0, 0.5); /* 遮罩背景 */

/* 边框颜色 */
--border-light: #E5E7EB;      /* 浅边框 */
--border-medium: #D1D5DB;     /* 中边框 */
--border-dark: #9CA3AF;       /* 深边框 */
```

## 3. 字体系统

### 3.1 字体族
```css
/* 主字体 - 系统字体栈 */
--font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                       'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* 等宽字体 - 数字显示 */
--font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 
                    'Roboto Mono', Consolas, 'Courier New', monospace;

/* 中文字体 */
--font-family-cn: 'PingFang SC', 'Hiragino Sans GB', 
                  'Microsoft YaHei', '微软雅黑', sans-serif;
```

### 3.2 字体大小
```css
/* 标题字体 */
--text-4xl: 2.25rem;   /* 36px - 大标题 */
--text-3xl: 1.875rem;  /* 30px - 中标题 */
--text-2xl: 1.5rem;    /* 24px - 小标题 */
--text-xl: 1.25rem;    /* 20px - 子标题 */

/* 正文字体 */
--text-lg: 1.125rem;   /* 18px - 大正文 */
--text-base: 1rem;     /* 16px - 标准正文 */
--text-sm: 0.875rem;   /* 14px - 小正文 */
--text-xs: 0.75rem;    /* 12px - 辅助文字 */

/* 移动端字体 */
--text-mobile-lg: 1.25rem;  /* 20px - 移动端大标题 */
--text-mobile-base: 1rem;   /* 16px - 移动端正文 */
--text-mobile-sm: 0.875rem; /* 14px - 移动端小字 */
```

### 3.3 字重和行高
```css
/* 字重 */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* 行高 */
--line-height-tight: 1.25;   /* 紧密行高 */
--line-height-normal: 1.5;   /* 正常行高 */
--line-height-relaxed: 1.75; /* 宽松行高 */
```

## 4. 间距系统

### 4.1 基础间距单位
```css
/* 基础间距单位 - 4px */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 4.2 组件间距规范
```css
/* 组件内边距 */
--padding-xs: var(--space-2);    /* 8px - 小组件 */
--padding-sm: var(--space-3);    /* 12px - 小组件 */
--padding-md: var(--space-4);    /* 16px - 标准组件 */
--padding-lg: var(--space-6);    /* 24px - 大组件 */
--padding-xl: var(--space-8);    /* 32px - 超大组件 */

/* 组件外边距 */
--margin-xs: var(--space-2);     /* 8px - 小间距 */
--margin-sm: var(--space-3);     /* 12px - 小间距 */
--margin-md: var(--space-4);     /* 16px - 标准间距 */
--margin-lg: var(--space-6);     /* 24px - 大间距 */
--margin-xl: var(--space-8);     /* 32px - 超大间距 */

/* 布局间距 */
--layout-gap-sm: var(--space-4);  /* 16px - 小布局间距 */
--layout-gap-md: var(--space-6);  /* 24px - 标准布局间距 */
--layout-gap-lg: var(--space-8);  /* 32px - 大布局间距 */
```

## 5. 圆角系统

### 5.1 基础圆角
```css
/* 圆角大小 */
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px - 小圆角 */
--radius-md: 0.25rem;    /* 4px - 标准圆角 */
--radius-lg: 0.5rem;     /* 8px - 大圆角 */
--radius-xl: 0.75rem;    /* 12px - 超大圆角 */
--radius-2xl: 1rem;      /* 16px - 特大圆角 */
--radius-full: 9999px;   /* 完全圆形 */
```

### 5.2 组件圆角规范
```css
/* 按钮圆角 */
--button-radius-sm: var(--radius-sm);   /* 小按钮 */
--button-radius-md: var(--radius-md);   /* 标准按钮 */
--button-radius-lg: var(--radius-lg);   /* 大按钮 */

/* 卡片圆角 */
--card-radius: var(--radius-lg);        /* 卡片 */
--card-radius-sm: var(--radius-md);     /* 小卡片 */

/* 输入框圆角 */
--input-radius: var(--radius-md);       /* 输入框 */

/* 模态框圆角 */
--modal-radius: var(--radius-xl);       /* 模态框 */
```

## 6. 阴影系统

### 6.1 基础阴影
```css
/* 阴影层级 */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
             0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
             0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
             0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
             0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### 6.2 组件阴影规范
```css
/* 卡片阴影 */
--card-shadow: var(--shadow-sm);
--card-shadow-hover: var(--shadow-md);

/* 按钮阴影 */
--button-shadow: var(--shadow-xs);
--button-shadow-hover: var(--shadow-sm);

/* 模态框阴影 */
--modal-shadow: var(--shadow-xl);

/* 下拉菜单阴影 */
--dropdown-shadow: var(--shadow-lg);
```

## 7. 组件规范

### 7.1 按钮组件

#### 按钮尺寸
```css
/* 按钮高度 */
--button-height-xs: 1.5rem;    /* 24px - 超小按钮 */
--button-height-sm: 2rem;      /* 32px - 小按钮 */
--button-height-md: 2.5rem;    /* 40px - 标准按钮 */
--button-height-lg: 3rem;      /* 48px - 大按钮 */
--button-height-xl: 3.5rem;    /* 56px - 超大按钮 */

/* 按钮内边距 */
--button-padding-xs: 0.5rem 0.75rem;   /* 8px 12px */
--button-padding-sm: 0.5rem 1rem;      /* 8px 16px */
--button-padding-md: 0.75rem 1.5rem;   /* 12px 24px */
--button-padding-lg: 1rem 2rem;        /* 16px 32px */
--button-padding-xl: 1.25rem 2.5rem;   /* 20px 40px */
```

#### 按钮变体
```css
/* 主要按钮 */
.button-primary {
  background-color: var(--primary-500);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--button-radius-md);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--button-shadow);
}

.button-primary:hover {
  background-color: var(--primary-600);
  box-shadow: var(--button-shadow-hover);
}

/* 次要按钮 */
.button-secondary {
  background-color: transparent;
  color: var(--primary-500);
  border: 1px solid var(--primary-500);
  border-radius: var(--button-radius-md);
  font-weight: var(--font-weight-medium);
}

.button-secondary:hover {
  background-color: var(--primary-50);
}

/* 危险按钮 */
.button-danger {
  background-color: var(--error-500);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--button-radius-md);
  font-weight: var(--font-weight-medium);
}
```

### 7.2 卡片组件

#### 卡片结构
```css
.card {
  background-color: var(--bg-primary);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: var(--padding-lg);
  border: 1px solid var(--border-light);
}

.card-header {
  padding-bottom: var(--padding-md);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--margin-md);
}

.card-body {
  padding: var(--padding-md) 0;
}

.card-footer {
  padding-top: var(--padding-md);
  border-top: 1px solid var(--border-light);
  margin-top: var(--margin-md);
}
```

#### 卡片变体
```css
/* 统计卡片 */
.card-stat {
  text-align: center;
  padding: var(--padding-lg);
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: var(--text-inverse);
}

/* 训练组卡片 */
.card-exercise {
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-exercise:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}
```

### 7.3 输入框组件

#### 输入框样式
```css
.input {
  width: 100%;
  padding: var(--padding-sm) var(--padding-md);
  border: 1px solid var(--border-medium);
  border-radius: var(--input-radius);
  font-size: var(--text-base);
  line-height: var(--line-height-normal);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.input:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-disabled);
  cursor: not-allowed;
}

/* 输入框尺寸 */
.input-sm {
  padding: var(--padding-xs) var(--padding-sm);
  font-size: var(--text-sm);
}

.input-lg {
  padding: var(--padding-md) var(--padding-lg);
  font-size: var(--text-lg);
}
```

### 7.4 导航组件

#### 顶部导航
```css
.navbar {
  height: 4rem; /* 64px */
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  padding: 0 var(--padding-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-500);
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}
```

#### 侧边栏导航
```css
.sidebar {
  width: 16rem; /* 256px */
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  padding: var(--padding-lg);
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav-item {
  margin-bottom: var(--space-2);
}

.sidebar-nav-link {
  display: flex;
  align-items: center;
  padding: var(--padding-sm) var(--padding-md);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.sidebar-nav-link:hover,
.sidebar-nav-link.active {
  background-color: var(--primary-50);
  color: var(--primary-600);
}
```

#### 底部导航（移动端）
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rem; /* 64px */
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--padding-sm) 0;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  transition: color 0.2s ease;
}

.bottom-nav-item.active {
  color: var(--primary-500);
}
```

## 8. 图标系统

### 8.1 图标尺寸
```css
/* 图标大小 */
--icon-xs: 1rem;      /* 16px - 超小图标 */
--icon-sm: 1.25rem;   /* 20px - 小图标 */
--icon-md: 1.5rem;    /* 24px - 标准图标 */
--icon-lg: 2rem;      /* 32px - 大图标 */
--icon-xl: 2.5rem;    /* 40px - 超大图标 */
```

### 8.2 图标颜色
```css
/* 图标颜色 */
--icon-primary: var(--text-primary);
--icon-secondary: var(--text-secondary);
--icon-disabled: var(--text-disabled);
--icon-accent: var(--primary-500);
--icon-success: var(--success-500);
--icon-warning: var(--warning-500);
--icon-error: var(--error-500);
```

## 9. 动画系统

### 9.1 过渡动画
```css
/* 过渡时间 */
--transition-fast: 0.15s;
--transition-normal: 0.2s;
--transition-slow: 0.3s;

/* 过渡函数 */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 9.2 常用动画
```css
/* 淡入淡出 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* 滑入滑出 */
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideOutDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

/* 缩放动画 */
@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

## 10. 响应式断点

### 10.1 媒体查询
```css
/* 手机端 */
@media (max-width: 767px) {
  .container {
    padding: 0 var(--padding-md);
  }
  
  .grid {
    grid-template-columns: 1fr;
    gap: var(--layout-gap-sm);
  }
}

/* 平板端 */
@media (min-width: 768px) and (max-width: 1023px) {
  .container {
    padding: 0 var(--padding-lg);
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--layout-gap-md);
  }
}

/* 桌面端 */
@media (min-width: 1024px) {
  .container {
    padding: 0 var(--padding-xl);
  }
  
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--layout-gap-lg);
  }
}
```

## 11. 无障碍规范

### 11.1 色彩对比度
- 正常文字：至少 4.5:1 的对比度
- 大文字：至少 3:1 的对比度
- 非文字元素：至少 3:1 的对比度

### 11.2 焦点状态
```css
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### 11.3 屏幕阅读器支持
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

**文档版本**：v1.0  
**创建日期**：2024年12月  
**最后更新**：2024年12月  
**负责人**：设计团队


