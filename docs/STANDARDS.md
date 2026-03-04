# 项目规范 (Project Standards)

**项目：** 加气站运营管理系统 (Gas Station Operations Management System)
**版本：** 1.2
**更新日期：** 2026-02-28

---

## 1. 术语表 (Glossary)

统一项目中使用的核心术语，避免歧义。

### 1.1 核心业务术语

| 中文术语 | 英文术语 | 代码命名 | 说明 |
|---------|---------|---------|------|
| 站点 | Station | station | 加气站/加油站物理站点 |
| 加注机 | Dispenser | dispenser | 加气/加油设备（**泛称**，见下方说明） |
| 枪 | Nozzle / Gun | nozzle | 加注机上的加注枪 |
| 充装 | Fueling / Filling | fueling | 加气/加油操作（**泛称**，见下方说明） |
| 储罐 | Tank | tank | 燃料存储罐 |
| 罐存 | Tank Level | tankLevel | 储罐中的燃料存量 |
| 订单 | Order / Transaction | order | 一次加注交易记录 |
| 交接班 | Shift Handover | shiftHandover | 班次交接操作 |
| 班次 | Shift | shift | 一个工作时段 |
| 巡检 | Inspection | inspection | 安全巡检/安检操作 |
| 维保工单 | Maintenance Order | maintenanceOrder | 设备维修保养工单 |
| 设备台账 | Equipment Ledger | equipmentLedger | 设备资产档案 |
| 价格调整 | Price Adjustment | priceAdjustment | 燃料价格变更记录 |
| 退款 | Refund | refund | 订单退款记录 |
| 会员 | Member | member | 注册会员客户 |
| 大客户 | Enterprise Client | enterprise | 企业/车队客户 |
| IC卡 | IC Card | icCard | 预付费IC卡 |
| 电子券 | E-Coupon | coupon | 电子优惠券 |
| 积分 | Points | points | 会员积分 |
| 挂账 | Credit Account | creditAccount | 企业客户赊账 |
| 数据大屏 | Data Dashboard | dataDashboard | 全屏可视化展示 |
| 非油业务 | Non-fuel Business | nonFuel | 便利店、洗车、充电等 |
| 入库 | Inbound | inbound | 燃料到货入库记录 |
| 出库 | Outbound | outbound | 燃料出库（销售/损耗/调拨） |
| 进销存 | Inventory Ledger | inventoryLedger | 库存流水账，逐笔记录进出 |
| 罐容比 | Tank Level Ratio | tankLevelRatio | 当前罐存 / 储罐容量（百分比） |
| 盘点调整 | Stock Adjustment | stockAdjustment | 实盘与理论库存差异的调整记录 |
| 冲红 | Reversal | reversal | 红字冲销已入账记录 |
| 预警 | Alert | alert | 库存异常自动触发的预警通知 |
| 损耗 | Loss | loss | 蒸发、泄漏等非销售性燃料减少 |

#### 术语使用规则

**加注机 / 加气机 / 加油机**：
- **泛称**：在文档描述、代码变量名、i18n key 中统一使用 **加注机** (`dispenser`)
- **具体设备名**：设备实例（如"加气机#01"）保留原名，因为这是 CNG/LNG 站点的实际设备名称
- **禁止**：同一段落中混用"加油机/加气机"并列写法，应统一为"加注机"

**充装 / 加注**：
- **泛称**：统一使用 **充装** (`fueling`)
- **状态描述**："加注中"(`fueling`) 可作为设备运行状态保留

**新增 vs 新建**：
- 统一使用 **新增** 作为创建类操作的动作用语（按钮文案、面包屑等）

### 1.2 角色术语

| 中文术语 | 英文术语 | 代码命名 | 说明 |
|---------|---------|---------|------|
| 站长 | Station Master | station_master | 站点负责人，管理站点日常运营 |
| 安全主管 | Safety Supervisor | safety_supervisor | 制定检查项目、下发安检任务、审核结果 |
| 安全员 | Safety Officer | safety_officer | 执行安检任务、巡检操作 |
| 操作员 / 充装员 | Operator | operator | 负责加注操作的一线员工 |
| 运维工程师 | Maintenance Engineer | maintenance_engineer | 设备维保执行人 |
| 财务 | Finance | finance | 财务审核与结算 |
| 班组长 | Shift Leader | shift_leader | 日常入库操作、损耗登记、小额审批 |
| 运营经理 | Operations Manager | ops_manager | 多站点库存监控、偏差分析、损耗追踪 |
| 管理员 | Admin | admin | 系统管理员 |

> **安全主管 vs 安全员**：这是两个不同层级的角色。安全主管负责计划制定与审批，安全员负责执行。小站点中两个角色可由同一人兼任，通过组织架构管理模块（Phase 9 系统与权限）实现角色权限控制。

### 1.3 模块与菜单术语

| 模块 ID | 中文名称 | 英文菜单 | 侧边栏层级 |
|---------|---------|---------|-----------|
| 1.1 | 站点管理 | Station | 基础运营 → 站点管理 → {子页面} |
| 1.2 | 交接班管理 | Shift | 基础运营 → 交接班 → {子页面} |
| 1.3 | 设备设施管理 | Device & Facility | 基础运营 → 设备设施 → {子页面} |
| 1.4 | 巡检/安检管理 | Inspection | 基础运营 → 巡检/安检管理 → {子页面} |
| 2.1 | 价格管理 | Price Management | 能源交易 → 价格管理 → {子页面} |
| 2.2 | 订单与交易 | Order | 能源交易 → 订单管理 → {子页面} |
| 2.3 | 库存管理 | Inventory | 能源交易 → 库存管理 → {子页面} |

### 1.4 状态/枚举术语

**严重程度量表（全系统通用）**：

| 值 | 中文 | 英文 | 代码 |
|---|------|------|------|
| 低 | 低 | Low | `low` |
| 中 | 中 | Medium | `medium` |
| 高 | 高 | High | `high` |
| 紧急 | 紧急 | Urgent | `urgent` |

**安检检查项分类（双维度）**：

安检检查项包含两个分类维度，通过不同字段区分：

| 维度 | 字段名 | 说明 | 值 |
|------|--------|------|-----|
| 空间区域 | `area` | 检查项所在物理区域 | `tank_area`, `dispenser`, `power_room`, `fueling_area`, `non_fuel`, `equipment` |
| 业务类型 | `category` | 检查项的业务分类 | `safety_equipment`, `fire_protection`, `electrical`, `pressure_vessel`, `environmental`, `general_facility` |

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
后端：      Python Flask + SQLAlchemy + Marshmallow
ORM：       SQLAlchemy 2.0+
迁移工具：  Flask-Migrate (Alembic)
API 文档：  flask-smorest / flasgger（OpenAPI/Swagger）
验证：      Marshmallow
认证：      JWT + Refresh Token
测试：      pytest + pytest-flask
日志：      Python logging
数据库：    MySQL 8.0
```

### 2.2 项目目录结构

#### 前端

```
frontend/
├── src/
│   ├── assets/              # 图片、图标、字体
│   ├── components/          # 共享 UI 组件
│   │   ├── AppLayout.tsx    # 应用外壳、侧边栏、顶部导航
│   │   ├── RequirementTag.tsx  # 需求追踪注册（所有模块 Story 映射）
│   │   └── Charts/          # ECharts 共享图表组件
│   ├── features/            # 功能模块（按业务域划分）
│   │   ├── operations/      # 基础运营
│   │   ├── energy-trade/    # 能源交易
│   │   ├── membership/      # 会员与大客户
│   │   ├── marketing/       # 智慧营销
│   │   ├── finance/         # 财税与风控
│   │   ├── non-fuel/        # 非油增值
│   │   ├── analytics/       # 数据分析与报表
│   │   └── system/          # 系统与权限
│   ├── locales/             # 国际化（zh-CN、en-US）
│   ├── router.tsx           # 路由定义（路由常量 + lazy loading）
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

#### 后端

```
backend/
├── app/
│   ├── __init__.py          # 应用工厂 (create_app)
│   ├── extensions.py        # db / migrate / jwt 等扩展统一初始化
│   ├── config.py            # 环境配置（DevelopmentConfig / ProductionConfig）
│   ├── models/              # SQLAlchemy Models（每模块一个文件）
│   │   ├── __init__.py      # 统一导出所有 Model（供 migration 发现）
│   │   ├── station.py       # Station / Nozzle / Employee
│   │   └── ...
│   ├── schemas/             # Marshmallow Schemas（序列化 + 输入验证）
│   │   ├── __init__.py
│   │   └── station.py
│   ├── services/            # 业务逻辑层（纯 Python，无 HTTP 依赖）
│   │   └── station_service.py
│   ├── api/                 # Flask Blueprints（路由 + 请求/响应处理）
│   │   ├── __init__.py      # 注册所有 Blueprint
│   │   └── stations.py      # GET/POST/PUT/DELETE 端点
│   └── utils/               # 工具：分页助手、错误处理、日志
├── migrations/              # Flask-Migrate / Alembic 迁移文件（自动生成）
├── tests/                   # pytest 测试套件
│   ├── conftest.py          # 测试 DB fixture、app fixture
│   ├── test_stations.py     # API 集成测试
│   └── unit/                # Service 层单元测试
├── requirements.txt         # 生产依赖
├── requirements-dev.txt     # 开发依赖（pytest、black、isort 等）
└── run.py                   # 开发服务器启动入口
```

---

## 8. 后端编码规范

### 8.1 语言与版本

- **Python 版本：** 3.11+（类型注解完整支持）
- **代码格式：** Black (auto-format) + isort (import 排序) + flake8 (lint)
- **类型注解：** 函数签名必须有类型注解（参数 + 返回值）

### 8.2 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | snake_case | `get_station_by_id`, `tank_level` |
| 类（Model/Schema/Service） | PascalCase | `Station`, `StationSchema`, `StationService` |
| 常量 | UPPER_SNAKE_CASE | `MAX_NOZZLE_COUNT`, `DEFAULT_PAGE_SIZE` |
| 文件 | snake_case | `station_service.py`, `shift_handover.py` |
| Blueprint | snake_case + `_bp` 后缀 | `stations_bp`, `orders_bp` |
| 数据库表名 | snake_case 复数 | `stations`, `shift_handovers`, `inspection_plans` |

### 8.3 SQLAlchemy Model 规范

```python
# 每个 Model 文件遵循此结构
class Station(db.Model):
    __tablename__ = 'stations'

    # 主键
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 业务字段（参照 architecture.md §DB Schema）
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Enum('active', 'inactive'), nullable=False)

    # 审计字段（每个表必须包含）
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)  # 软删除

    # 关系（显式声明，不使用隐式关联）
    nozzles = db.relationship('Nozzle', back_populates='station', lazy='dynamic')
```

### 8.4 Flask Blueprint 规范

```python
# api/stations.py
from flask_smorest import Blueprint

stations_bp = Blueprint('stations', __name__, url_prefix='/api/v1/stations',
                         description='站点管理 API')

@stations_bp.route('/')
@stations_bp.arguments(StationQuerySchema, location='query')
@stations_bp.response(200, StationListSchema)
def list_stations(args):
    """查询站点列表"""
    return StationService.list(args)
```

### 8.5 Service 层规范

- Service 层不依赖 Flask request/response 对象（纯业务逻辑）
- 每个 Service 方法对应一个 API 端点的核心逻辑
- 业务规则在 Service 层实现（对应 architecture.md §业务规则）
- Service 方法是单元测试的主要目标

---

## 9. 数据库规范

### 9.1 迁移规范

- **必须通过 Flask-Migrate 生成迁移文件**：禁止直接 ALTER TABLE 或手动修改数据库 Schema
- 每次 Model 变更后执行：`flask db migrate -m "描述变更内容"` → `flask db upgrade`
- 迁移文件必须 commit 到 Git，与代码变更在同一 PR 中
- 迁移文件命名遵循 Alembic 自动生成的格式（时间戳前缀）

### 9.2 表设计规范

| 规范项 | 规则 |
|--------|------|
| 主键 | INT AUTO_INCREMENT（与 architecture.md §DB Schema 保持一致） |
| 外键 | 必须有对应索引；显式声明 `ON DELETE` 行为 |
| 软删除 | 使用 `deleted_at DATETIME NULL`；查询时默认过滤 `deleted_at IS NULL` |
| 审计字段 | 每表必须包含 `created_at` + `updated_at`（ORM 自动维护） |
| 字符编码 | utf8mb4（支持中文 + emoji） |
| 金额字段 | `DECIMAL(12,2)`，单位：元 |
| 枚举字段 | 使用 MySQL ENUM 类型（与 architecture.md 的 Python Enum 对齐） |

### 9.3 索引策略

- 外键列必须建索引
- 高频查询字段（station_id、status、created_at 范围查询）建索引
- 复合索引：将选择性高的字段放在前面
- 禁止在 `deleted_at` 为 NULL 过滤的场景中全表扫描（建部分索引或复合索引）

---

## 10. 测试规范

### 10.1 测试层次

| 层次 | 工具 | 覆盖目标 | 文件位置 |
|------|------|---------|---------|
| 单元测试 | pytest | Service 层业务逻辑 | `tests/unit/` |
| 集成测试 | pytest-flask | API 端点（HTTP 请求→响应） | `tests/` 根目录 |

### 10.2 覆盖率目标

- Service 层核心函数：**>= 80%** 行覆盖率
- 关键业务路径（状态流转、金额计算）：**100%** 覆盖
- 边界条件（空值、权限拒绝、数据不存在）必须有对应测试用例

### 10.3 测试数据规范

```python
# conftest.py 中定义共享 fixture
@pytest.fixture
def station(db):
    """测试用站点数据，测试结束后自动回滚"""
    s = Station(name='测试站点', status='active')
    db.session.add(s)
    db.session.commit()
    return s
```

- 测试数据使用 pytest fixture（不使用全局静态数据文件）
- 每个测试用例相互独立，数据在测试结束后回滚
- 禁止测试代码依赖外部服务（DB 使用 SQLite 内存库或专用测试 DB）

### 10.4 测试命名

```
test_{功能描述}_{场景}.py
例：test_station_create_success
    test_station_create_duplicate_name
    test_shift_close_without_permission
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

## 6. API 接口设计规范

### 6.1 路径前缀

**所有 REST API 端点必须使用 `/api/v1/` 前缀。** 这是全局强制规范。

```
✅ 正确：GET  /api/v1/stations
✅ 正确：POST /api/v1/stations/:stationId/nozzles
❌ 错误：GET  /api/stations           （缺少版本号）
❌ 错误：GET  /stations               （缺少前缀）
```

**跨模块一致性说明**：
- Phase 1 中，交接班模块（shift-handover）的 architecture.md 使用了 `/api/` 前缀，与其他模块不一致。
- 后端实现时统一改为 `/api/v1/`，前端 API 服务层也需同步调整。

### 6.2 URL 命名规范

| 规则 | 示例 |
|------|------|
| 资源名用复数 | `/stations`, `/nozzles`, `/orders` |
| 路径全小写，中划线连接 | `/shift-handovers`, `/inspection-plans` |
| 嵌套资源用父子路径 | `/stations/:id/nozzles/:nozzleId` |
| 动作操作用动词后缀 | `POST /inspections/:id/submit`, `POST /handovers/:id/force` |
| 列表查询用 GET + query params | `GET /stations?status=active&page=1` |

### 6.3 HTTP 方法语义

| 操作 | 方法 | 示例 |
|------|------|------|
| 查询列表 | GET | `GET /api/v1/stations` |
| 查询详情 | GET | `GET /api/v1/stations/:id` |
| 创建资源 | POST | `POST /api/v1/stations` |
| 全量更新 | PUT | `PUT /api/v1/stations/:id` |
| 局部更新 | PATCH | `PATCH /api/v1/stations/:id` |
| 删除资源 | DELETE | `DELETE /api/v1/stations/:id` |
| 执行动作 | POST | `POST /api/v1/inspections/:id/submit` |

### 6.4 响应结构规范

**列表接口（分页）：**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

**单体接口：**
```json
{
  "data": { ... }
}
```

**错误响应：**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "站点名称不能为空",
    "details": [...]
  }
}
```

### 6.5 版本升级策略

- 当前版本：`v1`
- 破坏性变更时升级到 `/api/v2/`（如字段重命名、删除、类型变更）
- 非破坏性变更（新增字段）在 `v1` 中直接扩展
- `v1` 与 `v2` 并行期间，旧版本维护最少 3 个月

---

## 7. 模拟数据规范

- 所有模拟数据存放在 `src/mock/` 目录
- 使用真实感的中文数据（站点名称、地址、人员姓名）
- 模块间 ID 和引用保持一致
- 时间戳使用 ISO 8601 格式
- 金额单位：元（CNY），精确到分
- 燃料类型使用行业标准名称：CNG、LNG、L-CNG、92#、95#、0#柴油

---

*创建时间：2026-02-07*
*更新时间：2026-03-04*
*版本：1.3*
