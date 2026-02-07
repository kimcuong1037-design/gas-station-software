# 项目规范 (Project Standards)

**项目：** 加气站运营管理系统 (Gas Station Operations Management System)
**版本：** 1.0
**更新日期：** 2026-02-07

---

## 1. 术语表 (Glossary)

统一项目中使用的核心术语，避免歧义。

| 中文术语 | 英文术语 | 代码命名 | 说明 |
|---------|---------|---------|------|
| 站点 | Station | station | 加气站/加油站物理站点 |
| 加注机 | Dispenser | dispenser | 加气/加油设备 |
| 枪 | Nozzle / Gun | nozzle | 加注机上的加注枪 |
| 交接班 | Shift Handover | shiftHandover | 班次交接操作 |
| 班次 | Shift | shift | 一个工作时段 |
| 充装 | Fueling / Filling | fueling | 加气/加油操作 |
| 罐存 | Tank Level | tankLevel | 储罐中的燃料存量 |
| 巡检 | Inspection | inspection | 安全巡检操作 |
| 订单 | Order / Transaction | order | 一次加注交易记录 |
| 会员 | Member | member | 注册会员客户 |
| 大客户 | Enterprise Client | enterprise | 企业/车队客户 |
| IC卡 | IC Card | icCard | 预付费IC卡 |
| 电子券 | E-Coupon | coupon | 电子优惠券 |
| 积分 | Points | points | 会员积分 |
| 挂账 | Credit Account | creditAccount | 企业客户赊账 |
| 数据大屏 | Data Dashboard | dataDashboard | 全屏可视化展示 |
| 非油业务 | Non-fuel Business | nonFuel | 便利店、洗车、充电等 |

> 此表将随项目推进持续补充。新增术语需同时更新中英文和代码命名。

---

## 2. 技术栈规范

### 2.1 技术选型

```
前端框架：  React 18 + TypeScript
组件库：    Ant Design (antd)
国际化：    i18next + react-i18next
图表：      ECharts（中文市场首选）
路由：      React Router v6
状态管理：  React Context + useReducer（MVP阶段）；Zustand（生产阶段）
模拟数据：  MSW (Mock Service Worker) 或静态 JSON 数据
构建工具：  Vite
后端：      Node.js + Express（MVP 之后添加）
数据库：    PostgreSQL（MVP 之后添加）
```

### 2.2 项目目录结构

```
gas-station-software/
├── docs/                    # 项目文档
│   ├── CONSTITUTION.md      # 合作原则
│   ├── CORRECTIONS.md       # 修正记录
│   ├── STANDARDS.md         # 本文件 - 项目规范
│   ├── ROADMAP.md           # 项目计划与路线图
│   ├── AGENT-PLAN.md        # Agent 结构计划
│   └── skills/              # Skills 定义文件
├── requirements/            # 需求文档
├── src/
│   ├── assets/              # 图片、图标、字体
│   ├── components/          # 共享 UI 组件
│   │   ├── Layout/          # 应用外壳、侧边栏、顶部导航
│   │   └── common/          # 表格、表单、图表、卡片
│   ├── features/            # 功能模块（按业务域划分）
│   │   ├── operations/      # 基础运营
│   │   ├── energy-trade/    # 能源交易
│   │   ├── membership/      # 会员与大客户
│   │   ├── marketing/       # 智慧营销
│   │   ├── finance/         # 财税与风控
│   │   ├── non-fuel/        # 非油增值
│   │   ├── analytics/       # 数据分析与报表
│   │   ├── mobile/          # 微信与移动端
│   │   └── system/          # 系统与权限
│   ├── i18n/                # 国际化（zh-CN、en-US）
│   ├── mock/                # 模拟数据与 API
│   ├── hooks/               # 自定义 React Hooks
│   ├── utils/               # 工具函数
│   ├── routes/              # 路由定义
│   ├── App.tsx
│   └── main.tsx
├── PLAN.md                  # 项目索引文件
├── PLAN-CN.md               # 项目索引文件（中文版）
├── README.md
└── package.json
```

---

## 3. 编码规范

### 3.1 语言与类型

- **语言：** TypeScript（严格模式 `strict: true`）
- **目标：** ES2020+
- **模块：** ESM (ES Modules)

### 3.2 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `StationList.tsx`, `ShiftHandover.tsx` |
| 函数/变量 | camelCase | `getStationById`, `tankLevel` |
| 常量 | UPPER_SNAKE_CASE | `MAX_NOZZLE_COUNT`, `DEFAULT_PAGE_SIZE` |
| 类型/接口 | PascalCase + 前缀 | `IStation`, `TFuelType` 或无前缀 `Station` |
| 文件（组件） | PascalCase | `StationList.tsx` |
| 文件（工具） | camelCase | `formatCurrency.ts` |
| 目录 | kebab-case | `energy-trade/`, `shift-handover/` |
| i18n 键名 | 点分命名空间 | `operations.station.title` |
| CSS 类名 | BEM 或 CSS Modules | `.station-card__header` |

### 3.3 文件组织

- 每个文件一个组件
- 样式和测试就近放置（co-location）
- 功能模块内部结构：

```
features/operations/
├── station/
│   ├── StationList.tsx        # 列表页
│   ├── StationDetail.tsx      # 详情页
│   ├── StationForm.tsx        # 表单（新增/编辑）
│   ├── components/            # 模块内部子组件
│   ├── hooks/                 # 模块专用 hooks
│   ├── types.ts               # 类型定义
│   └── index.ts               # 模块导出
├── shift/
├── equipment/
└── inspection/
```

### 3.4 代码风格

- 使用 ESLint + Prettier 统一格式
- 缩进：2 空格
- 引号：单引号
- 分号：有
- 行尾逗号：ES5 风格

---

## 4. UI/UX 设计规范

### 4.1 布局结构（管理后台）

```
┌─────────────────────────────────────────────────────┐
│  顶部导航栏                                           │
│  [基础运营] [能源交易] [会员管理] [智慧营销] [财务] [数据分析] [系统] │
├──────────┬──────────────────────────────────────────┤
│ 左侧     │  主内容区域                                │
│ 侧边栏   │  ┌─────────────────────────────────────┐ │
│          │  │  面包屑导航 / 页面标题               │ │
│ (根据    │  │  ┌─────────────────────────────────┐ │ │
│  顶部    │  │  │  筛选 / 搜索栏                  │ │ │
│  导航    │  │  ├─────────────────────────────────┤ │ │
│  切换    │  │  │  数据表格 / 看板 /              │ │ │
│  菜单)   │  │  │  表单内容                       │ │ │
│          │  │  └─────────────────────────────────┘ │ │
│          │  └─────────────────────────────────────┘ │
├──────────┴──────────────────────────────────────────┤
│  底部栏：版本号、版权信息、技术支持                       │
└─────────────────────────────────────────────────────┘
```

### 4.2 设计体系

- **组件库：** Ant Design (antd) — 中国企业级软件广泛使用
- **图表：** ECharts — 中文支持最佳，图表类型丰富
- **主题：** 专业蓝白色企业主题
- **字体：** 系统字体 + 中文字体栈（苹方 PingFang SC、微软雅黑 Microsoft YaHei）
- **图标：** Ant Design Icons + 行业定制图标

### 4.3 核心 UI 模式

- 多标签页工作区（可同时打开多个页面）
- 列表页高级筛选/搜索栏
- 详情抽屉/弹窗查看记录
- 看板卡片展示 KPI 指标
- 状态标签与颜色编码指示器
- 响应式表格，支持列配置

### 4.4 颜色规范

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色 | `#1890ff` | Ant Design 默认蓝 |
| 成功 | `#52c41a` | 正常/通过/完成 |
| 警告 | `#faad14` | 预警/待处理 |
| 错误 | `#ff4d4f` | 异常/失败/紧急 |
| 文字主色 | `rgba(0,0,0,0.85)` | 标题、正文 |
| 文字次色 | `rgba(0,0,0,0.45)` | 辅助说明 |
| 背景色 | `#f0f2f5` | 页面背景 |

---

## 5. Git 工作流规范

### 5.1 分支策略

- `main` 分支：稳定发布版本
- `dev` 分支：活跃开发
- 功能分支：`feature/<模块>-<描述>`
  - 示例：`feature/operations-station-management`
- 修复分支：`fix/<描述>`
- 文档分支：`docs/<描述>`

### 5.2 提交信息规范

遵循 Conventional Commits 格式：

```
<type>(<scope>): <description>

[optional body]
```

类型（type）：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式（不影响逻辑）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具变更

范围（scope）示例：`station`, `shift`, `order`, `i18n`, `layout`

---

## 6. 模拟数据规范

- 所有模拟数据存放在 `src/mock/` 目录
- 使用真实感的中文数据（站点名称、地址、人员姓名）
- 模块间 ID 和引用保持一致
- 时间戳使用 ISO 8601 格式
- 金额单位：元（CNY），精确到分
- 燃料类型使用行业标准名称：CNG、LNG、L-CNG、92#、95#、0#柴油

---

*创建时间：2026-02-07*
*版本：1.0*
