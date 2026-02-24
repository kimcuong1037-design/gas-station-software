# 站点管理 — 架构设计

**模块：** 基础运营 > 站点管理 (1.1)
**基于：** requirements.md v1.0 + user-stories.md v1.0
**设计日期：** 2026-02-15
**状态：** 待评审

---

## 0. 设计原则

### 0.1 外部系统对接扩展性

对于需要与外部异构系统对接的实体（如枪、充电桩等设备），采用以下扩展字段设计：

| 字段 | 类型 | 用途 |
|------|------|------|
| `custom_fields` | `JSONB` | 存储外部系统的未知/自定义字段，便于对接时扩展 |
| `source_doc` | `JSONB` | 保留外部系统的原始报文/数据，用于问题排查和审计 |
| `tags` | `VARCHAR[]` | 标签数组，支持后续的分类、分组、多维分析 |

**设计理念：**
- **灵活扩展**：不同压动器/充电桩厂商返回的数据结构不同，`custom_fields` 允许存储任意扩展属性
- **问题追溯**：`source_doc` 保留原始数据，当出现数据解析错误时可回溯原始报文
- **分析支持**：`tags` 支持多标签，便于按设备类型、厂商、协议等维度分析

**应用此模式的实体：**
- `Nozzle`（枪）— 与加注机对接
- `ChargingPile`（充电桩）— 与充电系统对接

### 0.2 软删除策略

所有业务实体采用 `status` 字段进行软删除：
- `active` — 正常启用
- `inactive` — 已停用（软删除）
- `suspended` — 暂停（特定场景）

---

## 1. 数据模型

### 1.1 Station（站点）

站点是系统的核心实体，代表一个加气站/加油站物理站点。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `code` | `VARCHAR(32)` | UNIQUE, NOT NULL | 站点编码（自动生成或手工输入） |
| `name` | `VARCHAR(100)` | NOT NULL | 站点名称 |
| `address` | `VARCHAR(255)` | NOT NULL | 详细地址 |
| `latitude` | `DECIMAL(10, 7)` | | 纬度坐标 |
| `longitude` | `DECIMAL(10, 7)` | | 经度坐标 |
| `contact_phone` | `VARCHAR(20)` | | 联系电话 |
| `contact_name` | `VARCHAR(50)` | | 联系人姓名 |
| `business_hours` | `JSONB` | | 营业时间，格式：`{"weekday": "06:00-22:00", "weekend": "07:00-21:00"}` |
| `group_id` | `UUID` | FK → StationGroup | 所属分组（可选） |
| `region_id` | `UUID` | FK → Region | 所属区域（可选） |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 状态：`active`/`inactive`/`suspended` |
| `primary_image_id` | `UUID` | FK → StationImage | 主展示图（可选） |
| `employee_sync_mode` | `VARCHAR(20)` | NOT NULL, DEFAULT 'sync' | 员工同步模式：`sync`（从用户模块同步）/ `local`（本地独立维护） |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |
| `created_by` | `UUID` | FK → User | 创建人 |
| `updated_by` | `UUID` | FK → User | 更新人 |

**索引：**
- `idx_station_code` ON `code` — 编码唯一查询
- `idx_station_name` ON `name` — 名称搜索
- `idx_station_status` ON `status` — 状态筛选
- `idx_station_group` ON `group_id` — 分组筛选
- `idx_station_region` ON `region_id` — 区域筛选
- `idx_station_geo` ON `(latitude, longitude)` — 地理位置查询

**约束：**
- `code` 创建后不可修改（业务规则，API 层面限制）

---

### 1.2 StationGroup（站点分组）

站点分组用于业务分类，如"高速服务区站点"、"城市加气站"。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `name` | `VARCHAR(50)` | UNIQUE, NOT NULL | 分组名称 |
| `description` | `VARCHAR(255)` | | 分组描述 |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 状态：`active`/`inactive` |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_station_group_name` ON `name`
- `idx_station_group_sort` ON `sort_order`

---

### 1.3 Region（区域）

区域用于地理层级管理，支持多级结构（如：省 → 市 → 区）。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `name` | `VARCHAR(50)` | NOT NULL | 区域名称 |
| `code` | `VARCHAR(32)` | UNIQUE | 区域编码（如行政区划代码） |
| `parent_id` | `UUID` | FK → Region (self) | 上级区域（NULL 表示顶级） |
| `level` | `INTEGER` | NOT NULL, DEFAULT 1 | 层级深度（1=省，2=市，3=区） |
| `path` | `VARCHAR(255)` | | 层级路径（如 `/省id/市id/区id/`，用于快速查询下级） |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 状态：`active`/`inactive` |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_region_parent` ON `parent_id` — 父级查询
- `idx_region_code` ON `code` — 编码查询
- `idx_region_path` ON `path` USING GIN — 路径前缀查询（查找所有下级）

---

### 1.4 FuelType（燃料类型）

燃料类型采用固定枚举 + 自定义扩展模式。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `code` | `VARCHAR(20)` | UNIQUE, NOT NULL | 类型代码（如 `GASOLINE_92`, `CNG`） |
| `name` | `VARCHAR(50)` | NOT NULL | 显示名称（如 `92#汽油`, `CNG`) |
| `category` | `VARCHAR(20)` | NOT NULL | 类别：`gasoline`（汽油）/`diesel`（柴油）/`gas`（气体）/`other`（其他） |
| `is_system` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | 是否系统内置（内置类型不可删除） |
| `unit` | `VARCHAR(10)` | NOT NULL, DEFAULT 'L' | 计量单位：`L`（升）/`kg`（公斤）/`m³`（立方米） |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 状态：`active`/`inactive` |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**系统内置数据（is_system = true）：**

| code | name | category | unit |
|------|------|----------|------|
| `GASOLINE_92` | 92#汽油 | gasoline | L |
| `GASOLINE_95` | 95#汽油 | gasoline | L |
| `GASOLINE_98` | 98#汽油 | gasoline | L |
| `DIESEL_0` | 0#柴油 | diesel | L |
| `CNG` | CNG压缩天然气 | gas | m³ |
| `LNG` | LNG液化天然气 | gas | kg |

**索引：**
- `idx_fuel_type_code` ON `code`
- `idx_fuel_type_category` ON `category`

---

### 1.5 Nozzle（枪）

枪是加注设备的末端，关联到站点和燃料类型。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `nozzle_no` | `VARCHAR(20)` | NOT NULL | 枪号（站点内唯一） |
| `fuel_type_id` | `UUID` | FK → FuelType, NOT NULL | 燃料类型 |
| `unit_price` | `DECIMAL(10, 2)` | NOT NULL, DEFAULT 0.00 | 当前单价（元/单位） |
| `dispenser_no` | `VARCHAR(20)` | | 所属加注机编号 |
| `device_status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'offline' | 设备状态：`online`/`offline`/`error` |
| `fueling_status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'idle' | 充装状态：`idle`（空闲）/`fueling`（充装中） |
| `last_heartbeat_at` | `TIMESTAMP` | | 最后心跳时间（设备通信时间） |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 业务状态：`active`（启用）/`inactive`（停用） |
| `tags` | `VARCHAR(50)[]` | | 标签数组，用于分类分组分析 |
| `config` | `JSONB` | | 扩展配置（设备参数、采集协议等） |
| `custom_fields` | `JSONB` | | 自定义扩展字段，用于对接外部异构系统的未知字段 |
| `source_doc` | `JSONB` | | 原始数据存储，保留外部系统的原始报文用于排查问题 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_nozzle_station` ON `station_id` — 站点关联查询
- `idx_nozzle_station_no` ON `(station_id, nozzle_no)` UNIQUE — 站点内枪号唯一
- `idx_nozzle_fuel_type` ON `fuel_type_id` — 燃料类型筛选
- `idx_nozzle_status` ON `status` — 状态筛选
- `idx_nozzle_tags` ON `tags` USING GIN — 标签查询

**约束：**
- `nozzle_no` 在同一站点内唯一
- `nozzle_no` 创建后不可修改

---

### 1.6 NozzlePriceLog（枪单价变更日志）

记录枪单价的变更历史，用于审计和追溯。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `nozzle_id` | `UUID` | FK → Nozzle, NOT NULL | 枪ID |
| `old_price` | `DECIMAL(10, 2)` | NOT NULL | 变更前单价 |
| `new_price` | `DECIMAL(10, 2)` | NOT NULL | 变更后单价 |
| `changed_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 变更时间 |
| `changed_by` | `UUID` | FK → User, NOT NULL | 操作人 |
| `reason` | `VARCHAR(255)` | | 变更原因 |

**索引：**
- `idx_nozzle_price_log_nozzle` ON `nozzle_id`
- `idx_nozzle_price_log_time` ON `changed_at`

---

### 1.7 Shift（班次定义）

班次是工作时段的模板定义。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `name` | `VARCHAR(50)` | NOT NULL | 班次名称（如"早班"、"晚班"） |
| `start_time` | `TIME` | NOT NULL | 开始时间（如 `08:00:00`） |
| `end_time` | `TIME` | NOT NULL | 结束时间（如 `16:00:00`） |
| `is_overnight` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | 是否跨天（如夜班 22:00-06:00） |
| `supervisor_id` | `UUID` | FK → User | 班次负责人（可选） |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 状态：`active`/`inactive` |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_shift_station` ON `station_id` — 站点关联
- `idx_shift_station_name` ON `(station_id, name)` UNIQUE — 站点内名称唯一

**约束：**
- 班次名称在同一站点内唯一

---

### 1.8 Schedule（排班计划）

排班计划是员工在具体日期的班次安排。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `shift_id` | `UUID` | FK → Shift, NOT NULL | 班次ID |
| `employee_id` | `UUID` | FK → StationEmployee, NOT NULL | 员工ID |
| `schedule_date` | `DATE` | NOT NULL | 排班日期 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'scheduled' | 状态：`scheduled`（已排）/`completed`（已执行）/`cancelled`（已取消） |
| `note` | `VARCHAR(255)` | | 备注 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |
| `created_by` | `UUID` | FK → User | 创建人 |

**索引：**
- `idx_schedule_station` ON `station_id`
- `idx_schedule_date` ON `schedule_date` — 日期查询（日历视图）
- `idx_schedule_employee` ON `employee_id` — 员工排班查询
- `idx_schedule_station_date` ON `(station_id, schedule_date)` — 站点+日期组合查询
- `idx_schedule_employee_date` ON `(employee_id, schedule_date)` UNIQUE — 防止同一天重复排班

**约束：**
- 同一员工同一天只能有一个排班（或允许多班时移除 UNIQUE）

---

### 1.9 StationEmployee（站点员工关联）

关联站点与员工，支持同步模式和本地模式。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `user_id` | `UUID` | FK → User | 关联系统用户（同步模式时使用） |
| `employee_no` | `VARCHAR(32)` | | 工号 |
| `name` | `VARCHAR(50)` | NOT NULL | 员工姓名 |
| `phone` | `VARCHAR(20)` | | 联系电话 |
| `position` | `VARCHAR(50)` | | 岗位 |
| `source` | `VARCHAR(20)` | NOT NULL, DEFAULT 'sync' | 数据来源：`sync`（同步）/`local`（本地） |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 状态：`active`/`inactive` |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_station_employee_station` ON `station_id`
- `idx_station_employee_user` ON `user_id`
- `idx_station_employee_station_user` ON `(station_id, user_id)` UNIQUE — 站点+用户唯一

---

### 1.10 StationImage（站点照片）

站点形象照片、环境照片管理。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `file_url` | `VARCHAR(500)` | NOT NULL | 文件URL |
| `file_name` | `VARCHAR(255)` | NOT NULL | 原始文件名 |
| `file_size` | `INTEGER` | | 文件大小（字节） |
| `mime_type` | `VARCHAR(50)` | | MIME类型（如 `image/jpeg`） |
| `image_type` | `VARCHAR(20)` | NOT NULL, DEFAULT 'general' | 图片类型：`primary`（主展示图）/`environment`（环境照）/`general`（通用） |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `uploaded_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 上传时间 |
| `uploaded_by` | `UUID` | FK → User | 上传人 |

**索引：**
- `idx_station_image_station` ON `station_id`
- `idx_station_image_type` ON `image_type`

---

### 1.11 ChargingPile（充电桩 - 预留）

充电桩映射预留结构，界面暂不展示。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `pile_no` | `VARCHAR(32)` | NOT NULL | 充电桩编号 |
| `pile_type` | `VARCHAR(20)` | | 类型：`dc`（直流快充）/`ac`（交流慢充） |
| `power_kw` | `DECIMAL(8, 2)` | | 功率（千瓦） |
| `connector_count` | `INTEGER` | NOT NULL, DEFAULT 1 | 充电接口数 |
| `device_status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'offline' | 设备状态 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 业务状态 |
| `external_id` | `VARCHAR(100)` | | 外部系统ID（与充电系统对接） |
| `tags` | `VARCHAR(50)[]` | | 标签数组，用于分类分组分析 |
| `config` | `JSONB` | | 扩展配置 |
| `custom_fields` | `JSONB` | | 自定义扩展字段，用于对接外部异构系统的未知字段 |
| `source_doc` | `JSONB` | | 原始数据存储，保留外部系统的原始报文用于排查问题 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_charging_pile_station` ON `station_id`
- `idx_charging_pile_station_no` ON `(station_id, pile_no)` UNIQUE
- `idx_charging_pile_tags` ON `tags` USING GIN — 标签查询

---

### 1.12 StationResponsibility（责任/维护站点关联）

站点与大客户/企业的责任站点、维护站点关联关系。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 站点ID |
| `enterprise_id` | `UUID` | FK → Enterprise, NOT NULL | 企业/大客户ID |
| `relation_type` | `VARCHAR(20)` | NOT NULL | 关系类型：`responsible`（责任站点）/`maintenance`（维护站点） |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `created_by` | `UUID` | FK → User | 创建人 |

**索引：**
- `idx_station_resp_station` ON `station_id`
- `idx_station_resp_enterprise` ON `enterprise_id`
- `idx_station_resp_unique` ON `(station_id, enterprise_id, relation_type)` UNIQUE

---

## 2. 实体关系

### 2.1 ER 图描述

```
┌─────────────────┐       ┌─────────────────┐
│  StationGroup   │       │     Region      │
│─────────────────│       │─────────────────│
│  id (PK)        │       │  id (PK)        │
│  name           │       │  name           │
│  ...            │       │  parent_id (FK) │◄──┐
└────────┬────────┘       │  ...            │   │ (self-ref)
         │                └────────┬────────┘───┘
         │                         │
         │ 1                       │ 1
         ▼ n                       ▼ n
┌─────────────────────────────────────────────────────────────────┐
│                         Station (站点)                          │
│─────────────────────────────────────────────────────────────────│
│  id (PK)                                                        │
│  code (UK)                                                      │
│  name                                                           │
│  group_id (FK) ──────────────────────────────────────────────►  │
│  region_id (FK) ─────────────────────────────────────────────►  │
│  primary_image_id (FK) ──────────────────────────────────────►  │
│  ...                                                            │
└──────┬──────────────┬──────────────┬──────────────┬─────────────┘
       │              │              │              │
       │ 1            │ 1            │ 1            │ 1
       ▼ n            ▼ n            ▼ n            ▼ n
┌──────────┐   ┌──────────────┐  ┌──────────┐  ┌──────────────────┐
│  Nozzle  │   │StationImage  │  │  Shift   │  │StationEmployee   │
│──────────│   │──────────────│  │──────────│  │──────────────────│
│ id (PK)  │   │ id (PK)      │  │ id (PK)  │  │ id (PK)          │
│station_id│   │ station_id   │  │station_id│  │ station_id       │
│fuel_type │   │ file_url     │  │ name     │  │ user_id (FK)     │
│unit_price│   │ ...          │  │ start    │  │ name             │
│ ...      │   └──────────────┘  │ end      │  │ ...              │
└────┬─────┘                     │ ...      │  └────────┬─────────┘
     │                           └────┬─────┘           │
     │ 1                              │                 │
     ▼ n                              │ 1               │ 1
┌──────────────────┐                  ▼ n               ▼ n
│NozzlePriceLog    │           ┌──────────────────────────────┐
│──────────────────│           │        Schedule (排班)        │
│ id (PK)          │           │──────────────────────────────│
│ nozzle_id (FK)   │           │ id (PK)                      │
│ old_price        │           │ station_id (FK)              │
│ new_price        │           │ shift_id (FK) ───────────────│
│ changed_at       │           │ employee_id (FK) ────────────│
│ ...              │           │ schedule_date                │
└──────────────────┘           │ ...                          │
                               └──────────────────────────────┘

┌─────────────────┐
│   FuelType      │
│─────────────────│
│  id (PK)        │        ┌──────────────────────────┐
│  code (UK)      │◄───────│  Nozzle.fuel_type_id     │
│  name           │        └──────────────────────────┘
│  category       │
│  unit           │
│  ...            │
└─────────────────┘

┌─────────────────────────────────────┐
│  ChargingPile (充电桩 - 预留)        │
│─────────────────────────────────────│
│  id (PK)                            │
│  station_id (FK) → Station          │
│  pile_no                            │
│  ...                                │
└─────────────────────────────────────┘

┌──────────────────────────────────────┐
│  StationResponsibility (责任站点)    │
│──────────────────────────────────────│
│  id (PK)                             │
│  station_id (FK) → Station           │
│  enterprise_id (FK) → Enterprise     │
│  relation_type                       │
│  ...                                 │
└──────────────────────────────────────┘
```

### 2.2 关系说明

| 关系 | 类型 | 说明 |
|------|------|------|
| StationGroup → Station | 1:N | 一个分组包含多个站点 |
| Region → Station | 1:N | 一个区域包含多个站点 |
| Region → Region (self) | 1:N | 区域自关联，支持层级结构 |
| Station → Nozzle | 1:N | 一个站点有多个枪 |
| Station → StationImage | 1:N | 一个站点有多张照片 |
| Station → Shift | 1:N | 一个站点有多个班次定义 |
| Station → StationEmployee | 1:N | 一个站点关联多个员工 |
| Station → Schedule | 1:N | 一个站点有多个排班记录 |
| Station → ChargingPile | 1:N | 一个站点有多个充电桩 |
| FuelType → Nozzle | 1:N | 一个燃料类型对应多个枪 |
| Shift → Schedule | 1:N | 一个班次对应多个排班记录 |
| StationEmployee → Schedule | 1:N | 一个员工有多个排班记录 |
| Nozzle → NozzlePriceLog | 1:N | 一个枪有多条价格变更记录 |
| Station ↔ Enterprise | N:N | 通过 StationResponsibility 多对多关联 |

---

## 3. API 接口设计

### 3.1 通用约定

**基础路径：** `/api/v1`

**请求头：**
```http
Authorization: Bearer <token>
Content-Type: application/json
X-Station-Context: <station_id>  // 当前站点上下文（可选）
```

**通用响应格式：**
```jsonc
{
  "code": 0,           // 0=成功，非0=错误
  "message": "success",
  "data": { ... },     // 业务数据
  "timestamp": "2026-02-15T10:30:00.000Z"
}
```

**分页响应格式：**
```jsonc
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**通用错误码：**

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400001 | 参数校验失败 |
| 401001 | 未授权 |
| 403001 | 无权限 |
| 404001 | 资源不存在 |
| 409001 | 资源冲突（如编码重复） |
| 500001 | 服务器内部错误 |

---

### 3.2 站点管理 API

#### GET /api/v1/stations

获取站点列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 20，最大 100 |
| `keyword` | string | 否 | 搜索关键词（匹配名称、编码） |
| `status` | string | 否 | 状态筛选：`active`/`inactive`/`all` |
| `groupId` | string | 否 | 分组ID筛选 |
| `regionId` | string | 否 | 区域ID筛选（含下级区域） |
| `sortBy` | string | 否 | 排序字段：`name`/`code`/`createdAt`，默认 `createdAt` |
| `sortOrder` | string | 否 | 排序方向：`asc`/`desc`，默认 `desc` |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "code": "ST001",
        "name": "城北加气站",
        "address": "北京市朝阳区望京街道100号",
        "latitude": 39.9904,
        "longitude": 116.4737,
        "contactPhone": "010-12345678",
        "contactName": "张站长",
        "status": "active",
        "group": {
          "id": "...",
          "name": "城市加气站"
        },
        "region": {
          "id": "...",
          "name": "北京市/朝阳区"
        },
        "primaryImage": {
          "id": "...",
          "url": "https://cdn.example.com/images/station001.jpg"
        },
        "nozzleCount": 6,
        "createdAt": "2026-01-15T08:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

**权限：** `station:list`

---

#### GET /api/v1/stations/:id

获取站点详情。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 站点ID |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "code": "ST001",
    "name": "城北加气站",
    "address": "北京市朝阳区望京街道100号",
    "latitude": 39.9904,
    "longitude": 116.4737,
    "contactPhone": "010-12345678",
    "contactName": "张站长",
    "businessHours": {
      "weekday": "06:00-22:00",
      "weekend": "07:00-21:00"
    },
    "status": "active",
    "employeeSyncMode": "sync",
    "group": {
      "id": "...",
      "name": "城市加气站"
    },
    "region": {
      "id": "...",
      "name": "北京市/朝阳区",
      "path": ["北京市", "朝阳区"]
    },
    "primaryImage": {
      "id": "...",
      "url": "https://cdn.example.com/images/station001.jpg"
    },
    "statistics": {
      "nozzleCount": 6,
      "employeeCount": 12,
      "shiftCount": 3,
      "imageCount": 5
    },
    "responsibilities": [
      {
        "enterpriseId": "...",
        "enterpriseName": "某物流公司",
        "relationType": "responsible"
      }
    ],
    "createdAt": "2026-01-15T08:30:00.000Z",
    "updatedAt": "2026-02-10T14:20:00.000Z",
    "createdBy": { "id": "...", "name": "管理员" }
  }
}
```

**权限：** `station:read`

---

#### POST /api/v1/stations

新增站点。

**请求 Body：**
```json
{
  "code": "ST002",
  "codeMode": "manual",
  "name": "城南加气站",
  "address": "北京市丰台区草桥路200号",
  "latitude": 39.8664,
  "longitude": 116.3370,
  "contactPhone": "010-87654321",
  "contactName": "李站长",
  "businessHours": {
    "weekday": "06:00-22:00",
    "weekend": "07:00-21:00"
  },
  "groupId": "550e8400-e29b-41d4-a716-446655440010",
  "regionId": "550e8400-e29b-41d4-a716-446655440020",
  "employeeSyncMode": "sync"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | string | 条件 | 站点编码（`codeMode=manual` 时必填） |
| `codeMode` | string | 否 | 编码模式：`auto`（自动生成）/`manual`（手工输入），默认 `auto` |
| `name` | string | 是 | 站点名称 |
| `address` | string | 是 | 详细地址 |
| `latitude` | number | 否 | 纬度 |
| `longitude` | number | 否 | 经度 |
| `contactPhone` | string | 否 | 联系电话 |
| `contactName` | string | 否 | 联系人 |
| `businessHours` | object | 否 | 营业时间 |
| `groupId` | string | 否 | 分组ID |
| `regionId` | string | 否 | 区域ID |
| `employeeSyncMode` | string | 否 | 员工同步模式 |

**响应示例：**
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "code": "ST002"
  }
}
```

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409001 | 站点编码已存在 |
| 400001 | 参数校验失败 |

**权限：** `station:create`

---

#### PUT /api/v1/stations/:id

编辑站点。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 站点ID |

**请求 Body：**
```json
{
  "name": "城南加气站（新名称）",
  "address": "北京市丰台区草桥路200号",
  "latitude": 39.8664,
  "longitude": 116.3370,
  "contactPhone": "010-87654322",
  "contactName": "王站长",
  "businessHours": {
    "weekday": "05:30-23:00",
    "weekend": "06:00-22:00"
  },
  "groupId": "...",
  "regionId": "..."
}
```

> **注意：** `code` 字段不可修改，请求中不应包含。

**响应示例：**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002"
  }
}
```

**权限：** `station:update`

---

#### DELETE /api/v1/stations/:id

删除站点（软删除，标记为停用）。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 站点ID |

**响应示例：**
```json
{
  "code": 0,
  "message": "站点已停用"
}
```

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409002 | 站点存在未完成的业务，无法删除 |

**权限：** `station:delete`

---

#### PATCH /api/v1/stations/:id/status

更新站点状态（启用/停用）。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 站点ID |

**请求 Body：**
```json
{
  "status": "active"
}
```

**权限：** `station:update`

---

### 3.3 枪配置管理 API

#### GET /api/v1/stations/:stationId/nozzles

获取站点的枪列表。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `stationId` | string | 站点ID |

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fuelTypeId` | string | 否 | 燃料类型筛选 |
| `status` | string | 否 | 状态筛选：`active`/`inactive`/`all` |
| `deviceStatus` | string | 否 | 设备状态：`online`/`offline`/`error` |
| `tags` | string | 否 | 标签筛选（逗号分隔，如 `lngVendorA,protocol_v2`） |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "...",
        "nozzleNo": "01",
        "fuelType": {
          "id": "...",
          "code": "CNG",
          "name": "CNG压缩天然气",
          "unit": "m³"
        },
        "unitPrice": 4.50,
        "dispenserNo": "D01",
        "deviceStatus": "online",
        "fuelingStatus": "idle",
        "lastHeartbeatAt": "2026-02-15T10:25:00.000Z",
        "status": "active",
        "tags": ["lngVendorA", "protocol_v2"],
        "customFields": {
          "vendorCode": "ABC123"
        }
      }
    ]
  }
}
```

**权限：** `nozzle:list`

---

#### POST /api/v1/stations/:stationId/nozzles

新增枪配置。

**请求 Body：**
```json
{
  "nozzleNo": "02",
  "fuelTypeId": "...",
  "unitPrice": 4.50,
  "dispenserNo": "D01",
  "tags": ["lngVendorA", "protocol_v2"],
  "customFields": {
    "vendorCode": "ABC123",
    "protocolVersion": "2.1"
  },
  "sourceDoc": {
    "rawResponse": "...",
    "receivedAt": "2026-02-15T10:00:00Z"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `nozzleNo` | string | 是 | 枪号（站点内唯一） |
| `fuelTypeId` | string | 是 | 燃料类型ID |
| `unitPrice` | number | 是 | 初始单价 |
| `dispenserNo` | string | 否 | 加注机编号 |
| `tags` | string[] | 否 | 标签数组，用于分类分组分析 |
| `customFields` | object | 否 | 自定义扩展字段（外部系统对接） |
| `sourceDoc` | object | 否 | 原始数据存储（设备报文等） |

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409001 | 枪号已存在 |

**权限：** `nozzle:create`

---

#### PUT /api/v1/stations/:stationId/nozzles/:id

编辑枪配置。

**请求 Body：**
```json
{
  "fuelTypeId": "...",
  "unitPrice": 4.80,
  "dispenserNo": "D02",
  "tags": ["lngVendorA", "protocol_v2"],
  "customFields": {
    "vendorCode": "ABC123",
    "protocolVersion": "2.1"
  },
  "sourceDoc": {
    "rawResponse": "...",
    "receivedAt": "2026-02-15T10:00:00Z"
  }
}
```

> **注意：** `nozzleNo` 不可修改。

**权限：** `nozzle:update`

---

#### PATCH /api/v1/stations/:stationId/nozzles/:id/price

单独设置枪单价。

**请求 Body：**
```json
{
  "unitPrice": 4.80,
  "reason": "调整燃气价格"
}
```

**响应：**
价格变更成功后自动写入 `NozzlePriceLog` 表。

**权限：** `nozzle:price`

---

#### PATCH /api/v1/stations/:stationId/nozzles/batch-price

批量设置枪单价。

**请求 Body：**
```json
{
  "nozzleIds": ["id1", "id2", "id3"],
  "unitPrice": 4.80,
  "reason": "统一调价"
}
```

也支持按燃料类型批量设置：
```json
{
  "fuelTypeId": "...",
  "unitPrice": 4.80,
  "reason": "CNG统一调价"
}
```

**权限：** `nozzle:price`

---

#### PATCH /api/v1/stations/:stationId/nozzles/:id/status

枪启用/停用。

**请求 Body：**
```json
{
  "status": "inactive"
}
```

**权限：** `nozzle:update`

---

#### GET /api/v1/stations/:stationId/nozzles/:id

获取枪详情（含实时状态）。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "...",
    "nozzleNo": "01",
    "fuelType": {
      "id": "...",
      "code": "CNG",
      "name": "CNG压缩天然气",
      "unit": "m³"
    },
    "unitPrice": 4.50,
    "dispenserNo": "D01",
    "deviceStatus": "online",
    "fuelingStatus": "fueling",
    "currentFuelingAmount": 15.5,
    "lastHeartbeatAt": "2026-02-15T10:25:00.000Z",
    "status": "active",
    "priceHistory": [
      {
        "oldPrice": 4.30,
        "newPrice": 4.50,
        "changedAt": "2026-02-10T09:00:00.000Z",
        "changedBy": "张经理"
      }
    ]
  }
}
```

**权限：** `nozzle:read`

---

### 3.4 班次与排班管理 API

#### GET /api/v1/stations/:stationId/shifts

获取班次列表。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "...",
        "name": "早班",
        "startTime": "06:00",
        "endTime": "14:00",
        "isOvernight": false,
        "supervisor": {
          "id": "...",
          "name": "张班长"
        },
        "status": "active"
      },
      {
        "id": "...",
        "name": "中班",
        "startTime": "14:00",
        "endTime": "22:00",
        "isOvernight": false,
        "supervisor": null,
        "status": "active"
      },
      {
        "id": "...",
        "name": "夜班",
        "startTime": "22:00",
        "endTime": "06:00",
        "isOvernight": true,
        "supervisor": {
          "id": "...",
          "name": "李班长"
        },
        "status": "active"
      }
    ]
  }
}
```

**权限：** `shift:list`

---

#### POST /api/v1/stations/:stationId/shifts

新增班次。

**请求 Body：**
```json
{
  "name": "早班",
  "startTime": "06:00",
  "endTime": "14:00",
  "isOvernight": false,
  "supervisorId": "..."
}
```

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409001 | 班次名称已存在 |
| 400002 | 班次时间段与已有班次重叠（警告，不阻止） |

**权限：** `shift:create`

---

#### PUT /api/v1/stations/:stationId/shifts/:id

编辑班次。

**权限：** `shift:update`

---

#### DELETE /api/v1/stations/:stationId/shifts/:id

删除班次。

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409003 | 班次存在历史排班记录，无法删除 |

**权限：** `shift:delete`

---

#### GET /api/v1/stations/:stationId/schedules

获取排班列表/日历数据。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `startDate` | string | 是 | 开始日期（YYYY-MM-DD） |
| `endDate` | string | 是 | 结束日期（YYYY-MM-DD） |
| `employeeId` | string | 否 | 员工筛选 |
| `shiftId` | string | 否 | 班次筛选 |
| `view` | string | 否 | 视图类型：`list`/`calendar`，默认 `list` |

**响应示例（日历视图）：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "2026-02-15": [
      {
        "id": "...",
        "shift": { "id": "...", "name": "早班", "startTime": "06:00", "endTime": "14:00" },
        "employee": { "id": "...", "name": "张三", "position": "加气员" },
        "status": "scheduled"
      },
      {
        "id": "...",
        "shift": { "id": "...", "name": "早班", "startTime": "06:00", "endTime": "14:00" },
        "employee": { "id": "...", "name": "李四", "position": "加气员" },
        "status": "scheduled"
      }
    ],
    "2026-02-16": [ ... ]
  }
}
```

**权限：** `schedule:list`

---

#### POST /api/v1/stations/:stationId/schedules

创建排班。

**请求 Body（单条）：**
```json
{
  "scheduleDate": "2026-02-20",
  "shiftId": "...",
  "employeeId": "...",
  "note": ""
}
```

**请求 Body（批量）：**
```json
{
  "dateRange": {
    "startDate": "2026-02-20",
    "endDate": "2026-02-26"
  },
  "shiftId": "...",
  "employeeIds": ["id1", "id2"]
}
```

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409004 | 员工在该日期已有排班 |

**权限：** `schedule:create`

---

#### PUT /api/v1/stations/:stationId/schedules/:id

编辑排班。

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 403002 | 历史排班不可修改 |

**权限：** `schedule:update`

---

#### DELETE /api/v1/stations/:stationId/schedules/:id

删除/取消排班。

**权限：** `schedule:delete`

---

#### GET /api/v1/stations/:stationId/schedules/current

获取当前正在进行的班次排班信息。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "...",
    "shift": { "id": "...", "name": "早班", "startTime": "06:00", "endTime": "14:00" },
    "employee": { "id": "...", "name": "张建国", "position": "站长" },
    "scheduleDate": "2026-02-16",
    "status": "scheduled"
  }
}
```

> 根据服务器当前时间自动匹配正在进行的班次。如果当前时间不在任何班次内，返回 `data: null`。

**权限：** `schedule:list`

---

#### GET /api/v1/stations/:stationId/schedules/next

获取下一个班次的排班信息。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "...",
    "shift": { "id": "...", "name": "中班", "startTime": "14:00", "endTime": "22:00" },
    "employee": { "id": "...", "name": "王磊", "position": "班组长" },
    "scheduleDate": "2026-02-16",
    "status": "scheduled"
  }
}
```

> 返回当前班次之后的下一个排班。用于站点概况页显示"下一班次"信息。

**权限：** `schedule:list`

---

### 3.5 员工管理 API

#### GET /api/v1/stations/:stationId/employees

获取站点员工列表。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "...",
        "employeeNo": "EMP001",
        "name": "张三",
        "phone": "13800138001",
        "position": "加气员",
        "source": "sync",
        "userId": "...",
        "status": "active",
        "scheduleStats": {
          "thisMonth": 22,
          "nextWeek": 5
        }
      }
    ],
    "syncMode": "sync"
  }
}
```

**权限：** `employee:list`

---

#### POST /api/v1/stations/:stationId/employees

新增员工（仅 `local` 模式可用）。

**请求 Body：**
```json
{
  "employeeNo": "EMP010",
  "name": "王五",
  "phone": "13800138010",
  "position": "加气员"
}
```

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 403003 | 站点处于同步模式，无法直接新增员工 |

**权限：** `employee:create`

---

#### PUT /api/v1/stations/:stationId/employees/:id

编辑员工（仅 `local` 模式可用）。

**权限：** `employee:update`

---

### 3.6 分组与区域管理 API

#### GET /api/v1/station-groups

获取分组列表。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "...",
        "name": "高速服务区站点",
        "description": "位于高速公路服务区的加气站",
        "stationCount": 15,
        "sortOrder": 1,
        "status": "active"
      },
      {
        "id": "...",
        "name": "城市加气站",
        "description": "市区内的加气站",
        "stationCount": 30,
        "sortOrder": 2,
        "status": "active"
      }
    ]
  }
}
```

**权限：** `station-group:list`

---

#### POST /api/v1/station-groups

新增分组。

**请求 Body：**
```json
{
  "name": "新能源综合站",
  "description": "带充电桩的综合能源站",
  "sortOrder": 3
}
```

**权限：** `station-group:create`

---

#### PUT /api/v1/station-groups/:id

编辑分组。

**权限：** `station-group:update`

---

#### DELETE /api/v1/station-groups/:id

删除分组（需分组下无站点）。

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409005 | 分组下存在站点，无法删除 |

**权限：** `station-group:delete`

---

#### GET /api/v1/regions

获取区域树。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `parentId` | string | 否 | 父级区域ID，为空则返回顶级 |
| `includeChildren` | boolean | 否 | 是否包含所有下级，默认 false |

**响应示例（树形）：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "...",
        "name": "北京市",
        "code": "110000",
        "level": 1,
        "stationCount": 45,
        "children": [
          {
            "id": "...",
            "name": "朝阳区",
            "code": "110105",
            "level": 2,
            "stationCount": 15,
            "children": []
          },
          {
            "id": "...",
            "name": "海淀区",
            "code": "110108",
            "level": 2,
            "stationCount": 12,
            "children": []
          }
        ]
      }
    ]
  }
}
```

**权限：** `region:list`

---

#### POST /api/v1/regions

新增区域。

**请求 Body：**
```json
{
  "name": "通州区",
  "code": "110112",
  "parentId": "...",
  "sortOrder": 5
}
```

**权限：** `region:create`

---

#### PUT /api/v1/regions/:id

编辑区域。

**权限：** `region:update`

---

#### DELETE /api/v1/regions/:id

删除区域。

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409006 | 区域下存在子区域，无法删除 |
| 409007 | 区域下存在站点，无法删除 |

**权限：** `region:delete`

---

### 3.7 照片管理 API

#### GET /api/v1/stations/:stationId/images

获取站点照片列表。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "...",
        "fileUrl": "https://cdn.example.com/images/station001_01.jpg",
        "fileName": "station001_01.jpg",
        "fileSize": 1024000,
        "mimeType": "image/jpeg",
        "imageType": "primary",
        "uploadedAt": "2026-02-10T14:30:00.000Z",
        "uploadedBy": { "id": "...", "name": "张站长" }
      }
    ],
    "primaryImageId": "..."
  }
}
```

**权限：** `station-image:list`

---

#### POST /api/v1/stations/:stationId/images

上传站点照片。

**请求：** `multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `files` | File[] | 是 | 图片文件（支持多文件） |
| `imageType` | string | 否 | 图片类型，默认 `general` |

**响应示例：**
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "uploaded": [
      {
        "id": "...",
        "fileUrl": "https://cdn.example.com/images/station001_02.jpg",
        "fileName": "station001_02.jpg"
      }
    ]
  }
}
```

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 400003 | 文件格式不支持（仅支持 jpg/png/webp） |
| 400004 | 文件大小超过限制（最大 5MB） |

**权限：** `station-image:upload`

---

#### DELETE /api/v1/stations/:stationId/images/:id

删除照片。

**权限：** `station-image:delete`

---

#### PATCH /api/v1/stations/:stationId/images/:id/set-primary

设置主展示图。

**响应：**
成功后更新 `Station.primary_image_id`。

**权限：** `station-image:update`

---

#### DELETE /api/v1/stations/:stationId/images/batch

批量删除照片。

**请求 Body：**
```json
{
  "imageIds": ["id1", "id2", "id3"]
}
```

**权限：** `station-image:delete`

---

### 3.8 燃料类型 API

#### GET /api/v1/fuel-types

获取燃料类型列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `category` | string | 否 | 类别筛选：`gasoline`/`diesel`/`gas`/`other` |
| `status` | string | 否 | 状态筛选 |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "...",
        "code": "GASOLINE_92",
        "name": "92#汽油",
        "category": "gasoline",
        "unit": "L",
        "isSystem": true,
        "status": "active"
      },
      {
        "id": "...",
        "code": "CNG",
        "name": "CNG压缩天然气",
        "category": "gas",
        "unit": "m³",
        "isSystem": true,
        "status": "active"
      }
    ]
  }
}
```

**权限：** `fuel-type:list`

---

#### POST /api/v1/fuel-types

新增自定义燃料类型（仅 `isSystem = false`）。

**请求 Body：**
```json
{
  "code": "BIO_DIESEL",
  "name": "生物柴油",
  "category": "diesel",
  "unit": "L"
}
```

**权限：** `fuel-type:create`

---

### 3.9 责任站点/维护站点 API

#### GET /api/v1/stations/:stationId/responsibilities

获取站点的责任/维护站点关联。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "...",
        "enterprise": {
          "id": "...",
          "name": "某物流公司",
          "code": "ENT001"
        },
        "relationType": "responsible",
        "createdAt": "2026-01-20T10:00:00.000Z"
      },
      {
        "id": "...",
        "enterprise": {
          "id": "...",
          "name": "某运输集团",
          "code": "ENT002"
        },
        "relationType": "maintenance",
        "createdAt": "2026-01-22T14:30:00.000Z"
      }
    ]
  }
}
```

**权限：** `station-responsibility:list`

---

#### POST /api/v1/stations/:stationId/responsibilities

新增责任/维护站点关联。

**请求 Body：**
```json
{
  "enterpriseId": "...",
  "relationType": "responsible"
}
```

**权限：** `station-responsibility:create`

---

#### DELETE /api/v1/stations/:stationId/responsibilities/:id

删除关联。

**权限：** `station-responsibility:delete`

---

### 3.10 充电桩 API（预留）

> 以下 API 预留数据结构，暂不对外暴露。

#### GET /api/v1/stations/:stationId/charging-piles

获取充电桩列表。

#### POST /api/v1/stations/:stationId/charging-piles

新增充电桩。

#### PUT /api/v1/stations/:stationId/charging-piles/:id

编辑充电桩。

---

## 4. 模拟数据规范

### 4.1 数据生成规则

基于 `docs/STANDARDS.md` §6 模拟数据规范：

| 实体 | 数量 | 规则 |
|------|------|------|
| Station | 10-20 | 使用真实城市地址，编码 ST001-ST020 |
| StationGroup | 3-5 | 如"高速服务区"、"城市加气站"、"物流园区站" |
| Region | 10-15 | 使用真实行政区划（北京/上海下辖区） |
| FuelType | 6 | 系统内置 + 1-2 个自定义 |
| Nozzle | 每站 4-8 | 枪号 01-08，按燃料类型分配 |
| Shift | 每站 2-3 | 早班/中班/夜班 |
| StationEmployee | 每站 8-15 | 中文姓名，工号 EMP001-EMP100 |
| Schedule | 30天数据 | 覆盖当前月 |
| StationImage | 每站 3-5 | 使用占位图 URL |

### 4.2 示例数据

#### Station 示例

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "code": "ST001",
  "name": "城北加气站",
  "address": "北京市朝阳区望京街道阜荣街10号",
  "latitude": 39.9904,
  "longitude": 116.4737,
  "contactPhone": "010-64701234",
  "contactName": "张明",
  "businessHours": {
    "weekday": "06:00-22:00",
    "weekend": "07:00-21:00"
  },
  "status": "active",
  "employeeSyncMode": "sync",
  "groupId": "550e8400-e29b-41d4-a716-446655440101",
  "regionId": "550e8400-e29b-41d4-a716-446655440201",
  "createdAt": "2025-06-15T08:30:00.000Z",
  "updatedAt": "2026-02-10T14:20:00.000Z"
}
```

#### Nozzle 示例

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440301",
  "stationId": "550e8400-e29b-41d4-a716-446655440001",
  "nozzleNo": "01",
  "fuelTypeId": "550e8400-e29b-41d4-a716-446655440401",
  "unitPrice": 4.50,
  "dispenserNo": "D01",
  "deviceStatus": "online",
  "fuelingStatus": "idle",
  "lastHeartbeatAt": "2026-02-15T10:25:00.000Z",
  "status": "active"
}
```

#### Shift 示例

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440501",
  "stationId": "550e8400-e29b-41d4-a716-446655440001",
  "name": "早班",
  "startTime": "06:00:00",
  "endTime": "14:00:00",
  "isOvernight": false,
  "supervisorId": "550e8400-e29b-41d4-a716-446655440601",
  "status": "active"
}
```

#### Schedule 示例

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440701",
  "stationId": "550e8400-e29b-41d4-a716-446655440001",
  "shiftId": "550e8400-e29b-41d4-a716-446655440501",
  "employeeId": "550e8400-e29b-41d4-a716-446655440801",
  "scheduleDate": "2026-02-15",
  "status": "scheduled",
  "note": ""
}
```

---

## 5. 权限列表

| 权限代码 | 说明 | 默认角色 |
|----------|------|----------|
| `station:list` | 查看站点列表 | 所有角色 |
| `station:read` | 查看站点详情 | 所有角色 |
| `station:create` | 新增站点 | `ops_manager`, `admin` |
| `station:update` | 编辑站点 | `ops_manager`, `station_master`, `admin` |
| `station:delete` | 删除站点 | `ops_manager`, `admin` |
| `nozzle:list` | 查看枪列表 | 所有角色 |
| `nozzle:read` | 查看枪详情 | 所有角色 |
| `nozzle:create` | 新增枪 | `equipment_admin`, `admin` |
| `nozzle:update` | 编辑枪 | `equipment_admin`, `admin` |
| `nozzle:price` | 设置枪单价 | `station_master`, `ops_manager`, `admin` |
| `shift:list` | 查看班次 | 所有角色 |
| `shift:create` | 新增班次 | `station_master`, `admin` |
| `shift:update` | 编辑班次 | `station_master`, `admin` |
| `shift:delete` | 删除班次 | `station_master`, `admin` |
| `schedule:list` | 查看排班 | 所有角色 |
| `schedule:create` | 创建排班 | `station_master`, `admin` |
| `schedule:update` | 编辑排班 | `station_master`, `admin` |
| `schedule:delete` | 删除排班 | `station_master`, `admin` |
| `employee:list` | 查看员工 | 所有角色 |
| `employee:create` | 新增员工 | `station_master`, `admin` |
| `employee:update` | 编辑员工 | `station_master`, `admin` |
| `station-group:list` | 查看分组 | 所有角色 |
| `station-group:create` | 新增分组 | `ops_manager`, `admin` |
| `station-group:update` | 编辑分组 | `ops_manager`, `admin` |
| `station-group:delete` | 删除分组 | `ops_manager`, `admin` |
| `region:list` | 查看区域 | 所有角色 |
| `region:create` | 新增区域 | `ops_manager`, `admin` |
| `region:update` | 编辑区域 | `ops_manager`, `admin` |
| `region:delete` | 删除区域 | `ops_manager`, `admin` |
| `station-image:list` | 查看照片 | 所有角色 |
| `station-image:upload` | 上传照片 | `station_master`, `admin` |
| `station-image:update` | 设置主展示图 | `station_master`, `admin` |
| `station-image:delete` | 删除照片 | `station_master`, `admin` |
| `fuel-type:list` | 查看燃料类型 | 所有角色 |
| `fuel-type:create` | 新增燃料类型 | `admin` |
| `station-responsibility:list` | 查看责任站点 | 所有角色 |
| `station-responsibility:create` | 设置责任站点 | `ops_manager`, `admin` |
| `station-responsibility:delete` | 删除责任站点 | `ops_manager`, `admin` |

---

## 附录：设计决策记录

| # | 决策 | 说明 |
|---|------|------|
| D1 | 站点编码不可修改 | 编码可能被外部系统引用，修改会导致数据不一致 |
| D2 | 枪号不可修改 | 同上，枪号是业务标识 |
| D3 | 软删除策略 | 所有实体删除时标记 `status=inactive`，保留历史数据 |
| D4 | 员工同步模式可配置 | 站点级别配置，支持从系统用户模块同步或本地独立维护 |
| D5 | 燃料类型固定枚举优先 | 系统内置 6 种常见类型，支持自定义扩展 |
| D6 | 充电桩预留结构 | 数据模型和 API 预留，界面暂不展示 |
| D7 | 区域使用 path 字段 | 存储完整路径便于查询下级区域（如 `/北京市/朝阳区/`） |
| D8 | 排班冲突检测 | 同一员工同一天只允许一个排班，API 返回错误提示 |
| D9 | 价格变更日志 | 枪单价变更自动记录日志，支持审计追溯 |

---

## 6. Database Schema (PostgreSQL)

> 后端启动时可直接使用的数据库表定义草案。基于 Section 1 数据模型生成。

```sql
-- ============================================================================
-- 模块：基础运营 > 站点管理 (1.1)
-- 生成日期：2026-02-24
-- 基于：architecture.md Section 1 数据模型
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- ENUM Types
-- ----------------------------------------------------------------------------

CREATE TYPE station_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE general_status AS ENUM ('active', 'inactive');
CREATE TYPE fuel_category AS ENUM ('gasoline', 'diesel', 'gas', 'other');
CREATE TYPE fuel_unit AS ENUM ('L', 'kg', 'm³');
CREATE TYPE device_status AS ENUM ('online', 'offline', 'error');
CREATE TYPE fueling_status AS ENUM ('idle', 'fueling');
CREATE TYPE schedule_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE employee_source AS ENUM ('sync', 'local');
CREATE TYPE employee_sync_mode AS ENUM ('sync', 'local');
CREATE TYPE image_type AS ENUM ('primary', 'environment', 'general');
CREATE TYPE pile_type AS ENUM ('dc', 'ac');
CREATE TYPE responsibility_type AS ENUM ('responsible', 'maintenance');

-- ----------------------------------------------------------------------------
-- 1. StationGroup（站点分组）
-- ----------------------------------------------------------------------------

CREATE TABLE station_group (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50)     NOT NULL,
    description     VARCHAR(255),
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    status          general_status  NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_station_group_name UNIQUE (name)
);

CREATE INDEX idx_station_group_name ON station_group (name);
CREATE INDEX idx_station_group_sort ON station_group (sort_order);

COMMENT ON TABLE station_group IS '站点分组 — 用于业务分类，如"高速服务区站点"、"城市加气站"';

-- ----------------------------------------------------------------------------
-- 2. Region（区域）
-- ----------------------------------------------------------------------------

CREATE TABLE region (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50)     NOT NULL,
    code            VARCHAR(32),
    parent_id       UUID            REFERENCES region (id) ON DELETE RESTRICT,
    level           INTEGER         NOT NULL DEFAULT 1,
    path            VARCHAR(255),
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    status          general_status  NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_region_code UNIQUE (code),
    CONSTRAINT chk_region_level CHECK (level >= 1 AND level <= 10)
);

CREATE INDEX idx_region_parent ON region (parent_id);
CREATE INDEX idx_region_code   ON region (code);
CREATE INDEX idx_region_path   ON region USING GIN (path gin_trgm_ops);

COMMENT ON TABLE region IS '区域 — 地理层级管理，支持多级结构（省 → 市 → 区）';

-- ----------------------------------------------------------------------------
-- 3. FuelType（燃料类型）
-- ----------------------------------------------------------------------------

CREATE TABLE fuel_type (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20)     NOT NULL,
    name            VARCHAR(50)     NOT NULL,
    category        fuel_category   NOT NULL,
    is_system       BOOLEAN         NOT NULL DEFAULT FALSE,
    unit            fuel_unit       NOT NULL DEFAULT 'L',
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    status          general_status  NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_fuel_type_code UNIQUE (code)
);

CREATE INDEX idx_fuel_type_code     ON fuel_type (code);
CREATE INDEX idx_fuel_type_category ON fuel_type (category);

COMMENT ON TABLE fuel_type IS '燃料类型 — 固定枚举 + 自定义扩展（如 CNG、LNG、92#汽油）';

-- ----------------------------------------------------------------------------
-- 4. Station（站点）
-- ----------------------------------------------------------------------------

CREATE TABLE station (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(32)     NOT NULL,
    name                VARCHAR(100)    NOT NULL,
    address             VARCHAR(255)    NOT NULL,
    latitude            DECIMAL(10, 7),
    longitude           DECIMAL(10, 7),
    contact_phone       VARCHAR(20),
    contact_name        VARCHAR(50),
    business_hours      JSONB,
    group_id            UUID            REFERENCES station_group (id) ON DELETE RESTRICT,
    region_id           UUID            REFERENCES region (id) ON DELETE RESTRICT,
    status              station_status  NOT NULL DEFAULT 'active',
    primary_image_id    UUID,           -- FK added later (circular ref with station_image)
    employee_sync_mode  employee_sync_mode NOT NULL DEFAULT 'sync',
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by          UUID,           -- FK → User (external module)
    updated_by          UUID,           -- FK → User (external module)

    CONSTRAINT uq_station_code UNIQUE (code),
    CONSTRAINT chk_station_latitude  CHECK (latitude  IS NULL OR (latitude  BETWEEN -90 AND 90)),
    CONSTRAINT chk_station_longitude CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180))
);

CREATE INDEX idx_station_code   ON station (code);
CREATE INDEX idx_station_name   ON station (name);
CREATE INDEX idx_station_status ON station (status);
CREATE INDEX idx_station_group  ON station (group_id);
CREATE INDEX idx_station_region ON station (region_id);
CREATE INDEX idx_station_geo    ON station (latitude, longitude);

COMMENT ON TABLE station IS '站点 — 系统核心实体，代表一个加气站/加油站物理站点';

-- ----------------------------------------------------------------------------
-- 5. StationImage（站点照片）
-- ----------------------------------------------------------------------------

CREATE TABLE station_image (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id      UUID            NOT NULL REFERENCES station (id) ON DELETE CASCADE,
    file_url        VARCHAR(500)    NOT NULL,
    file_name       VARCHAR(255)    NOT NULL,
    file_size       INTEGER,
    mime_type       VARCHAR(50),
    image_type      image_type      NOT NULL DEFAULT 'general',
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    uploaded_at     TIMESTAMP       NOT NULL DEFAULT NOW(),
    uploaded_by     UUID,           -- FK → User (external module)

    CONSTRAINT chk_station_image_file_size CHECK (file_size IS NULL OR file_size > 0)
);

CREATE INDEX idx_station_image_station ON station_image (station_id);
CREATE INDEX idx_station_image_type    ON station_image (image_type);

COMMENT ON TABLE station_image IS '站点照片 — 站点形象照片、环境照片管理';

-- Add deferred FK from station.primary_image_id → station_image.id
ALTER TABLE station
    ADD CONSTRAINT fk_station_primary_image
    FOREIGN KEY (primary_image_id) REFERENCES station_image (id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 6. Nozzle（枪）
-- ----------------------------------------------------------------------------

CREATE TABLE nozzle (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id          UUID            NOT NULL REFERENCES station (id) ON DELETE CASCADE,
    nozzle_no           VARCHAR(20)     NOT NULL,
    fuel_type_id        UUID            NOT NULL REFERENCES fuel_type (id) ON DELETE RESTRICT,
    unit_price          DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    dispenser_no        VARCHAR(20),
    device_status       device_status   NOT NULL DEFAULT 'offline',
    fueling_status      fueling_status  NOT NULL DEFAULT 'idle',
    last_heartbeat_at   TIMESTAMP,
    status              general_status  NOT NULL DEFAULT 'active',
    tags                VARCHAR(50)[],
    config              JSONB,
    custom_fields       JSONB,
    source_doc          JSONB,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_nozzle_station_no UNIQUE (station_id, nozzle_no),
    CONSTRAINT chk_nozzle_unit_price CHECK (unit_price >= 0)
);

CREATE INDEX idx_nozzle_station    ON nozzle (station_id);
CREATE INDEX idx_nozzle_fuel_type  ON nozzle (fuel_type_id);
CREATE INDEX idx_nozzle_status     ON nozzle (status);
CREATE INDEX idx_nozzle_tags       ON nozzle USING GIN (tags);

COMMENT ON TABLE nozzle IS '枪 — 加注设备末端，关联站点和燃料类型，支持外部系统对接扩展';

-- ----------------------------------------------------------------------------
-- 7. NozzlePriceLog（枪单价变更日志）
-- ----------------------------------------------------------------------------

CREATE TABLE nozzle_price_log (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    nozzle_id       UUID            NOT NULL REFERENCES nozzle (id) ON DELETE CASCADE,
    old_price       DECIMAL(10, 2)  NOT NULL,
    new_price       DECIMAL(10, 2)  NOT NULL,
    changed_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    changed_by      UUID            NOT NULL,   -- FK → User (external module)
    reason          VARCHAR(255),

    CONSTRAINT chk_nozzle_price_log_old CHECK (old_price >= 0),
    CONSTRAINT chk_nozzle_price_log_new CHECK (new_price >= 0),
    CONSTRAINT chk_nozzle_price_log_diff CHECK (old_price <> new_price)
);

CREATE INDEX idx_nozzle_price_log_nozzle ON nozzle_price_log (nozzle_id);
CREATE INDEX idx_nozzle_price_log_time   ON nozzle_price_log (changed_at);

COMMENT ON TABLE nozzle_price_log IS '枪单价变更日志 — 记录价格变更历史，用于审计和追溯';

-- ----------------------------------------------------------------------------
-- 8. StationEmployee（站点员工关联）
-- ----------------------------------------------------------------------------

CREATE TABLE station_employee (
    id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id      UUID              NOT NULL REFERENCES station (id) ON DELETE CASCADE,
    user_id         UUID,             -- FK → User (external module, used in sync mode)
    employee_no     VARCHAR(32),
    name            VARCHAR(50)       NOT NULL,
    phone           VARCHAR(20),
    position        VARCHAR(50),
    source          employee_source   NOT NULL DEFAULT 'sync',
    status          general_status    NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP         NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_station_employee_station_user UNIQUE (station_id, user_id)
);

CREATE INDEX idx_station_employee_station ON station_employee (station_id);
CREATE INDEX idx_station_employee_user    ON station_employee (user_id);

COMMENT ON TABLE station_employee IS '站点员工关联 — 关联站点与员工，支持同步模式和本地模式';

-- ----------------------------------------------------------------------------
-- 9. Shift（班次定义）
-- ----------------------------------------------------------------------------

CREATE TABLE shift (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id      UUID            NOT NULL REFERENCES station (id) ON DELETE CASCADE,
    name            VARCHAR(50)     NOT NULL,
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL,
    is_overnight    BOOLEAN         NOT NULL DEFAULT FALSE,
    supervisor_id   UUID,           -- FK → User (external module)
    status          general_status  NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_shift_station_name UNIQUE (station_id, name)
);

CREATE INDEX idx_shift_station ON shift (station_id);

COMMENT ON TABLE shift IS '班次定义 — 工作时段模板（如早班、中班、夜班）';

-- ----------------------------------------------------------------------------
-- 10. Schedule（排班计划）
-- ----------------------------------------------------------------------------

CREATE TABLE schedule (
    id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id      UUID              NOT NULL REFERENCES station (id) ON DELETE CASCADE,
    shift_id        UUID              NOT NULL REFERENCES shift (id) ON DELETE RESTRICT,
    employee_id     UUID              NOT NULL REFERENCES station_employee (id) ON DELETE RESTRICT,
    schedule_date   DATE              NOT NULL,
    status          schedule_status   NOT NULL DEFAULT 'scheduled',
    note            VARCHAR(255),
    created_at      TIMESTAMP         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP         NOT NULL DEFAULT NOW(),
    created_by      UUID,             -- FK → User (external module)

    CONSTRAINT uq_schedule_employee_date UNIQUE (employee_id, schedule_date)
);

CREATE INDEX idx_schedule_station       ON schedule (station_id);
CREATE INDEX idx_schedule_date          ON schedule (schedule_date);
CREATE INDEX idx_schedule_employee      ON schedule (employee_id);
CREATE INDEX idx_schedule_station_date  ON schedule (station_id, schedule_date);

COMMENT ON TABLE schedule IS '排班计划 — 员工在具体日期的班次安排';

-- ----------------------------------------------------------------------------
-- 11. ChargingPile（充电桩 — 预留）
-- ----------------------------------------------------------------------------

CREATE TABLE charging_pile (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id          UUID            NOT NULL REFERENCES station (id) ON DELETE CASCADE,
    pile_no             VARCHAR(32)     NOT NULL,
    pile_type           pile_type,
    power_kw            DECIMAL(8, 2),
    connector_count     INTEGER         NOT NULL DEFAULT 1,
    device_status       device_status   NOT NULL DEFAULT 'offline',
    status              general_status  NOT NULL DEFAULT 'active',
    external_id         VARCHAR(100),
    tags                VARCHAR(50)[],
    config              JSONB,
    custom_fields       JSONB,
    source_doc          JSONB,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_charging_pile_station_no UNIQUE (station_id, pile_no),
    CONSTRAINT chk_charging_pile_power     CHECK (power_kw IS NULL OR power_kw > 0),
    CONSTRAINT chk_charging_pile_connectors CHECK (connector_count >= 1)
);

CREATE INDEX idx_charging_pile_station ON charging_pile (station_id);
CREATE INDEX idx_charging_pile_tags    ON charging_pile USING GIN (tags);

COMMENT ON TABLE charging_pile IS '充电桩（预留）— 充电桩映射结构，界面暂不展示';

-- ----------------------------------------------------------------------------
-- 12. StationResponsibility（责任/维护站点关联）
-- ----------------------------------------------------------------------------

CREATE TABLE station_responsibility (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id      UUID                NOT NULL REFERENCES station (id) ON DELETE CASCADE,
    enterprise_id   UUID                NOT NULL,   -- FK → Enterprise (external module)
    relation_type   responsibility_type NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT NOW(),
    created_by      UUID,               -- FK → User (external module)

    CONSTRAINT uq_station_resp UNIQUE (station_id, enterprise_id, relation_type)
);

CREATE INDEX idx_station_resp_station    ON station_responsibility (station_id);
CREATE INDEX idx_station_resp_enterprise ON station_responsibility (enterprise_id);

COMMENT ON TABLE station_responsibility IS '责任/维护站点关联 — 站点与大客户/企业的多对多关系';

COMMIT;
```

---

*文档生成时间：2026-02-15*
*生成依据：requirements.md + user-stories.md + STANDARDS.md*

