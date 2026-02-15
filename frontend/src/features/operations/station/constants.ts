/**
 * 站点管理模块共享常量
 */
import type { StationStatus, DeviceStatus, FuelingStatus } from './types';

/** 站点状态颜色映射 */
export const statusColorMap: Record<StationStatus, string> = {
  active: 'green',
  inactive: 'default',
  suspended: 'orange',
};

/** 设备状态 Badge 映射 */
export const deviceStatusMap: Record<DeviceStatus, { status: 'success' | 'error' | 'default'; textKey: string }> = {
  online: { status: 'success', textKey: 'station.device.online' },
  offline: { status: 'default', textKey: 'station.device.offline' },
  error: { status: 'error', textKey: 'station.device.error' },
};

/** 充装状态映射 */
export const fuelingStatusMap: Record<FuelingStatus, { color: string; textKey: string }> = {
  idle: { color: 'green', textKey: 'station.nozzle.statusIdle' },
  fueling: { color: 'blue', textKey: 'station.nozzle.statusFueling' },
};

/** 员工来源映射 */
export const employeeSourceMap: Record<string, { color: string; textKey: string }> = {
  sync: { color: 'blue', textKey: 'station.employee.sourceSync' },
  local: { color: 'green', textKey: 'station.employee.sourceLocal' },
};

/** 编码模式映射 */
export const codeModeMap = {
  auto: 'station.form.codeModeAuto',
  manual: 'station.form.codeModeManual',
};

/** 员工管理模式映射 */
export const employeeSyncModeMap: Record<string, { color: string; textKey: string }> = {
  sync: { color: 'blue', textKey: 'station.employee.syncModeSync' },
  local: { color: 'green', textKey: 'station.employee.syncModeLocal' },
};
