# 报表中心 — UI Schema

**模块：** 数据分析与报表 > 报表中心 (7.2)
**版本：** 草案 v1
**日期：** 2026-03-10
**状态：** 待确认

---

## 1. 页面清单与路由

| 页面 ID | 页面名称 | 路由路径 | 组件文件 |
|---------|---------|---------|---------|
| P01 | 报表总览 | `/analytics/report-center/overview` | `ReportOverview.tsx` |
| P02 | 标准报表 | `/analytics/report-center/standard` | `StandardReport.tsx` |
| P03 | 自定义报表 | `/analytics/report-center/custom` | `CustomReport.tsx` |

**默认跳转：** `/analytics/report-center` → `/analytics/report-center/overview`

---

## 2. P01 报表总览 (ReportOverview)

### 2.1 页面 Header

```
PageHeader
├── title: t('reportCenter.overview.title', '报表总览')
├── RequirementTag: module="report-center"
└── 无操作按钮
```

### 2.2 快速入口区

```
Section: t('reportCenter.overview.quickAccess', '快速入口')
├── Row gutter={[16, 16]}
│   ├── Col span={4} (xl) / span={8} (md)  ← 共 5 个
│   │   └── Card hoverable onClick={→ navigate P02 + tab}
│   │       ├── Icon: <BarChartOutlined /> (经营日报)
│   │       ├── title: t('reportCenter.types.dailyOperations', '经营日报')
│   │       └── description: "最近生成: 2026-03-09"
│   ├── Col — Card: <LineChartOutlined /> 经营月报
│   ├── Col — Card: <SwapOutlined /> 交接班报表
│   ├── Col — Card: <SafetyCertificateOutlined /> 巡检报表
│   └── Col — Card: <DatabaseOutlined /> 库存报表
```

**交互：** 卡片 hover 上浮阴影 → onClick 跳转 `/analytics/report-center/standard?tab={type}`

### 2.3 收藏报表 + 最近查看

```
Row gutter={24}
├── Col span={12}
│   └── Card title={t('reportCenter.overview.favorites', '我的收藏')}
│       ├── List dataSource={favoriteReports}
│       │   └── List.Item
│       │       ├── List.Item.Meta
│       │       │   ├── avatar: <Tag color={typeColor}>{typeLabel}</Tag>
│       │       │   ├── title: report.title (clickable → navigate to detail)
│       │       │   └── description: report.generatedAt
│       │       └── actions: [<StarFilled onClick={toggleFavorite} />]
│       └── Empty: t('reportCenter.overview.noFavorites', '暂无收藏报表')
│
└── Col span={12}
    └── Card title={t('reportCenter.overview.recent', '最近查看')}
        ├── List dataSource={recentReports} (max 5)
        │   └── List.Item
        │       ├── List.Item.Meta
        │       │   ├── avatar: <Tag color={typeColor}>{typeLabel}</Tag>
        │       │   ├── title: report.title (clickable)
        │       │   └── description: report.generatedAt
        │       └── (no actions)
        └── Empty: t('reportCenter.overview.noRecent', '暂无查看记录')
```

### 2.4 报表日历

```
Section: t('reportCenter.overview.calendar', '报表日历')
└── Card
    └── Calendar
        ├── mode="month"
        ├── headerRender: 自定义月份切换
        ├── dateCellRender: (date) =>
        │   └── if hasReports(date):
        │       └── <div className="calendar-dots">
        │           ├── <span className="dot" style={color: typeColorMap[type]} />
        │           └── ... (每种类型一个圆点)
        │       </div>
        └── onSelect: (date) =>
            └── if hasReports(date):
                └── Popover content=
                    └── List
                        └── List.Item onClick={→ navigate to report}
                            ├── <Tag>{typeLabel}</Tag>
                            └── report.title
```

**圆点颜色映射：**

| 报表类型 | 颜色 | Ant Design Tag color |
|---------|------|---------------------|
| daily_operations | 蓝色 | `blue` |
| monthly_operations | 蓝色 | `geekblue` |
| shift_handover | 紫色 | `purple` |
| inspection | 橙色 | `orange` |
| inventory | 绿色 | `green` |
| custom | 灰色 | `default` |

---

## 3. P02 标准报表 (StandardReport)

### 3.1 页面 Header

```
PageHeader
├── title: t('reportCenter.standard.title', '标准报表')
├── RequirementTag: module="report-center"
└── 无操作按钮
```

### 3.2 Tab 栏 + 筛选条件

```
Tabs activeKey={activeTab} onChange={setActiveTab}
├── Tab key="daily_operations" tab={t('reportCenter.types.dailyOperations', '经营日报')}
├── Tab key="monthly_operations" tab={t('reportCenter.types.monthlyOperations', '经营月报')}
├── Tab key="shift_handover" tab={t('reportCenter.types.shiftHandover', '交接班报表')}
├── Tab key="inspection" tab={t('reportCenter.types.inspection', '巡检报表')}
└── Tab key="inventory" tab={t('reportCenter.types.inventory', '库存报表')}

Card (筛选条件)
├── Row gutter={16} align="middle"
│   ├── Col: DatePicker / MonthPicker / RangePicker (根据 Tab 动态)
│   │   └── daily → DatePicker (defaultValue=yesterday)
│   │   └── monthly → DatePicker.MonthPicker
│   │   └── shift/inspection/inventory → RangePicker
│   ├── Col: Select mode="multiple" placeholder={t('common.selectStation', '选择站点')}
│   │   └── options: stations (from context)
│   ├── Col: Button type="primary" icon={<FileTextOutlined />}
│   │   └── text: t('reportCenter.actions.generate', '生成报表')
│   ├── Col: Button icon={<DownloadOutlined />}
│   │   └── text: t('reportCenter.actions.export', '导出')
│   │   └── onClick: message.info(t('reportCenter.exportMvpTip'))
│   └── Col: Button icon={<StarOutlined />} onClick={toggleFavorite}
│       └── isFavorite ? <StarFilled style={color:'#faad14'} /> : <StarOutlined />
```

### 3.3 经营日报/月报内容

```
(当 activeTab = 'daily_operations' 或 'monthly_operations')

<!-- KPI 汇总卡片 -->
Row gutter={16}
├── Col span={6}: StatisticCard
│   ├── title: t('reportCenter.kpi.revenue', '营业额')
│   ├── value: formatCurrency(kpi.totalRevenue)
│   ├── suffix: <GrowthBadge value={kpi.revenueGrowth} />
│   └── prefix: <DollarOutlined />
├── Col span={6}: StatisticCard — 订单数
├── Col span={6}: StatisticCard — 充装量
└── Col span={6}: StatisticCard — 客单价

<!-- 站点明细表格 -->
Table
├── columns:
│   ├── { title: t('common.station'), dataIndex: 'stationName', width: 150 }
│   ├── { title: t('reportCenter.kpi.revenue'), dataIndex: 'revenue', width: 140, render: formatCurrency, sorter }
│   ├── { title: t('reportCenter.kpi.orders'), dataIndex: 'orders', width: 100, sorter }
│   ├── { title: t('reportCenter.kpi.fuelVolume'), dataIndex: 'fuelVolume', width: 140, render: formatVolume, sorter }
│   └── { title: t('reportCenter.kpi.avgOrderValue'), dataIndex: 'avgOrderValue', width: 130, render: formatCurrency, sorter }
├── scroll={{ x: 660 }}
├── pagination={false}
└── summary: 汇总行

<!-- 图表区 -->
Row gutter={16}
├── Col span={12}:
│   └── Card title={t('reportCenter.charts.fuelBreakdown', '燃料类型占比')}
│       └── PieChart data={fuelTypeBreakdown}
└── Col span={12}:
    └── Card title={t('reportCenter.charts.stationComparison', '站点对比')}
        └── BarChart data={stationBreakdown} xField="stationName" yField="revenue"

<!-- 月报额外：日均趋势 -->
(仅 monthly_operations)
Card title={t('reportCenter.charts.dailyTrend', '日均趋势')}
└── LineChart data={dailyTrend} xField="date" yField="revenue"
```

### 3.4 交接班报表内容

```
(当 activeTab = 'shift_handover')

<!-- 班次汇总表格 -->
Table
├── columns:
│   ├── { title: t('reportCenter.shift.date'), dataIndex: 'date', width: 110 }
│   ├── { title: t('reportCenter.shift.name'), dataIndex: 'shiftName', width: 100 }
│   ├── { title: t('reportCenter.shift.operator'), dataIndex: 'operatorName', width: 100 }
│   ├── { title: t('reportCenter.kpi.revenue'), dataIndex: 'revenue', width: 130, render: formatCurrency }
│   ├── { title: t('reportCenter.kpi.orders'), dataIndex: 'orders', width: 90 }
│   ├── { title: t('reportCenter.kpi.fuelVolume'), dataIndex: 'fuelVolume', width: 130 }
│   ├── { title: t('reportCenter.shift.cash'), dataIndex: 'cashAmount', width: 120, render: formatCurrency }
│   ├── { title: t('reportCenter.shift.online'), dataIndex: 'onlineAmount', width: 120, render: formatCurrency }
│   └── { title: t('reportCenter.shift.card'), dataIndex: 'cardAmount', width: 120, render: formatCurrency }
├── scroll={{ x: 1020 }}
└── pagination={false}

<!-- 图表区 -->
Row gutter={16}
├── Col span={12}:
│   └── Card title={t('reportCenter.charts.paymentDistribution', '支付方式分布')}
│       └── PieChart data={paymentDistribution}
└── Col span={12}:
    └── Card title={t('reportCenter.charts.shiftComparison', '班次对比')}
        └── BarChart data={shifts} xField="shiftName" yField="revenue"
```

### 3.5 巡检报表内容

```
(当 activeTab = 'inspection')

<!-- 汇总卡片 -->
Row gutter={16}
├── Col span={8}: StatisticCard
│   ├── title: t('reportCenter.inspection.completionRate', '计划完成率')
│   ├── value: summary.completionRate + '%'
│   └── valueStyle: { color: completionRate >= 90 ? '#3f8600' : '#cf1322' }
├── Col span={8}: StatisticCard — 问题发现数
└── Col span={8}: StatisticCard — 整改完成率

<!-- 区域问题分布表格 -->
Table
├── columns:
│   ├── { title: t('reportCenter.inspection.area'), dataIndex: 'areaLabel', width: 150 }
│   ├── { title: t('reportCenter.inspection.issueCount'), dataIndex: 'issueCount', width: 120, sorter }
│   ├── { title: t('reportCenter.inspection.criticalCount'), dataIndex: 'criticalCount', width: 120, render: val => val > 0 ? <Text type="danger">{val}</Text> : val }
│   └── { title: t('reportCenter.inspection.rectifiedCount'), dataIndex: 'rectifiedCount', width: 120 }
├── scroll={{ x: 510 }}
└── pagination={false}

<!-- 未整改高危问题 -->
(if unresolvedCritical.length > 0)
Alert type="error" message={t('reportCenter.inspection.unresolvedAlert', '以下高/紧急级别问题尚未整改')}
Table
├── columns:
│   ├── { title: t('reportCenter.inspection.area'), dataIndex: 'area', width: 120 }
│   ├── { title: t('reportCenter.inspection.description'), dataIndex: 'description', width: 250 }
│   ├── { title: t('reportCenter.inspection.severity'), dataIndex: 'severity', width: 100, render: severityTag }
│   ├── { title: t('reportCenter.inspection.discoveredDate'), dataIndex: 'discoveredDate', width: 120 }
│   └── { title: t('reportCenter.inspection.daysPending'), dataIndex: 'daysPending', width: 100, render: val => <Text type="danger">{val}天</Text> }
├── scroll={{ x: 690 }}
└── rowClassName="danger-row"
```

### 3.6 库存报表内容

```
(当 activeTab = 'inventory')

<!-- 汇总卡片 -->
Row gutter={16}
├── Col span={6}: StatisticCard — 总入库量
├── Col span={6}: StatisticCard — 总出库量
├── Col span={6}: StatisticCard — 总损耗量
└── Col span={6}: StatisticCard — 期末库存

<!-- 库存明细表格 -->
Table
├── columns:
│   ├── { title: t('common.station'), dataIndex: 'stationName', width: 140 }
│   ├── { title: t('reportCenter.inventory.fuelType'), dataIndex: 'fuelTypeName', width: 100 }
│   ├── { title: t('reportCenter.inventory.inbound'), dataIndex: 'inboundVolume', width: 120 }
│   ├── { title: t('reportCenter.inventory.outbound'), dataIndex: 'outboundVolume', width: 120 }
│   ├── { title: t('reportCenter.inventory.loss'), dataIndex: 'lossVolume', width: 110, render: (val, row) => row.abnormalLoss ? <Text type="danger">{val}</Text> : val }
│   ├── { title: t('reportCenter.inventory.ending'), dataIndex: 'endingVolume', width: 120 }
│   └── { title: t('reportCenter.inventory.tankRatio'), dataIndex: 'tankLevelRatio', width: 110, render: val => `${(val*100).toFixed(1)}%` }
├── scroll={{ x: 820 }}
├── rowClassName: (record) => record.abnormalLoss ? 'danger-row' : ''
└── pagination={false}

<!-- 罐容比趋势 -->
Card title={t('reportCenter.charts.tankTrend', '罐容比趋势')}
└── LineChart data={tankLevelTrend} xField="date" yField="tankLevelRatio"
```

---

## 4. P03 自定义报表 (CustomReport)

### 4.1 页面 Header

```
PageHeader
├── title: t('reportCenter.custom.title', '自定义报表')
├── RequirementTag: module="report-center"
└── 无操作按钮
```

### 4.2 左侧模板列表

```
Layout style={{ display: 'flex' }}
├── Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
│   ├── div style={{ padding: '16px' }}
│   │   ├── Input.Search placeholder={t('reportCenter.custom.searchTemplate', '搜索模板')}
│   │   └── Button type="dashed" block icon={<PlusOutlined />} onClick={openBuilder}
│   │       └── text: t('reportCenter.custom.newTemplate', '新建模板')
│   │
│   ├── Divider orientation="left": t('reportCenter.custom.systemTemplates', '系统模板')
│   ├── Menu mode="inline" selectedKeys={[selectedTemplateId]}
│   │   └── Menu.Item key={tpl.id} onClick={selectTemplate}
│   │       ├── <Tag color={dataSourceColor}>{dataSourceLabel}</Tag>
│   │       ├── <span>{tpl.name}</span>
│   │       └── <LockOutlined /> (if isSystem)
│   │
│   ├── Divider orientation="left": t('reportCenter.custom.myTemplates', '我的模板')
│   └── Menu mode="inline"
│       └── Menu.Item key={tpl.id}
│           ├── <Tag color={dataSourceColor}>{dataSourceLabel}</Tag>
│           ├── <span>{tpl.name}</span>
│           └── <Dropdown menu={editMenu}>
│               └── <EllipsisOutlined />
│               └── menu: [编辑, 删除(Popconfirm)]
```

### 4.3 右侧操作区

```
Content style={{ flex: 1, padding: '24px' }}

(selectedTemplate === null)
└── Empty description={t('reportCenter.custom.selectPrompt', '请选择左侧模板或创建新模板')} />

(selectedTemplate !== null)
├── Card
│   ├── title: selectedTemplate.name
│   ├── extra: [
│   │   Button 编辑 (if !isSystem),
│   │   Popconfirm 删除 (if !isSystem)
│   │ ]
│   └── body:
│       ├── Descriptions bordered size="small"
│       │   ├── Item label="数据源": <Tag>{dataSourceLabel}</Tag>
│       │   ├── Item label="维度": dimensions.map(d => <Tag>{dimensionLabel(d)}</Tag>)
│       │   ├── Item label="指标": metrics.map(m => <Tag>{metricLabel(m)}</Tag>)
│       │   └── Item label="时间粒度": timeGranularity
│       │
│       ├── Divider
│       ├── Row gutter={16} align="middle"
│       │   ├── Col: RangePicker (时间范围)
│       │   ├── Col: Select mode="multiple" (站点筛选)
│       │   └── Col: Button type="primary" icon={<ThunderboltOutlined />}
│       │       └── text: t('reportCenter.actions.generate', '生成报表')
│
├── (reportGenerated)
│   ├── Card
│   │   ├── title: generatedReport.title
│   │   ├── extra: [
│   │   │   Segmented options=['表格', '图表'] onChange={setViewMode},
│   │   │   Button 导出Excel onClick={exportMock},
│   │   │   Button 导出PDF onClick={exportMock},
│   │   │   Button 收藏 onClick={toggleFavorite}
│   │   │ ]
│   │   └── body:
│   │       ├── (viewMode === 'table')
│   │       │   └── Table
│   │       │       ├── columns: 动态生成 (dimensionLabel + metricColumns)
│   │       │       ├── dataSource: reportData.rows
│   │       │       ├── scroll={{ x: 计算值 }}
│   │       │       └── summary: reportData.summary
│   │       │
│   │       └── (viewMode === 'chart')
│   │           └── (auto-select chart type based on dimensions)
│   │               ├── time dimension → LineChart
│   │               ├── station/fuelType → BarChart
│   │               └── single metric → PieChart
```

### 4.4 模板构建器 Drawer

```
Drawer
├── title: t('reportCenter.custom.buildTemplate', '创建报表模板') / '编辑报表模板'
├── width={560}
├── placement="right"
└── body:
    └── Steps current={currentStep}
        ├── Step 0: 选择数据源
        │   └── Radio.Group optionType="button" buttonStyle="solid" size="large"
        │       ├── Radio value="operations"
        │       │   └── Card: <BarChartOutlined /> + t('reportCenter.dataSource.operations', '经营数据')
        │       ├── Radio value="inventory"
        │       │   └── Card: <DatabaseOutlined /> + t('reportCenter.dataSource.inventory', '库存数据')
        │       └── Radio value="inspection"
        │           └── Card: <SafetyCertificateOutlined /> + t('reportCenter.dataSource.inspection', '巡检数据')
        │
        ├── Step 1: 选择维度
        │   └── Checkbox.Group
        │       ├── (dataSource=operations): time, station, fuelType, shift
        │       ├── (dataSource=inventory): time, station, fuelType
        │       └── (dataSource=inspection): time, station
        │       └── 每个 Checkbox 带描述 tooltip
        │
        ├── Step 2: 选择指标
        │   └── Checkbox.Group
        │       ├── (dataSource=operations): revenue, orders, fuelVolume, avgOrderValue
        │       ├── (dataSource=inventory): inboundVolume, outboundVolume, lossVolume, tankLevelRatio
        │       └── (dataSource=inspection): inspectionCompletionRate, issueCount, rectificationRate
        │       └── 每个 Checkbox 带描述 tooltip
        │
        └── Step 3: 命名与保存
            ├── Form.Item label="模板名称" required
            │   └── Input maxLength={50}
            ├── Form.Item label="描述"
            │   └── Input.TextArea maxLength={200}
            ├── Form.Item label="标签"
            │   └── Select options=['daily','monthly','special']
            ├── Form.Item label="默认时间范围"
            │   └── InputNumber addonAfter="天" min={1} max={365}
            └── Form.Item label="默认站点"
                └── Select mode="multiple" options={stations}

Footer:
├── Button onClick={prevStep}: t('common.prev', '上一步') (step > 0)
├── Button onClick={nextStep}: t('common.next', '下一步') (step < 3)
└── Button type="primary" onClick={saveTemplate}: t('common.save', '保存') (step === 3)
```

---

## 5. i18n 键清单

### 5.1 菜单键（menu.*）

| 键 | zh-CN | en-US |
|----|-------|-------|
| `menu.reportCenter` | 报表中心 | Report Center |
| `menu.reportOverview` | 报表总览 | Report Overview |
| `menu.standardReport` | 标准报表 | Standard Reports |
| `menu.customReport` | 自定义报表 | Custom Reports |

### 5.2 模块键（reportCenter.*）

| 键 | zh-CN | en-US |
|----|-------|-------|
| `reportCenter.overview.title` | 报表总览 | Report Overview |
| `reportCenter.overview.quickAccess` | 快速入口 | Quick Access |
| `reportCenter.overview.favorites` | 我的收藏 | My Favorites |
| `reportCenter.overview.recent` | 最近查看 | Recently Viewed |
| `reportCenter.overview.calendar` | 报表日历 | Report Calendar |
| `reportCenter.overview.noFavorites` | 暂无收藏报表 | No favorited reports |
| `reportCenter.overview.noRecent` | 暂无查看记录 | No recent records |
| `reportCenter.standard.title` | 标准报表 | Standard Reports |
| `reportCenter.custom.title` | 自定义报表 | Custom Reports |
| `reportCenter.custom.searchTemplate` | 搜索模板 | Search templates |
| `reportCenter.custom.newTemplate` | 新建模板 | New Template |
| `reportCenter.custom.systemTemplates` | 系统模板 | System Templates |
| `reportCenter.custom.myTemplates` | 我的模板 | My Templates |
| `reportCenter.custom.selectPrompt` | 请选择左侧模板或创建新模板 | Select a template or create a new one |
| `reportCenter.custom.buildTemplate` | 创建报表模板 | Create Report Template |
| `reportCenter.custom.editTemplate` | 编辑报表模板 | Edit Report Template |
| `reportCenter.types.dailyOperations` | 经营日报 | Daily Operations |
| `reportCenter.types.monthlyOperations` | 经营月报 | Monthly Operations |
| `reportCenter.types.shiftHandover` | 交接班报表 | Shift Handover |
| `reportCenter.types.inspection` | 巡检报表 | Inspection Report |
| `reportCenter.types.inventory` | 库存报表 | Inventory Report |
| `reportCenter.types.custom` | 自定义报表 | Custom Report |
| `reportCenter.actions.generate` | 生成报表 | Generate Report |
| `reportCenter.actions.export` | 导出 | Export |
| `reportCenter.actions.exportExcel` | 导出 Excel | Export Excel |
| `reportCenter.actions.exportPdf` | 导出 PDF | Export PDF |
| `reportCenter.exportMvpTip` | 导出功能将在后端实现后启用 | Export will be available after backend implementation |
| `reportCenter.kpi.revenue` | 营业额 | Revenue |
| `reportCenter.kpi.orders` | 订单数 | Orders |
| `reportCenter.kpi.fuelVolume` | 充装量 | Fuel Volume |
| `reportCenter.kpi.avgOrderValue` | 客单价 | Avg Order Value |
| `reportCenter.shift.date` | 日期 | Date |
| `reportCenter.shift.name` | 班次 | Shift |
| `reportCenter.shift.operator` | 操作员 | Operator |
| `reportCenter.shift.cash` | 现金 | Cash |
| `reportCenter.shift.online` | 在线支付 | Online |
| `reportCenter.shift.card` | 刷卡 | Card |
| `reportCenter.inspection.completionRate` | 计划完成率 | Completion Rate |
| `reportCenter.inspection.issueCount` | 问题发现数 | Issues Found |
| `reportCenter.inspection.rectifiedCount` | 已整改数 | Rectified |
| `reportCenter.inspection.criticalCount` | 高危问题数 | Critical Issues |
| `reportCenter.inspection.area` | 检查区域 | Area |
| `reportCenter.inspection.description` | 问题描述 | Description |
| `reportCenter.inspection.severity` | 严重程度 | Severity |
| `reportCenter.inspection.discoveredDate` | 发现日期 | Discovered |
| `reportCenter.inspection.daysPending` | 待整改天数 | Days Pending |
| `reportCenter.inspection.unresolvedAlert` | 以下高/紧急级别问题尚未整改 | Unresolved high/urgent issues below |
| `reportCenter.inspection.rectificationRate` | 整改完成率 | Rectification Rate |
| `reportCenter.inventory.fuelType` | 燃料类型 | Fuel Type |
| `reportCenter.inventory.inbound` | 入库量 | Inbound |
| `reportCenter.inventory.outbound` | 出库量 | Outbound |
| `reportCenter.inventory.loss` | 损耗量 | Loss |
| `reportCenter.inventory.ending` | 期末库存 | Ending Stock |
| `reportCenter.inventory.tankRatio` | 罐容比 | Tank Ratio |
| `reportCenter.charts.fuelBreakdown` | 燃料类型占比 | Fuel Type Breakdown |
| `reportCenter.charts.stationComparison` | 站点对比 | Station Comparison |
| `reportCenter.charts.dailyTrend` | 日均趋势 | Daily Trend |
| `reportCenter.charts.paymentDistribution` | 支付方式分布 | Payment Distribution |
| `reportCenter.charts.shiftComparison` | 班次对比 | Shift Comparison |
| `reportCenter.charts.tankTrend` | 罐容比趋势 | Tank Level Trend |
| `reportCenter.dataSource.operations` | 经营数据 | Operations Data |
| `reportCenter.dataSource.inventory` | 库存数据 | Inventory Data |
| `reportCenter.dataSource.inspection` | 巡检数据 | Inspection Data |
| `reportCenter.viewMode.table` | 表格 | Table |
| `reportCenter.viewMode.chart` | 图表 | Chart |

---

## 6. scroll.x 汇总

| 页面 | 表格 | columns 宽度合计 | scroll.x |
|------|------|----------------|----------|
| P02 | 经营报表站点明细 | 150+140+100+140+130 | 660 |
| P02 | 交接班汇总 | 110+100+100+130+90+130+120+120+120 | 1020 |
| P02 | 巡检区域分布 | 150+120+120+120 | 510 |
| P02 | 巡检未整改问题 | 120+250+100+120+100 | 690 |
| P02 | 库存明细 | 140+100+120+120+110+120+110 | 820 |
| P03 | 自定义报表预览 | 动态计算 | 动态 |

---

*UI Schema 设计人：AI Agent*
*基于 architecture.md v1 + ux-design.md v1*
*版本：草案 v1*
