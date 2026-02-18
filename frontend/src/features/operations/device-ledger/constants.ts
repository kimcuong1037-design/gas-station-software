// 设备设施管理模块常量定义

import i18n from '../../../locales/i18n';
import type {
  DeviceStatus,
  DeviceType,
  DispenserStatus,
  OrderStatus,
  OrderType,
  UrgencyLevel,
  MaintenanceCycle,
  ConnectionStatus,
} from './types';

// ============================================================
// 多语言标签辅助函数
// ============================================================

export const getLabel = (config: { label: string; labelEn: string }): string => {
  return i18n.language?.startsWith('en') ? config.labelEn : config.label;
};

// ============================================================
// 设备状态
// ============================================================

export const DEVICE_STATUS_CONFIG: Record<DeviceStatus, { label: string; labelEn: string; color: string }> = {
  active: { label: '正常', labelEn: 'Active', color: 'green' },
  fault: { label: '故障', labelEn: 'Fault', color: 'red' },
  pending_maintenance: { label: '待维保', labelEn: 'Pending Maint.', color: 'orange' },
  inactive: { label: '已停用', labelEn: 'Inactive', color: 'default' },
};

// ============================================================
// 设备类型
// ============================================================

export const DEVICE_TYPE_CONFIG: Record<DeviceType, { label: string; labelEn: string; icon: string; color: string; abbr: string }> = {
  tank: { label: '储罐', labelEn: 'Tank', icon: '🛢️', color: 'blue', abbr: 'TANK' },
  dispenser: { label: '加气机', labelEn: 'Dispenser', icon: '⛽', color: 'cyan', abbr: 'DISP' },
  pump: { label: '泵', labelEn: 'Pump', icon: '⚙️', color: 'purple', abbr: 'PUMP' },
  valve: { label: '阀门', labelEn: 'Valve', icon: '🔧', color: 'orange', abbr: 'VALVE' },
  sensor: { label: '传感器', labelEn: 'Sensor', icon: '📡', color: 'green', abbr: 'SENS' },
  fire_equipment: { label: '消防设备', labelEn: 'Fire Equip.', icon: '🧯', color: 'red', abbr: 'FIRE' },
  electrical: { label: '电气设备', labelEn: 'Electrical', icon: '⚡', color: 'gold', abbr: 'ELEC' },
};

// ============================================================
// 加气机/枪状态
// ============================================================

export const DISPENSER_STATUS_CONFIG: Record<DispenserStatus, { label: string; labelEn: string; color: string }> = {
  idle: { label: '空闲', labelEn: 'Idle', color: 'green' },
  fueling: { label: '加注中', labelEn: 'Fueling', color: 'blue' },
  fault: { label: '故障', labelEn: 'Fault', color: 'red' },
  offline: { label: '离线', labelEn: 'Offline', color: 'default' },
};

// ============================================================
// 工单状态
// ============================================================

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; labelEn: string; color: string; step: number }> = {
  pending: { label: '待处理', labelEn: 'Pending', color: 'blue', step: 0 },
  processing: { label: '处理中', labelEn: 'Processing', color: 'orange', step: 1 },
  pending_review: { label: '待验收', labelEn: 'Pending Review', color: 'purple', step: 2 },
  completed: { label: '已完成', labelEn: 'Completed', color: 'green', step: 3 },
  closed: { label: '已关闭', labelEn: 'Closed', color: 'default', step: 4 },
};

// ============================================================
// 工单类型
// ============================================================

export const ORDER_TYPE_CONFIG: Record<OrderType, { label: string; labelEn: string; color: string }> = {
  maintenance: { label: '保养', labelEn: 'Maintenance', color: 'blue' },
  repair: { label: '维修', labelEn: 'Repair', color: 'orange' },
  report: { label: '报修', labelEn: 'Report', color: 'red' },
};

// ============================================================
// 紧急程度
// ============================================================

export const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; labelEn: string; color: string; bgColor: string; desc: string; descEn: string }> = {
  low: { label: '低', labelEn: 'Low', color: 'default', bgColor: '', desc: '不影响运营', descEn: 'No impact' },
  medium: { label: '中', labelEn: 'Medium', color: 'blue', bgColor: '', desc: '影响部分功能', descEn: 'Partial impact' },
  high: { label: '高', labelEn: 'High', color: 'orange', bgColor: '', desc: '影响运行', descEn: 'Affects operation' },
  urgent: { label: '紧急', labelEn: 'Urgent', color: 'red', bgColor: '#fff1f0', desc: '安全隐患，立即处理', descEn: 'Safety hazard' },
};

// ============================================================
// 维保频率
// ============================================================

export const MAINTENANCE_CYCLE_CONFIG: Record<MaintenanceCycle, { label: string; labelEn: string; days: number }> = {
  daily: { label: '日检', labelEn: 'Daily', days: 1 },
  weekly: { label: '周检', labelEn: 'Weekly', days: 7 },
  monthly: { label: '月检', labelEn: 'Monthly', days: 30 },
  quarterly: { label: '季检', labelEn: 'Quarterly', days: 90 },
  semi_annual: { label: '半年检', labelEn: 'Semi-annual', days: 180 },
  annual: { label: '年检', labelEn: 'Annual', days: 365 },
};

// ============================================================
// 连接状态
// ============================================================

export const CONNECTION_STATUS_CONFIG: Record<ConnectionStatus, { label: string; labelEn: string; color: string }> = {
  connected: { label: '已连接', labelEn: 'Connected', color: 'green' },
  disconnected: { label: '已断开', labelEn: 'Disconnected', color: 'red' },
  unstable: { label: '不稳定', labelEn: 'Unstable', color: 'orange' },
};

// ============================================================
// 储罐液位阈值
// ============================================================

export const TANK_LEVEL_THRESHOLDS = {
  warning: 50,
  danger: 20,
} as const;

export const TANK_LEVEL_COLORS = {
  normal: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
} as const;

export const getTankLevelColor = (percent: number): string => {
  if (percent < TANK_LEVEL_THRESHOLDS.danger) return TANK_LEVEL_COLORS.danger;
  if (percent < TANK_LEVEL_THRESHOLDS.warning) return TANK_LEVEL_COLORS.warning;
  return TANK_LEVEL_COLORS.normal;
};

// ============================================================
// 常量
// ============================================================

/** 自动刷新间隔 (毫秒) */
export const AUTO_REFRESH_INTERVAL = 15000;

/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 20;

/** 维保提前提醒天数 */
export const MAINTENANCE_REMINDER_DAYS = 7;

/** 照片上传限制 */
export const PHOTO_UPLOAD_LIMIT = 10;
export const PHOTO_MAX_SIZE_MB = 5;
export const PHOTO_ACCEPT = '.jpg,.jpeg,.png';

/** 附件上传限制 */
export const ATTACHMENT_UPLOAD_LIMIT = 5;

/** 设备类型缩写映射 (用于自动编码) */
export const DEVICE_TYPE_ABBR: Record<string, string> = {
  tank: 'TANK',
  dispenser: 'DISP',
  pump: 'PUMP',
  valve: 'VALVE',
  sensor: 'SENS',
  fire_equipment: 'FIRE',
  electrical: 'ELEC',
};
