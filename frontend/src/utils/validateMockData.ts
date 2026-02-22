/**
 * Mock 数据完整性验证工具
 *
 * 根据 docs/reflections.md 中"数据一致性"问题的改进措施而创建：
 * 自动检查 mock 数据中状态字段与关联详情数据之间的一致性，
 * 防止"已完成状态但 logs/records 为空"类问题进入 UI 演示。
 *
 * 使用方式（开发阶段）：
 *   import { devValidateMockData } from '@/utils/validateMockData';
 *   devValidateMockData(); // 在 main.tsx 或 App.tsx 中调用（仅 dev 模式）
 */

import { inspectionTasks, inspectionLogs } from '../mock/inspections';
import { shiftHandovers } from '../mock/shiftHandovers';
import { maintenanceOrders } from '../mock/maintenanceOrders';

// ===== 通用类型 =====

export interface ValidationError {
  module: string;
  entityType: string;
  entityId: string;
  rule: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  summary: string;
}

// ===== 核心验证引擎 =====

/**
 * 验证一组实体，针对每条记录执行规则数组
 */
export function validateEntities<T extends { id: string }>(
  module: string,
  entityType: string,
  entities: T[],
  rules: Array<{
    rule: string;
    isWarning?: boolean;
    check: (entity: T) => string | null;
  }>
): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  for (const entity of entities) {
    for (const { rule, isWarning, check } of rules) {
      const msg = check(entity);
      if (msg) {
        const entry: ValidationError = { module, entityType, entityId: entity.id, rule, message: msg };
        if (isWarning) {
          warnings.push(entry);
        } else {
          errors.push(entry);
        }
      }
    }
  }

  return { errors, warnings };
}

// ===== 模块级验证函数 =====

function validateInspectionMockData(): { errors: ValidationError[]; warnings: ValidationError[] } {
  const logsCountByTask = new Map<string, number>();
  inspectionLogs.forEach((log: { taskId: string }) => {
    logsCountByTask.set(log.taskId, (logsCountByTask.get(log.taskId) || 0) + 1);
  });

  return validateEntities(
    'inspection',
    'InspectionTask',
    inspectionTasks as Array<{ id: string; status: string; completedAt?: string }>,
    [
      {
        rule: 'COMPLETED_TASK_MUST_HAVE_LOGS',
        check: (task) =>
          task.status === 'completed' && (logsCountByTask.get(task.id) || 0) === 0
            ? '已完成任务 (status=completed) 没有对应的 inspectionLogs 记录'
            : null,
      },
      {
        rule: 'COMPLETED_TASK_MUST_HAVE_COMPLETED_AT',
        check: (task) =>
          task.status === 'completed' && !task.completedAt
            ? '已完成任务缺少 completedAt 字段'
            : null,
      },
      {
        rule: 'IN_PROGRESS_SHOULD_HAVE_LOGS',
        isWarning: true,
        check: (task) =>
          task.status === 'in_progress' && (logsCountByTask.get(task.id) || 0) === 0
            ? '进行中任务没有任何巡检记录（建议补充至少一条）'
            : null,
      },
    ]
  );
}

function validateShiftHandoverMockData(): { errors: ValidationError[]; warnings: ValidationError[] } {
  return validateEntities(
    'shift-handover',
    'ShiftHandover',
    shiftHandovers as Array<{ id: string; status: string; completedAt?: string; receiverId?: string }>,
    [
      {
        rule: 'COMPLETED_HANDOVER_MUST_HAVE_COMPLETED_AT',
        check: (h) =>
          h.status === 'completed' && !h.completedAt
            ? '已完成交接班记录缺少 completedAt 字段'
            : null,
      },
      {
        rule: 'COMPLETED_HANDOVER_MUST_HAVE_RECEIVER',
        check: (h) =>
          h.status === 'completed' && !h.receiverId
            ? '已完成交接班记录缺少接班人信息 (receiverId)'
            : null,
      },
    ]
  );
}

function validateDeviceLedgerMockData(): { errors: ValidationError[]; warnings: ValidationError[] } {
  return validateEntities(
    'device-ledger',
    'MaintenanceOrder',
    maintenanceOrders as Array<{ id: string; status: string; completedAt?: string; completedBy?: string }>,
    [
      {
        rule: 'COMPLETED_ORDER_MUST_HAVE_COMPLETED_AT',
        check: (o) =>
          o.status === 'completed' && !o.completedAt
            ? '已完成维保工单缺少 completedAt 字段'
            : null,
      },
      {
        rule: 'COMPLETED_ORDER_MUST_HAVE_COMPLETED_BY',
        check: (o) =>
          o.status === 'completed' && !o.completedBy
            ? '已完成维保工单缺少完成人信息 (completedBy)'
            : null,
      },
    ]
  );
}

// ===== 统一入口 =====

export function runAllValidations(): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  const results = [
    validateInspectionMockData(),
    validateShiftHandoverMockData(),
    validateDeviceLedgerMockData(),
  ];

  for (const { errors, warnings } of results) {
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  const valid = allErrors.length === 0;
  const summary = valid
    ? `✅ Mock 数据验证通过（${allWarnings.length} 条警告）`
    : `❌ Mock 数据验证失败：${allErrors.length} 个错误，${allWarnings.length} 个警告`;

  if (!valid) {
    console.error('[validateMockData] 数据一致性错误：');
    allErrors.forEach((e) =>
      console.error(`  [${e.module}/${e.entityType}] ${e.entityId}: ${e.message} (${e.rule})`)
    );
  }
  if (allWarnings.length > 0) {
    console.warn('[validateMockData] 数据警告：');
    allWarnings.forEach((w) =>
      console.warn(`  [${w.module}/${w.entityType}] ${w.entityId}: ${w.message} (${w.rule})`)
    );
  }
  console.info(`[validateMockData] ${summary}`);

  return { valid, errors: allErrors, warnings: allWarnings, summary };
}

/**
 * 便捷函数：仅在开发模式下运行验证
 * 在 main.tsx 中调用：devValidateMockData()
 */
export function devValidateMockData(): void {
  if (import.meta.env.DEV) {
    runAllValidations();
  }
}
