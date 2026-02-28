/**
 * API Documentation Data
 * 全局 API 接口文档数据源
 *
 * 覆盖 Phase 1 + Phase 2 模块的所有 REST API 端点：
 * - 1.1 站点管理 (Station Management)
 * - 1.2 交接班管理 (Shift Handover)
 * - 1.3 设备设施管理 (Device Ledger)
 * - 1.4 巡检安检管理 (Inspection)
 * - 2.1 价格管理 (Price Management)
 * - 2.2 订单与交易 (Order & Transaction)
 * - 2.3 库存管理 (Inventory Management)
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ParamDef {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface RequestBody {
  contentType: 'application/json' | 'multipart/form-data';
  fields: ParamDef[];
  example?: string;
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  tags: string[];
  pathParams?: ParamDef[];
  queryParams?: ParamDef[];
  requestBody?: RequestBody;
  responseFields?: string[];
  notes?: string;
}

export interface ApiModule {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  baseUrl: string;
  color: string;
  endpoints: ApiEndpoint[];
}

// ============================================================
// 模块 1.1 — 站点管理
// ============================================================
const stationModule: ApiModule = {
  id: 'station',
  name: '站点管理',
  nameEn: 'Station Management',
  description: '站点基础信息、加注机/枪配置、班次排班、员工管理、站点照片、区域分组管理',
  baseUrl: '/api/v1',
  color: '#1677ff',
  endpoints: [
    // --- Stations ---
    {
      id: 'station-list',
      method: 'GET',
      path: '/api/v1/stations',
      summary: '获取站点列表',
      tags: ['站点'],
      queryParams: [
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量（最大100）', example: '20' },
        { name: 'keyword', type: 'string', required: false, description: '搜索关键词（匹配名称、编码）', example: '朝阳站' },
        { name: 'status', type: 'string', required: false, description: '状态筛选：active / inactive / all', example: 'active' },
        { name: 'groupId', type: 'string', required: false, description: '分组ID筛选', example: 'group-001' },
        { name: 'regionId', type: 'string', required: false, description: '区域ID筛选（含下级区域）', example: 'region-001' },
        { name: 'sortBy', type: 'string', required: false, description: '排序字段：name / code / createdAt', example: 'createdAt' },
        { name: 'sortOrder', type: 'string', required: false, description: '排序方向：asc / desc', example: 'desc' },
      ],
      responseFields: ['items[]', 'items[].id', 'items[].code', 'items[].name', 'items[].address', 'items[].status', 'items[].nozzleCount', 'pagination'],
    },
    {
      id: 'station-get',
      method: 'GET',
      path: '/api/v1/stations/:id',
      summary: '获取站点详情',
      tags: ['站点'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['id', 'code', 'name', 'address', 'latitude', 'longitude', 'contactPhone', 'contactName', 'businessHours', 'status', 'group', 'region', 'primaryImage', 'statistics', 'createdAt', 'updatedAt'],
    },
    {
      id: 'station-create',
      method: 'POST',
      path: '/api/v1/stations',
      summary: '新增站点',
      tags: ['站点'],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'name', type: 'string', required: true, description: '站点名称', example: '北京朝阳加气站' },
          { name: 'address', type: 'string', required: true, description: '详细地址', example: '北京市朝阳区...' },
          { name: 'codeMode', type: 'string', required: false, description: '编码模式：auto / manual（默认auto）', example: 'auto' },
          { name: 'code', type: 'string', required: false, description: '站点编码（codeMode=manual时必填）', example: 'ST-BJ-001' },
          { name: 'latitude', type: 'number', required: false, description: '纬度', example: '39.9087' },
          { name: 'longitude', type: 'number', required: false, description: '经度', example: '116.3975' },
          { name: 'contactPhone', type: 'string', required: false, description: '联系电话', example: '010-12345678' },
          { name: 'contactName', type: 'string', required: false, description: '联系人', example: '张经理' },
          { name: 'groupId', type: 'string', required: false, description: '分组ID', example: 'group-001' },
          { name: 'regionId', type: 'string', required: false, description: '区域ID', example: 'region-001' },
          { name: 'employeeSyncMode', type: 'string', required: false, description: '员工同步模式：sync / local', example: 'local' },
        ],
        example: '{\n  "name": "北京朝阳加气站",\n  "address": "北京市朝阳区朝阳路1号",\n  "codeMode": "auto",\n  "contactPhone": "010-12345678",\n  "contactName": "张经理"\n}',
      },
      responseFields: ['id', 'code'],
    },
    {
      id: 'station-update',
      method: 'PUT',
      path: '/api/v1/stations/:id',
      summary: '编辑站点',
      tags: ['站点'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'name', type: 'string', required: false, description: '站点名称' },
          { name: 'address', type: 'string', required: false, description: '详细地址' },
          { name: 'contactPhone', type: 'string', required: false, description: '联系电话' },
          { name: 'contactName', type: 'string', required: false, description: '联系人' },
          { name: 'groupId', type: 'string', required: false, description: '分组ID' },
          { name: 'regionId', type: 'string', required: false, description: '区域ID' },
        ],
        example: '{\n  "name": "北京朝阳加气站（更新）",\n  "contactPhone": "010-99999999"\n}',
      },
      responseFields: ['id'],
    },
    {
      id: 'station-delete',
      method: 'DELETE',
      path: '/api/v1/stations/:id',
      summary: '删除站点（软删除，标记为停用）',
      tags: ['站点'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
    },
    {
      id: 'station-status',
      method: 'PATCH',
      path: '/api/v1/stations/:id/status',
      summary: '更新站点状态（启用/停用）',
      tags: ['站点'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'status', type: 'string', required: true, description: '目标状态：active / inactive', example: 'inactive' }],
        example: '{ "status": "inactive" }',
      },
    },
    // --- Nozzles ---
    {
      id: 'nozzle-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/nozzles',
      summary: '获取站点枪列表',
      tags: ['枪配置'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型筛选', example: 'ft-lng' },
        { name: 'status', type: 'string', required: false, description: '状态：active / inactive / all', example: 'active' },
        { name: 'deviceStatus', type: 'string', required: false, description: '设备状态：online / offline / error', example: 'online' },
      ],
      responseFields: ['items[].id', 'items[].nozzleNo', 'items[].fuelType', 'items[].unitPrice', 'items[].dispenserNo', 'items[].deviceStatus', 'items[].fuelingStatus'],
    },
    {
      id: 'nozzle-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/nozzles',
      summary: '新增枪配置',
      tags: ['枪配置'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'nozzleNo', type: 'string', required: true, description: '枪号（站点内唯一）', example: '01' },
          { name: 'fuelTypeId', type: 'string', required: true, description: '燃料类型ID', example: 'ft-lng' },
          { name: 'unitPrice', type: 'number', required: true, description: '初始单价（元/kg）', example: '4.8' },
          { name: 'dispenserNo', type: 'string', required: false, description: '加注机编号', example: 'D01' },
          { name: 'tags', type: 'string[]', required: false, description: '标签数组' },
          { name: 'customFields', type: 'object', required: false, description: '自定义扩展字段（外部系统对接）' },
        ],
        example: '{\n  "nozzleNo": "01",\n  "fuelTypeId": "ft-lng",\n  "unitPrice": 4.8,\n  "dispenserNo": "D01"\n}',
      },
    },
    {
      id: 'nozzle-update',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/nozzles/:id',
      summary: '编辑枪配置（枪号不可修改）',
      tags: ['枪配置'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '枪ID', example: 'nozzle-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID' },
          { name: 'unitPrice', type: 'number', required: false, description: '单价' },
          { name: 'dispenserNo', type: 'string', required: false, description: '加注机编号' },
        ],
        example: '{ "unitPrice": 4.9, "dispenserNo": "D02" }',
      },
    },
    {
      id: 'nozzle-price',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/nozzles/:id/price',
      summary: '设置枪单价',
      tags: ['枪配置'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '枪ID', example: 'nozzle-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'unitPrice', type: 'number', required: true, description: '新单价（元/kg）', example: '5.0' },
          { name: 'reason', type: 'string', required: false, description: '变更原因', example: '市场调价' },
        ],
        example: '{ "unitPrice": 5.0, "reason": "市场调价" }',
      },
    },
    {
      id: 'nozzle-batch-price',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/nozzles/batch-price',
      summary: '批量设置枪单价',
      tags: ['枪配置'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'nozzleIds', type: 'string[]', required: false, description: '枪ID列表（与 fuelTypeId 二选一）' },
          { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID（按类型批量设置）' },
          { name: 'unitPrice', type: 'number', required: true, description: '新单价', example: '5.0' },
          { name: 'reason', type: 'string', required: false, description: '变更原因' },
        ],
        example: '{\n  "fuelTypeId": "ft-lng",\n  "unitPrice": 5.0,\n  "reason": "LNG市场调价"\n}',
      },
    },
    {
      id: 'nozzle-status',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/nozzles/:id/status',
      summary: '枪启用/停用',
      tags: ['枪配置'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '枪ID', example: 'nozzle-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'status', type: 'string', required: true, description: '目标状态：active / inactive', example: 'inactive' }],
        example: '{ "status": "inactive" }',
      },
    },
    // --- Shifts ---
    {
      id: 'shift-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/shifts',
      summary: '获取班次列表',
      tags: ['班次排班'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['items[].id', 'items[].name', 'items[].startTime', 'items[].endTime', 'items[].isOvernight', 'items[].status'],
    },
    {
      id: 'shift-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/shifts',
      summary: '新增班次',
      tags: ['班次排班'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'name', type: 'string', required: true, description: '班次名称', example: '早班' },
          { name: 'startTime', type: 'string', required: true, description: '开始时间（HH:MM）', example: '08:00' },
          { name: 'endTime', type: 'string', required: true, description: '结束时间（HH:MM）', example: '16:00' },
          { name: 'isOvernight', type: 'boolean', required: false, description: '是否跨天', example: 'false' },
          { name: 'supervisorId', type: 'string', required: false, description: '班次负责人ID' },
        ],
        example: '{\n  "name": "早班",\n  "startTime": "08:00",\n  "endTime": "16:00",\n  "isOvernight": false\n}',
      },
    },
    {
      id: 'schedule-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/schedules',
      summary: '获取排班列表/日历数据',
      tags: ['班次排班'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'startDate', type: 'string', required: true, description: '开始日期（YYYY-MM-DD）', example: '2026-02-01' },
        { name: 'endDate', type: 'string', required: true, description: '结束日期（YYYY-MM-DD）', example: '2026-02-28' },
        { name: 'employeeId', type: 'string', required: false, description: '员工筛选' },
        { name: 'view', type: 'string', required: false, description: '视图类型：list / calendar', example: 'calendar' },
      ],
    },
    {
      id: 'schedule-current',
      method: 'GET',
      path: '/api/v1/stations/:stationId/schedules/current',
      summary: '获取当前正在进行的班次排班',
      tags: ['班次排班'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['id', 'shift', 'employee', 'scheduleDate', 'status'],
    },
    {
      id: 'schedule-next',
      method: 'GET',
      path: '/api/v1/stations/:stationId/schedules/next',
      summary: '获取下一班次的排班信息',
      tags: ['班次排班'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['id', 'shift', 'employee', 'scheduleDate', 'status'],
    },
    {
      id: 'schedule-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/schedules',
      summary: '创建排班（支持单条和批量）',
      tags: ['班次排班'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'scheduleDate', type: 'string', required: false, description: '单条：排班日期（YYYY-MM-DD）', example: '2026-03-01' },
          { name: 'shiftId', type: 'string', required: true, description: '班次ID', example: 'shift-001' },
          { name: 'employeeId', type: 'string', required: false, description: '单条：员工ID', example: 'emp-001' },
          { name: 'dateRange', type: 'object', required: false, description: '批量：日期范围 { startDate, endDate }' },
          { name: 'employeeIds', type: 'string[]', required: false, description: '批量：员工ID列表' },
        ],
        example: '{\n  "scheduleDate": "2026-03-01",\n  "shiftId": "shift-morning",\n  "employeeId": "emp-001"\n}',
      },
    },
    // --- Employees ---
    {
      id: 'employee-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/employees',
      summary: '获取站点员工列表',
      tags: ['员工'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['items[].id', 'items[].employeeNo', 'items[].name', 'items[].phone', 'items[].position', 'items[].syncMode', 'items[].status'],
    },
    // --- Station Images ---
    {
      id: 'station-images-upload',
      method: 'POST',
      path: '/api/v1/stations/:stationId/images',
      summary: '上传站点照片',
      tags: ['站点照片'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'multipart/form-data',
        fields: [
          { name: 'files', type: 'File[]', required: true, description: '图片文件（支持多文件，jpg/png，单张≤5MB）' },
          { name: 'imageType', type: 'string', required: false, description: '图片类型：general / exterior / interior / equipment', example: 'exterior' },
        ],
      },
    },
    {
      id: 'station-images-set-primary',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/images/:id/set-primary',
      summary: '设置站点主展示图',
      tags: ['站点照片'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '图片ID', example: 'img-001' },
      ],
    },
    // --- Regions / Groups ---
    {
      id: 'regions-tree',
      method: 'GET',
      path: '/api/v1/regions',
      summary: '获取区域树结构',
      tags: ['区域分组'],
      queryParams: [
        { name: 'parentId', type: 'string', required: false, description: '父级区域ID，为空则返回顶级' },
        { name: 'includeChildren', type: 'boolean', required: false, description: '是否包含所有下级（默认false）', example: 'true' },
      ],
    },
    {
      id: 'groups-list',
      method: 'GET',
      path: '/api/v1/station-groups',
      summary: '获取站点分组列表',
      tags: ['区域分组'],
      responseFields: ['items[].id', 'items[].name', 'items[].description', 'items[].stationCount'],
    },
    {
      id: 'fuel-types-list',
      method: 'GET',
      path: '/api/v1/fuel-types',
      summary: '获取燃料类型列表',
      tags: ['燃料类型'],
      queryParams: [
        { name: 'category', type: 'string', required: false, description: '类别：gasoline / diesel / gas / other' },
        { name: 'status', type: 'string', required: false, description: '状态筛选' },
      ],
      responseFields: ['items[].id', 'items[].code', 'items[].name', 'items[].category', 'items[].unit', 'items[].isSystem'],
    },
  ],
};

// ============================================================
// 模块 1.2 — 交接班管理
// ============================================================
const shiftHandoverModule: ApiModule = {
  id: 'shift-handover',
  name: '交接班管理',
  nameEn: 'Shift Handover',
  description: '班次汇总统计、交接班操作向导、现金解缴与审核、交接班历史报表',
  baseUrl: '/api/v1',
  color: '#52c41a',
  endpoints: [
    {
      id: 'auth-me',
      method: 'GET',
      path: '/api/v1/auth/me',
      summary: '获取当前登录用户信息',
      tags: ['认证'],
      responseFields: ['id', 'name', 'role', 'roleName', 'stationIds', 'defaultStationId'],
      notes: 'MVP 阶段返回 hardcoded 用户信息，后续接入真实认证系统',
    },
    {
      id: 'station-overview',
      method: 'GET',
      path: '/api/v1/stations/:stationId/overview',
      summary: '获取站点概况聚合数据（当前班次 + 下一排班 + 核心经营指标）',
      tags: ['站点概况'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['currentShift', 'nextShift', 'summary.totalAmount', 'summary.totalOrders', 'fuelSummary', 'paymentSummary'],
      notes: '聚合接口，减少前端多次请求；站点概况页的核心数据源',
    },
    {
      id: 'shift-summary',
      method: 'GET',
      path: '/api/v1/stations/:stationId/shift/current/summary',
      summary: '获取当前班次实时汇总数据',
      tags: ['班次统计'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['shift', 'summary.totalAmount', 'summary.totalOrders', 'summary.totalFueling', 'fuelSummary', 'paymentSummary', 'lastUpdated'],
    },
    {
      id: 'handover-create',
      method: 'POST',
      path: '/api/v1/handovers',
      summary: '发起交接班',
      tags: ['交接班操作'],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
          { name: 'shiftId', type: 'string', required: true, description: '班次ID', example: 'shift-morning' },
          { name: 'shiftDate', type: 'string', required: true, description: '班次日期（YYYY-MM-DD）', example: '2026-02-22' },
          { name: 'remarks', type: 'string', required: false, description: '交接备注', example: '一切正常，设备运行良好' },
        ],
        example: '{\n  "stationId": "station-001",\n  "shiftId": "shift-morning",\n  "shiftDate": "2026-02-22",\n  "remarks": "一切正常"\n}',
      },
      responseFields: ['id', 'handoverNo', 'status', 'precheck'],
    },
    {
      id: 'handover-precheck',
      method: 'GET',
      path: '/api/v1/handovers/:id/precheck',
      summary: '获取交接班预检结果',
      tags: ['交接班操作'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '交接班ID', example: 'ho-2026-001' }],
      responseFields: ['checkItems[].type', 'checkItems[].name', 'checkItems[].result', 'checkItems[].message', 'canProceed', 'warnings'],
    },
    {
      id: 'handover-complete',
      method: 'PUT',
      path: '/api/v1/handovers/:id/complete',
      summary: '确认接班，完成交接',
      tags: ['交接班操作'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '交接班ID', example: 'ho-2026-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'receivedBy', type: 'string', required: true, description: '接班人员ID', example: 'emp-002' }],
        example: '{ "receivedBy": "emp-002" }',
      },
    },
    {
      id: 'handover-force',
      method: 'POST',
      path: '/api/v1/handovers/:id/force',
      summary: '强制交接班（需站长权限）',
      tags: ['交接班操作'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '交接班ID', example: 'ho-2026-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'reason', type: 'string', required: true, description: '强制交接原因', example: '接班人员紧急情况' }],
        example: '{ "reason": "接班人员临时有紧急情况" }',
      },
    },
    {
      id: 'settlement-create',
      method: 'POST',
      path: '/api/v1/settlements',
      summary: '创建现金解缴记录',
      tags: ['现金解缴'],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'handoverId', type: 'string', required: true, description: '关联交接班ID', example: 'ho-2026-001' },
          { name: 'actualAmount', type: 'number', required: true, description: '实收金额（元）', example: '5280.00' },
          { name: 'settlementMethod', type: 'string', required: true, description: '解缴方式：safe / bank / manager', example: 'bank' },
          { name: 'differenceReason', type: 'string', required: false, description: '差异原因（有差异时必填）' },
          { name: 'differenceNote', type: 'string', required: false, description: '差异说明' },
        ],
        example: '{\n  "handoverId": "ho-2026-001",\n  "actualAmount": 5280.00,\n  "settlementMethod": "bank"\n}',
      },
    },
    {
      id: 'settlement-review',
      method: 'PUT',
      path: '/api/v1/settlements/:id/review',
      summary: '审核现金解缴',
      tags: ['现金解缴'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '解缴记录ID', example: 'st-2026-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'approved', type: 'boolean', required: true, description: '是否通过', example: 'true' },
          { name: 'note', type: 'string', required: false, description: '审核意见', example: '金额核对无误' },
        ],
        example: '{ "approved": true, "note": "金额核对无误" }',
      },
    },
    {
      id: 'handover-list',
      method: 'GET',
      path: '/api/v1/handovers',
      summary: '获取交接班历史列表',
      tags: ['交接班历史'],
      queryParams: [
        { name: 'stationId', type: 'string', required: false, description: '站点ID筛选' },
        { name: 'startDate', type: 'string', required: false, description: '开始日期（YYYY-MM-DD）', example: '2026-02-01' },
        { name: 'endDate', type: 'string', required: false, description: '结束日期（YYYY-MM-DD）', example: '2026-02-28' },
        { name: 'status', type: 'string', required: false, description: '状态筛选：completed / pending / force_completed' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[].id', 'items[].handoverNo', 'items[].stationName', 'items[].shiftName', 'items[].handoverByName', 'items[].receivedByName', 'items[].totalAmount', 'items[].status', 'pagination'],
    },
    {
      id: 'handover-get',
      method: 'GET',
      path: '/api/v1/handovers/:id',
      summary: '获取交接班详情',
      tags: ['交接班历史'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '交接班ID', example: 'ho-2026-001' }],
    },
    {
      id: 'handover-export',
      method: 'GET',
      path: '/api/v1/handovers/export',
      summary: '导出交接班报表',
      tags: ['交接班历史'],
      queryParams: [
        { name: 'format', type: 'string', required: true, description: '导出格式：excel / pdf', example: 'excel' },
        { name: 'startDate', type: 'string', required: true, description: '开始日期', example: '2026-02-01' },
        { name: 'endDate', type: 'string', required: true, description: '结束日期', example: '2026-02-28' },
        { name: 'stationId', type: 'string', required: false, description: '站点ID' },
      ],
    },
  ],
};

// ============================================================
// 模块 1.3 — 设备设施管理
// ============================================================
const deviceLedgerModule: ApiModule = {
  id: 'device-ledger',
  name: '设备设施管理',
  nameEn: 'Device Ledger',
  description: '设施监控看板、设备台账管理、维保工单全生命周期、保养计划、告警管理',
  baseUrl: '/api/v1',
  color: '#fa8c16',
  endpoints: [
    // --- Monitoring ---
    {
      id: 'monitoring-overview',
      method: 'GET',
      path: '/api/v1/stations/:stationId/monitoring/overview',
      summary: '获取设施监控看板概览数据',
      tags: ['设施监控'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['stats.total', 'stats.active', 'stats.fault', 'tanks[]', 'dispensers[]', 'pendingActions', 'lastUpdated'],
    },
    {
      id: 'monitoring-device',
      method: 'GET',
      path: '/api/v1/stations/:stationId/monitoring/:equipmentId',
      summary: '获取单台设备实时监控数据',
      tags: ['设施监控'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'equipmentId', type: 'string', required: true, description: '设备ID', example: 'eq-tank-001' },
      ],
    },
    {
      id: 'monitoring-history',
      method: 'GET',
      path: '/api/v1/stations/:stationId/monitoring/:equipmentId/history',
      summary: '获取设备监控历史数据（趋势图）',
      tags: ['设施监控'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'equipmentId', type: 'string', required: true, description: '设备ID', example: 'eq-tank-001' },
      ],
      queryParams: [
        { name: 'metric', type: 'string', required: true, description: '监控指标：level_percent / pressure / temperature / sensor_value', example: 'level_percent' },
        { name: 'period', type: 'string', required: false, description: '时间范围：24h / 7d / 30d（默认24h）', example: '7d' },
      ],
      responseFields: ['equipmentId', 'metric', 'unit', 'points[].time', 'points[].value'],
    },
    {
      id: 'connections-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/connections',
      summary: '获取站点设备连接状态列表',
      tags: ['设施监控'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'connectionStatus', type: 'string', required: false, description: '连接状态：connected / disconnected / unstable / all', example: 'connected' },
      ],
      responseFields: ['items[].equipmentId', 'items[].deviceCode', 'items[].name', 'items[].connectionStatus', 'items[].lastCommunicationAt', 'summary'],
    },
    // --- Equipment ---
    {
      id: 'equipment-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/equipments',
      summary: '获取站点设备台账列表',
      tags: ['设备台账'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'keyword', type: 'string', required: false, description: '搜索关键词（匹配设备编号、名称）', example: 'LNG储罐' },
        { name: 'deviceType', type: 'string', required: false, description: '设备类型：tank / dispenser / pump / valve / sensor / fire / electrical', example: 'tank' },
        { name: 'status', type: 'string', required: false, description: '状态：active / fault / pending_maintenance / inactive / all', example: 'active' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量（最大100）', example: '20' },
      ],
      responseFields: ['items[].id', 'items[].deviceCode', 'items[].name', 'items[].deviceType', 'items[].model', 'items[].status', 'items[].nextMaintenanceDate', 'pagination'],
    },
    {
      id: 'equipment-get',
      method: 'GET',
      path: '/api/v1/stations/:stationId/equipments/:id',
      summary: '获取设备详情',
      tags: ['设备台账'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '设备ID', example: 'eq-tank-001' },
      ],
      responseFields: ['id', 'deviceCode', 'name', 'deviceType', 'model', 'manufacturer', 'serialNumber', 'location', 'installDate', 'status', 'specification', 'typeSpecificFields', 'monitoring', 'photos', 'statistics'],
    },
    {
      id: 'equipment-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/equipments',
      summary: '新增设备台账',
      tags: ['设备台账'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'name', type: 'string', required: true, description: '设备名称', example: 'LNG储罐#1' },
          { name: 'deviceType', type: 'string', required: true, description: '设备类型：tank / dispenser / pump / valve / sensor / fire / electrical', example: 'tank' },
          { name: 'codeMode', type: 'string', required: false, description: '编码模式：auto / manual', example: 'auto' },
          { name: 'model', type: 'string', required: false, description: '型号', example: 'VCT-200' },
          { name: 'manufacturer', type: 'string', required: false, description: '制造商', example: '张家港富瑞特种装备' },
          { name: 'serialNumber', type: 'string', required: false, description: '序列号', example: 'SN-2024-0001' },
          { name: 'location', type: 'string', required: false, description: '安装位置', example: '储罐区A区' },
          { name: 'installDate', type: 'string', required: false, description: '安装日期（YYYY-MM-DD）', example: '2022-06-01' },
          { name: 'maintenanceCycle', type: 'string', required: false, description: '维保频率：monthly / quarterly / semi_annual / annual', example: 'quarterly' },
          { name: 'typeSpecificFields', type: 'object', required: false, description: '设备类型专有字段（JSONB），如储罐容量、压力等级等' },
        ],
        example: '{\n  "name": "LNG储罐#1",\n  "deviceType": "tank",\n  "model": "VCT-200",\n  "manufacturer": "张家港富瑞特种装备",\n  "installDate": "2022-06-01",\n  "maintenanceCycle": "quarterly",\n  "typeSpecificFields": {\n    "capacity": 200,\n    "pressureRating": 0.8,\n    "designTemperature": -196\n  }\n}',
      },
      responseFields: ['id', 'deviceCode'],
    },
    {
      id: 'equipment-update',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/equipments/:id',
      summary: '编辑设备台账（设备编号不可修改）',
      tags: ['设备台账'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '设备ID', example: 'eq-tank-001' },
      ],
    },
    {
      id: 'equipment-delete',
      method: 'DELETE',
      path: '/api/v1/stations/:stationId/equipments/:id',
      summary: '停用设备（软删除，有未完成工单时阻止）',
      tags: ['设备台账'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '设备ID', example: 'eq-tank-001' },
      ],
    },
    {
      id: 'equipment-photos',
      method: 'POST',
      path: '/api/v1/stations/:stationId/equipments/:id/photos',
      summary: '上传设备照片（最多10张，单张≤5MB）',
      tags: ['设备台账'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '设备ID', example: 'eq-tank-001' },
      ],
      requestBody: {
        contentType: 'multipart/form-data',
        fields: [{ name: 'files', type: 'File[]', required: true, description: '图片文件（jpg/png，最多10张，单张≤5MB）' }],
      },
    },
    // --- Maintenance Orders ---
    {
      id: 'maintenance-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/maintenance-orders',
      summary: '获取维保工单列表',
      tags: ['维保工单'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'keyword', type: 'string', required: false, description: '搜索（工单编号、设备名称）' },
        { name: 'status', type: 'string', required: false, description: '状态：pending / processing / pending_review / completed / closed', example: 'pending' },
        { name: 'orderType', type: 'string', required: false, description: '工单类型：fault / preventive / inspection / upgrade', example: 'fault' },
        { name: 'urgency', type: 'string', required: false, description: '紧急程度：urgent / high / medium / low', example: 'urgent' },
        { name: 'equipmentId', type: 'string', required: false, description: '设备ID筛选' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[].id', 'items[].orderNo', 'items[].device.name', 'items[].orderType', 'items[].urgency', 'items[].status', 'items[].assignee.name', 'items[].createdAt', 'pagination'],
    },
    {
      id: 'maintenance-get',
      method: 'GET',
      path: '/api/v1/stations/:stationId/maintenance-orders/:id',
      summary: '获取工单详情（含完整处理记录时间线）',
      tags: ['维保工单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '工单ID', example: 'mo-2026-001' },
      ],
      responseFields: ['id', 'orderNo', 'device', 'orderType', 'urgency', 'status', 'description', 'assignee', 'records[].content', 'records[].parts', 'records[].cost', 'records[].createdAt'],
    },
    {
      id: 'maintenance-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/maintenance-orders',
      summary: '创建维保工单',
      tags: ['维保工单'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'equipmentId', type: 'string', required: true, description: '关联设备ID', example: 'eq-tank-001' },
          { name: 'orderType', type: 'string', required: true, description: '工单类型：fault / preventive / inspection / upgrade', example: 'fault' },
          { name: 'urgency', type: 'string', required: false, description: '紧急程度（默认medium）：urgent / high / medium / low', example: 'urgent' },
          { name: 'description', type: 'string', required: true, description: '问题描述', example: '储罐液位传感器显示异常，数值波动较大' },
          { name: 'assigneeId', type: 'string', required: true, description: '负责人ID', example: 'emp-003' },
          { name: 'plannedStartDate', type: 'string', required: true, description: '计划开始日期（YYYY-MM-DD）', example: '2026-02-22' },
          { name: 'plannedEndDate', type: 'string', required: true, description: '计划完成日期（YYYY-MM-DD）', example: '2026-02-23' },
        ],
        example: '{\n  "equipmentId": "eq-tank-001",\n  "orderType": "fault",\n  "urgency": "urgent",\n  "description": "储罐液位传感器显示异常",\n  "assigneeId": "emp-003",\n  "plannedStartDate": "2026-02-22",\n  "plannedEndDate": "2026-02-23"\n}',
      },
      responseFields: ['id', 'orderNo'],
    },
    {
      id: 'maintenance-fault-report',
      method: 'POST',
      path: '/api/v1/stations/:stationId/maintenance-orders/fault-report',
      summary: '故障报修（快捷创建，可附照片）',
      tags: ['维保工单'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'multipart/form-data',
        fields: [
          { name: 'equipmentId', type: 'string', required: true, description: '设备ID', example: 'eq-dispenser-001' },
          { name: 'urgency', type: 'string', required: false, description: '紧急程度', example: 'urgent' },
          { name: 'description', type: 'string', required: true, description: '故障描述（必填）', example: '加气机#01计量不准，差值超标' },
          { name: 'photos', type: 'File[]', required: false, description: '故障照片（可选）' },
        ],
      },
    },
    {
      id: 'maintenance-start',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/maintenance-orders/:id/start',
      summary: '开始处理（pending → processing）',
      tags: ['维保工单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '工单ID', example: 'mo-2026-001' },
      ],
    },
    {
      id: 'maintenance-submit-review',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/maintenance-orders/:id/submit-review',
      summary: '提交验收（processing → pending_review）',
      tags: ['维保工单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '工单ID', example: 'mo-2026-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'content', type: 'string', required: true, description: '维修说明', example: '更换液位传感器，测试正常' },
          { name: 'parts', type: 'string', required: false, description: '使用配件', example: '液位传感器 x1' },
          { name: 'cost', type: 'number', required: false, description: '费用（元）', example: '800' },
          { name: 'duration', type: 'number', required: false, description: '工时（小时）', example: '3' },
        ],
        example: '{\n  "content": "更换液位传感器，测试正常",\n  "parts": "液位传感器 x1",\n  "cost": 800,\n  "duration": 3\n}',
      },
    },
    {
      id: 'maintenance-approve',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/maintenance-orders/:id/approve',
      summary: '验收通过（pending_review → completed）',
      tags: ['维保工单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '工单ID', example: 'mo-2026-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'content', type: 'string', required: true, description: '验收说明', example: '现场复核设备运行正常，验收通过' }],
        example: '{ "content": "现场复核，验收通过" }',
      },
    },
    {
      id: 'maintenance-reject',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/maintenance-orders/:id/reject',
      summary: '退回处理（pending_review → processing）',
      tags: ['维保工单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '工单ID', example: 'mo-2026-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'content', type: 'string', required: true, description: '退回原因', example: '传感器仍有偏差，需重新校准' }],
        example: '{ "content": "仍有偏差，需重新校准" }',
      },
    },
    // --- Alarm ---
    {
      id: 'alarm-records',
      method: 'GET',
      path: '/api/v1/stations/:stationId/alarm-records',
      summary: '获取告警记录列表',
      tags: ['告警管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'equipmentId', type: 'string', required: false, description: '设备筛选' },
        { name: 'alarmLevel', type: 'string', required: false, description: '告警级别：critical / warning / info' },
        { name: 'status', type: 'string', required: false, description: '状态：active / acknowledged / resolved' },
      ],
    },
  ],
};

// ============================================================
// 模块 1.4 — 巡检安检管理
// ============================================================
const inspectionModule: ApiModule = {
  id: 'inspection',
  name: '巡检安检管理',
  nameEn: 'Inspection Management',
  description: '安检计划管理、任务分配与执行、检查项与标签配置、巡检日志、问题跟踪闭环、统计报表',
  baseUrl: '/api/v1',
  color: '#722ed1',
  endpoints: [
    // --- Inspection Plans ---
    {
      id: 'plan-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inspection-plans',
      summary: '获取安检计划列表',
      tags: ['安检计划'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'keyword', type: 'string', required: false, description: '搜索（计划编号、名称）', example: '日常巡检' },
        { name: 'status', type: 'string', required: false, description: '状态：pending / in_progress / completed / cancelled / all', example: 'in_progress' },
        { name: 'cycleType', type: 'string', required: false, description: '周期类型：daily / weekly / monthly', example: 'daily' },
        { name: 'startDateFrom', type: 'string', required: false, description: '开始日期起始（YYYY-MM-DD）', example: '2026-02-01' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[].id', 'items[].planNo', 'items[].name', 'items[].cycleType', 'items[].startDate', 'items[].endDate', 'items[].status', 'items[].taskCount', 'items[].completedTaskCount', 'pagination'],
    },
    {
      id: 'plan-get',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inspection-plans/:id',
      summary: '获取安检计划详情（含关联任务列表）',
      tags: ['安检计划'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '计划ID', example: 'plan-001' },
      ],
    },
    {
      id: 'plan-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/inspection-plans',
      summary: '创建安检计划',
      tags: ['安检计划'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'name', type: 'string', required: true, description: '计划名称', example: '2026年2月日常巡检计划' },
          { name: 'cycleType', type: 'string', required: true, description: '周期类型：daily / weekly / monthly', example: 'daily' },
          { name: 'startDate', type: 'string', required: true, description: '开始日期（YYYY-MM-DD）', example: '2026-02-01' },
          { name: 'endDate', type: 'string', required: true, description: '结束日期（YYYY-MM-DD）', example: '2026-02-28' },
          { name: 'checkItemIds', type: 'string[]', required: true, description: '检查项目ID列表', example: '["ci-001", "ci-002"]' },
          { name: 'description', type: 'string', required: false, description: '计划描述' },
        ],
        example: '{\n  "name": "2月日常巡检计划",\n  "cycleType": "daily",\n  "startDate": "2026-02-01",\n  "endDate": "2026-02-28",\n  "checkItemIds": ["ci-tank-01", "ci-dispenser-01", "ci-fire-01"]\n}',
      },
      responseFields: ['id', 'planNo'],
    },
    {
      id: 'plan-update',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/inspection-plans/:id',
      summary: '编辑安检计划（仅pending状态可编辑）',
      tags: ['安检计划'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '计划ID', example: 'plan-001' },
      ],
    },
    {
      id: 'plan-delete',
      method: 'DELETE',
      path: '/api/v1/stations/:stationId/inspection-plans/:id',
      summary: '取消安检计划（仅pending状态可取消）',
      tags: ['安检计划'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '计划ID', example: 'plan-001' },
      ],
    },
    {
      id: 'plan-dispatch',
      method: 'POST',
      path: '/api/v1/stations/:stationId/inspection-plans/:id/dispatch',
      summary: '从计划下发安检任务',
      tags: ['安检计划'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '计划ID', example: 'plan-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'assigneeId', type: 'string', required: true, description: '执行人ID', example: 'emp-005' },
          { name: 'dueDate', type: 'string', required: true, description: '截止日期（YYYY-MM-DD）', example: '2026-02-22' },
        ],
        example: '{ "assigneeId": "emp-005", "dueDate": "2026-02-22" }',
      },
    },
    // --- Inspection Tasks ---
    {
      id: 'task-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inspection-tasks',
      summary: '获取安检任务列表',
      tags: ['安检任务'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'status', type: 'string', required: false, description: '状态：pending / in_progress / completed / all', example: 'in_progress' },
        { name: 'assigneeId', type: 'string', required: false, description: '执行人筛选' },
        { name: 'planId', type: 'string', required: false, description: '关联计划筛选', example: 'plan-001' },
        { name: 'dueDateFrom', type: 'string', required: false, description: '截止日期起始' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[].id', 'items[].taskNo', 'items[].planNo', 'items[].status', 'items[].assigneeName', 'items[].dueDate', 'items[].totalItems', 'items[].checkedItems', 'pagination'],
    },
    {
      id: 'task-get',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inspection-tasks/:id',
      summary: '获取任务详情（含检查项列表及各项结果）',
      tags: ['安检任务'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '任务ID', example: 'task-001' },
      ],
      responseFields: ['id', 'taskNo', 'planId', 'planName', 'assigneeName', 'status', 'dueDate', 'totalItems', 'checkedItems', 'checkResults[].checkItemName', 'checkResults[].result', 'checkResults[].remark'],
    },
    {
      id: 'task-assign',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/inspection-tasks/:id/assign',
      summary: '分配/变更执行人',
      tags: ['安检任务'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '任务ID', example: 'task-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'assigneeId', type: 'string', required: true, description: '新执行人ID', example: 'emp-006' }],
        example: '{ "assigneeId": "emp-006" }',
      },
    },
    // --- Check Items ---
    {
      id: 'check-items-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/check-items',
      summary: '获取检查项目列表',
      tags: ['检查项管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'keyword', type: 'string', required: false, description: '名称搜索', example: '储罐' },
        { name: 'category', type: 'string', required: false, description: '分类：tank / dispenser / power / fueling / non_oil / equipment', example: 'tank' },
        { name: 'status', type: 'string', required: false, description: '状态：active / inactive / all', example: 'active' },
      ],
      responseFields: ['items[].id', 'items[].name', 'items[].category', 'items[].tags', 'items[].status', 'items[].isRequired'],
    },
    {
      id: 'check-item-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/check-items',
      summary: '新增检查项目',
      tags: ['检查项管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'name', type: 'string', required: true, description: '检查项名称', example: '储罐液位检查' },
          { name: 'category', type: 'string', required: true, description: '分类', example: 'tank' },
          { name: 'isRequired', type: 'boolean', required: false, description: '是否必检项', example: 'true' },
          { name: 'tagIds', type: 'string[]', required: false, description: '关联标签ID列表' },
          { name: 'description', type: 'string', required: false, description: '检查说明/标准' },
        ],
        example: '{\n  "name": "储罐液位检查",\n  "category": "tank",\n  "isRequired": true,\n  "description": "检查液位是否在安全范围（10%-90%）"\n}',
      },
    },
    // --- Inspection Logs ---
    {
      id: 'log-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inspection-logs',
      summary: '获取巡检日志列表',
      tags: ['巡检日志'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'taskId', type: 'string', required: false, description: '任务筛选' },
        { name: 'executorId', type: 'string', required: false, description: '执行人筛选' },
        { name: 'result', type: 'string', required: false, description: '结果：normal / abnormal / pending', example: 'abnormal' },
      ],
    },
    {
      id: 'log-result',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/inspection-logs/:id/result',
      summary: '记录检查结果（执行巡检）',
      tags: ['巡检日志'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '日志ID', example: 'log-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'result', type: 'string', required: true, description: '检查结果：normal / abnormal', example: 'abnormal' },
          { name: 'remark', type: 'string', required: false, description: '异常备注（result=abnormal时建议填写）', example: '液位传感器数值不稳定，波动±3%' },
        ],
        example: '{ "result": "abnormal", "remark": "液位传感器数值不稳定" }',
      },
    },
    {
      id: 'log-photos',
      method: 'POST',
      path: '/api/v1/stations/:stationId/inspection-logs/:id/photos',
      summary: '上传巡检现场照片',
      tags: ['巡检日志'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '日志ID', example: 'log-001' },
      ],
      requestBody: {
        contentType: 'multipart/form-data',
        fields: [{ name: 'files', type: 'File[]', required: true, description: '现场照片（jpg/png）' }],
      },
    },
    // --- Issue Records ---
    {
      id: 'issue-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/issue-records',
      summary: '获取问题记录列表',
      tags: ['问题跟踪'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'status', type: 'string', required: false, description: '状态：pending / processing / pending_review / closed', example: 'pending' },
        { name: 'severity', type: 'string', required: false, description: '等级：urgent / high / medium / low', example: 'urgent' },
        { name: 'assigneeId', type: 'string', required: false, description: '处理人筛选' },
        { name: 'sortBy', type: 'string', required: false, description: '排序：createdAt / severity / dueDate', example: 'severity' },
      ],
    },
    {
      id: 'issue-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/issue-records',
      summary: '登记问题',
      tags: ['问题跟踪'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'description', type: 'string', required: true, description: '问题描述', example: '储罐安全阀有轻微泄漏，需立即处理' },
          { name: 'severity', type: 'string', required: true, description: '等级：urgent / high / medium / low', example: 'urgent' },
          { name: 'taskId', type: 'string', required: false, description: '关联任务ID' },
          { name: 'logId', type: 'string', required: false, description: '关联日志ID' },
          { name: 'equipmentId', type: 'string', required: false, description: '关联设备ID', example: 'eq-tank-001' },
          { name: 'dueDate', type: 'string', required: false, description: '处理期限（YYYY-MM-DD）', example: '2026-02-22' },
        ],
        example: '{\n  "description": "储罐安全阀有轻微泄漏",\n  "severity": "urgent",\n  "equipmentId": "eq-tank-001",\n  "dueDate": "2026-02-22"\n}',
      },
      responseFields: ['id', 'issueNo'],
    },
    {
      id: 'issue-rectify',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/issue-records/:id/rectify',
      summary: '提交整改结果',
      tags: ['问题跟踪'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '问题ID', example: 'issue-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'rectification', type: 'string', required: true, description: '整改措施', example: '更换安全阀密封圈，重新调压测试' },
          { name: 'rectificationResult', type: 'string', required: true, description: '整改结果', example: '测试正常，泄漏消除' },
        ],
        example: '{\n  "rectification": "更换安全阀密封圈",\n  "rectificationResult": "测试正常，泄漏已消除"\n}',
      },
    },
    {
      id: 'issue-close',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/issue-records/:id/close',
      summary: '问题闭环确认（验收通过/驳回）',
      tags: ['问题跟踪'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '问题ID', example: 'issue-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'approved', type: 'boolean', required: true, description: '是否通过', example: 'true' },
          { name: 'reviewComment', type: 'string', required: false, description: '审核意见', example: '现场核验，问题已彻底整改' },
        ],
        example: '{ "approved": true, "reviewComment": "现场核验，问题已彻底整改" }',
      },
    },
    // --- Stats & Reports ---
    {
      id: 'stats-daily-report',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inspection-stats/daily-report',
      summary: '获取巡检日报',
      tags: ['统计报表'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'date', type: 'string', required: false, description: '日期（YYYY-MM-DD，默认今天）', example: '2026-02-22' },
      ],
      responseFields: ['date', 'totalTasks', 'completedTasks', 'completionRate', 'totalItems', 'normalItems', 'abnormalItems', 'newIssues', 'executorSummary'],
    },
    {
      id: 'stats-station-report',
      method: 'GET',
      path: '/api/v1/inspection-stats/station-report',
      summary: '获取站点执行报表（跨站点，运营经理视角）',
      tags: ['统计报表'],
      notes: '⚠️ 此接口无 stationId 前缀，为跨站点聚合接口，需较高权限（运营经理及以上）',
      queryParams: [
        { name: 'startDate', type: 'string', required: true, description: '开始日期（YYYY-MM-DD）', example: '2026-02-01' },
        { name: 'endDate', type: 'string', required: true, description: '结束日期（YYYY-MM-DD）', example: '2026-02-28' },
        { name: 'stationIds', type: 'string', required: false, description: '站点ID列表（逗号分隔），默认全部', example: 'station-001,station-002' },
      ],
      responseFields: ['stations[].stationId', 'stations[].stationName', 'stations[].completionRate', 'stations[].totalAbnormalItems', 'stations[].totalIssues', 'stations[].rectificationRate'],
    },
    {
      id: 'stats-overview',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inspection-stats/overview',
      summary: '获取安检统计概览（多维分析）',
      tags: ['统计报表'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'startDate', type: 'string', required: true, description: '开始日期（YYYY-MM-DD）', example: '2026-02-01' },
        { name: 'endDate', type: 'string', required: true, description: '结束日期（YYYY-MM-DD）', example: '2026-02-28' },
        { name: 'dimension', type: 'string', required: false, description: '分析维度：time / station / category（默认time）', example: 'time' },
        { name: 'granularity', type: 'string', required: false, description: '时间粒度：day / week / month（默认day）', example: 'week' },
      ],
    },
    {
      id: 'report-generate',
      method: 'POST',
      path: '/api/v1/stations/:stationId/inspection-reports/generate',
      summary: '生成检查报表',
      tags: ['统计报表'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'reportType', type: 'string', required: true, description: '报表类型：completion / abnormal / rectification / compliance', example: 'completion' },
          { name: 'startDate', type: 'string', required: true, description: '开始日期（YYYY-MM-DD）', example: '2026-02-01' },
          { name: 'endDate', type: 'string', required: true, description: '结束日期（YYYY-MM-DD）', example: '2026-02-28' },
          { name: 'format', type: 'string', required: true, description: '导出格式：excel', example: 'excel' },
        ],
        example: '{\n  "reportType": "completion",\n  "startDate": "2026-02-01",\n  "endDate": "2026-02-28",\n  "format": "excel"\n}',
      },
    },
    {
      id: 'inspection-tags-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inspection-tags',
      summary: '获取标签列表',
      tags: ['检查项管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
    },
    {
      id: 'inspection-tags-sort',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/inspection-tags/sort',
      summary: '批量更新标签排序',
      tags: ['检查项管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'items', type: 'Array<{id, sortOrder}>', required: true, description: '标签排序数据', example: '[{"id":"tag-001","sortOrder":1},{"id":"tag-002","sortOrder":2}]' }],
        example: '{\n  "items": [\n    { "id": "tag-001", "sortOrder": 1 },\n    { "id": "tag-002", "sortOrder": 2 }\n  ]\n}',
      },
    },
  ],
};

// ============================================================
// 模块 2.1 — 价格管理
// ============================================================
const priceManagementModule: ApiModule = {
  id: 'price-management',
  name: '价格管理',
  nameEn: 'Price Management',
  description: '燃料类型基准价、调价操作与审批、枪独立定价、价格防御配置、会员专享价、价格协议、聚合接口',
  baseUrl: '/api/v1',
  color: '#fa8c16',
  endpoints: [
    // --- 燃料类型基准价 ---
    {
      id: 'fuel-type-price-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/fuel-type-prices',
      summary: '获取站点所有燃料类型基准价列表',
      tags: ['燃料基准价'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'status', type: 'string', required: false, description: '状态筛选', example: 'active' },
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID', example: 'ft-lng' },
      ],
      responseFields: ['items[].id', 'items[].fuelTypeId', 'items[].fuelTypeName', 'items[].basePrice', 'items[].status', 'items[].nozzleCount'],
    },
    {
      id: 'fuel-type-price-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/fuel-type-prices',
      summary: '设置燃料类型初始基准价',
      tags: ['燃料基准价'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'fuelTypeId', type: 'string', required: true, description: '燃料类型ID', example: 'ft-lng' },
          { name: 'basePrice', type: 'number', required: true, description: '基准价（元/kg）', example: '4.8' },
        ],
        example: '{\n  "fuelTypeId": "ft-lng",\n  "basePrice": 4.8\n}',
      },
    },
    {
      id: 'fuel-type-price-update',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/fuel-type-prices/:id',
      summary: '更新基准价（内部走调价流程）',
      tags: ['燃料基准价'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '基准价ID', example: 'ftp-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'basePrice', type: 'number', required: true, description: '新基准价', example: '5.0' }],
        example: '{ "basePrice": 5.0 }',
      },
      notes: '内部走 PriceAdjustment 流程',
    },
    // --- 调价操作 ---
    {
      id: 'price-adjustment-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/price-adjustments',
      summary: '调价记录列表（历史 + 待生效）',
      tags: ['调价操作'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'status', type: 'string', required: false, description: '调价状态', example: 'pending' },
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID', example: 'ft-lng' },
        { name: 'adjustmentType', type: 'string', required: false, description: '调价类型', example: 'immediate' },
        { name: 'dateFrom', type: 'string', required: false, description: '开始日期', example: '2026-01-01' },
        { name: 'dateTo', type: 'string', required: false, description: '结束日期', example: '2026-02-28' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[].id', 'items[].fuelTypeId', 'items[].oldPrice', 'items[].newPrice', 'items[].adjustmentType', 'items[].status', 'items[].effectiveAt', 'pagination'],
    },
    {
      id: 'price-adjustment-detail',
      method: 'GET',
      path: '/api/v1/stations/:stationId/price-adjustments/:id',
      summary: '调价记录详情（含影响枪列表、审批信息）',
      tags: ['调价操作'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '调价记录ID', example: 'pa-001' },
      ],
      responseFields: ['id', 'fuelTypeId', 'oldPrice', 'newPrice', 'adjustmentType', 'status', 'effectiveAt', 'affectedNozzles[]', 'approvalInfo'],
    },
    {
      id: 'price-adjustment-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/price-adjustments',
      summary: '提交调价',
      tags: ['调价操作'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'fuelTypeId', type: 'string', required: true, description: '燃料类型ID', example: 'ft-lng' },
          { name: 'nozzleId', type: 'string', required: false, description: '枪ID（枪级调价时提供）', example: 'nz-001' },
          { name: 'newPrice', type: 'number', required: true, description: '新价格', example: '5.2' },
          { name: 'adjustmentType', type: 'string', required: true, description: '调价类型：immediate / scheduled', example: 'immediate' },
          { name: 'effectiveAt', type: 'string', required: false, description: '生效时间（scheduled 时必填）', example: '2026-03-01T00:00:00Z' },
          { name: 'reason', type: 'string', required: false, description: '调价原因', example: '市场价格调整' },
        ],
        example: '{\n  "fuelTypeId": "ft-lng",\n  "newPrice": 5.2,\n  "adjustmentType": "immediate",\n  "reason": "市场价格调整"\n}',
      },
    },
    {
      id: 'price-adjustment-approve',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/price-adjustments/:id/approve',
      summary: '审批通过',
      tags: ['调价操作'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '调价记录ID', example: 'pa-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'approvedBy', type: 'string', required: true, description: '审批人ID', example: 'emp-001' }],
        example: '{ "approvedBy": "emp-001" }',
      },
    },
    {
      id: 'price-adjustment-reject',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/price-adjustments/:id/reject',
      summary: '审批驳回',
      tags: ['调价操作'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '调价记录ID', example: 'pa-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'rejectedBy', type: 'string', required: true, description: '驳回人ID', example: 'emp-002' },
          { name: 'reason', type: 'string', required: true, description: '驳回原因', example: '调价幅度过大' },
        ],
        example: '{ "rejectedBy": "emp-002", "reason": "调价幅度过大" }',
      },
    },
    {
      id: 'price-adjustment-cancel',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/price-adjustments/:id/cancel',
      summary: '取消调价计划',
      tags: ['调价操作'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '调价记录ID', example: 'pa-001' },
      ],
    },
    {
      id: 'price-adjustment-batch',
      method: 'POST',
      path: '/api/v1/stations/:stationId/price-adjustments/batch',
      summary: '批量调价',
      tags: ['调价操作'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'fuelTypeIds', type: 'string[]', required: true, description: '燃料类型ID数组', example: '["ft-lng", "ft-cng"]' },
          { name: 'adjustmentMode', type: 'string', required: true, description: '调价模式：absolute / percentage', example: 'absolute' },
          { name: 'adjustmentValue', type: 'number', required: true, description: '调价值', example: '0.5' },
        ],
        example: '{\n  "fuelTypeIds": ["ft-lng", "ft-cng"],\n  "adjustmentMode": "absolute",\n  "adjustmentValue": 0.5\n}',
      },
    },
    // --- 枪独立定价 ---
    {
      id: 'nozzle-override-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/nozzle-price-overrides',
      summary: '获取站点所有枪覆盖价列表',
      tags: ['枪独立定价'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'nozzleId', type: 'string', required: false, description: '枪ID', example: 'nz-001' },
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID', example: 'ft-lng' },
      ],
      responseFields: ['items[].id', 'items[].nozzleId', 'items[].overridePrice', 'items[].fuelTypeId'],
    },
    {
      id: 'nozzle-override-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/nozzle-price-overrides',
      summary: '创建枪覆盖价（内部走调价流程）',
      tags: ['枪独立定价'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'nozzleId', type: 'string', required: true, description: '枪ID', example: 'nz-001' },
          { name: 'overridePrice', type: 'number', required: true, description: '覆盖价格', example: '5.5' },
        ],
        example: '{ "nozzleId": "nz-001", "overridePrice": 5.5 }',
      },
    },
    {
      id: 'nozzle-override-delete',
      method: 'DELETE',
      path: '/api/v1/stations/:stationId/nozzle-price-overrides/:id',
      summary: '删除覆盖价（恢复基准价）',
      tags: ['枪独立定价'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '覆盖价ID', example: 'npo-001' },
      ],
    },
    // --- 调价防御配置 ---
    {
      id: 'defense-config-list',
      method: 'GET',
      path: '/api/v1/price-defense-configs',
      summary: '获取防御配置列表',
      tags: ['调价防御'],
      queryParams: [
        { name: 'stationId', type: 'string', required: false, description: '站点ID', example: 'station-001' },
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID', example: 'ft-lng' },
      ],
      responseFields: ['items[].id', 'items[].stationId', 'items[].fuelTypeId', 'items[].maxIncreasePct', 'items[].maxDecreasePct', 'items[].requireApproval', 'items[].approvalThresholdPct'],
    },
    {
      id: 'defense-config-create',
      method: 'POST',
      path: '/api/v1/price-defense-configs',
      summary: '创建防御配置',
      tags: ['调价防御'],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'stationId', type: 'string', required: false, description: '站点ID（不传表示全局）', example: 'station-001' },
          { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID（不传表示全品类）', example: 'ft-lng' },
          { name: 'maxIncreasePct', type: 'number', required: true, description: '最大上调幅度（%）', example: '10' },
          { name: 'maxDecreasePct', type: 'number', required: true, description: '最大下调幅度（%）', example: '15' },
          { name: 'requireApproval', type: 'boolean', required: true, description: '是否需要审批', example: 'true' },
          { name: 'approvalThresholdPct', type: 'number', required: false, description: '审批触发阈值（%）', example: '5' },
        ],
        example: '{\n  "maxIncreasePct": 10,\n  "maxDecreasePct": 15,\n  "requireApproval": true,\n  "approvalThresholdPct": 5\n}',
      },
    },
    {
      id: 'defense-config-update',
      method: 'PUT',
      path: '/api/v1/price-defense-configs/:id',
      summary: '更新防御配置',
      tags: ['调价防御'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '配置ID', example: 'pdc-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'maxIncreasePct', type: 'number', required: true, description: '最大上调幅度（%）', example: '10' },
          { name: 'maxDecreasePct', type: 'number', required: true, description: '最大下调幅度（%）', example: '15' },
          { name: 'requireApproval', type: 'boolean', required: true, description: '是否需要审批', example: 'true' },
          { name: 'approvalThresholdPct', type: 'number', required: false, description: '审批触发阈值（%）', example: '5' },
        ],
      },
    },
    // --- 会员专享价 ---
    {
      id: 'member-price-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/member-price-rules',
      summary: '获取会员价规则列表',
      tags: ['会员专享价'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID', example: 'ft-lng' },
        { name: 'memberTier', type: 'string', required: false, description: '会员等级', example: 'gold' },
      ],
      responseFields: ['items[].id', 'items[].fuelTypeId', 'items[].memberTier', 'items[].discountType', 'items[].discountValue'],
      notes: '⚠️ Phase 4 依赖（会员管理模块）',
    },
    {
      id: 'member-price-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/member-price-rules',
      summary: '创建会员价规则',
      tags: ['会员专享价'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'fuelTypeId', type: 'string', required: true, description: '燃料类型ID', example: 'ft-lng' },
          { name: 'memberTier', type: 'string', required: true, description: '会员等级', example: 'gold' },
          { name: 'discountType', type: 'string', required: true, description: '折扣类型：fixed / percentage', example: 'fixed' },
          { name: 'discountValue', type: 'number', required: true, description: '折扣值', example: '0.3' },
        ],
        example: '{\n  "fuelTypeId": "ft-lng",\n  "memberTier": "gold",\n  "discountType": "fixed",\n  "discountValue": 0.3\n}',
      },
    },
    {
      id: 'member-price-update',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/member-price-rules/:id',
      summary: '更新会员价规则',
      tags: ['会员专享价'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '规则ID', example: 'mpr-001' },
      ],
    },
    {
      id: 'member-price-delete',
      method: 'DELETE',
      path: '/api/v1/stations/:stationId/member-price-rules/:id',
      summary: '删除会员价规则',
      tags: ['会员专享价'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '规则ID', example: 'mpr-001' },
      ],
    },
    // --- 价格协议 ---
    {
      id: 'agreement-list',
      method: 'GET',
      path: '/api/v1/price-agreements',
      summary: '价格协议列表',
      tags: ['价格协议'],
      queryParams: [
        { name: 'enterpriseId', type: 'string', required: false, description: '企业ID', example: 'ent-001' },
        { name: 'stationId', type: 'string', required: false, description: '站点ID', example: 'station-001' },
        { name: 'status', type: 'string', required: false, description: '状态筛选', example: 'active' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[].id', 'items[].enterpriseId', 'items[].enterpriseName', 'items[].stationId', 'items[].fuelTypeId', 'items[].agreedPrice', 'items[].validFrom', 'items[].validTo', 'items[].status', 'pagination'],
      notes: '⚠️ Phase 4 依赖（大客户管理模块）',
    },
    {
      id: 'agreement-detail',
      method: 'GET',
      path: '/api/v1/price-agreements/:id',
      summary: '协议详情',
      tags: ['价格协议'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '协议ID', example: 'agr-001' }],
      responseFields: ['id', 'enterpriseId', 'enterpriseName', 'stationId', 'fuelTypeId', 'agreedPrice', 'validFrom', 'validTo', 'status', 'createdAt', 'updatedAt'],
    },
    {
      id: 'agreement-create',
      method: 'POST',
      path: '/api/v1/price-agreements',
      summary: '创建协议',
      tags: ['价格协议'],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'enterpriseId', type: 'string', required: true, description: '企业ID', example: 'ent-001' },
          { name: 'enterpriseName', type: 'string', required: true, description: '企业名称', example: '顺丰物流' },
          { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
          { name: 'fuelTypeId', type: 'string', required: true, description: '燃料类型ID', example: 'ft-lng' },
          { name: 'agreedPrice', type: 'number', required: true, description: '协议价格', example: '4.5' },
          { name: 'validFrom', type: 'string', required: true, description: '生效日期', example: '2026-01-01' },
          { name: 'validTo', type: 'string', required: true, description: '到期日期', example: '2026-12-31' },
        ],
        example: '{\n  "enterpriseId": "ent-001",\n  "enterpriseName": "顺丰物流",\n  "stationId": "station-001",\n  "fuelTypeId": "ft-lng",\n  "agreedPrice": 4.5,\n  "validFrom": "2026-01-01",\n  "validTo": "2026-12-31"\n}',
      },
    },
    {
      id: 'agreement-update',
      method: 'PUT',
      path: '/api/v1/price-agreements/:id',
      summary: '更新协议',
      tags: ['价格协议'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '协议ID', example: 'agr-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'agreedPrice', type: 'number', required: false, description: '协议价格', example: '4.6' },
          { name: 'validTo', type: 'string', required: false, description: '到期日期', example: '2027-06-30' },
        ],
        example: '{ "agreedPrice": 4.6, "validTo": "2027-06-30" }',
      },
    },
    {
      id: 'agreement-terminate',
      method: 'PATCH',
      path: '/api/v1/price-agreements/:id/terminate',
      summary: '终止协议',
      tags: ['价格协议'],
      pathParams: [{ name: 'id', type: 'string', required: true, description: '协议ID', example: 'agr-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'terminationReason', type: 'string', required: true, description: '终止原因', example: '合同到期不续约' }],
        example: '{ "terminationReason": "合同到期不续约" }',
      },
    },
    // --- 聚合接口 ---
    {
      id: 'price-overview',
      method: 'GET',
      path: '/api/v1/stations/:stationId/price-overview',
      summary: '价格管理首页聚合数据',
      tags: ['聚合接口'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['fuelTypePrices[]', 'pendingAdjustments[]', 'defenseConfig'],
      notes: '聚合多个实体数据用于 Dashboard 展示',
    },
    {
      id: 'price-board',
      method: 'GET',
      path: '/api/v1/stations/:stationId/price-board',
      summary: '价格公示看板数据',
      tags: ['聚合接口'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['stationName', 'prices[]', 'prices[].fuelTypeName', 'prices[].standardPrice', 'prices[].memberPrice', 'lastUpdatedAt'],
      notes: '聚合标准价 + 会员价用于价格公示看板',
    },
  ],
};

// ============================================================
// 模块 2.2 — 订单与交易
// ============================================================
const orderTransactionModule: ApiModule = {
  id: 'order-transaction',
  name: '订单与交易',
  nameEn: 'Order & Transaction',
  description: '充装订单管理、收银支付、异常订单处理、退款审批、订单标签管理',
  baseUrl: '/api/v1',
  color: '#eb2f96',
  endpoints: [
    // --- 充装订单 ---
    {
      id: 'fueling-order-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/fueling-orders',
      summary: '订单列表',
      tags: ['充装订单'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'status', type: 'string', required: false, description: '订单状态筛选：filling / pending_payment / paid / cancelled / exception / suspended / refunded / closed', example: 'paid' },
        { name: 'paymentMethod', type: 'string', required: false, description: '支付方式筛选：cash / wechat / alipay / unionpay', example: 'wechat' },
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID', example: 'ft-lng' },
        { name: 'nozzleNo', type: 'string', required: false, description: '枪号', example: '01' },
        { name: 'dateFrom', type: 'string', required: false, description: '开始日期', example: '2026-02-20' },
        { name: 'dateTo', type: 'string', required: false, description: '结束日期', example: '2026-02-26' },
        { name: 'keyword', type: 'string', required: false, description: '搜索关键词（匹配订单号、车牌号）', example: 'ST001' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[]', 'items[].id', 'items[].orderNo', 'items[].nozzleNo', 'items[].fuelTypeName', 'items[].quantity', 'items[].totalAmount', 'items[].payableAmount', 'items[].orderStatus', 'items[].paymentMethod', 'items[].vehiclePlateNo', 'items[].createdAt', 'pagination'],
    },
    {
      id: 'fueling-order-detail',
      method: 'GET',
      path: '/api/v1/stations/:stationId/fueling-orders/:id',
      summary: '订单详情',
      tags: ['充装订单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-001' },
      ],
      responseFields: ['id', 'orderNo', 'stationId', 'nozzleId', 'nozzleNo', 'fuelTypeId', 'fuelTypeName', 'shiftId', 'operatorId', 'operatorName', 'unitPrice', 'quantity', 'totalAmount', 'discountAmount', 'payableAmount', 'orderStatus', 'vehiclePlateNo', 'notes', 'paymentRecords[]', 'refundRecords[]', 'tags[]', 'createdAt', 'updatedAt'],
    },
    {
      id: 'fueling-order-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/fueling-orders',
      summary: '手动创建订单',
      tags: ['充装订单'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'nozzleId', type: 'string', required: true, description: '枪ID', example: 'nozzle-01' },
          { name: 'quantity', type: 'number', required: true, description: '充装量（kg）', example: '50.5' },
          { name: 'vehiclePlateNo', type: 'string', required: false, description: '车牌号', example: '京A12345' },
          { name: 'notes', type: 'string', required: false, description: '备注', example: '补录订单' },
        ],
        example: '{\n  "nozzleId": "nozzle-01",\n  "quantity": 50.5,\n  "vehiclePlateNo": "京A12345",\n  "notes": "补录订单"\n}',
      },
      responseFields: ['id', 'orderNo'],
      notes: '内部自动获取当前价格（来自价格管理 API）并锁定在 unitPrice 字段',
    },
    {
      id: 'fueling-order-cancel',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/cancel',
      summary: '取消订单',
      tags: ['充装订单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'cancelReason', type: 'string', required: true, description: '取消原因', example: '客户临时取消' }],
        example: '{ "cancelReason": "客户临时取消" }',
      },
      notes: '仅 filling / pending_payment 状态可取消；已支付需走退款流程',
    },
    {
      id: 'fueling-order-update-notes',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/notes',
      summary: '更新订单备注',
      tags: ['充装订单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'notes', type: 'string', required: true, description: '备注内容', example: '已与客户确认' }],
        example: '{ "notes": "已与客户确认" }',
      },
    },
    {
      id: 'fueling-order-statistics',
      method: 'GET',
      path: '/api/v1/stations/:stationId/fueling-orders/statistics',
      summary: '订单统计',
      tags: ['充装订单'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'dimension', type: 'string', required: true, description: '统计维度：today / shift', example: 'today' },
        { name: 'shiftId', type: 'string', required: false, description: '班次ID（dimension=shift 时必填）', example: 'shift-001' },
      ],
      responseFields: ['totalOrders', 'totalAmount', 'totalQuantity', 'pendingPaymentCount', 'paymentMethodBreakdown'],
    },
    {
      id: 'fueling-order-export',
      method: 'GET',
      path: '/api/v1/stations/:stationId/fueling-orders/export',
      summary: '导出订单',
      tags: ['充装订单'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'status', type: 'string', required: false, description: '状态筛选', example: 'paid' },
        { name: 'dateFrom', type: 'string', required: false, description: '开始日期', example: '2026-02-01' },
        { name: 'dateTo', type: 'string', required: false, description: '结束日期', example: '2026-02-28' },
      ],
      notes: 'MVP+ 功能，响应为 Excel 文件流（application/vnd.openxmlformats-officedocument.spreadsheetml.sheet）',
    },
    // --- 异常订单 ---
    {
      id: 'exception-order-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/fueling-orders/exceptions',
      summary: '异常订单列表',
      tags: ['异常订单'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'exceptionType', type: 'string', required: false, description: '异常类型：power_loss / timeout / amount_error / other', example: 'timeout' },
        { name: 'handleStatus', type: 'string', required: false, description: '处理状态：pending / suspended / supplemented / pending_review / closed', example: 'pending' },
        { name: 'dateFrom', type: 'string', required: false, description: '开始日期', example: '2026-02-20' },
        { name: 'dateTo', type: 'string', required: false, description: '结束日期', example: '2026-02-26' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[]', 'pagination', 'statistics'],
    },
    {
      id: 'exception-order-suspend',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/suspend',
      summary: '挂起异常订单',
      tags: ['异常订单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-exc-001' },
      ],
      notes: '挂起后订单不参与班次结算统计',
    },
    {
      id: 'exception-order-unsuspend',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/unsuspend',
      summary: '取消挂起',
      tags: ['异常订单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-exc-001' },
      ],
    },
    {
      id: 'exception-order-supplement',
      method: 'POST',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/supplement',
      summary: '补单',
      tags: ['异常订单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-exc-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'paymentMethod', type: 'string', required: true, description: '支付方式', example: 'cash' },
          { name: 'amount', type: 'number', required: true, description: '支付金额', example: '293.00' },
          { name: 'supplementReason', type: 'string', required: true, description: '补单原因', example: '掉电恢复后补录' },
        ],
        example: '{\n  "paymentMethod": "cash",\n  "amount": 293.00,\n  "supplementReason": "掉电恢复后补录"\n}',
      },
      notes: '仅对 exception / suspended 状态订单可用',
    },
    {
      id: 'exception-order-supplement-approve',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/supplement-approve',
      summary: '补单审核通过',
      tags: ['异常订单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-exc-001' },
      ],
      notes: 'MVP+ 功能',
    },
    {
      id: 'exception-order-supplement-reject',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/supplement-reject',
      summary: '补单审核驳回',
      tags: ['异常订单'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-exc-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'reason', type: 'string', required: true, description: '驳回原因', example: '金额不符' }],
        example: '{ "reason": "金额不符" }',
      },
      notes: 'MVP+ 功能',
    },
    // --- 支付 ---
    {
      id: 'fueling-order-pay',
      method: 'POST',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/pay',
      summary: '支付（单一方式）',
      tags: ['支付'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'paymentMethod', type: 'string', required: true, description: '支付方式：cash / wechat / alipay / unionpay', example: 'wechat' },
          { name: 'amount', type: 'number', required: true, description: '支付金额', example: '293.00' },
          { name: 'receivedAmount', type: 'number', required: false, description: '实收金额（现金支付时使用，用于找零计算）', example: '300.00' },
        ],
        example: '{\n  "paymentMethod": "wechat",\n  "amount": 293.00\n}',
      },
      notes: '支付操作保证幂等性（通过 transaction_ref 去重）',
    },
    {
      id: 'fueling-order-pay-mixed',
      method: 'POST',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/pay-mixed',
      summary: '混合支付',
      tags: ['支付'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'payments', type: 'array', required: true, description: '支付明细数组：[{ paymentMethod, amount }]', example: '见下方示例' },
        ],
        example: '{\n  "payments": [\n    { "paymentMethod": "cash", "amount": 100.00 },\n    { "paymentMethod": "wechat", "amount": 193.00 }\n  ]\n}',
      },
      notes: 'MVP+ 功能，一笔订单可多种支付方式混合支付',
    },
    // --- 退款 ---
    {
      id: 'refund-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/refunds',
      summary: '退款记录列表',
      tags: ['退款'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'refundStatus', type: 'string', required: false, description: '退款状态：pending_approval / refunded / rejected', example: 'pending_approval' },
        { name: 'dateFrom', type: 'string', required: false, description: '开始日期', example: '2026-02-20' },
        { name: 'dateTo', type: 'string', required: false, description: '结束日期', example: '2026-02-26' },
        { name: 'keyword', type: 'string', required: false, description: '搜索关键词（匹配订单号）', example: 'ST001' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[]', 'items[].id', 'items[].orderId', 'items[].orderNo', 'items[].refundType', 'items[].refundAmount', 'items[].refundReason', 'items[].refundStatus', 'items[].appliedBy', 'items[].approvedBy', 'items[].createdAt', 'pagination'],
    },
    {
      id: 'refund-apply',
      method: 'POST',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/refund',
      summary: '发起退款申请',
      tags: ['退款'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'refundType', type: 'string', required: true, description: '退款类型：full / partial', example: 'partial' },
          { name: 'refundAmount', type: 'number', required: true, description: '退款金额', example: '100.00' },
          { name: 'refundReason', type: 'string', required: true, description: '退款原因', example: '多充退款' },
        ],
        example: '{\n  "refundType": "partial",\n  "refundAmount": 100.00,\n  "refundReason": "多充退款"\n}',
      },
      notes: '退款金额 ≤ (实付金额 - 已退总额)；全额退款时 refundAmount 自动填入 payableAmount',
    },
    {
      id: 'refund-approve',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/refunds/:id/approve',
      summary: '退款审批通过',
      tags: ['退款'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '退款记录ID', example: 'refund-001' },
      ],
      notes: '审批通过后：全额退款→订单状态变更为 refunded；部分退款→订单状态保持 paid',
    },
    {
      id: 'refund-reject',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/refunds/:id/reject',
      summary: '退款审批驳回',
      tags: ['退款'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '退款记录ID', example: 'refund-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'reason', type: 'string', required: true, description: '驳回原因', example: '退款金额有误' }],
        example: '{ "reason": "退款金额有误" }',
      },
    },
    // --- 标签管理 ---
    {
      id: 'order-tag-config-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/order-tags',
      summary: '标签配置列表',
      tags: ['标签管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['items[]', 'items[].id', 'items[].name', 'items[].sortOrder'],
      notes: 'MVP+ 功能',
    },
    {
      id: 'order-tag-config-create',
      method: 'POST',
      path: '/api/v1/stations/:stationId/order-tags',
      summary: '创建标签',
      tags: ['标签管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'name', type: 'string', required: true, description: '标签名称', example: '滴滴' }],
        example: '{ "name": "滴滴" }',
      },
      notes: 'MVP+ 功能',
    },
    {
      id: 'order-tag-config-update',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/order-tags/:id',
      summary: '更新标签',
      tags: ['标签管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '标签ID', example: 'tag-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'name', type: 'string', required: true, description: '标签名称', example: '物流车队' }],
        example: '{ "name": "物流车队" }',
      },
      notes: 'MVP+ 功能',
    },
    {
      id: 'order-tag-config-delete',
      method: 'DELETE',
      path: '/api/v1/stations/:stationId/order-tags/:id',
      summary: '删除标签',
      tags: ['标签管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '标签ID', example: 'tag-001' },
      ],
      notes: 'MVP+ 功能',
    },
    {
      id: 'order-tag-add',
      method: 'POST',
      path: '/api/v1/stations/:stationId/fueling-orders/:id/tags',
      summary: '为订单添加标签',
      tags: ['标签管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '订单ID', example: 'order-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [{ name: 'tagName', type: 'string', required: true, description: '标签名称', example: '滴滴' }],
        example: '{ "tagName": "滴滴" }',
      },
      notes: 'MVP+ 功能',
    },
    {
      id: 'order-tag-remove',
      method: 'DELETE',
      path: '/api/v1/stations/:stationId/fueling-orders/:orderId/tags/:tagId',
      summary: '移除订单标签',
      tags: ['标签管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'orderId', type: 'string', required: true, description: '订单ID', example: 'order-001' },
        { name: 'tagId', type: 'string', required: true, description: '标签ID', example: 'tag-001' },
      ],
      notes: 'MVP+ 功能',
    },
  ],
};

// ============================================================
// 模块 2.3 — 库存管理
// ============================================================
const inventoryModule: ApiModule = {
  id: 'inventory-management',
  name: '库存管理',
  nameEn: 'Inventory Management',
  description: '库存总览、入库管理、出库记录、进销存流水、罐存比对、盘点调整、库存预警',
  baseUrl: '/api/v1',
  color: '#13c2c2',
  endpoints: [
    // --- 库存总览 ---
    {
      id: 'inventory-overview',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/overview',
      summary: '库存总览聚合',
      description: '聚合所有燃料类型的库存卡片数据和趋势数据',
      tags: ['库存总览'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'trendDays', type: 'number', required: false, description: '趋势数据天数', example: '7' },
      ],
      responseFields: ['cards[]', 'cards[].fuelTypeId', 'cards[].fuelTypeName', 'cards[].currentStock', 'cards[].ratedCapacity', 'cards[].tankLevelRatio', 'cards[].todayInbound', 'cards[].todayOutbound', 'cards[].netChange', 'trendData[]'],
    },
    // --- 入库管理 ---
    {
      id: 'inbound-record-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/inbound-records',
      summary: '入库记录列表',
      tags: ['入库管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID', example: 'ft-lng' },
        { name: 'auditStatus', type: 'string', required: false, description: '审核状态：pending_review / approved / rejected', example: 'pending_review' },
        { name: 'dateFrom', type: 'string', required: false, description: '开始日期', example: '2026-02-01' },
        { name: 'dateTo', type: 'string', required: false, description: '结束日期', example: '2026-02-28' },
        { name: 'keyword', type: 'string', required: false, description: '搜索关键词（匹配入库单号、供应商）', example: 'RK' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[]', 'items[].id', 'items[].inboundNo', 'items[].supplierName', 'items[].fuelTypeName', 'items[].plannedQuantity', 'items[].actualQuantity', 'items[].variance', 'items[].varianceRate', 'items[].auditStatus', 'items[].inboundTime', 'pagination'],
    },
    {
      id: 'inbound-record-detail',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/inbound-records/:id',
      summary: '入库记录详情',
      tags: ['入库管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '入库记录ID', example: 'inb-001' },
      ],
      responseFields: ['id', 'inboundNo', 'tankId', 'tankName', 'fuelTypeId', 'fuelTypeName', 'supplierName', 'deliveryNo', 'plannedQuantity', 'actualQuantity', 'variance', 'varianceRate', 'auditStatus', 'auditorName', 'auditedAt', 'rejectReason', 'operatorName', 'inboundTime', 'remark'],
    },
    {
      id: 'create-inbound-record',
      method: 'POST',
      path: '/api/v1/stations/:stationId/inventory/inbound-records',
      summary: '创建入库单',
      tags: ['入库管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'tankId', type: 'string', required: true, description: '目标储罐ID', example: 'tank-001' },
          { name: 'supplierName', type: 'string', required: true, description: '供应商名称', example: '中石化供应' },
          { name: 'deliveryNo', type: 'string', required: false, description: '送货单号', example: 'DL-20260225-001' },
          { name: 'plannedQuantity', type: 'number', required: true, description: '计划量(kg)', example: '5000.000' },
          { name: 'actualQuantity', type: 'number', required: true, description: '实收量(kg)', example: '4985.500' },
          { name: 'inboundTime', type: 'string', required: true, description: '入库时间(ISO)', example: '2026-02-25T10:00:00' },
          { name: 'remark', type: 'string', required: false, description: '备注' },
        ],
      },
      responseFields: ['id', 'inboundNo'],
    },
    {
      id: 'approve-inbound-record',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/inventory/inbound-records/:id/approve',
      summary: '审核通过入库单',
      description: '更新审核状态为 approved，同时更新理论库存',
      tags: ['入库管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '入库记录ID', example: 'inb-001' },
      ],
      notes: '权限：station_master',
    },
    {
      id: 'reject-inbound-record',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/inventory/inbound-records/:id/reject',
      summary: '审核驳回入库单',
      tags: ['入库管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '入库记录ID', example: 'inb-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'reason', type: 'string', required: true, description: '驳回原因', example: '数量偏差过大' },
        ],
      },
    },
    // --- 出库管理 ---
    {
      id: 'outbound-record-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/outbound-records',
      summary: '出库记录列表',
      tags: ['出库管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'outboundType', type: 'string', required: false, description: '出库类型：sales / loss / reversal', example: 'loss' },
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID', example: 'ft-lng' },
        { name: 'source', type: 'string', required: false, description: '操作来源：auto / manual', example: 'manual' },
        { name: 'dateFrom', type: 'string', required: false, description: '开始日期', example: '2026-02-01' },
        { name: 'dateTo', type: 'string', required: false, description: '结束日期', example: '2026-02-28' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[]', 'items[].id', 'items[].outboundNo', 'items[].outboundType', 'items[].fuelTypeName', 'items[].quantity', 'items[].amount', 'items[].source', 'items[].auditStatus', 'items[].outboundTime', 'pagination'],
    },
    {
      id: 'create-loss-outbound',
      method: 'POST',
      path: '/api/v1/stations/:stationId/inventory/outbound-records',
      summary: '创建损耗出库',
      tags: ['出库管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'fuelTypeId', type: 'string', required: true, description: '燃料类型ID', example: 'ft-lng' },
          { name: 'quantity', type: 'number', required: true, description: '损耗量(kg)', example: '15.500' },
          { name: 'lossReason', type: 'string', required: true, description: '损耗原因：evaporation / leakage / transfer / other', example: 'evaporation' },
          { name: 'lossReasonDetail', type: 'string', required: false, description: '原因说明（选other时必填）' },
        ],
      },
      responseFields: ['id', 'outboundNo'],
    },
    {
      id: 'approve-loss-outbound',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/inventory/outbound-records/:id/approve',
      summary: '损耗审批通过',
      tags: ['出库管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '出库记录ID', example: 'out-001' },
      ],
      notes: '权限：shift_leader, station_master',
    },
    {
      id: 'reject-loss-outbound',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/inventory/outbound-records/:id/reject',
      summary: '损耗审批驳回',
      tags: ['出库管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '出库记录ID', example: 'out-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'reason', type: 'string', required: true, description: '驳回原因' },
        ],
      },
    },
    // --- 进销存流水 ---
    {
      id: 'transaction-ledger-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/transactions',
      summary: '流水明细列表',
      tags: ['进销存流水'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'transactionType', type: 'string[]', required: false, description: '流水类型(多选)：inbound / sales_outbound / loss_outbound / stock_adjustment / reversal', example: 'inbound' },
        { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID', example: 'ft-lng' },
        { name: 'dateFrom', type: 'string', required: false, description: '开始日期', example: '2026-02-01' },
        { name: 'dateTo', type: 'string', required: false, description: '结束日期', example: '2026-02-28' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[]', 'items[].id', 'items[].transactionType', 'items[].fuelTypeName', 'items[].quantity', 'items[].amount', 'items[].stockBalance', 'items[].relatedNo', 'items[].transactionTime', 'pagination'],
    },
    {
      id: 'transaction-ledger-export',
      method: 'POST',
      path: '/api/v1/stations/:stationId/inventory/transactions/export',
      summary: '导出流水',
      tags: ['进销存流水'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'transactionType', type: 'string[]', required: false, description: '流水类型' },
          { name: 'fuelTypeId', type: 'string', required: false, description: '燃料类型ID' },
          { name: 'dateFrom', type: 'string', required: false, description: '开始日期' },
          { name: 'dateTo', type: 'string', required: false, description: '结束日期' },
        ],
      },
      responseFields: ['Blob (Excel)'],
      notes: '返回 Excel 文件流',
    },
    // --- 罐存比对 ---
    {
      id: 'tank-comparison-realtime',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/tank-comparison/realtime',
      summary: '实时罐存比对',
      tags: ['罐存比对'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['tanks[]', 'tanks[].tankId', 'tanks[].tankName', 'tanks[].fuelTypeName', 'tanks[].ratedCapacity', 'tanks[].theoreticalStock', 'tanks[].actualLevel', 'tanks[].deviation', 'tanks[].deviationRate', 'tanks[].lastUpdated'],
    },
    {
      id: 'tank-comparison-loss-analysis',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/tank-comparison/loss-analysis',
      summary: '损耗分类分析',
      tags: ['罐存比对'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['transportLoss[]', 'transportLoss[].supplierName', 'transportLoss[].batchCount', 'transportLoss[].avgDeviation', 'stationLoss[]', 'stationLoss[].tankName', 'stationLoss[].avgDailyDeviation'],
    },
    {
      id: 'tank-comparison-history',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/tank-comparison/history',
      summary: '比对历史',
      tags: ['罐存比对'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'tankId', type: 'string', required: false, description: '储罐ID', example: 'tank-001' },
        { name: 'dateFrom', type: 'string', required: false, description: '开始日期', example: '2026-02-01' },
        { name: 'dateTo', type: 'string', required: false, description: '结束日期', example: '2026-02-28' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[]', 'items[].snapshotDate', 'items[].tankName', 'items[].theoreticalStock', 'items[].actualLevel', 'items[].deviation', 'items[].deviationRate', 'pagination', 'trendData[]'],
    },
    // --- 盘点调整 [MVP+] ---
    {
      id: 'create-stock-adjustment',
      method: 'POST',
      path: '/api/v1/stations/:stationId/inventory/stock-adjustments',
      summary: '创建盘点调整',
      tags: ['盘点调整'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'tankId', type: 'string', required: true, description: '储罐ID', example: 'tank-001' },
          { name: 'adjustedStock', type: 'number', required: true, description: '调整后理论库存(kg)', example: '14850.000' },
          { name: 'reason', type: 'string', required: true, description: '调整原因', example: '月度盘点，仪表偏差校正' },
        ],
      },
      responseFields: ['id'],
      notes: '[MVP+] 调整 >1% 需站长审批',
    },
    {
      id: 'approve-stock-adjustment',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/inventory/stock-adjustments/:id/approve',
      summary: '调整审核通过',
      tags: ['盘点调整'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '调整记录ID', example: 'adj-001' },
      ],
      notes: '[MVP+]',
    },
    {
      id: 'reject-stock-adjustment',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/inventory/stock-adjustments/:id/reject',
      summary: '调整审核驳回',
      tags: ['盘点调整'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '调整记录ID', example: 'adj-001' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'reason', type: 'string', required: true, description: '驳回原因' },
        ],
      },
      notes: '[MVP+]',
    },
    // --- 预警管理 ---
    {
      id: 'alert-list',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/alerts',
      summary: '预警列表',
      tags: ['预警管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      queryParams: [
        { name: 'status', type: 'string', required: false, description: '状态筛选：active / history', example: 'active' },
        { name: 'page', type: 'number', required: false, description: '页码', example: '1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量', example: '20' },
      ],
      responseFields: ['items[]', 'items[].id', 'items[].alertLevel', 'items[].alertType', 'items[].fuelTypeName', 'items[].currentValue', 'items[].threshold', 'items[].triggeredAt', 'items[].handleStatus', 'activeCount', 'pagination'],
    },
    {
      id: 'acknowledge-alert',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/inventory/alerts/:id/acknowledge',
      summary: '确认预警',
      tags: ['预警管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '预警ID', example: 'alert-001' },
      ],
    },
    {
      id: 'dismiss-alert',
      method: 'PATCH',
      path: '/api/v1/stations/:stationId/inventory/alerts/:id/dismiss',
      summary: '忽略预警',
      tags: ['预警管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'id', type: 'string', required: true, description: '预警ID', example: 'alert-001' },
      ],
    },
    {
      id: 'alert-config-get',
      method: 'GET',
      path: '/api/v1/stations/:stationId/inventory/alert-config',
      summary: '预警规则配置',
      tags: ['预警管理'],
      pathParams: [{ name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' }],
      responseFields: ['rules[]', 'rules[].fuelTypeId', 'rules[].fuelTypeName', 'rules[].safeThreshold', 'rules[].warningThreshold', 'rules[].criticalThreshold', 'rules[].lossDeviationThreshold', 'rules[].thresholdType'],
    },
    {
      id: 'alert-config-update',
      method: 'PUT',
      path: '/api/v1/stations/:stationId/inventory/alert-config/:fuelTypeId',
      summary: '更新预警规则',
      tags: ['预警管理'],
      pathParams: [
        { name: 'stationId', type: 'string', required: true, description: '站点ID', example: 'station-001' },
        { name: 'fuelTypeId', type: 'string', required: true, description: '燃料类型ID', example: 'ft-lng' },
      ],
      requestBody: {
        contentType: 'application/json',
        fields: [
          { name: 'safeThreshold', type: 'number', required: true, description: '安全阈值', example: '50' },
          { name: 'warningThreshold', type: 'number', required: true, description: '预警阈值', example: '30' },
          { name: 'criticalThreshold', type: 'number', required: true, description: '紧急阈值', example: '15' },
          { name: 'lossDeviationThreshold', type: 'number', required: true, description: '损耗偏差阈值(%)', example: '3' },
          { name: 'thresholdType', type: 'string', required: true, description: '阈值类型：percentage / absolute', example: 'percentage' },
        ],
      },
    },
  ],
};

// ============================================================
// 导出所有模块
// ============================================================
export const API_MODULES: ApiModule[] = [
  stationModule,
  shiftHandoverModule,
  deviceLedgerModule,
  inspectionModule,
  priceManagementModule,
  orderTransactionModule,
  inventoryModule,
];

export const API_VERSION = 'v1';
export const BASE_URL = 'https://api.gasstation.com';

/** 获取所有端点总数 */
export function getTotalEndpointCount(): number {
  return API_MODULES.reduce((total, module) => total + module.endpoints.length, 0);
}

/** 根据模块ID和端点ID获取端点 */
export function getEndpoint(moduleId: string, endpointId: string): ApiEndpoint | undefined {
  const module = API_MODULES.find((m) => m.id === moduleId);
  return module?.endpoints.find((e) => e.id === endpointId);
}

/** 获取某个标签下的所有端点 */
export function getEndpointsByTag(tag: string): { module: ApiModule; endpoint: ApiEndpoint }[] {
  const results: { module: ApiModule; endpoint: ApiEndpoint }[] = [];
  API_MODULES.forEach((module) => {
    module.endpoints.forEach((endpoint) => {
      if (endpoint.tags.includes(tag)) {
        results.push({ module, endpoint });
      }
    });
  });
  return results;
}
