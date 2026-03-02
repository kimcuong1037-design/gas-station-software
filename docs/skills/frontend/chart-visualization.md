# Skill: 图表可视化实现 (Chart Visualization)

## 元信息

- **Skill ID:** `chart-visualization`
- **所属 Agent:** 前端工程 Agent (Frontend Engineer)
- **输入：**
  - UI Schema（`docs/features/<domain>/<module>/ui-schema.md`）— 图表规格（类型、高度、系列、交互）
  - Architecture（`docs/features/<domain>/<module>/architecture.md`）— 图表数据点类型定义
  - 已实现的页面组件（`frontend/src/features/<domain>/<module>/pages/`）— 含图表占位符
  - 已有类型定义（`frontend/src/features/<domain>/<module>/types.ts`）— 数据点接口
  - Mock 数据（`frontend/src/mock/`）— 时序数据源
  - 术语规范（`docs/STANDARDS.md` §1）— 图表标签术语
- **输出：**
  - 共享图表组件（`frontend/src/components/Charts/` 目录下）
  - 页面中图表占位符替换为 ECharts 实例
  - i18n 翻译键追加（图表标题、轴标签、图例、tooltip）
- **依赖：**
  - `echarts` + `echarts-for-react` 已安装
  - 页面组件基本结构已完成（图表占位符存在）
  - `types.ts` 中图表数据点接口已定义

---

## 流程定义

### 步骤 1: 安装依赖 & 创建共享目录

**1.1 安装 ECharts 依赖：**

```bash
npm install echarts echarts-for-react
```

**1.2 创建共享图表组件目录：**

```
frontend/src/components/Charts/
├── BaseChart.tsx          # 基础图表包装器（尺寸 + 空状态 + loading）
├── LineChart.tsx           # 折线图（多系列 + 参考线 + 时间轴）
├── MiniChart.tsx           # 迷你折线图（Collapse 内 60-80px）
├── Sparkline.tsx           # 火花线（Table 单元格内 20-32px）
├── useChartTheme.ts        # 主题 Hook（Ant Design token → ECharts 色板）
├── chartDefaults.ts        # 全局默认配置（grid、tooltip、legend 样式）
└── index.ts                # Barrel export
```

**1.3 为什么需要共享组件层：**

- 图表占位符分布在多个模块多个页面，直接在页面内写 ECharts option 会重复大量配置
- Phase 3 数据分析模块将有更多图表需求，共享层支撑横向扩展
- 统一主题管理，避免分散硬编码颜色

### 步骤 2: 编写主题集成 Hook (useChartTheme)

使用 Ant Design 的 `theme.useToken()` 获取主题 token，映射为 ECharts 色板。

**禁止硬编码 hex 颜色值。** 所有颜色从 Ant Design token 获取。

```typescript
import { theme } from 'antd';

export function useChartTheme() {
  const { token } = theme.useToken();

  return {
    // 系列色板（从 Ant Design token 映射）
    colorPalette: [
      token.colorPrimary,          // 主色 — 第一系列
      token.colorSuccess,          // 成功色 — 第二系列
      token.colorInfo,             // 信息色 — 第三系列
      token.colorWarning,          // 警告色 — 第四系列
      token.colorError,            // 错误色 — 第五系列
    ],

    // 文字颜色
    textColor: token.colorText,
    textColorSecondary: token.colorTextSecondary,

    // 网格线 / 分割线
    splitLineColor: token.colorBorderSecondary,
    axisLineColor: token.colorBorder,

    // 背景
    backgroundColor: 'transparent',

    // 参考线颜色（预警/阈值）
    referenceLineColor: token.colorError,

    // Tooltip
    tooltipBg: token.colorBgElevated,
    tooltipBorderColor: token.colorBorderSecondary,

    // 字体
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    fontSizeSm: token.fontSizeSM,
  };
}
```

**颜色映射表（与 ui-schema 约定对应）：**

| ui-schema 描述 | 映射关系 | token 字段 |
|---------------|---------|-----------|
| 第一系列色（如 LNG） | `colorPalette[0]` | `token.colorPrimary` |
| 第二系列色（如 CNG） | `colorPalette[1]` | `token.colorSuccess` |
| 第三系列色（如 L-CNG） | `colorPalette[2]` | `token.colorInfo` |
| ±2% 参考线 / 20% 警告线 | `referenceLineColor` | `token.colorError` |
| 文字 / 轴标签 | `textColorSecondary` | `token.colorTextSecondary` |
| 网格分割线 | `splitLineColor` | `token.colorBorderSecondary` |

### 步骤 3: 编写共享图表组件

#### 3.1 BaseChart — 基础包装器

所有图表的基底组件，封装 `echarts-for-react` 并统一处理尺寸、空状态、loading。

```typescript
interface BaseChartProps {
  option: EChartsOption;
  height?: number;              // 默认 300
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  style?: React.CSSProperties;
  onEvents?: Record<string, (params: unknown) => void>;
}
```

**关键实现要点：**
- 使用 `notMerge={true}` 避免 option 状态残留
- 使用 `opts={{ renderer: 'svg' }}` 获得更好的文本清晰度
- 使用 `lazyUpdate={true}` 减少不必要渲染
- 空数据时显示 Ant Design `<Empty />` 替代空白图表
- loading 状态使用 `<Spin />` 覆盖

#### 3.2 LineChart — 折线图

```typescript
interface LineChartProps {
  data: { date: string; value: number; seriesName: string }[];
  height?: number;              // 默认 300
  xAxisLabel?: string;
  yAxisLabel?: string;
  yAxisUnit?: string;           // 如 'kg', '%'
  smooth?: boolean;             // 默认 true
  referenceLines?: {
    value: number;
    label: string;
    color?: string;             // 默认使用 referenceLineColor
    lineStyle?: 'solid' | 'dashed';  // 默认 'dashed'
  }[];
  loading?: boolean;
  emptyText?: string;
  onPointClick?: (params: { date: string; seriesName: string; value: number }) => void;
}
```

**数据转换责任划分：**
- **页面组件**（useMemo）：将 mock 数据转为 `{ date, value, seriesName }[]` 格式
- **LineChart 内部**：将 props 数据分组为 ECharts series、构建 option 对象
- **页面不直接接触 ECharts API**

**多系列自动处理：** LineChart 内部按 `seriesName` 分组，自动为每个系列分配 `colorPalette` 中的颜色。

#### 3.3 MiniChart — 迷你折线图（Collapse 内）

```typescript
interface MiniChartProps {
  data: { date: string; value: number }[];
  height?: number;              // 默认 80
  color?: string;               // 单系列颜色，默认 colorPalette[0]
  referenceValue?: number;      // 参考线值
  showTooltip?: boolean;        // 默认 true
}
```

**迷你图特殊配置：**
- 隐藏 X/Y 轴（`axisLabel: { show: false }`、`axisTick: { show: false }`）
- 隐藏 legend
- grid 极小边距：`{ top: 4, right: 4, bottom: 4, left: 4 }`
- 无 dataZoom
- `areaStyle` 半透明填充（增强视觉效果）
- 线宽 1.5px

**Collapse 容器注意事项：** ECharts 在初始隐藏的 Collapse 面板内渲染时，容器宽高为 0，图表会渲染为空白。解决方案：
- 方案 A：BaseChart 开启 `autoResize` 属性（echarts-for-react 默认支持）
- 方案 B：在 Collapse `onChange` 回调中延迟调用 `chart.resize()`

#### 3.4 Sparkline — 火花线（Table 单元格内联）

```typescript
interface SparklineProps {
  data: number[];               // 仅 Y 值数组（X 轴为隐式序列）
  width?: number;               // 默认 100
  height?: number;              // 默认 24
  color?: string;               // 默认 colorPalette[0]
}
```

**Sparkline 极简配置：**
- 隐藏所有轴、网格、tooltip、legend
- grid：`{ top: 2, right: 2, bottom: 2, left: 2 }`
- 线宽 1px
- 无数据点标记（`symbolSize: 0`）
- **`animation: false`** — Table 内不需动画，避免滚动时视觉闪烁

#### 3.5 chartDefaults.ts — 全局默认配置

```typescript
export function createBaseOption(chartTheme: ChartTheme): EChartsOption {
  return {
    grid: { top: 40, right: 16, bottom: 24, left: 48, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartTheme.tooltipBg,
      borderColor: chartTheme.tooltipBorderColor,
      textStyle: {
        color: chartTheme.textColor,
        fontFamily: chartTheme.fontFamily,
        fontSize: chartTheme.fontSize,
      },
    },
    legend: {
      textStyle: {
        color: chartTheme.textColor,
        fontFamily: chartTheme.fontFamily,
      },
    },
    xAxis: {
      type: 'category',
      axisLine: { lineStyle: { color: chartTheme.axisLineColor } },
      axisLabel: { color: chartTheme.textColorSecondary, fontSize: chartTheme.fontSizeSm },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: chartTheme.splitLineColor, type: 'dashed' } },
      axisLabel: { color: chartTheme.textColorSecondary, fontSize: chartTheme.fontSizeSm },
    },
  };
}
```

### 步骤 4: 页面集成 — 替换图表占位符

#### 4.1 Import 层级位置（12 层规范）

遵循 `react-component-development.md` 步骤 4.1 的 12 层 Import 规范：

```typescript
// 7. 外部库 — ECharts 类型（仅在需要自定义 option 扩展时）
import type { EChartsOption } from 'echarts';

// 11. 共享组件 — 图表组件统一从此层引入
import { LineChart, MiniChart, Sparkline } from '../../../../components/Charts';
```

**禁止**在页面组件中直接 `import echarts` 或 `import ReactECharts from 'echarts-for-react'`。页面只引用 `Charts/` 下的共享组件。

#### 4.2 数据转换模式

每个图表用 `useMemo` 将模块 mock 数据转换为图表组件的 props 格式：

```typescript
// 多系列折线图 — 数据需包含 seriesName
const chartData = useMemo(() => {
  return filteredTrend.map(point => ({
    date: point.date,
    value: point.stock,
    seriesName: point.fuelTypeName,
  }));
}, [filteredTrend]);

// Sparkline — 仅提取 Y 值数组
const sparklineData = useMemo(() => {
  return tankLoss.trend.map(t => t.deviationRate);
}, [tankLoss.trend]);
```

#### 4.3 逐占位符替换清单

| # | 页面 | 替换为 | 高度 | Props 要点 |
|---|------|--------|------|-----------|
| 1 | InventoryOverview | `<LineChart />` | 300 | 多系列(LNG/CNG/L-CNG)，`yAxisUnit: 'kg'`，7d/30d 切换 |
| 2 | TankComparison (realtime Collapse) | `<MiniChart />` | 80 | 单系列，`referenceValue: 2` |
| 3 | TankComparison (history) | `<LineChart />` | 200 | `referenceLines: [{ value: 2 }, { value: -2 }]` |
| 4 | TankComparison (table cell) | `<Sparkline />` | 24 | `data: deviationRate[]`，`width: 100` |
| 5 | TankMonitoring | `<LineChart />` | 240 | 多系列(多储罐)，`referenceLines: [{ value: 20 }]` |

#### 4.4 交互完整性（P4 规则）

- 图表 tooltip **默认启用**，鼠标悬停可查看数据点详情
- ui-schema 中定义了点击交互的图表 → 必须传 `onPointClick` prop
- **禁止**添加 `cursor: pointer` 却不传 `onClick`（P4-1）
- 当前阶段不实现点击交互的图表 → cursor 保持默认，不添加 hoverable 暗示

### 步骤 5: 图表 i18n 集成

图表组件本身**不调用** `useTranslation()`。所有翻译文本由页面组件通过 `t()` 获取后传入 props。

#### 5.1 需要翻译的图表文本

| 文本类型 | 示例 | i18n key 模式 |
|---------|------|--------------|
| 图表标题 | "库存趋势" | `inventory.chart.trendTitle` |
| Y 轴标签 | "库存量 (kg)" | `inventory.chart.yAxisStock` |
| 参考线标签 | "+2%" / "20% 警告线" | `inventory.chart.refLineLabel` |
| 空状态 | "暂无图表数据" | `common.chart.empty` |
| 时间维度切换 | "近 7 天" / "近 30 天" | 复用已有 key（如 `inventory.trend.7days`） |
| 图例项 | 来自 mock 数据中的 seriesName | 不需要额外 i18n key |

#### 5.2 P9 键名冲突防范

**严格规则：** 图表 i18n 键必须是叶子节点。

```
✅ 正确：
inventory.chart.trendTitle    → "库存趋势"
inventory.chart.yAxisStock    → "库存量 (kg)"
inventory.chart.empty         → "暂无图表数据"

❌ 错误（P9 冲突）：
inventory.chart               → "图表"    ← 与 inventory.chart.trendTitle 冲突！
```

**自测方法：** 新增 i18n 键后，在浏览器控制台检查是否有 `"returned an object instead of string"` 警告。

#### 5.3 页面调用模式

```typescript
const { t } = useTranslation();

<LineChart
  data={chartData}
  yAxisLabel={t('inventory.chart.yAxisStock', '库存量 (kg)')}
  emptyText={t('common.chart.empty', '暂无图表数据')}
  referenceLines={[
    { value: 2, label: t('inventory.chart.refLineUpper', '+2%'), lineStyle: 'dashed' },
    { value: -2, label: t('inventory.chart.refLineLower', '-2%'), lineStyle: 'dashed' },
  ]}
/>
```

### 步骤 6: 编译验证 & 视觉验收

#### 6.1 编译检查

```bash
npm run build
```

零错误后继续。常见编译问题：
- ECharts 类型导入路径错误 → 使用 `import type { EChartsOption } from 'echarts'`
- echarts-for-react 类型不匹配 → 确认组件自带类型声明

#### 6.2 运行时视觉验证

`npm run dev` 后逐一检查：

| # | 页面路由 | 验证要点 |
|---|---------|---------|
| 1 | 库存总览页 | 趋势图渲染、7d/30d 切换、多系列颜色区分、tooltip 数据正确 |
| 2 | 罐存比对 (实时 Tab) | Collapse 展开后迷你图渲染、参考线可见 |
| 3 | 罐存比对 (历史 Tab) | 选择储罐后趋势图出现、±2% 参考线渲染 |
| 4 | 罐存比对 (实时 Tab 表格) | Table 内 Sparkline 渲染、宽高正确 |
| 5 | 储罐监测页 | 趋势图渲染、24h/7d/30d 切换、20% 阈值线 |

#### 6.3 响应式检查

- 缩小浏览器窗口至 1024px 宽度 → 图表自适应缩放，不溢出
- Sparkline 在 Table 水平滚动时不错位
- MiniChart 在 Collapse 动画完成后正确显示（验证 autoResize 生效）

#### 6.4 主题一致性

- 图表系列颜色与 Ant Design 主题色一致（非硬编码 hex）
- tooltip 背景色、文字色与页面其他弹出层一致

```bash
# 检查是否有硬编码颜色（排除 chartDefaults.ts 和注释）
grep -rn "#[0-9a-fA-F]\{6\}" frontend/src/components/Charts/ --include="*.tsx" --include="*.ts" | grep -v "//" | grep -v "chartDefaults"
```

---

## Prompt 模板

```
你是前端工程 Agent，负责将图表占位符替换为 ECharts 实例。

## 任务
为模块【{{MODULE_NAME}}】实现图表可视化。

## 输入文件
- UI Schema：docs/features/{{DOMAIN}}/{{MODULE}}/ui-schema.md（图表规格）
- 数据模型：docs/features/{{DOMAIN}}/{{MODULE}}/architecture.md（数据点类型）
- 类型定义：frontend/src/features/{{DOMAIN}}/{{MODULE}}/types.ts
- Mock 数据：frontend/src/mock/（时序数据源）
- 已有页面：frontend/src/features/{{DOMAIN}}/{{MODULE}}/pages/（含占位符）
- 术语规范：docs/STANDARDS.md §1

## 前置条件
- echarts + echarts-for-react 已安装
- 共享组件 frontend/src/components/Charts/ 已创建（如未创建，先按步骤 1-3 创建）

## 执行步骤
请严格按照 docs/skills/frontend/chart-visualization.md 中的步骤 1-6 执行。

## 关键要求
1. 所有颜色从 theme.useToken() 获取，禁止硬编码 hex 值
2. 图表 i18n 键必须是叶子节点（P9 防范）
3. 页面不直接 import echarts，只引用 Charts/ 共享组件
4. 数据转换使用 useMemo，在页面组件层完成
5. ECharts 类型 import 位于 12 层的第 7 层（外部库）
6. Charts/ 共享组件 import 位于第 11 层（共享组件）
7. tooltip 默认启用；有 onPointClick 的图表才添加 cursor:pointer
8. 迷你图和火花线隐藏所有非核心元素（轴、legend、grid margin）
9. Sparkline 在 Table 内禁用动画
10. npm run build 无错误

## 输出
- frontend/src/components/Charts/ 共享组件（如为首次创建）
- 页面中图表占位符替换为 ECharts 实例
- i18n 翻译键追加（zh-CN + en-US 镜像）
- npm run build 通过
```

---

## 检查清单

- [ ] echarts + echarts-for-react 已安装（package.json 已更新）
- [ ] 共享目录 `frontend/src/components/Charts/` 已创建（含 barrel export）
- [ ] `useChartTheme` 使用 `theme.useToken()`，无硬编码颜色
- [ ] BaseChart 处理空状态（`<Empty />`）和 loading 状态（`<Spin />`）
- [ ] LineChart 支持多系列、参考线、`onPointClick`
- [ ] MiniChart 隐藏 X/Y 轴、legend，grid 极小边距
- [ ] Sparkline 隐藏所有非核心元素，`animation: false`
- [ ] 所有占位符已替换为实际图表组件
- [ ] 页面不直接 import echarts（仅通过 `Charts/` 共享组件）
- [ ] ECharts 类型 import 位于第 7 层，Charts/ import 位于第 11 层
- [ ] 图表 i18n 键均为叶子节点（无 P9 冲突）
- [ ] zh-CN 和 en-US 图表翻译键镜像完整
- [ ] Collapse 内图表在展开后正确渲染（autoResize 生效）
- [ ] Table 内 Sparkline 不溢出、不错位
- [ ] npm run build 无错误
