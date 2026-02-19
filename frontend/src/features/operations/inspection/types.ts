// 巡检/安检管理模块类型定义 - 基于 ui-schema.md 数据模型

// ============================================================
// 状态类型
// ============================================================

/** 安检计划状态 */
export type PlanStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/** 安检任务状态 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

/** 检查结果 */
export type CheckResult = 'pending' | 'normal' | 'abnormal';

/** 问题等级 */
export type IssueSeverity = 'low' | 'medium' | 'high' | 'urgent';

/** 问题状态 */
export type IssueStatus = 'pending' | 'processing' | 'pending_review' | 'closed';

/** 巡检周期类型 */
export type CycleType = 'daily' | 'weekly' | 'monthly';

/** 检查项分类 */
export type CheckItemCategory = 'tank_area' | 'dispenser' | 'power_room' | 'fueling_area' | 'non_fuel' | 'equipment';

/** 检查项状态 */
export type CheckItemStatus = 'active' | 'inactive';

/** 问题时间线操作类型 */
export type IssueTimelineAction = 'created' | 'assigned' | 'rectified' | 'approved' | 'rejected';

/** 报表类型 */
export type ReportType = 'completion' | 'abnormal' | 'rectification' | 'compliance';

// ============================================================
// 安检计划
// ============================================================

/** 安检计划实体 */
export interface InspectionPlan {
  id: string;
  planNo: string;
  name: string;
  stationId: string;
  stationName: string;
  cycleType: CycleType;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  description: string | null;
  checkItemIds: string[];
  checkItemCount: number;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

/** 安检计划表单数据 */
export interface InspectionPlanFormData {
  name: string;
  cycleType: CycleType;
  startDate: string;
  endDate: string;
  description?: string;
  checkItemIds: string[];
}

/** 计划列表查询参数 */
export interface PlanListParams {
  keyword?: string;
  status?: PlanStatus | 'all';
  cycleType?: CycleType | 'all';
  page?: number;
  pageSize?: number;
}

// ============================================================
// 安检任务
// ============================================================

/** 安检任务实体 */
export interface InspectionTask {
  id: string;
  taskNo: string;
  planId: string;
  plan: {
    id: string;
    planNo: string;
    name: string;
  };
  stationId: string;
  assignee: {
    id: string;
    name: string;
  } | null;
  /** 该任务关联的检查项目 ID 列表（创建时从计划继承，支持子集选择） */
  checkItemIds: string[];
  status: TaskStatus;
  dueDate: string;
  startedAt: string | null;
  completedAt: string | null;
  totalItems: number;
  checkedItems: number;
  normalItems: number;
  abnormalItems: number;
  remark: string | null;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  /** 关联检查日志（执行页使用） */
  logs: InspectionLog[];
}

/** 任务列表查询参数 */
export interface TaskListParams {
  keyword?: string;
  status?: TaskStatus | 'all';
  assigneeId?: string;
  dueDateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

/** 任务统计 */
export interface TaskStats {
  todayTotal: number;
  todayCompleted: number;
  completionRate: number;
  abnormalCount: number;
  pendingIssueCount: number;
}

// ============================================================
// 检查项目
// ============================================================

/** 检查项目实体 */
export interface CheckItem {
  id: string;
  name: string;
  category: CheckItemCategory;
  description: string | null;
  stationId: string;
  equipment: {
    id: string;
    name: string;
    deviceCode: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
  }>;
  sortOrder: number;
  status: CheckItemStatus;
  createdAt: string;
  updatedAt: string;
}

/** 检查项目表单数据 */
export interface CheckItemFormData {
  name: string;
  category: CheckItemCategory;
  description?: string;
  equipmentId?: string;
  tagIds?: string[];
}

/** 检查项目列表查询参数 */
export interface CheckItemListParams {
  keyword?: string;
  category?: CheckItemCategory | 'all';
  tagIds?: string[];
  status?: CheckItemStatus | 'all';
  page?: number;
  pageSize?: number;
}

// ============================================================
// 巡检标签
// ============================================================

/** 巡检标签实体 */
export interface InspectionTag {
  id: string;
  name: string;
  stationId: string;
  sortOrder: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 巡检日志
// ============================================================

/** 巡检日志实体 */
export interface InspectionLog {
  id: string;
  taskId: string;
  task: {
    id: string;
    taskNo: string;
  };
  checkItemId: string;
  checkItem: {
    id: string;
    name: string;
    category: CheckItemCategory;
    description: string | null;
  };
  stationId: string;
  executor: {
    id: string;
    name: string;
  };
  result: CheckResult;
  remark: string | null;
  executedAt: string | null;
  photos?: Array<{
    id: string;
    url: string;
    fileName: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/** 日志列表查询参数 */
export interface LogListParams {
  keyword?: string;
  result?: CheckResult | 'all';
  executorId?: string;
  checkItemId?: string;
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

// ============================================================
// 问题记录
// ============================================================

/** 问题处理时间线条目 */
export interface IssueTimelineEntry {
  id: string;
  timestamp: string;
  operator: { id: string; name: string };
  action: IssueTimelineAction;
  content: string;
  attachments?: Array<{ id: string; url: string; fileName: string }>;
}

/** 问题记录实体 */
export interface IssueRecord {
  id: string;
  issueNo: string;
  stationId: string;
  task: {
    id: string;
    taskNo: string;
  } | null;
  checkItem: {
    id: string;
    name: string;
  } | null;
  equipment: {
    id: string;
    name: string;
    deviceCode: string;
  } | null;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  reporter: { id: string; name: string };
  assignee: { id: string; name: string } | null;
  assignedAt: string | null;
  assignedBy: { id: string; name: string } | null;
  rectification: string | null;
  rectificationResult: string | null;
  rectifiedAt: string | null;
  reviewer: { id: string; name: string } | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  dueDate: string | null;
  photos?: Array<{
    id: string;
    url: string;
    fileName: string;
  }>;
  timeline: IssueTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

/** 登记问题表单数据 */
export interface IssueReportFormData {
  taskId?: string;
  checkItemId?: string;
  equipmentId?: string;
  severity: IssueSeverity;
  description: string;
  dueDate?: string;
}

/** 提交整改表单数据 */
export interface RectificationFormData {
  rectification: string;
  rectificationResult: string;
  photos?: Array<{ id: string; url: string }>;
}

/** 驳回表单数据 */
export interface RejectFormData {
  reviewComment: string;
}

/** 问题列表查询参数 */
export interface IssueListParams {
  keyword?: string;
  status?: IssueStatus | 'all';
  severity?: IssueSeverity | 'all';
  assigneeId?: string;
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

// ============================================================
// 统计报表
// ============================================================

/** 巡检日报数据 */
export interface DailyReportData {
  date: string;
  plannedTasks: number;
  completedTasks: number;
  completionRate: number;
  abnormalItems: number;
  executorDetails: Array<{
    executor: { id: string; name: string };
    assignedTasks: number;
    completedTasks: number;
    normalItems: number;
    abnormalItems: number;
    completionRate: number;
  }>;
  abnormalDetails: Array<{
    checkItem: { id: string; name: string; category: CheckItemCategory };
    executor: { id: string; name: string };
    result: CheckResult;
    remark: string;
  }>;
}

/** 站点报表数据 */
export interface StationReportData {
  station: { id: string; name: string };
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  abnormalCount: number;
  issueCount: number;
  rectificationRate: number;
}

/** 检查报表实体 */
export interface InspectionReport {
  id: string;
  name: string;
  reportType: ReportType;
  timeRange: string;
  stationIds: string[];
  generatedAt: string;
  generatedBy: { id: string; name: string };
  data?: Record<string, unknown>;
}

/** 下发任务表单 */
export interface DispatchTaskFormData {
  assigneeId: string;
  dueDate: string;
}
