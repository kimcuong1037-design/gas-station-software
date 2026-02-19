// 巡检/安检管理模块常量定义

import i18n from '../../../locales/i18n';
import type {
  PlanStatus,
  TaskStatus,
  CheckResult,
  IssueSeverity,
  IssueStatus,
  CycleType,
  CheckItemCategory,
  CheckItemStatus,
  ReportType,
} from './types';

// ============================================================
// 多语言标签辅助函数
// ============================================================

export const getLabel = (config: { label: string; labelEn: string }): string => {
  return i18n.language?.startsWith('en') ? config.labelEn : config.label;
};

// ============================================================
// 计划状态
// ============================================================

export const PLAN_STATUS_CONFIG: Record<PlanStatus, { label: string; labelEn: string; color: string }> = {
  pending: { label: '待执行', labelEn: 'Pending', color: 'blue' },
  in_progress: { label: '执行中', labelEn: 'In Progress', color: 'orange' },
  completed: { label: '已完成', labelEn: 'Completed', color: 'green' },
  cancelled: { label: '已取消', labelEn: 'Cancelled', color: 'default' },
};

// ============================================================
// 任务状态
// ============================================================

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; labelEn: string; color: string }> = {
  pending: { label: '待执行', labelEn: 'Pending', color: 'blue' },
  in_progress: { label: '执行中', labelEn: 'In Progress', color: 'orange' },
  completed: { label: '已完成', labelEn: 'Completed', color: 'green' },
};

// ============================================================
// 检查结果
// ============================================================

export const CHECK_RESULT_CONFIG: Record<CheckResult, { label: string; labelEn: string; color: string; icon: string }> = {
  pending: { label: '待检查', labelEn: 'Pending', color: 'default', icon: '○' },
  normal: { label: '正常', labelEn: 'Normal', color: 'green', icon: '●' },
  abnormal: { label: '异常', labelEn: 'Abnormal', color: 'red', icon: '●' },
};

// ============================================================
// 问题等级
// ============================================================

export const SEVERITY_CONFIG: Record<IssueSeverity, { label: string; labelEn: string; color: string; bgColor: string; desc: string; descEn: string }> = {
  low: { label: '低', labelEn: 'Low', color: 'blue', bgColor: '', desc: '不影响运营', descEn: 'No impact on operations' },
  medium: { label: '中', labelEn: 'Medium', color: 'gold', bgColor: '', desc: '较快处理', descEn: 'Handle soon' },
  high: { label: '高', labelEn: 'High', color: 'orange', bgColor: '', desc: '当日处理', descEn: 'Handle today' },
  urgent: { label: '紧急', labelEn: 'Urgent', color: 'red', bgColor: '#fff1f0', desc: '立即处理', descEn: 'Immediate action' },
};

// ============================================================
// 问题状态
// ============================================================

export const ISSUE_STATUS_CONFIG: Record<IssueStatus, { label: string; labelEn: string; color: string; step: number }> = {
  pending: { label: '待处理', labelEn: 'Pending', color: 'blue', step: 0 },
  processing: { label: '处理中', labelEn: 'Processing', color: 'orange', step: 1 },
  pending_review: { label: '待验收', labelEn: 'Pending Review', color: 'purple', step: 2 },
  closed: { label: '已闭环', labelEn: 'Closed', color: 'green', step: 3 },
};

// ============================================================
// 巡检周期类型
// ============================================================

export const CYCLE_TYPE_CONFIG: Record<CycleType, { label: string; labelEn: string; color: string; icon: string; desc: string; descEn: string }> = {
  daily: { label: '每日', labelEn: 'Daily', color: 'blue', icon: '📅', desc: '每日生成任务', descEn: 'Generate tasks daily' },
  weekly: { label: '每周', labelEn: 'Weekly', color: 'cyan', icon: '📅', desc: '每周生成任务', descEn: 'Generate tasks weekly' },
  monthly: { label: '每月', labelEn: 'Monthly', color: 'purple', icon: '📅', desc: '每月生成任务', descEn: 'Generate tasks monthly' },
};

// ============================================================
// 检查项分类
// ============================================================

export const CATEGORY_CONFIG: Record<CheckItemCategory, { label: string; labelEn: string; color: string }> = {
  tank_area: { label: '罐区环保', labelEn: 'Tank Area', color: 'blue' },
  dispenser: { label: '加气机', labelEn: 'Dispenser', color: 'cyan' },
  power_room: { label: '配电室', labelEn: 'Power Room', color: 'orange' },
  fueling_area: { label: '加油区域', labelEn: 'Fueling Area', color: 'green' },
  non_fuel: { label: '非油管理', labelEn: 'Non-fuel', color: 'purple' },
  equipment: { label: '设备管理', labelEn: 'Equipment', color: 'gold' },
};

// ============================================================
// 检查项目状态
// ============================================================

export const CHECK_ITEM_STATUS_CONFIG: Record<CheckItemStatus, { label: string; labelEn: string; color: string }> = {
  active: { label: '启用', labelEn: 'Active', color: 'green' },
  inactive: { label: '已停用', labelEn: 'Inactive', color: 'default' },
};

// ============================================================
// 报表类型
// ============================================================

export const REPORT_TYPE_CONFIG: Record<ReportType, { label: string; labelEn: string; color: string; desc: string; descEn: string }> = {
  completion: { label: '巡检完成报表', labelEn: 'Completion Report', color: 'blue', desc: '各站点各任务的巡检完成明细', descEn: 'Task completion details by station' },
  abnormal: { label: '异常统计报表', labelEn: 'Abnormal Report', color: 'orange', desc: '按时间/分类统计异常项', descEn: 'Abnormal items by time/category' },
  rectification: { label: '整改跟踪报表', labelEn: 'Rectification Report', color: 'green', desc: '问题整改闭环进度汇总', descEn: 'Rectification progress summary' },
  compliance: { label: '合规报表', labelEn: 'Compliance Report', color: 'purple', desc: '满足监管要求的标准报表', descEn: 'Regulatory compliance report' },
};

// ============================================================
// 常量
// ============================================================

/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 20;

/** 照片上传限制 */
export const PHOTO_UPLOAD_LIMIT = 10;
export const PHOTO_MAX_SIZE_MB = 5;
export const PHOTO_ACCEPT = '.jpg,.jpeg,.png';

/** 问题默认处理期限（天） */
export const DEFAULT_ISSUE_DUE_DAYS = 3;

/** 即将到期阈值（小时） */
export const DUE_SOON_HOURS = 24;

/** 自动保存间隔（毫秒） */
export const AUTO_SAVE_INTERVAL = 30000;

/** localStorage keys */
export const STORAGE_KEYS = {
  PLAN_FORM_DRAFT: 'inspection_plan_form_draft',
  EXECUTION_GUIDE_SHOWN: 'inspection_execution_guide_shown',
} as const;

// ============================================================
// 辅助函数
// ============================================================

/** 判断任务是否已逾期 */
export const isOverdue = (dueDate: string, status: string): boolean => {
  if (status === 'completed') return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
};

/** 判断任务是否即将到期 */
export const isDueSoon = (dueDate: string, status: string): boolean => {
  if (status === 'completed') return false;
  const now = new Date();
  const due = new Date(dueDate);
  const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursLeft > 0 && hoursLeft <= DUE_SOON_HOURS;
};

/** 计算计划预计生成任务数 */
export const estimateTaskCount = (cycleType: CycleType, startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  switch (cycleType) {
    case 'daily': return diffDays;
    case 'weekly': return Math.ceil(diffDays / 7);
    case 'monthly': {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      return months;
    }
    default: return 0;
  }
};
