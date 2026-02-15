// 站点管理模块类型定义 - 基于 architecture.md 数据模型

/** 站点状态 */
export type StationStatus = 'active' | 'inactive' | 'suspended';

/** 枪设备状态 */
export type DeviceStatus = 'online' | 'offline' | 'error';

/** 枪充装状态 */
export type FuelingStatus = 'idle' | 'fueling';

/** 燃料类别 */
export type FuelCategory = 'gasoline' | 'diesel' | 'gas' | 'other';

/** 计量单位 */
export type FuelUnit = 'L' | 'kg' | 'm³';

/** 员工来源模式 */
export type EmployeeSource = 'sync' | 'local';

/** 排班状态 */
export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled';

/** 图片类型 */
export type ImageType = 'primary' | 'environment' | 'general';

/** 区域 */
export interface Region {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
  level: number;
  path?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  children?: Region[];
  createdAt: string;
  updatedAt: string;
}

/** 站点分组 */
export interface StationGroup {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/** 燃料类型 */
export interface FuelType {
  id: string;
  code: string;
  name: string;
  category: FuelCategory;
  isSystem: boolean;
  unit: FuelUnit;
  sortOrder: number;
  status: 'active' | 'inactive';
}

/** 站点 */
export interface Station {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  contactName?: string;
  businessHours?: {
    weekday: string;
    weekend: string;
  };
  groupId?: string;
  group?: StationGroup;
  regionId?: string;
  region?: Region;
  status: StationStatus;
  primaryImageId?: string;
  primaryImageUrl?: string;
  employeeSyncMode: EmployeeSource;
  nozzleCount?: number;
  employeeCount?: number;
  shiftCount?: number;
  imageCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/** 枪配置 */
export interface Nozzle {
  id: string;
  stationId: string;
  nozzleNo: string;
  fuelTypeId: string;
  fuelType?: FuelType;
  unitPrice: number;
  dispenserNo?: string;
  deviceStatus: DeviceStatus;
  fuelingStatus: FuelingStatus;
  lastHeartbeatAt?: string;
  status: 'active' | 'inactive';
  tags?: string[];
  config?: Record<string, unknown>;
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** 班次定义 */
export interface Shift {
  id: string;
  stationId: string;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  supervisorId?: string;
  supervisorName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/** 站点员工 */
export interface StationEmployee {
  id: string;
  stationId: string;
  userId?: string;
  employeeNo?: string;
  name: string;
  phone?: string;
  position?: string;
  source: EmployeeSource;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/** 排班计划 */
export interface Schedule {
  id: string;
  stationId: string;
  shiftId: string;
  shift?: Shift;
  employeeId: string;
  employee?: StationEmployee;
  scheduleDate: string;
  status: ScheduleStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/** 站点照片 */
export interface StationImage {
  id: string;
  stationId: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  imageType: ImageType;
  sortOrder: number;
  uploadedAt: string;
  uploadedBy?: string;
}

/** 站点表单数据 */
export interface StationFormData {
  codeMode: 'auto' | 'manual';
  code?: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  businessHours?: {
    weekday: string;
    weekend: string;
  };
  regionId?: string;
  groupId?: string;
  status: StationStatus;
  employeeSyncMode: EmployeeSource;
}

/** 列表查询参数 */
export interface StationListParams {
  keyword?: string;
  status?: StationStatus | 'all';
  regionId?: string;
  groupId?: string;
  page?: number;
  pageSize?: number;
}
