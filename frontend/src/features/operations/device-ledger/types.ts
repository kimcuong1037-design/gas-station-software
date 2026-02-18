// 设备设施管理模块类型定义 - 基于 ui-schema.md 数据模型

// ============================================================
// 状态类型
// ============================================================

/** 设备状态 */
export type DeviceStatus = 'active' | 'fault' | 'pending_maintenance' | 'inactive';

/** 设备类型 (固定7类) */
export type DeviceType = 'tank' | 'dispenser' | 'pump' | 'valve' | 'sensor' | 'fire_equipment' | 'electrical';

/** 加气机/枪状态 */
export type DispenserStatus = 'idle' | 'fueling' | 'fault' | 'offline';

/** 维保工单状态 */
export type OrderStatus = 'pending' | 'processing' | 'pending_review' | 'completed' | 'closed';

/** 工单类型 */
export type OrderType = 'maintenance' | 'repair' | 'report';

/** 紧急程度 */
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';

/** 维保频率 */
export type MaintenanceCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

/** 连接状态 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'unstable';

/** 存储介质 */
export type StorageMedium = 'LNG' | 'CNG' | 'LPG' | 'other';

/** 编码方式 */
export type CodeMode = 'auto' | 'manual';

// ============================================================
// 设备台账
// ============================================================

/** 枪位信息 */
export interface NozzleInfo {
  nozzleNo: string;
  nozzleId?: string;
  fuelType: string;
  status: DispenserStatus;
  unitPrice: number;
  currentFlow?: number;
}

/** 设备监控数据 (实时) */
export interface DeviceMonitoring {
  /** 液位百分比 (储罐) */
  levelPercent?: number;
  /** 液位 (兼容别名) */
  level?: number;
  /** 液位体积 m³ (储罐) */
  levelVolume?: number;
  /** 日加注量 m³ (加气机) */
  dailyVolume?: number;
  /** 压力 MPa (储罐) */
  pressure?: number;
  /** 温度 ℃ (储罐) */
  temperature?: number;
  /** 加气机状态 */
  dispenserStatus?: DispenserStatus;
  /** 枪位列表 (加气机) */
  nozzles?: NozzleInfo[];
  /** 连接状态 */
  connectionStatus?: ConnectionStatus;
  /** 最后通信时间 */
  lastCommunicationAt?: string;
}

/** 设备照片 */
export interface DevicePhoto {
  id: string;
  url: string;
  uploadedAt: string;
}

/** 设备台账实体 */
export interface Equipment {
  id: string;
  deviceCode: string;
  name: string;
  deviceType: DeviceType;
  model: string;
  manufacturer: string;
  stationId: string;
  stationName: string;
  installDate?: string;
  status: DeviceStatus;
  maintenanceCycle?: MaintenanceCycle;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  remark?: string;
  /** 储罐特有字段 */
  capacity?: number;
  maxPressure?: number;
  medium?: StorageMedium;
  /** 加气机特有字段 */
  nozzleCount?: number;
  fuelTypes?: string[];
  /** 通用扩展 */
  specification?: string;
  /** 序列号 */
  serialNumber?: string;
  /** 设备位置 */
  location?: string;
  /** 实时监控数据 */
  monitoring?: DeviceMonitoring;
  /** 设备照片 */
  photos?: DevicePhoto[];
  createdAt: string;
  updatedAt: string;
}

/** 设备表单数据 */
export interface EquipmentFormData {
  codeMode: CodeMode;
  deviceCode?: string;
  name: string;
  deviceType: DeviceType;
  model?: string;
  manufacturer?: string;
  stationId: string;
  installDate?: string;
  status: DeviceStatus;
  maintenanceCycle?: MaintenanceCycle;
  lastMaintenanceDate?: string;
  /** 储罐 */
  capacity?: number;
  maxPressure?: number;
  medium?: StorageMedium;
  /** 加气机 */
  nozzleCount?: number;
  fuelTypes?: string[];
  /** 通用 */
  specification?: string;
  remark?: string;
}

/** 设备列表查询参数 */
export interface EquipmentListParams {
  keyword?: string;
  deviceType?: DeviceType | 'all';
  status?: DeviceStatus | 'all';
  installDateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

// ============================================================
// 维保工单
// ============================================================

/** 工单处理记录 */
export interface OrderRecord {
  id: string;
  timestamp: string;
  operator: { id: string; name: string };
  action: 'created' | 'started' | 'submitted_review' | 'approved' | 'rejected' | 'closed' | 'record_added';
  content: string;
  parts?: string;
  cost?: number;
  duration?: number;
  attachments?: Array<{ id: string; url: string }>;
}

/** 维保工单实体 */
export interface MaintenanceOrder {
  id: string;
  orderNo: string;
  deviceId: string;
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
  records: OrderRecord[];
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

/** 维保工单表单数据 */
export interface MaintenanceOrderFormData {
  deviceId: string;
  orderType: OrderType;
  urgency: UrgencyLevel;
  description: string;
  assigneeId: string;
  plannedStartDate: string;
  plannedEndDate: string;
}

/** 工单列表查询参数 */
export interface OrderListParams {
  keyword?: string;
  status?: OrderStatus | 'all';
  orderType?: OrderType | 'all';
  deviceId?: string;
  assigneeId?: string;
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

/** 故障报修表单数据 */
export interface FaultReportFormData {
  deviceId: string;
  urgency: UrgencyLevel;
  description: string;
  photos?: Array<{ id: string; url: string }>;
}

/** 处理记录表单数据 */
export interface OrderRecordFormData {
  content: string;
  parts?: string;
  cost?: number;
  duration?: number;
  attachments?: Array<{ id: string; url: string }>;
}

// ============================================================
// 保养计划 [MVP+]
// ============================================================

/** 保养计划 */
export interface MaintenancePlan {
  id: string;
  name: string;
  deviceId: string;
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

// ============================================================
// 监控看板
// ============================================================

/** 设施监控统计 */
export interface MonitoringStats {
  totalDevices: number;
  onlineRate: number;
  alarmCount: number;
  pendingMaintenance: number;
}

/** 待处理事项 */
export interface PendingAction {
  id: string;
  icon: 'warning' | 'fault' | 'maintenance';
  message: string;
  actionLabel: string;
  actionTarget: string;
  deviceId?: string;
}
