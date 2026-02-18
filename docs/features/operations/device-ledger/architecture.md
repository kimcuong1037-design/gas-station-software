# 设备设施管理 — 架构设计

**模块：** 基础运营 > 设备设施管理 (1.3)
**基于：** requirements.md v1.0 + user-stories.md v1.0
**设计日期：** 2026-02-18
**状态：** 待评审

---

## 0. 设计原则

### 0.1 软删除策略

所有业务实体采用 `status` 字段进行软删除：
- `active` — 正常启用
- `inactive` — 已停用（软删除）

设备特有的运行状态（故障、待维保）通过独立字段表达，与软删除状态分离。

### 0.2 设备类型扩展性

设备类型采用固定枚举（7 种），满足 MVP 阶段需求：
- 储罐 (tank)、加气机 (dispenser)、泵 (pump)、阀门 (valve)、传感器 (sensor)、消防设备 (fire_equipment)、电气设备 (electrical)

不同设备类型的专有属性通过 `type_specific_fields` (JSONB) 存储，避免宽表。

### 0.3 监控数据分离

设备台账（静态档案）与设备监控数据（实时运行参数）分离存储：
- **Equipment** — 设备档案信息，变更频率低
- **EquipmentMonitoring** — 设备实时运行数据，高频更新
- **EquipmentMonitoringLog** — 历史运行数据快照，用于趋势图

### 0.4 工单审批流对接

维保工单的审批流由系统统一审批流模块提供，本模块仅定义工单状态机和审批触发节点。各站点可配置不同的审批流。

---

## 1. 数据模型

### 1.1 Equipment（设备台账）

设备台账是本模块的核心实体，记录每台设备的完整档案信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `device_code` | `VARCHAR(32)` | UNIQUE, NOT NULL | 设备编码（全局唯一，格式：DEV-类型缩写-序号） |
| `name` | `VARCHAR(100)` | NOT NULL | 设备名称 |
| `device_type` | `VARCHAR(20)` | NOT NULL | 设备类型：`tank`/`dispenser`/`pump`/`valve`/`sensor`/`fire_equipment`/`electrical` |
| `model` | `VARCHAR(100)` | | 型号规格 |
| `manufacturer` | `VARCHAR(100)` | | 制造商 |
| `serial_number` | `VARCHAR(100)` | | 出厂序列号 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `location` | `VARCHAR(255)` | | 安装位置描述 |
| `install_date` | `DATE` | | 安装日期 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 业务状态：`active`/`fault`/`pending_maintenance`/`inactive` |
| `maintenance_cycle` | `VARCHAR(20)` | | 维保频率：`daily`/`weekly`/`monthly`/`quarterly`/`semi_annual`/`annual` |
| `last_maintenance_date` | `DATE` | | 上次维保日期 |
| `next_maintenance_date` | `DATE` | | 下次维保日期（系统自动计算） |
| `specification` | `TEXT` | | 技术参数/规格说明 |
| `remark` | `TEXT` | | 备注 |
| `type_specific_fields` | `JSONB` | | 设备类型专有字段（见 §1.2） |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |
| `created_by` | `UUID` | FK → User | 创建人 |
| `updated_by` | `UUID` | FK → User | 更新人 |

**索引：**
- `idx_equipment_code` ON `device_code` — 编码唯一查询
- `idx_equipment_name` ON `name` — 名称搜索
- `idx_equipment_station` ON `station_id` — 站点筛选
- `idx_equipment_type` ON `device_type` — 类型筛选
- `idx_equipment_status` ON `status` — 状态筛选
- `idx_equipment_next_maint` ON `next_maintenance_date` — 维保到期查询

**约束：**
- `device_code` 创建后不可修改（设备编码是业务标识，可能被维保工单等引用）
- `device_code` 全局唯一（跨站点）

---

### 1.2 设备类型专有字段 (type_specific_fields)

不同设备类型在 `type_specific_fields` JSONB 字段中存储专有属性：

**储罐 (tank)：**
```json
{
  "capacity": 200,
  "maxPressure": 1.2,
  "medium": "LNG"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `capacity` | number | 容积（m³） |
| `maxPressure` | number | 最大工作压力（MPa） |
| `medium` | string | 存储介质：`LNG`/`CNG`/`LPG`/`other` |

**加气机 (dispenser)：**
```json
{
  "nozzleCount": 2,
  "fuelTypes": ["LNG", "CNG"]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `nozzleCount` | number | 枪位数量 |
| `fuelTypes` | string[] | 支持的燃料类型 |

**传感器 (sensor)：**
```json
{
  "sensorType": "combustible_gas",
  "measureUnit": "%LEL",
  "measureRange": "0-100"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `sensorType` | string | 传感器类型：`temperature`/`pressure`/`combustible_gas`/`level` |
| `measureUnit` | string | 计量单位 |
| `measureRange` | string | 量程范围 |

**泵、阀门、消防设备、电气设备：** 暂不定义专有字段，通过 `specification` 纯文本描述。

---

### 1.3 EquipmentPhoto（设备照片）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `equipment_id` | `UUID` | FK → Equipment, NOT NULL | 关联设备 |
| `file_url` | `VARCHAR(500)` | NOT NULL | 文件URL |
| `file_name` | `VARCHAR(255)` | NOT NULL | 原始文件名 |
| `file_size` | `INTEGER` | | 文件大小（字节） |
| `mime_type` | `VARCHAR(50)` | | MIME 类型（image/jpeg, image/png） |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `uploaded_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 上传时间 |
| `uploaded_by` | `UUID` | FK → User | 上传人 |

**索引：**
- `idx_equip_photo_equipment` ON `equipment_id`

**约束：**
- 每台设备最多 10 张照片
- 格式限制：JPG/PNG，单张不超过 5MB

---

### 1.4 EquipmentMonitoring（设备实时监控数据）

设备的最新实时运行参数，每台设备一条记录，持续更新。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `equipment_id` | `UUID` | FK → Equipment, UNIQUE, NOT NULL | 关联设备（一对一） |
| `level_percent` | `DECIMAL(5,2)` | | 液位百分比（储罐） |
| `level_volume` | `DECIMAL(10,2)` | | 液位体积 m³（储罐） |
| `pressure` | `DECIMAL(8,4)` | | 压力 MPa（储罐） |
| `temperature` | `DECIMAL(8,2)` | | 温度 ℃（储罐） |
| `dispenser_status` | `VARCHAR(20)` | | 加气机状态：`idle`/`fueling`/`fault`/`offline` |
| `daily_volume` | `DECIMAL(10,2)` | | 日加注量 m³（加气机） |
| `sensor_value` | `DECIMAL(10,4)` | | 传感器当前读数 |
| `sensor_unit` | `VARCHAR(20)` | | 传感器单位 |
| `connection_status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'disconnected' | 连接状态：`connected`/`disconnected`/`unstable` |
| `last_communication_at` | `TIMESTAMP` | | 最后通信时间 |
| `nozzle_data` | `JSONB` | | 枪位实时数据（加气机）：`[{nozzleNo, fuelType, status, unitPrice, currentFlow}]` |
| `extra_data` | `JSONB` | | 其他扩展监控数据 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**nozzle_data 示例：**
```json
[
  {"nozzleNo": "枪1", "fuelType": "LNG", "status": "idle", "unitPrice": 4.50, "currentFlow": 0},
  {"nozzleNo": "枪2", "fuelType": "CNG", "status": "fueling", "unitPrice": 3.80, "currentFlow": 12.5}
]
```

**索引：**
- `idx_monitoring_equipment` ON `equipment_id` UNIQUE — 一对一
- `idx_monitoring_connection` ON `connection_status` — 连接状态筛选

---

### 1.5 EquipmentMonitoringLog（设备监控历史日志）

定时快照，用于趋势图展示（如储罐液位变化趋势）。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `equipment_id` | `UUID` | FK → Equipment, NOT NULL | 关联设备 |
| `level_percent` | `DECIMAL(5,2)` | | 液位百分比 |
| `level_volume` | `DECIMAL(10,2)` | | 液位体积 |
| `pressure` | `DECIMAL(8,4)` | | 压力 |
| `temperature` | `DECIMAL(8,2)` | | 温度 |
| `sensor_value` | `DECIMAL(10,4)` | | 传感器读数 |
| `recorded_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 记录时间 |

**索引：**
- `idx_monitoring_log_equip_time` ON `(equipment_id, recorded_at)` — 设备+时间查询（趋势图）
- `idx_monitoring_log_time` ON `recorded_at` — 时间范围清理

**数据保留策略：**
- 5 分钟粒度，保留 7 天
- 1 小时聚合粒度，保留 90 天
- 1 天聚合粒度，永久保留

---

### 1.6 MaintenanceOrder（维保工单）

维保工单是设备维护的核心实体，支持保养、维修、报修三种类型。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `order_no` | `VARCHAR(32)` | UNIQUE, NOT NULL | 工单编号（格式：WO-年份-序号） |
| `equipment_id` | `UUID` | FK → Equipment, NOT NULL | 关联设备 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `order_type` | `VARCHAR(20)` | NOT NULL | 工单类型：`maintenance`（保养）/`repair`（维修）/`report`（报修） |
| `urgency` | `VARCHAR(20)` | NOT NULL, DEFAULT 'medium' | 紧急程度：`low`/`medium`/`high`/`urgent` |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending' | 工单状态：`pending`/`processing`/`pending_review`/`completed`/`closed` |
| `description` | `TEXT` | NOT NULL | 问题描述/工单内容 |
| `assignee_id` | `UUID` | FK → Employee, NOT NULL | 指派负责人 |
| `planned_start_date` | `DATE` | NOT NULL | 计划开始日期 |
| `planned_end_date` | `DATE` | NOT NULL | 计划完成日期 |
| `actual_start_time` | `TIMESTAMP` | | 实际开始时间 |
| `actual_end_time` | `TIMESTAMP` | | 实际完成时间 |
| `total_cost` | `DECIMAL(12,2)` | DEFAULT 0 | 总费用 |
| `total_duration` | `DECIMAL(8,2)` | DEFAULT 0 | 总工时（小时） |
| `created_by` | `UUID` | FK → User, NOT NULL | 创建人 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_order_no` ON `order_no` — 编号查询
- `idx_order_equipment` ON `equipment_id` — 设备关联查询
- `idx_order_station` ON `station_id` — 站点筛选
- `idx_order_status` ON `status` — 状态筛选
- `idx_order_type` ON `order_type` — 类型筛选
- `idx_order_assignee` ON `assignee_id` — 负责人筛选
- `idx_order_urgency` ON `urgency` — 紧急程度筛选
- `idx_order_planned_start` ON `planned_start_date` — 计划时间排序
- `idx_order_created` ON `created_at` — 创建时间排序

---

### 1.7 OrderRecord（工单处理记录）

工单处理过程的流水记录，形成完整的处理时间线。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `order_id` | `UUID` | FK → MaintenanceOrder, NOT NULL | 关联工单 |
| `action` | `VARCHAR(30)` | NOT NULL | 操作类型：`created`/`started`/`submitted_review`/`approved`/`rejected`/`closed`/`record_added` |
| `content` | `TEXT` | NOT NULL | 操作内容/说明 |
| `parts` | `VARCHAR(500)` | | 使用配件 |
| `cost` | `DECIMAL(10,2)` | | 本次费用 |
| `duration` | `DECIMAL(8,2)` | | 本次耗时（小时） |
| `operator_id` | `UUID` | FK → User, NOT NULL | 操作人 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 记录时间 |

**索引：**
- `idx_record_order` ON `order_id` — 工单关联查询
- `idx_record_time` ON `created_at` — 时间排序

---

### 1.8 OrderAttachment（工单附件）

工单处理记录的附件（故障照片、维修凭证等）。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `record_id` | `UUID` | FK → OrderRecord, NOT NULL | 关联处理记录 |
| `file_url` | `VARCHAR(500)` | NOT NULL | 文件URL |
| `file_name` | `VARCHAR(255)` | NOT NULL | 原始文件名 |
| `file_size` | `INTEGER` | | 文件大小（字节） |
| `mime_type` | `VARCHAR(50)` | | MIME 类型 |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `uploaded_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 上传时间 |
| `uploaded_by` | `UUID` | FK → User | 上传人 |

**索引：**
- `idx_attachment_record` ON `record_id`

---

### 1.9 MaintenancePlan（保养计划） [MVP+]

周期性保养计划模板，到期自动创建维保工单。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `name` | `VARCHAR(100)` | NOT NULL | 计划名称 |
| `equipment_id` | `UUID` | FK → Equipment, NOT NULL | 关联设备 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `frequency` | `VARCHAR(20)` | NOT NULL | 保养频率：`daily`/`weekly`/`monthly`/`quarterly`/`semi_annual`/`annual` |
| `start_date` | `DATE` | NOT NULL | 计划起始日期 |
| `next_date` | `DATE` | NOT NULL | 下次保养日期 |
| `reminder_days` | `INTEGER` | NOT NULL, DEFAULT 7 | 提前提醒天数 |
| `enabled` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | 是否启用 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |
| `created_by` | `UUID` | FK → User | 创建人 |

**索引：**
- `idx_plan_equipment` ON `equipment_id`
- `idx_plan_station` ON `station_id`
- `idx_plan_next_date` ON `next_date` — 到期查询
- `idx_plan_enabled` ON `enabled`

---

### 1.10 AlarmRule（告警规则） [MVP+]

设备监控指标的告警阈值配置。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `equipment_id` | `UUID` | FK → Equipment, NOT NULL | 关联设备 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `metric` | `VARCHAR(50)` | NOT NULL | 监控指标：`level_percent`/`pressure`/`temperature`/`sensor_value` |
| `condition` | `VARCHAR(10)` | NOT NULL | 条件：`lt`（小于）/`gt`（大于）/`eq`（等于） |
| `threshold` | `DECIMAL(10,4)` | NOT NULL | 阈值 |
| `alarm_level` | `VARCHAR(20)` | NOT NULL, DEFAULT 'warning' | 告警级别：`info`/`warning`/`critical` |
| `enabled` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | 是否启用 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |
| `created_by` | `UUID` | FK → User | 创建人 |

**索引：**
- `idx_alarm_rule_equipment` ON `equipment_id`
- `idx_alarm_rule_station` ON `station_id`
- `idx_alarm_rule_enabled` ON `enabled`

---

### 1.11 AlarmRecord（告警记录） [MVP+]

告警事件日志。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `rule_id` | `UUID` | FK → AlarmRule | 触发的告警规则（可为 NULL，支持系统自动告警） |
| `equipment_id` | `UUID` | FK → Equipment, NOT NULL | 关联设备 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `alarm_level` | `VARCHAR(20)` | NOT NULL | 告警级别：`info`/`warning`/`critical` |
| `alarm_type` | `VARCHAR(50)` | NOT NULL | 告警类型：`level_low`/`pressure_high`/`temperature_abnormal`/`gas_leak`/`device_offline`/`other` |
| `message` | `TEXT` | NOT NULL | 告警信息 |
| `metric_value` | `DECIMAL(10,4)` | | 触发时的指标值 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'unhandled' | 状态：`unhandled`（未处理）/`acknowledged`（已确认）/`resolved`（已解决） |
| `acknowledged_by` | `UUID` | FK → User | 确认人 |
| `acknowledged_at` | `TIMESTAMP` | | 确认时间 |
| `resolved_by` | `UUID` | FK → User | 解决人 |
| `resolved_at` | `TIMESTAMP` | | 解决时间 |
| `resolution_note` | `TEXT` | | 处理说明 |
| `triggered_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 告警触发时间 |

**索引：**
- `idx_alarm_record_equipment` ON `equipment_id`
- `idx_alarm_record_station` ON `station_id`
- `idx_alarm_record_status` ON `status` — 未处理告警查询
- `idx_alarm_record_level` ON `alarm_level`
- `idx_alarm_record_time` ON `triggered_at` — 时间排序

---

## 2. 实体关系

### 2.1 ER 图描述

```
┌─────────────────────────────────────────────────────────────────┐
│                      Station (站点) [外部]                       │
└──────┬──────────────┬──────────────┬──────────────┬─────────────┘
       │              │              │              │
       │ 1            │ 1            │ 1            │ 1
       ▼ n            ▼ n            ▼ n            ▼ n
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│MaintenanceOrder│ │MaintenancePlan│ │  AlarmRule  │ │ AlarmRecord  │
│──────────────│ │──────────────│ │──────────────│ │──────────────│
│ id (PK)      │ │ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ station_id   │ │ station_id   │ │ station_id   │ │ station_id   │
│ equipment_id │ │ equipment_id │ │ equipment_id │ │ equipment_id │
│ order_no     │ │ frequency    │ │ metric       │ │ alarm_level  │
│ order_type   │ │ next_date    │ │ threshold    │ │ alarm_type   │
│ status       │ │ ...          │ │ ...          │ │ status       │
│ ...          │ └──────────────┘ └──────────────┘ │ ...          │
└──────┬───────┘                                   └──────────────┘
       │
       │ 1
       ▼ n
┌──────────────┐
│ OrderRecord  │
│──────────────│
│ id (PK)      │    ┌──────────────────────────────────────────────┐
│ order_id(FK) │    │               Equipment (设备台账)             │
│ action       │    │──────────────────────────────────────────────│
│ content      │    │ id (PK)                                      │
│ ...          │    │ device_code (UK)                             │
└──────┬───────┘    │ name                                         │
       │            │ device_type                                  │
       │ 1          │ station_id (FK) → Station                    │
       ▼ n          │ status                                       │
┌──────────────┐    │ type_specific_fields (JSONB)                  │
│OrderAttachment│   │ ...                                          │
│──────────────│    └──────┬──────────────┬──────────────┬─────────┘
│ id (PK)      │           │              │              │
│ record_id(FK)│           │ 1            │ 1            │ 1
│ file_url     │           ▼ n            ▼ 1            ▼ n
│ ...          │    ┌──────────────┐ ┌──────────────┐ ┌───────────────────┐
└──────────────┘    │EquipmentPhoto│ │Equip-        │ │EquipmentMonitoring│
                    │──────────────│ │Monitoring    │ │Log                │
                    │ id (PK)      │ │──────────────│ │───────────────────│
                    │ equipment_id │ │ id (PK)      │ │ id (PK)           │
                    │ file_url     │ │equipment_id  │ │ equipment_id      │
                    │ ...          │ │(FK, UNIQUE)  │ │ recorded_at       │
                    └──────────────┘ │ level_percent│ │ level_percent     │
                                     │ pressure     │ │ pressure          │
                                     │ nozzle_data  │ │ ...               │
                                     │ ...          │ └───────────────────┘
                                     └──────────────┘
```

### 2.2 关系说明

| 关系 | 类型 | 说明 |
|------|------|------|
| Station → Equipment | 1:N | 一个站点有多台设备 |
| Equipment → EquipmentPhoto | 1:N | 一台设备有多张照片（最多 10 张） |
| Equipment → EquipmentMonitoring | 1:1 | 一台设备对应一条实时监控记录 |
| Equipment → EquipmentMonitoringLog | 1:N | 一台设备有多条历史监控快照 |
| Equipment → MaintenanceOrder | 1:N | 一台设备有多个维保工单 |
| Equipment → MaintenancePlan | 1:N | 一台设备可有多个保养计划（不同频率） |
| Equipment → AlarmRule | 1:N | 一台设备可配置多条告警规则 |
| Equipment → AlarmRecord | 1:N | 一台设备可产生多条告警记录 |
| MaintenanceOrder → OrderRecord | 1:N | 一个工单有多条处理记录 |
| OrderRecord → OrderAttachment | 1:N | 一条记录可附带多个附件 |
| AlarmRule → AlarmRecord | 1:N | 一条规则可触发多条告警记录 |

---

## 3. 枚举定义

### 3.1 设备状态 (DeviceStatus)

| 值 | 说明 |
|----|------|
| `active` | 正常运行 |
| `fault` | 故障 |
| `pending_maintenance` | 待维保 |
| `inactive` | 已停用 |

### 3.2 设备类型 (DeviceType)

| 值 | 中文名 | 编码缩写 |
|----|--------|---------|
| `tank` | 储罐 | TANK |
| `dispenser` | 加气机 | DISP |
| `pump` | 泵 | PUMP |
| `valve` | 阀门 | VALVE |
| `sensor` | 传感器 | SENS |
| `fire_equipment` | 消防设备 | FIRE |
| `electrical` | 电气设备 | ELEC |

### 3.3 工单状态 (OrderStatus)

| 值 | 说明 | 步骤序号 |
|----|------|---------|
| `pending` | 待处理 | 0 |
| `processing` | 处理中 | 1 |
| `pending_review` | 待验收 | 2 |
| `completed` | 已完成 | 3 |
| `closed` | 已关闭 | 4 |

**状态流转：**
```
pending → processing → pending_review → completed → closed
                    ↑                  │
                    └── (退回处理) ─────┘
```

### 3.4 工单类型 (OrderType)

| 值 | 说明 |
|----|------|
| `maintenance` | 保养 |
| `repair` | 维修 |
| `report` | 报修 |

### 3.5 紧急程度 (UrgencyLevel)

| 值 | 说明 | 响应要求 |
|----|------|---------|
| `low` | 低 | 不影响运营 |
| `medium` | 中 | 影响部分功能 |
| `high` | 高 | 影响运行 |
| `urgent` | 紧急 | 安全隐患，立即处理 |

### 3.6 维保频率 (MaintenanceCycle)

| 值 | 说明 | 间隔天数 |
|----|------|---------|
| `daily` | 日检 | 1 |
| `weekly` | 周检 | 7 |
| `monthly` | 月检 | 30 |
| `quarterly` | 季检 | 90 |
| `semi_annual` | 半年检 | 180 |
| `annual` | 年检 | 365 |

### 3.7 加气机/枪状态 (DispenserStatus)

| 值 | 说明 |
|----|------|
| `idle` | 空闲 |
| `fueling` | 加注中 |
| `fault` | 故障 |
| `offline` | 离线 |

### 3.8 连接状态 (ConnectionStatus)

| 值 | 说明 |
|----|------|
| `connected` | 已连接 |
| `disconnected` | 已断开 |
| `unstable` | 不稳定 |

### 3.9 告警级别 (AlarmLevel)

| 值 | 说明 |
|----|------|
| `info` | 信息 |
| `warning` | 警告 |
| `critical` | 严重 |

### 3.10 告警状态 (AlarmStatus)

| 值 | 说明 |
|----|------|
| `unhandled` | 未处理 |
| `acknowledged` | 已确认 |
| `resolved` | 已解决 |

### 3.11 告警类型 (AlarmType)

| 值 | 说明 |
|----|------|
| `level_low` | 液位过低 |
| `pressure_high` | 压力过高 |
| `temperature_abnormal` | 温度异常 |
| `gas_leak` | 气体泄漏 |
| `device_offline` | 设备离线 |
| `other` | 其他 |

### 3.12 存储介质 (StorageMedium)

| 值 | 说明 |
|----|------|
| `LNG` | 液化天然气 |
| `CNG` | 压缩天然气 |
| `LPG` | 液化石油气 |
| `other` | 其他 |

### 3.13 工单记录操作类型 (RecordAction)

| 值 | 说明 |
|----|------|
| `created` | 创建工单 |
| `started` | 开始处理 |
| `submitted_review` | 提交验收 |
| `approved` | 验收通过 |
| `rejected` | 退回处理 |
| `closed` | 关闭工单 |
| `record_added` | 添加处理记录 |

---

## 4. API 接口设计

### 4.1 通用约定

遵循站点管理模块（1.1）定义的 API 通用约定：

**基础路径：** `/api/v1`

**通用响应格式：**
```jsonc
{
  "code": 0,           // 0=成功，非0=错误
  "message": "success",
  "data": { ... },
  "timestamp": "2026-02-18T10:30:00.000Z"
}
```

---

### 4.2 设备台账 API

#### GET /api/v1/stations/:stationId/equipments

获取站点设备台账列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 20，最大 100 |
| `keyword` | string | 否 | 搜索关键词（匹配设备编号、名称） |
| `deviceType` | string | 否 | 设备类型筛选 |
| `status` | string | 否 | 状态筛选：`active`/`fault`/`pending_maintenance`/`inactive`/`all` |
| `installDateStart` | string | 否 | 安装日期起始（YYYY-MM-DD） |
| `installDateEnd` | string | 否 | 安装日期截止（YYYY-MM-DD） |
| `sortBy` | string | 否 | 排序字段：`name`/`deviceCode`/`installDate`/`createdAt`，默认 `createdAt` |
| `sortOrder` | string | 否 | 排序方向：`asc`/`desc`，默认 `desc` |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "equip-001",
        "deviceCode": "DEV-TANK-001",
        "name": "LNG储罐#1",
        "deviceType": "tank",
        "model": "VCT-200",
        "manufacturer": "中集安瑞科",
        "installDate": "2023-06-15",
        "status": "active",
        "maintenanceCycle": "monthly",
        "nextMaintenanceDate": "2026-03-12",
        "monitoring": {
          "levelPercent": 78,
          "pressure": 0.65,
          "connectionStatus": "connected"
        },
        "createdAt": "2023-06-15T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

**权限：** `equipment:list`

---

#### GET /api/v1/stations/:stationId/equipments/:id

获取设备详情。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "equip-001",
    "deviceCode": "DEV-TANK-001",
    "name": "LNG储罐#1",
    "deviceType": "tank",
    "model": "VCT-200",
    "manufacturer": "中集安瑞科",
    "serialNumber": "JARI-VCT200-2023-0042",
    "stationId": "station-001",
    "stationName": "北京朝阳加气站",
    "location": "罐区A区1号位",
    "installDate": "2023-06-15",
    "status": "active",
    "maintenanceCycle": "monthly",
    "lastMaintenanceDate": "2026-02-10",
    "nextMaintenanceDate": "2026-03-12",
    "specification": "容积200m³，工作压力0.8MPa，设计压力1.2MPa",
    "typeSpecificFields": {
      "capacity": 200,
      "maxPressure": 1.2,
      "medium": "LNG"
    },
    "monitoring": {
      "levelPercent": 78,
      "levelVolume": 156,
      "pressure": 0.65,
      "temperature": -162,
      "connectionStatus": "connected",
      "lastCommunicationAt": "2026-02-18T08:30:00.000Z"
    },
    "photos": [
      {
        "id": "photo-001",
        "fileUrl": "https://cdn.example.com/images/tank001.jpg",
        "fileName": "tank001.jpg"
      }
    ],
    "statistics": {
      "totalOrders": 12,
      "pendingOrders": 1,
      "lastOrderDate": "2026-02-10"
    },
    "createdAt": "2023-06-15T08:00:00.000Z",
    "updatedAt": "2026-02-10T14:30:00.000Z"
  }
}
```

**权限：** `equipment:read`

---

#### POST /api/v1/stations/:stationId/equipments

新增设备台账。

**请求 Body：**
```json
{
  "codeMode": "auto",
  "deviceCode": "",
  "name": "LNG储罐#4",
  "deviceType": "tank",
  "model": "VCT-150",
  "manufacturer": "中集安瑞科",
  "serialNumber": "JARI-VCT150-2026-0001",
  "location": "罐区A区4号位",
  "installDate": "2026-02-18",
  "maintenanceCycle": "monthly",
  "specification": "容积150m³，工作压力0.8MPa",
  "typeSpecificFields": {
    "capacity": 150,
    "maxPressure": 1.0,
    "medium": "LNG"
  },
  "remark": "新增储罐"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `codeMode` | string | 否 | 编码模式：`auto`（自动生成）/`manual`（手工输入），默认 `auto` |
| `deviceCode` | string | 条件 | 设备编码（`codeMode=manual` 时必填） |
| `name` | string | 是 | 设备名称 |
| `deviceType` | string | 是 | 设备类型 |
| `model` | string | 否 | 型号 |
| `manufacturer` | string | 否 | 制造商 |
| `serialNumber` | string | 否 | 序列号 |
| `location` | string | 否 | 安装位置 |
| `installDate` | string | 否 | 安装日期 |
| `maintenanceCycle` | string | 否 | 维保频率 |
| `specification` | string | 否 | 技术参数 |
| `typeSpecificFields` | object | 否 | 设备类型专有字段 |
| `remark` | string | 否 | 备注 |

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409001 | 设备编码已存在 |
| 400001 | 参数校验失败 |

**权限：** `equipment:create`

---

#### PUT /api/v1/stations/:stationId/equipments/:id

编辑设备台账。

> **注意：** `deviceCode` 字段不可修改。

**权限：** `equipment:update`

---

#### DELETE /api/v1/stations/:stationId/equipments/:id

删除设备（软删除，标记为停用）。

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409002 | 设备存在未完成的维保工单，无法删除 |

**权限：** `equipment:delete`

---

#### POST /api/v1/stations/:stationId/equipments/:id/photos

上传设备照片。

**请求：** `multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `files` | File[] | 是 | 图片文件（最多 10 张，支持 jpg/png，单张 ≤ 5MB） |

**权限：** `equipment:update`

---

#### DELETE /api/v1/stations/:stationId/equipments/:id/photos/:photoId

删除设备照片。

**权限：** `equipment:update`

---

#### GET /api/v1/stations/:stationId/equipments/export

导出设备台账。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `format` | string | 是 | 导出格式：`excel` |
| `deviceType` | string | 否 | 设备类型筛选 |
| `status` | string | 否 | 状态筛选 |

**权限：** `equipment:export`

---

### 4.3 设施监控 API

#### GET /api/v1/stations/:stationId/monitoring/overview

获取设施监控看板概览数据。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "stats": {
      "totalDevices": 15,
      "onlineRate": 86.7,
      "alarmCount": 2,
      "pendingMaintenance": 3
    },
    "tanks": [
      {
        "equipmentId": "equip-001",
        "deviceCode": "DEV-TANK-001",
        "name": "LNG储罐#1",
        "levelPercent": 78,
        "levelVolume": 156,
        "pressure": 0.65,
        "temperature": -162,
        "connectionStatus": "connected",
        "status": "active"
      }
    ],
    "dispensers": [
      {
        "equipmentId": "equip-004",
        "deviceCode": "DEV-DISP-001",
        "name": "加气机#01",
        "dispenserStatus": "idle",
        "nozzles": [
          {"nozzleNo": "枪1", "fuelType": "LNG", "status": "idle"}
        ],
        "connectionStatus": "connected",
        "status": "active"
      }
    ],
    "pendingActions": [
      {
        "id": "action-001",
        "icon": "warning",
        "message": "LNG储罐#3 液位过低 (18%)",
        "actionLabel": "查看",
        "actionTarget": "/operations/device-ledger/monitoring/equip-003",
        "deviceId": "equip-003"
      }
    ],
    "lastUpdated": "2026-02-18T08:30:00.000Z"
  }
}
```

**权限：** `equipment:monitoring`

---

#### GET /api/v1/stations/:stationId/monitoring/:equipmentId

获取单台设备的实时监控数据。

**权限：** `equipment:monitoring`

---

#### GET /api/v1/stations/:stationId/monitoring/:equipmentId/history

获取设备监控历史数据（趋势图）。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `metric` | string | 是 | 指标：`level_percent`/`pressure`/`temperature`/`sensor_value` |
| `period` | string | 否 | 时间范围：`24h`/`7d`/`30d`，默认 `24h` |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "equipmentId": "equip-001",
    "metric": "level_percent",
    "unit": "%",
    "points": [
      {"time": "2026-02-17T08:00:00Z", "value": 82},
      {"time": "2026-02-17T08:05:00Z", "value": 81.5},
      {"time": "2026-02-17T08:10:00Z", "value": 81}
    ]
  }
}
```

**权限：** `equipment:monitoring`

---

### 4.4 设备连接状态 API

#### GET /api/v1/stations/:stationId/connections

获取站点设备连接状态列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `connectionStatus` | string | 否 | 连接状态筛选：`connected`/`disconnected`/`unstable`/`all` |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "equipmentId": "equip-001",
        "deviceCode": "DEV-TANK-001",
        "name": "LNG储罐#1",
        "deviceType": "tank",
        "connectionStatus": "connected",
        "lastCommunicationAt": "2026-02-18T08:30:00.000Z"
      },
      {
        "equipmentId": "equip-007",
        "deviceCode": "DEV-DISP-004",
        "name": "加气机#04",
        "deviceType": "dispenser",
        "connectionStatus": "disconnected",
        "lastCommunicationAt": "2026-02-18T06:15:00.000Z"
      }
    ],
    "summary": {
      "total": 15,
      "connected": 12,
      "disconnected": 2,
      "unstable": 1
    }
  }
}
```

**权限：** `equipment:monitoring`

---

### 4.5 维保工单 API

#### GET /api/v1/stations/:stationId/maintenance-orders

获取维保工单列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 20 |
| `keyword` | string | 否 | 搜索关键词（匹配工单编号、设备名称） |
| `status` | string | 否 | 状态筛选 |
| `orderType` | string | 否 | 工单类型筛选 |
| `equipmentId` | string | 否 | 设备ID筛选 |
| `assigneeId` | string | 否 | 负责人ID筛选 |
| `urgency` | string | 否 | 紧急程度筛选 |
| `startDate` | string | 否 | 计划开始日期起始 |
| `endDate` | string | 否 | 计划开始日期截止 |
| `sortBy` | string | 否 | 排序字段，默认 `createdAt` |
| `sortOrder` | string | 否 | 排序方向，默认 `desc` |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "order-001",
        "orderNo": "WO-2026-0042",
        "device": {
          "id": "equip-006",
          "deviceCode": "DEV-DISP-003",
          "name": "加气机#03",
          "deviceType": "dispenser"
        },
        "orderType": "report",
        "urgency": "urgent",
        "status": "processing",
        "description": "加气机#03枪1无法正常出液...",
        "assignee": { "id": "emp-003", "name": "张工程师" },
        "plannedStartDate": "2026-02-18",
        "plannedEndDate": "2026-02-18",
        "createdBy": { "id": "emp-005", "name": "王安全员" },
        "createdAt": "2026-02-18T09:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

**权限：** `maintenance-order:list`

---

#### GET /api/v1/stations/:stationId/maintenance-orders/:id

获取工单详情（含完整处理记录时间线）。

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "order-001",
    "orderNo": "WO-2026-0042",
    "device": {
      "id": "equip-006",
      "deviceCode": "DEV-DISP-003",
      "name": "加气机#03",
      "deviceType": "dispenser",
      "model": "DQ-500"
    },
    "orderType": "report",
    "urgency": "urgent",
    "status": "processing",
    "description": "加气机#03枪1无法正常出液，客户报告加注过程中突然停止。",
    "assignee": { "id": "emp-003", "name": "张工程师" },
    "plannedStartDate": "2026-02-18",
    "plannedEndDate": "2026-02-18",
    "actualStartTime": "2026-02-18T10:30:00.000Z",
    "totalCost": 0,
    "totalDuration": 0,
    "records": [
      {
        "id": "rec-001",
        "action": "created",
        "content": "加气枪无法正常出液，客户投诉加注过程中突然停止",
        "operator": { "id": "emp-005", "name": "王安全员" },
        "attachments": [
          { "id": "att-001", "fileUrl": "https://cdn.example.com/fault-photo-1.jpg" }
        ],
        "createdAt": "2026-02-18T09:00:00.000Z"
      },
      {
        "id": "rec-002",
        "action": "started",
        "content": "已到现场检查，初步判断为密封件老化",
        "operator": { "id": "emp-003", "name": "张工程师" },
        "createdAt": "2026-02-18T10:30:00.000Z"
      }
    ],
    "createdBy": { "id": "emp-005", "name": "王安全员" },
    "createdAt": "2026-02-18T09:00:00.000Z",
    "updatedAt": "2026-02-18T10:30:00.000Z"
  }
}
```

**权限：** `maintenance-order:read`

---

#### POST /api/v1/stations/:stationId/maintenance-orders

创建维保工单。

**请求 Body：**
```json
{
  "equipmentId": "equip-004",
  "orderType": "maintenance",
  "urgency": "medium",
  "description": "加气机#01月检保养",
  "assigneeId": "emp-003",
  "plannedStartDate": "2026-02-20",
  "plannedEndDate": "2026-02-20"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `equipmentId` | string | 是 | 关联设备ID |
| `orderType` | string | 是 | 工单类型 |
| `urgency` | string | 否 | 紧急程度，默认 `medium` |
| `description` | string | 是 | 问题描述 |
| `assigneeId` | string | 是 | 负责人ID |
| `plannedStartDate` | string | 是 | 计划开始日期 |
| `plannedEndDate` | string | 是 | 计划完成日期 |

**权限：** `maintenance-order:create`

---

#### POST /api/v1/stations/:stationId/maintenance-orders/fault-report

故障报修（快捷创建报修工单）。

**请求 Body：**
```json
{
  "equipmentId": "equip-006",
  "urgency": "urgent",
  "description": "加气枪无法正常出液",
  "photos": ["file1", "file2"]
}
```

**请求：** `multipart/form-data`

**权限：** `maintenance-order:create`

---

#### PATCH /api/v1/stations/:stationId/maintenance-orders/:id/start

开始处理工单（pending → processing）。

**权限：** `maintenance-order:process`

---

#### PATCH /api/v1/stations/:stationId/maintenance-orders/:id/submit-review

提交验收（processing → pending_review）。

**请求 Body：**
```json
{
  "content": "维修完成，更换密封件，测试正常",
  "parts": "密封件×2",
  "cost": 450,
  "duration": 3
}
```

**权限：** `maintenance-order:process`

---

#### PATCH /api/v1/stations/:stationId/maintenance-orders/:id/approve

验收通过（pending_review → completed）。

**请求 Body：**
```json
{
  "content": "验收通过，设备恢复正常运行"
}
```

**权限：** `maintenance-order:approve`

---

#### PATCH /api/v1/stations/:stationId/maintenance-orders/:id/reject

退回处理（pending_review → processing）。

**请求 Body：**
```json
{
  "content": "密封性测试未通过，需重新处理"
}
```

**权限：** `maintenance-order:approve`

---

#### PATCH /api/v1/stations/:stationId/maintenance-orders/:id/close

关闭工单（completed → closed）。

**权限：** `maintenance-order:close`

---

#### POST /api/v1/stations/:stationId/maintenance-orders/:id/records

添加处理记录。

**请求 Body：**
```json
{
  "content": "更换加气枪密封件",
  "parts": "密封件×2",
  "cost": 450,
  "duration": 2
}
```

**请求：** 支持 `multipart/form-data`（可附带附件）

**权限：** `maintenance-order:process`

---

#### PUT /api/v1/stations/:stationId/maintenance-orders/:id

编辑工单信息（仅 pending/processing 状态可编辑）。

**权限：** `maintenance-order:update`

---

### 4.6 保养计划 API [MVP+]

#### GET /api/v1/stations/:stationId/maintenance-plans

获取保养计划列表。

**权限：** `maintenance-plan:list`

---

#### POST /api/v1/stations/:stationId/maintenance-plans

创建保养计划。

**请求 Body：**
```json
{
  "name": "LNG储罐月检",
  "equipmentId": "equip-001",
  "frequency": "monthly",
  "startDate": "2026-03-01",
  "reminderDays": 7
}
```

**权限：** `maintenance-plan:create`

---

#### PUT /api/v1/stations/:stationId/maintenance-plans/:id

编辑保养计划。

**权限：** `maintenance-plan:update`

---

#### PATCH /api/v1/stations/:stationId/maintenance-plans/:id/toggle

启用/禁用保养计划。

**权限：** `maintenance-plan:update`

---

### 4.7 告警管理 API [MVP+]

#### GET /api/v1/stations/:stationId/alarm-rules

获取告警规则列表。

**权限：** `alarm:config`

---

#### POST /api/v1/stations/:stationId/alarm-rules

创建告警规则。

**请求 Body：**
```json
{
  "equipmentId": "equip-001",
  "metric": "level_percent",
  "condition": "lt",
  "threshold": 20,
  "alarmLevel": "warning"
}
```

**权限：** `alarm:config`

---

#### PUT /api/v1/stations/:stationId/alarm-rules/:id

编辑告警规则。

**权限：** `alarm:config`

---

#### GET /api/v1/stations/:stationId/alarm-records

获取告警记录列表。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |
| `equipmentId` | string | 否 | 设备筛选 |
| `alarmLevel` | string | 否 | 告警级别筛选 |
| `status` | string | 否 | 状态筛选 |
| `startTime` | string | 否 | 开始时间 |
| `endTime` | string | 否 | 结束时间 |

**权限：** `alarm:view`

---

#### PATCH /api/v1/stations/:stationId/alarm-records/:id/acknowledge

确认告警。

**请求 Body：**
```json
{
  "note": "已派人到储罐区检查"
}
```

**权限：** `alarm:handle`

---

#### PATCH /api/v1/stations/:stationId/alarm-records/:id/resolve

解决告警。

**请求 Body：**
```json
{
  "note": "已补充液位，恢复正常"
}
```

**权限：** `alarm:handle`

---

## 5. TypeScript 类型定义

```typescript
// 设备状态
export type DeviceStatus = 'active' | 'fault' | 'pending_maintenance' | 'inactive';

// 设备类型
export type DeviceType = 'tank' | 'dispenser' | 'pump' | 'valve' | 'sensor' | 'fire_equipment' | 'electrical';

// 加气机/枪状态
export type DispenserStatus = 'idle' | 'fueling' | 'fault' | 'offline';

// 维保工单状态
export type OrderStatus = 'pending' | 'processing' | 'pending_review' | 'completed' | 'closed';

// 工单类型
export type OrderType = 'maintenance' | 'repair' | 'report';

// 紧急程度
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';

// 维保频率
export type MaintenanceCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

// 连接状态
export type ConnectionStatus = 'connected' | 'disconnected' | 'unstable';

// 存储介质
export type StorageMedium = 'LNG' | 'CNG' | 'LPG' | 'other';

// 告警级别
export type AlarmLevel = 'info' | 'warning' | 'critical';

// 告警状态
export type AlarmStatus = 'unhandled' | 'acknowledged' | 'resolved';

// 告警类型
export type AlarmType = 'level_low' | 'pressure_high' | 'temperature_abnormal' | 'gas_leak' | 'device_offline' | 'other';

// 工单记录操作类型
export type RecordAction = 'created' | 'started' | 'submitted_review' | 'approved' | 'rejected' | 'closed' | 'record_added';

// 编码方式
export type CodeMode = 'auto' | 'manual';

// 枪位信息
export interface NozzleInfo {
  nozzleNo: string;
  nozzleId?: string;
  fuelType: string;
  status: DispenserStatus;
  unitPrice: number;
  currentFlow?: number;
}

// 设备监控数据
export interface DeviceMonitoring {
  levelPercent?: number;
  levelVolume?: number;
  pressure?: number;
  temperature?: number;
  dispenserStatus?: DispenserStatus;
  dailyVolume?: number;
  nozzles?: NozzleInfo[];
  sensorValue?: number;
  sensorUnit?: string;
  connectionStatus?: ConnectionStatus;
  lastCommunicationAt?: string;
}

// 设备照片
export interface DevicePhoto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
}

// 设备台账
export interface Equipment {
  id: string;
  deviceCode: string;
  name: string;
  deviceType: DeviceType;
  model: string;
  manufacturer: string;
  serialNumber?: string;
  stationId: string;
  stationName?: string;
  location?: string;
  installDate?: string;
  status: DeviceStatus;
  maintenanceCycle?: MaintenanceCycle;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  specification?: string;
  remark?: string;
  typeSpecificFields?: Record<string, unknown>;
  monitoring?: DeviceMonitoring;
  photos?: DevicePhoto[];
  createdAt: string;
  updatedAt: string;
}

// 设备表单数据
export interface EquipmentFormData {
  codeMode: CodeMode;
  deviceCode?: string;
  name: string;
  deviceType: DeviceType;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  installDate?: string;
  status: DeviceStatus;
  maintenanceCycle?: MaintenanceCycle;
  typeSpecificFields?: Record<string, unknown>;
  specification?: string;
  remark?: string;
}

// 设备列表查询参数
export interface EquipmentListParams {
  keyword?: string;
  deviceType?: DeviceType | 'all';
  status?: DeviceStatus | 'all';
  installDateRange?: [string, string];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 工单处理记录
export interface OrderRecord {
  id: string;
  action: RecordAction;
  content: string;
  parts?: string;
  cost?: number;
  duration?: number;
  operator: { id: string; name: string };
  attachments?: Array<{ id: string; fileUrl: string }>;
  createdAt: string;
}

// 维保工单
export interface MaintenanceOrder {
  id: string;
  orderNo: string;
  equipmentId: string;
  device: {
    id: string;
    deviceCode: string;
    name: string;
    deviceType: DeviceType;
    model: string;
  };
  orderType: OrderType;
  urgency: UrgencyLevel;
  status: OrderStatus;
  description: string;
  assignee: { id: string; name: string };
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartTime?: string;
  actualEndTime?: string;
  totalCost?: number;
  totalDuration?: number;
  records: OrderRecord[];
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

// 维保工单表单数据
export interface MaintenanceOrderFormData {
  equipmentId: string;
  orderType: OrderType;
  urgency: UrgencyLevel;
  description: string;
  assigneeId: string;
  plannedStartDate: string;
  plannedEndDate: string;
}

// 故障报修表单
export interface FaultReportFormData {
  equipmentId: string;
  urgency: UrgencyLevel;
  description: string;
  photos?: File[];
}

// 保养计划 [MVP+]
export interface MaintenancePlan {
  id: string;
  name: string;
  equipmentId: string;
  device: {
    id: string;
    deviceCode: string;
    name: string;
    deviceType: DeviceType;
  };
  frequency: MaintenanceCycle;
  startDate: string;
  nextDate: string;
  reminderDays: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 告警规则 [MVP+]
export interface AlarmRule {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  metric: string;
  condition: 'lt' | 'gt' | 'eq';
  threshold: number;
  alarmLevel: AlarmLevel;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 告警记录 [MVP+]
export interface AlarmRecord {
  id: string;
  ruleId?: string;
  equipmentId: string;
  equipmentName?: string;
  alarmLevel: AlarmLevel;
  alarmType: AlarmType;
  message: string;
  metricValue?: number;
  status: AlarmStatus;
  acknowledgedBy?: { id: string; name: string };
  acknowledgedAt?: string;
  resolvedBy?: { id: string; name: string };
  resolvedAt?: string;
  resolutionNote?: string;
  triggeredAt: string;
}

// 设施监控统计
export interface MonitoringStats {
  totalDevices: number;
  onlineRate: number;
  alarmCount: number;
  pendingMaintenance: number;
}

// 待处理事项
export interface PendingAction {
  id: string;
  icon: 'warning' | 'fault' | 'maintenance';
  message: string;
  actionLabel: string;
  actionTarget: string;
  deviceId?: string;
}
```

---

## 6. 模块依赖

### 6.1 依赖的外部模块

| 模块 | 依赖内容 | 说明 |
|------|----------|------|
| 站点管理 (1.1) | Station, StationEmployee | 设备归属站点，工单指派站点员工 |
| 站点管理 (1.1) | Nozzle | 加气机枪位数据来源（只读引用） |
| 系统权限 (9.1) | User, Role, Permission | 用户认证、权限控制、审批流 |

### 6.2 被依赖的模块

| 模块 | 依赖内容 | 说明 |
|------|----------|------|
| 巡检/安检管理 (1.4) | Equipment | 巡检检查项目关联设备台账 [PROD] |
| 能源交易 > 库存管理 (2.3) | EquipmentMonitoring (储罐液位) | 储罐液位数据为库存来源之一 |
| 数据分析 (7.1) | EquipmentMonitoring, MaintenanceOrder | 设备运行数据、维保数据分析 |

---

## 7. 安全与权限

### 7.1 权限列表

| 权限代码 | 说明 | 默认角色 |
|----------|------|----------|
| `equipment:list` | 查看设备列表 | 所有角色 |
| `equipment:read` | 查看设备详情 | 所有角色 |
| `equipment:create` | 新增设备 | `equipment_admin`, `station_master`, `admin` |
| `equipment:update` | 编辑设备 | `equipment_admin`, `station_master`, `admin` |
| `equipment:delete` | 删除设备 | `equipment_admin`, `station_master`, `admin` |
| `equipment:export` | 导出设备台账 | `equipment_admin`, `station_master`, `ops_manager`, `admin` |
| `equipment:monitoring` | 查看设施监控 | 所有角色 |
| `maintenance-order:list` | 查看工单列表 | 所有角色 |
| `maintenance-order:read` | 查看工单详情 | 所有角色 |
| `maintenance-order:create` | 创建工单 | `equipment_admin`, `station_master`, `tech_lead`, `safety_officer`, `admin` |
| `maintenance-order:update` | 编辑工单 | `equipment_admin`, `station_master`, `admin` |
| `maintenance-order:process` | 处理工单（开始、提交验收、添加记录） | `equipment_admin`, `tech_lead`, `admin` |
| `maintenance-order:approve` | 审批工单（验收通过/退回） | `station_master`, `tech_lead`, `admin` |
| `maintenance-order:close` | 关闭工单 | `station_master`, `admin` |
| `maintenance-plan:list` | 查看保养计划 | 所有角色 |
| `maintenance-plan:create` | 创建保养计划 | `equipment_admin`, `tech_lead`, `admin` |
| `maintenance-plan:update` | 编辑保养计划 | `equipment_admin`, `tech_lead`, `admin` |
| `alarm:config` | 配置告警规则 | `equipment_admin`, `station_master`, `admin` |
| `alarm:view` | 查看告警记录 | 所有角色 |
| `alarm:handle` | 处理告警（确认/解决） | `equipment_admin`, `safety_officer`, `station_master`, `admin` |

### 7.2 数据范围限制

| 角色 | 数据范围 |
|------|----------|
| 站长 | 本站点所有设备和工单 |
| 设备管理员 | 本站点所有设备和工单 |
| 技术负责人 | 本站点所有设备和工单 |
| 安全员 | 本站点所有设备（只读）、监控告警（读写） |
| 运营经理 | 所有站点设备数据（只读） |

---

## 8. 模拟数据规范

### 8.1 数据生成规则

| 实体 | 数量 | 规则 |
|------|------|------|
| Equipment | 每站 12-18 台 | 储罐 3-4、加气机 4-6、泵 2-3、阀门 1-2、传感器 2-3、消防/电气各 1 |
| MaintenanceOrder | 每站 8-15 条 | 覆盖各状态和类型，近 30 天数据 |
| MaintenancePlan | 每站 5-8 条 | 覆盖关键设备的不同频率计划 |
| AlarmRecord | 每站 5-10 条 | 近 7 天数据，覆盖各告警类型和状态 |
| EquipmentPhoto | 每台 0-3 张 | 使用占位图 URL |

### 8.2 设备编码规则

设备编码格式：`DEV-{类型缩写}-{3位序号}`

| 类型 | 缩写 | 示例编码 |
|------|------|---------|
| 储罐 | TANK | DEV-TANK-001 |
| 加气机 | DISP | DEV-DISP-001 |
| 泵 | PUMP | DEV-PUMP-001 |
| 阀门 | VALVE | DEV-VALVE-001 |
| 传感器 | SENS | DEV-SENS-001 |
| 消防设备 | FIRE | DEV-FIRE-001 |
| 电气设备 | ELEC | DEV-ELEC-001 |

---

## 附录：设计决策记录

| # | 决策 | 说明 |
|---|------|------|
| D1 | 设备编码全局唯一且不可修改 | 编码被维保工单、告警记录等引用，修改会导致数据不一致 |
| D2 | 软删除策略 | 删除设备标记 `status=inactive`，保留历史数据和维保记录 |
| D3 | 监控数据与台账分离 | 台账为低频变更的档案信息，监控为高频更新的实时数据，分表避免互相影响 |
| D4 | 设备类型专有字段使用 JSONB | 不同设备类型的专有属性差异大，JSONB 避免宽表，保持灵活性 |
| D5 | 工单审批流对接系统统一模块 | 维保工单审批由系统审批流模块处理，本模块仅定义触发节点和状态机 |
| D6 | 监控历史日志分级保留 | 5 分钟粒度保留 7 天，1 小时聚合保留 90 天，1 天聚合永久保留 |
| D7 | MVP 阶段监控数据使用模拟数据 | 使用静态模拟数据 + 随机波动，模拟实时监控效果 |
| D8 | 设备联网对接功能标记为 [PROD] | MVP 仅展示连接状态列表（模拟），采集配置等功能推迟到生产阶段 |
| D9 | 告警和保养计划标记为 [MVP+] | 数据模型和 API 预留，优先实现台账和工单核心功能 |

---

*文档生成时间：2026-02-18*
*生成依据：requirements.md + user-stories.md + STANDARDS.md*
