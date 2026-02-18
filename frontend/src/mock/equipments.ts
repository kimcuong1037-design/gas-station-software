// 设备台账模拟数据

import type { Equipment, MonitoringStats, PendingAction } from '../features/operations/device-ledger/types';

// ============================================================
// 设备台账数据
// ============================================================

export const equipments: Equipment[] = [
  // ---- 储罐 ----
  {
    id: 'equip-001',
    deviceCode: 'DEV-TANK-001',
    name: 'LNG储罐#1',
    deviceType: 'tank',
    model: 'VCT-200',
    manufacturer: '中集安瑞科',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-06-15',
    status: 'active',
    maintenanceCycle: 'monthly',
    lastMaintenanceDate: '2026-02-10',
    nextMaintenanceDate: '2026-03-12',
    capacity: 200,
    maxPressure: 1.2,
    medium: 'LNG',
    monitoring: {
      levelPercent: 78,
      levelVolume: 156,
      pressure: 0.65,
      temperature: -162,
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    photos: [
      { id: 'photo-001', url: 'https://placehold.co/400x300/e3f2fd/1890ff?text=Tank+1', uploadedAt: '2025-08-10T10:00:00Z' },
    ],
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'equip-002',
    deviceCode: 'DEV-TANK-002',
    name: 'LNG储罐#2',
    deviceType: 'tank',
    model: 'VCT-200',
    manufacturer: '中集安瑞科',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-06-15',
    status: 'active',
    maintenanceCycle: 'monthly',
    lastMaintenanceDate: '2026-02-10',
    nextMaintenanceDate: '2026-03-12',
    capacity: 200,
    maxPressure: 1.2,
    medium: 'LNG',
    monitoring: {
      levelPercent: 45,
      levelVolume: 90,
      pressure: 0.62,
      temperature: -161,
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'equip-003',
    deviceCode: 'DEV-TANK-003',
    name: 'LNG储罐#3',
    deviceType: 'tank',
    model: 'VCT-100',
    manufacturer: '中集安瑞科',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2024-01-20',
    status: 'pending_maintenance',
    maintenanceCycle: 'monthly',
    lastMaintenanceDate: '2026-01-08',
    nextMaintenanceDate: '2026-02-07',
    capacity: 100,
    maxPressure: 1.0,
    medium: 'LNG',
    monitoring: {
      levelPercent: 18,
      levelVolume: 18,
      pressure: 0.68,
      temperature: -160,
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:29:00Z',
    },
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2026-02-07T09:00:00Z',
  },

  // ---- 加气机 ----
  {
    id: 'equip-004',
    deviceCode: 'DEV-DISP-001',
    name: '加气机#01',
    deviceType: 'dispenser',
    model: 'DQ-500',
    manufacturer: '正星科技',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-08-01',
    status: 'active',
    maintenanceCycle: 'monthly',
    lastMaintenanceDate: '2026-02-05',
    nextMaintenanceDate: '2026-03-07',
    nozzleCount: 2,
    fuelTypes: ['LNG'],
    monitoring: {
      dispenserStatus: 'idle',
      nozzles: [
        { nozzleNo: '枪1', fuelType: 'LNG', status: 'idle', unitPrice: 4.50 },
        { nozzleNo: '枪2', fuelType: 'LNG', status: 'idle', unitPrice: 4.50 },
      ],
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-08-01T08:00:00Z',
    updatedAt: '2026-02-05T16:00:00Z',
  },
  {
    id: 'equip-005',
    deviceCode: 'DEV-DISP-002',
    name: '加气机#02',
    deviceType: 'dispenser',
    model: 'DQ-500',
    manufacturer: '正星科技',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-08-01',
    status: 'active',
    maintenanceCycle: 'monthly',
    lastMaintenanceDate: '2026-02-05',
    nextMaintenanceDate: '2026-03-07',
    nozzleCount: 2,
    fuelTypes: ['LNG', 'CNG'],
    monitoring: {
      dispenserStatus: 'fueling',
      nozzles: [
        { nozzleNo: '枪1', fuelType: 'LNG', status: 'fueling', unitPrice: 4.50 },
        { nozzleNo: '枪2', fuelType: 'CNG', status: 'idle', unitPrice: 3.80 },
      ],
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-08-01T08:00:00Z',
    updatedAt: '2026-02-05T16:00:00Z',
  },
  {
    id: 'equip-006',
    deviceCode: 'DEV-DISP-003',
    name: '加气机#03',
    deviceType: 'dispenser',
    model: 'DQ-500',
    manufacturer: '正星科技',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-08-01',
    status: 'fault',
    maintenanceCycle: 'monthly',
    lastMaintenanceDate: '2026-01-12',
    nextMaintenanceDate: '2026-02-11',
    nozzleCount: 2,
    fuelTypes: ['LNG'],
    monitoring: {
      dispenserStatus: 'fault',
      nozzles: [
        { nozzleNo: '枪1', fuelType: 'LNG', status: 'fault', unitPrice: 4.50 },
      ],
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:25:00Z',
    },
    createdAt: '2023-08-01T08:00:00Z',
    updatedAt: '2026-02-18T06:30:00Z',
  },
  {
    id: 'equip-007',
    deviceCode: 'DEV-DISP-004',
    name: '加气机#04',
    deviceType: 'dispenser',
    model: 'DQ-300',
    manufacturer: '正星科技',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2024-03-15',
    status: 'active',
    maintenanceCycle: 'monthly',
    lastMaintenanceDate: '2026-02-01',
    nextMaintenanceDate: '2026-03-03',
    nozzleCount: 1,
    fuelTypes: ['CNG'],
    monitoring: {
      dispenserStatus: 'offline',
      nozzles: [
        { nozzleNo: '枪1', fuelType: 'CNG', status: 'offline', unitPrice: 3.80 },
      ],
      connectionStatus: 'disconnected',
      lastCommunicationAt: '2026-02-18T03:10:00Z',
    },
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2026-02-01T14:00:00Z',
  },

  // ---- 泵 ----
  {
    id: 'equip-008',
    deviceCode: 'DEV-PUMP-001',
    name: 'LNG低温泵#1',
    deviceType: 'pump',
    model: 'CP-80',
    manufacturer: '杭州科利达',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-06-20',
    status: 'active',
    maintenanceCycle: 'quarterly',
    lastMaintenanceDate: '2026-01-15',
    nextMaintenanceDate: '2026-04-15',
    specification: '流量: 80L/min, 扬程: 200m, 功率: 15kW',
    monitoring: {
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-06-20T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'equip-009',
    deviceCode: 'DEV-PUMP-002',
    name: 'LNG低温泵#2',
    deviceType: 'pump',
    model: 'CP-80',
    manufacturer: '杭州科利达',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-06-20',
    status: 'active',
    maintenanceCycle: 'quarterly',
    lastMaintenanceDate: '2026-01-15',
    nextMaintenanceDate: '2026-04-15',
    specification: '流量: 80L/min, 扬程: 200m, 功率: 15kW',
    monitoring: {
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-06-20T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },

  // ---- 阀门 ----
  {
    id: 'equip-010',
    deviceCode: 'DEV-VALVE-001',
    name: '主切断阀',
    deviceType: 'valve',
    model: 'QV-100',
    manufacturer: '四川空分',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-06-15',
    status: 'active',
    maintenanceCycle: 'semi_annual',
    lastMaintenanceDate: '2025-12-20',
    nextMaintenanceDate: '2026-06-18',
    specification: 'DN100, PN25, 低温不锈钢',
    monitoring: {
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2025-12-20T14:00:00Z',
  },
  {
    id: 'equip-011',
    deviceCode: 'DEV-VALVE-002',
    name: '安全泄放阀',
    deviceType: 'valve',
    model: 'SV-50',
    manufacturer: '四川空分',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-06-15',
    status: 'active',
    maintenanceCycle: 'annual',
    lastMaintenanceDate: '2025-06-10',
    nextMaintenanceDate: '2026-06-10',
    specification: 'DN50, 开启压力1.1MPa',
    monitoring: {
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2025-06-10T10:00:00Z',
  },

  // ---- 传感器 ----
  {
    id: 'equip-012',
    deviceCode: 'DEV-SENS-001',
    name: '可燃气体探测器#1',
    deviceType: 'sensor',
    model: 'GD-300',
    manufacturer: '汉威科技',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-07-10',
    status: 'active',
    maintenanceCycle: 'quarterly',
    lastMaintenanceDate: '2026-01-20',
    nextMaintenanceDate: '2026-04-20',
    specification: '检测范围: 0-100%LEL, 精度: ±3%',
    monitoring: {
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-07-10T08:00:00Z',
    updatedAt: '2026-01-20T09:00:00Z',
  },
  {
    id: 'equip-013',
    deviceCode: 'DEV-SENS-002',
    name: '温度传感器#1',
    deviceType: 'sensor',
    model: 'TS-200',
    manufacturer: '汉威科技',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-07-10',
    status: 'active',
    maintenanceCycle: 'quarterly',
    lastMaintenanceDate: '2026-01-20',
    nextMaintenanceDate: '2026-04-20',
    specification: '测量范围: -200~200℃, 精度: ±0.5℃',
    monitoring: {
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-07-10T08:00:00Z',
    updatedAt: '2026-01-20T09:00:00Z',
  },

  // ---- 消防设备 ----
  {
    id: 'equip-014',
    deviceCode: 'DEV-FIRE-001',
    name: '干粉灭火系统',
    deviceType: 'fire_equipment',
    model: 'FX-500',
    manufacturer: '海湾安全',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-06-15',
    status: 'active',
    maintenanceCycle: 'semi_annual',
    lastMaintenanceDate: '2025-12-01',
    nextMaintenanceDate: '2026-05-30',
    specification: '覆盖面积: 500m², 药剂量: 150kg',
    monitoring: {
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2025-12-01T14:00:00Z',
  },

  // ---- 电气设备 ----
  {
    id: 'equip-015',
    deviceCode: 'DEV-ELEC-001',
    name: '配电柜#1',
    deviceType: 'electrical',
    model: 'GGD-800',
    manufacturer: '施耐德电气',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-06-10',
    status: 'active',
    maintenanceCycle: 'annual',
    lastMaintenanceDate: '2025-12-15',
    nextMaintenanceDate: '2026-12-15',
    specification: '额定电流: 800A, 额定电压: 380V',
    monitoring: {
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-06-10T08:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'equip-016',
    deviceCode: 'DEV-ELEC-002',
    name: 'UPS不间断电源',
    deviceType: 'electrical',
    model: 'APC-3000',
    manufacturer: '施耐德电气',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2023-06-10',
    status: 'active',
    maintenanceCycle: 'semi_annual',
    lastMaintenanceDate: '2026-01-05',
    nextMaintenanceDate: '2026-07-04',
    specification: '容量: 3000VA, 后备时间: 30min',
    monitoring: {
      connectionStatus: 'connected',
      lastCommunicationAt: '2026-02-18T08:30:00Z',
    },
    createdAt: '2023-06-10T08:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z',
  },

  // ---- 已停用设备 ----
  {
    id: 'equip-017',
    deviceCode: 'DEV-PUMP-003',
    name: 'LNG低温泵#3(旧)',
    deviceType: 'pump',
    model: 'CP-50',
    manufacturer: '杭州科利达',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    installDate: '2021-03-01',
    status: 'inactive',
    maintenanceCycle: 'quarterly',
    lastMaintenanceDate: '2025-06-01',
    specification: '流量: 50L/min, 扬程: 150m, 功率: 11kW (已报废)',
    monitoring: {
      connectionStatus: 'disconnected',
      lastCommunicationAt: '2025-09-15T08:00:00Z',
    },
    createdAt: '2021-03-01T08:00:00Z',
    updatedAt: '2025-09-15T08:00:00Z',
  },
];

// ============================================================
// 辅助函数
// ============================================================

/** 按站点获取设备 */
export const getEquipmentByStation = (stationId: string) =>
  equipments.filter((e) => e.stationId === stationId);

/** 按设备类型获取 */
export const getEquipmentByType = (deviceType: string) =>
  equipments.filter((e) => e.deviceType === deviceType);

/** 获取储罐列表 (含监控数据) */
export const getTanks = () =>
  equipments.filter((e) => e.deviceType === 'tank' && e.status !== 'inactive');

/** 获取加气机列表 (含监控数据) */
export const getDispensers = () =>
  equipments.filter((e) => e.deviceType === 'dispenser' && e.status !== 'inactive');

/** 获取监控统计数据 */
export const getMonitoringStats = (): MonitoringStats => {
  const activeDevices = equipments.filter((e) => e.status !== 'inactive');
  const onlineDevices = activeDevices.filter((e) => e.monitoring?.connectionStatus === 'connected');
  const faultDevices = activeDevices.filter((e) => e.status === 'fault');
  const pendingMaint = activeDevices.filter((e) => {
    if (!e.nextMaintenanceDate) return false;
    const diff = new Date(e.nextMaintenanceDate).getTime() - Date.now();
    return diff <= 7 * 24 * 60 * 60 * 1000 && diff > 0;
  });

  return {
    totalDevices: activeDevices.length,
    onlineRate: activeDevices.length > 0 ? Math.round((onlineDevices.length / activeDevices.length) * 100) : 0,
    alarmCount: faultDevices.length,
    pendingMaintenance: pendingMaint.length,
  };
};

/** 获取待处理事项 */
export const getPendingActions = (): PendingAction[] => {
  const actions: PendingAction[] = [];

  // 低液位告警
  equipments.forEach((e) => {
    if (e.deviceType === 'tank' && e.monitoring?.levelPercent && e.monitoring.levelPercent < 20) {
      actions.push({
        id: `action-level-${e.id}`,
        icon: 'warning',
        message: `${e.name} 液位过低(${e.monitoring.levelPercent}%)，建议安排补液`,
        actionLabel: '查看详情',
        actionTarget: '/operations/device-ledger/monitoring/tanks',
        deviceId: e.id,
      });
    }
  });

  // 故障设备
  equipments.forEach((e) => {
    if (e.status === 'fault') {
      actions.push({
        id: `action-fault-${e.id}`,
        icon: 'fault',
        message: `${e.name} 故障，需要维修处理`,
        actionLabel: '快速报修',
        actionTarget: '',
        deviceId: e.id,
      });
    }
  });

  // 即将到期维保
  equipments.forEach((e) => {
    if (e.nextMaintenanceDate && e.status !== 'inactive') {
      const diff = new Date(e.nextMaintenanceDate).getTime() - Date.now();
      const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
      if (days > 0 && days <= 7) {
        actions.push({
          id: `action-maint-${e.id}`,
          icon: 'maintenance',
          message: `${e.name} ${MAINTENANCE_LABEL}将于${days}天后到期`,
          actionLabel: '查看工单',
          actionTarget: `/operations/device-ledger/maintenance?deviceId=${e.id}`,
          deviceId: e.id,
        });
      }
    }
  });

  return actions;
};

const MAINTENANCE_LABEL = '维保';

export default equipments;
