// 中文翻译
export default {
  // 通用
  common: {
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    add: '新增',
    search: '搜索',
    reset: '重置',
    actions: '操作',
    status: '状态',
    loading: '加载中...',
    noData: '暂无数据',
    success: '操作成功',
    error: '操作失败',
    required: '必填',
    optional: '选填',
    all: '全部',
    enabled: '启用',
    disabled: '停用',
    yes: '是',
    no: '否',
    back: '返回',
    detail: '详情',
    export: '导出',
    import: '导入',
  },

  // 导航菜单
  menu: {
    operations: '基础运营',
    station: '站点管理',
    shift: '交接班',
    equipment: '设备管理',
    inspection: '巡检管理',
  },

  // 站点管理模块
  station: {
    title: '站点管理',
    list: '站点列表',
    detail: '站点详情',
    add: '新增站点',
    edit: '编辑站点',
    
    // 字段
    name: '站点名称',
    code: '站点编码',
    address: '地址',
    longitude: '经度',
    latitude: '纬度',
    contact: '联系人',
    phone: '联系电话',
    businessHours: '营业时间',
    regionLabel: '所属区域',
    groupLabel: '所属分组',
    status: '站点状态',
    
    // 状态
    statusActive: '运营中',
    statusInactive: '已停用',
    statusMaintenance: '维护中',
    
    // 操作
    switchStation: '切换站点',
    selectStation: '请选择站点',
    
    // Tabs
    tabBasic: '基本信息',
    tabNozzle: '枪配置',
    tabShift: '班次排班',
    tabPhoto: '站点照片',
    tabEmployee: '员工管理',
    
    // 枪配置
    nozzle: {
      title: '枪配置',
      list: '枪列表',
      add: '新增枪',
      edit: '编辑枪',
      code: '枪号',
      fuelType: '燃料类型',
      unitPrice: '单价',
      status: '状态',
      setPrice: '设置单价',
      enable: '启用',
      disable: '停用',
      statusOnline: '在线',
      statusOffline: '离线',
      statusFueling: '充装中',
      statusFault: '故障',
    },
    
    // 班次
    shift: {
      title: '班次管理',
      list: '班次列表',
      add: '新增班次',
      edit: '编辑班次',
      name: '班次名称',
      startTime: '开始时间',
      endTime: '结束时间',
      supervisor: '负责人',
    },
    
    // 排班
    schedule: {
      title: '排班日历',
      addSchedule: '新增排班',
      editSchedule: '编辑排班',
      date: '日期',
      employee: '员工',
      copyLastWeek: '复制上周',
    },
    
    // 照片
    photo: {
      title: '站点照片',
      upload: '上传照片',
      setPrimary: '设为主图',
      primary: '主展示图',
    },
    
    // 分组
    group: {
      title: '站点分组',
      list: '分组列表',
      add: '新增分组',
      edit: '编辑分组',
      name: '分组名称',
    },
    
    // 区域
    region: {
      title: '区域管理',
      list: '区域列表',
      add: '新增区域',
      edit: '编辑区域',
      name: '区域名称',
      parent: '上级区域',
    },
  },

  // 燃料类型
  fuelType: {
    gasoline92: '92#汽油',
    gasoline95: '95#汽油',
    gasoline98: '98#汽油',
    diesel: '柴油',
    cng: 'CNG',
    lng: 'LNG',
    other: '其他',
  },
};
