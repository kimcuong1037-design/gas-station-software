# Gas Station Management System - Design System
## 风格方向: 极简专业风 (Fluent-inspired)

---

## 1. 设计原则

| 原则 | 描述 |
|------|------|
| **极简** | 减少视觉噪音，只保留必要元素 |
| **高效** | 信息层级清晰，一眼抓住重点 |
| **专业** | 克制的色彩，沉稳的排版 |
| **沉浸** | 去边框化，让内容成为主角 |

---

## 2. 色彩系统

### 2.1 主色板

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色 | `#0078D4` | Microsoft Blue，链接/主操作 |
| 成功 | `#107C10` | 运营中/正常状态 |
| 警告 | `#FF8C00` | 暂停/维护中 |
| 错误 | `#D13438` | 停用/故障 |
| 中性 | `#605E5C` | 辅助文本 |

### 2.2 灰阶

```
白色背景: #FFFFFF
卡片背景: #FAFAFA (hover: #F5F5F5)
分割线:   #E1E1E1
次要文字: #8A8A8A
主要文字: #242424
```

### 2.3 使用规范

- 主色使用极度克制，仅用于：主按钮、链接、选中状态
- 禁止大面积彩色背景（页面主体永远为白/浅灰）
- 状态色仅用于 Tag/Badge，宽度不超过 80px

---

## 3. 排版系统

### 3.1 字体

```scss
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
              'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif;
```

### 3.2 字号层级

| 级别 | 尺寸 | 行高 | 用途 |
|------|------|------|------|
| H1 | 28px | 36px | 页面标题（极少用） |
| H2 | 20px | 28px | 模块标题 |
| H3 | 16px | 24px | 卡片标题 |
| Body | 14px | 22px | 正文内容 |
| Caption | 12px | 18px | 辅助说明 |

### 3.3 字重

- **Regular (400)**: 正文、表格
- **Medium (500)**: 标签、小标题
- **Semibold (600)**: 模块标题、关键数字

---

## 4. 布局系统

### 4.1 间距规范

```
基础单位: 4px
常用间距: 8px / 12px / 16px / 24px / 32px / 48px
```

### 4.2 页面结构

```
┌─────────────────────────────────────────┐
│  Sidebar (240px)  │  Content Area       │
│                   │                     │
│  [Logo]           │  Page Header (48px) │
│  [Nav Items]      │  ─────────────────  │
│                   │  Filters (可折叠)    │
│                   │  ─────────────────  │
│                   │  Main Content       │
│                   │                     │
└─────────────────────────────────────────┘
```

### 4.3 卡片规范

- 圆角: `8px`
- 阴影: **无** (仅用底边分隔线 `border-bottom: 1px solid #E1E1E1`)
- 内边距: `24px` (小卡片 `16px`)
- 卡片间距: `16px`

---

## 5. 组件定制

### 5.1 按钮

```scss
// 主按钮
.btn-primary {
  background: #0078D4;
  border: none;
  border-radius: 4px;
  height: 32px;
  padding: 0 16px;
  font-weight: 500;
  
  &:hover {
    background: #106EBE;
  }
}

// 次要按钮（幽灵风格）
.btn-secondary {
  background: transparent;
  border: 1px solid #D2D2D2;
  color: #242424;
  
  &:hover {
    background: #F5F5F5;
  }
}

// 文字按钮
.btn-link {
  color: #0078D4;
  padding: 0;
  font-weight: 400;
}
```

### 5.2 表格

```scss
.table-fluent {
  border: none;  // 无边框
  
  th {
    background: transparent;
    font-weight: 500;
    color: #605E5C;
    font-size: 12px;
    text-transform: uppercase;
    border-bottom: 1px solid #E1E1E1;
  }
  
  tr {
    &:hover {
      background: #F5F5F5;
    }
  }
  
  td {
    border-bottom: 1px solid #F0F0F0;  // 极淡分隔
  }
}
```

### 5.3 标签 (Tag)

```scss
.tag-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  
  &.active {
    background: rgba(16, 124, 16, 0.1);
    color: #107C10;
  }
  
  &.inactive {
    background: #F0F0F0;
    color: #8A8A8A;
  }
  
  &.suspended {
    background: rgba(255, 140, 0, 0.1);
    color: #FF8C00;
  }
}
```

### 5.4 输入框

```scss
.input-fluent {
  border: 1px solid #D2D2D2;
  border-radius: 4px;
  height: 32px;
  
  &:hover {
    border-color: #949494;
  }
  
  &:focus {
    border-color: #0078D4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
  }
}
```

---

## 6. 独特设计亮点

### 6.1 计数徽章

关键数字使用大字号 + 弱化单位，形成视觉焦点：

```
┌───────────────────┐
│  128              │
│  座运营中站点     │
└───────────────────┘

数字: 36px, Semibold, #242424
单位: 14px, Regular, #8A8A8A
```

### 6.2 状态指示器

使用小圆点 + 文字组合，替代传统 Tag：

```
● 运营中    ○ 已停用    ◐ 维护中
```

```scss
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  
  &.active { background: #107C10; }
  &.inactive { background: #D2D2D2; }
  &.suspended {
    background: #FF8C00;
    animation: pulse 1.5s infinite;
  }
}
```

### 6.3 面包屑导航

极简风格，用分隔符而非箭头：

```
首页 / 基础运营 / 站点管理 / 北京朝阳加气站
```

### 6.4 数据加载占位

使用 Skeleton 加载态，保持布局稳定：

```scss
.skeleton {
  background: linear-gradient(
    90deg,
    #F0F0F0 25%,
    #E1E1E1 50%,
    #F0F0F0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}
```

### 6.5 细节点缀

- 表格行 hover 时显示操作按钮（平时隐藏）
- 卡片切换使用 Fade 动画 (150ms)
- 多选时左侧出现选中条（3px 主色）
- 空状态使用灰度插画 + 简洁文案

---

## 7. Ant Design 主题配置

```typescript
// theme/config.ts
import { ThemeConfig } from 'antd';

export const fluentTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0078D4',
    colorSuccess: '#107C10',
    colorWarning: '#FF8C00',
    colorError: '#D13438',
    
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#FAFAFA',
    
    borderRadius: 4,
    borderRadiusLG: 8,
    
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif`,
    fontSize: 14,
    fontSizeHeading2: 20,
    fontSizeHeading3: 16,
    
    lineHeight: 1.5714,
    
    controlHeight: 32,
    controlHeightLG: 40,
    
    boxShadow: 'none',
    boxShadowSecondary: 'none',
  },
  components: {
    Button: {
      primaryShadow: 'none',
    },
    Card: {
      boxShadow: 'none',
      boxShadowSecondary: 'none',
    },
    Table: {
      headerBg: 'transparent',
      headerColor: '#605E5C',
      borderColor: '#E1E1E1',
      rowHoverBg: '#F5F5F5',
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Input: {
      activeShadow: '0 0 0 2px rgba(0, 120, 212, 0.2)',
    },
  },
};
```

---

## 8. 响应式断点

| 断点 | 宽度 | 侧边栏 | 表格 |
|------|------|--------|------|
| XL | ≥1440px | 240px固定 | 完整展示 |
| LG | ≥1200px | 200px固定 | 部分列隐藏 |
| MD | ≥992px | 折叠图标 | 横向滚动 |
| SM | ≥768px | 抽屉式 | 卡片视图 |
| XS | <768px | 抽屉式 | 卡片视图 |

---

## 9. 辅助功能 (A11y)

- 所有交互元素 focus 状态清晰可见
- 色彩对比度符合 WCAG AA 标准
- 表格支持键盘导航
- 图标配合文字说明

---

*设计系统版本: 1.0.0*
*最后更新: 2025-01*
