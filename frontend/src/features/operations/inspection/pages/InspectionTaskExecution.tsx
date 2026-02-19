// P02: 安检任务详情/执行页
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Button, Progress, Collapse, Space, Input, Affix, Popconfirm, Alert, message, Empty } from 'antd';
import { CheckOutlined, CloseOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { inspectionTasks, checkItems } from '../../../../mock/inspections';
import type { InspectionTask, InspectionLog, CheckResult, CheckItemCategory } from '../types';
import { CATEGORY_CONFIG, STORAGE_KEYS } from '../constants';
import TaskStatusTag from '../components/TaskStatusTag';
import ResultTag from '../components/ResultTag';
import IssueReportDrawer from './IssueReportDrawer';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;
const { TextArea } = Input;

/** Category display order */
const CATEGORY_ORDER: CheckItemCategory[] = [
  'tank_area',
  'dispenser',
  'power_room',
  'fueling_area',
  'non_fuel',
  'equipment',
];

interface CategoryGroup {
  category: CheckItemCategory;
  label: string;
  logs: InspectionLog[];
  checkedCount: number;
  totalCount: number;
}

const InspectionTaskExecution: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find task from mock data
  const task = useMemo(() => inspectionTasks.find((t) => t.id === id), [id]);

  // Issue report drawer state
  const [issueDrawerOpen, setIssueDrawerOpen] = useState(false);
  const [issueDrawerPrefill, setIssueDrawerPrefill] = useState<{
    taskId?: string;
    checkItemId?: string;
    equipmentId?: string;
  }>({});

  // Local state for logs (mutable copy)
  const [logs, setLogs] = useState<InspectionLog[]>([]);
  // Local state for task status
  const [taskStatus, setTaskStatus] = useState<InspectionTask['status']>('pending');
  // Track which log id has its remark area expanded
  const [expandedRemarkIds, setExpandedRemarkIds] = useState<Set<string>>(new Set());
  // Remark text per log id
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  // First-time guide visibility
  const [showGuide, setShowGuide] = useState(false);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Initialize local state from task
  useEffect(() => {
    if (task) {
      setLogs([...task.logs]);
      setTaskStatus(task.status);
      // Pre-fill remarks from existing data
      const existingRemarks: Record<string, string> = {};
      const expandedIds = new Set<string>();
      task.logs.forEach((log) => {
        if (log.remark) existingRemarks[log.id] = log.remark;
        if (log.result === 'abnormal') expandedIds.add(log.id);
      });
      setRemarks(existingRemarks);
      setExpandedRemarkIds(expandedIds);
    }
  }, [task]);

  // First-time guide
  useEffect(() => {
    const guideShown = localStorage.getItem(STORAGE_KEYS.EXECUTION_GUIDE_SHOWN);
    if (!guideShown) {
      setShowGuide(true);
    }
  }, []);

  const dismissGuide = () => {
    setShowGuide(false);
    localStorage.setItem(STORAGE_KEYS.EXECUTION_GUIDE_SHOWN, 'true');
  };

  // Derived: group logs by category
  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    if (!logs.length) return [];
    const groupMap = new Map<CheckItemCategory, InspectionLog[]>();
    logs.forEach((log) => {
      const cat = log.checkItem.category;
      if (!groupMap.has(cat)) groupMap.set(cat, []);
      groupMap.get(cat)!.push(log);
    });
    return CATEGORY_ORDER
      .filter((cat) => groupMap.has(cat))
      .map((cat) => {
        const groupLogs = groupMap.get(cat)!;
        const checkedCount = groupLogs.filter((l) => l.result !== 'pending').length;
        return {
          category: cat,
          label: CATEGORY_CONFIG[cat]?.label ?? cat,
          logs: groupLogs,
          checkedCount,
          totalCount: groupLogs.length,
        };
      });
  }, [logs]);

  // Derived: progress stats
  const totalItems = logs.length;
  const checkedItems = logs.filter((l) => l.result !== 'pending').length;
  const uncheckedItems = totalItems - checkedItems;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const isCompleted = taskStatus === 'completed';

  // Scroll to next pending item
  const scrollToNextPending = (currentLogId: string) => {
    const currentIndex = logs.findIndex((l) => l.id === currentLogId);
    // Look for next pending item after current
    for (let i = currentIndex + 1; i < logs.length; i++) {
      if (logs[i].result === 'pending') {
        const el = itemRefs.current[logs[i].id];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
    // Wrap around: search from beginning
    for (let i = 0; i < currentIndex; i++) {
      if (logs[i].result === 'pending') {
        const el = itemRefs.current[logs[i].id];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
  };

  // Mark a single log as normal
  const markNormal = (logId: string) => {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? { ...l, result: 'normal' as CheckResult, executedAt: new Date().toISOString(), remark: null }
          : l
      )
    );
    // Remove expanded remark if any
    setExpandedRemarkIds((prev) => {
      const next = new Set(prev);
      next.delete(logId);
      return next;
    });
    // Auto-transition task status
    if (taskStatus === 'pending') {
      setTaskStatus('in_progress');
    }
    message.success('已标记为正常');
    // Scroll to next pending
    setTimeout(() => scrollToNextPending(logId), 100);
  };

  // Mark a single log as abnormal
  const markAbnormal = (logId: string) => {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? { ...l, result: 'abnormal' as CheckResult, executedAt: new Date().toISOString() }
          : l
      )
    );
    // Expand remark area
    setExpandedRemarkIds((prev) => new Set(prev).add(logId));
    // Auto-transition task status
    if (taskStatus === 'pending') {
      setTaskStatus('in_progress');
    }
  };

  // Update remark for a log
  const updateRemark = (logId: string, value: string) => {
    setRemarks((prev) => ({ ...prev, [logId]: value }));
    // Also update in logs
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, remark: value || null } : l))
    );
  };

  // Batch mark all pending items in a category as normal
  const batchMarkNormal = (category: CheckItemCategory) => {
    const pendingInCategory = logs.filter(
      (l) => l.checkItem.category === category && l.result === 'pending'
    );
    const count = pendingInCategory.length;
    if (count === 0) return;

    const now = new Date().toISOString();
    const pendingIds = new Set(pendingInCategory.map((l) => l.id));

    setLogs((prev) =>
      prev.map((l) =>
        pendingIds.has(l.id)
          ? { ...l, result: 'normal' as CheckResult, executedAt: now, remark: null }
          : l
      )
    );

    if (taskStatus === 'pending') {
      setTaskStatus('in_progress');
    }

    message.success(`${count}项已标记为正常`);
  };

  // Submit task as completed
  const handleSubmit = () => {
    if (uncheckedItems > 0) return;
    setTaskStatus('completed');
    message.success('巡检任务已完成');
    setTimeout(() => navigate('/operations/inspection/tasks'), 500);
  };

  // Format time from ISO string
  const formatTime = (isoStr: string | null): string => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Is due date overdue?
  const isDueOverdue = task ? new Date(task.dueDate) < new Date(new Date().toDateString()) && !isCompleted : false;

  // ---- Render ----

  if (!task) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }} data-testid="inspection-task-execution">
        <Empty description="未找到该任务" />
        <Button type="link" onClick={() => navigate('/operations/inspection/tasks')}>
          <ArrowLeftOutlined /> 返回任务列表
        </Button>
      </div>
    );
  }

  // Build Collapse items for category groups
  const collapseItems = categoryGroups.map((group) => {
    const hasPending = group.logs.some((l) => l.result === 'pending');
    const pendingCount = group.logs.filter((l) => l.result === 'pending').length;

    return {
      key: group.category,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Space>
            <Text strong style={{ fontSize: 15 }}>
              {group.label}
            </Text>
            <Text type="secondary">
              ({group.checkedCount}/{group.totalCount})
            </Text>
          </Space>
          {!isCompleted && hasPending && (
            <Popconfirm
              title={`将该分类下${pendingCount}项标记为正常？`}
              onConfirm={(e) => {
                e?.stopPropagation();
                batchMarkNormal(group.category);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="确认"
              cancelText="取消"
            >
              <Button
                size="small"
                type="default"
                icon={<CheckOutlined />}
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#52c41a', borderColor: '#52c41a' }}
              >
                全部正常
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
      children: (
        <div>
          {group.logs.map((log) => {
            const isPending = log.result === 'pending';
            const isNormal = log.result === 'normal';
            const isAbnormal = log.result === 'abnormal';
            const showRemarkArea = expandedRemarkIds.has(log.id) || isAbnormal;

            return (
              <div
                key={log.id}
                ref={(el) => { itemRefs.current[log.id] = el; }}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
                data-testid={`check-item-${log.checkItemId}`}
              >
                {/* Row: name + action buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 14 }}>
                      {isPending ? '○' : isNormal ? '●' : '●'}{' '}
                      {log.checkItem.name}
                    </Text>
                    {log.checkItem.description && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          检查标准: {log.checkItem.description}
                        </Text>
                      </div>
                    )}
                    {/* Result status line */}
                    <div style={{ marginTop: 6 }}>
                      <Space size={8}>
                        <ResultTag result={log.result} />
                        {log.executedAt && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatTime(log.executedAt)}
                          </Text>
                        )}
                      </Space>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {!isCompleted && (
                    <Space>
                      <Button
                        size="small"
                        type={isNormal ? 'primary' : 'default'}
                        icon={<CheckOutlined />}
                        onClick={() => markNormal(log.id)}
                        style={
                          isNormal
                            ? { background: '#52c41a', borderColor: '#52c41a' }
                            : { color: '#52c41a', borderColor: '#52c41a' }
                        }
                      >
                        正常
                      </Button>
                      <Button
                        size="small"
                        type={isAbnormal ? 'primary' : 'default'}
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => markAbnormal(log.id)}
                      >
                        异常
                      </Button>
                    </Space>
                  )}
                </div>

                {/* Remark area for abnormal items */}
                {showRemarkArea && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 12,
                      background: '#fff1f0',
                      borderRadius: 6,
                      border: '1px solid #ffccc7',
                    }}
                  >
                    <TextArea
                      placeholder="请输入异常备注（必填）"
                      value={remarks[log.id] ?? log.remark ?? ''}
                      onChange={(e) => updateRemark(log.id, e.target.value)}
                      rows={2}
                      disabled={isCompleted}
                      status={isAbnormal && !remarks[log.id] && !log.remark ? 'error' : undefined}
                      style={{ marginBottom: 8 }}
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<ExclamationCircleOutlined />}
                      onClick={() => {
                        setIssueDrawerPrefill({
                          taskId: task.id,
                          checkItemId: log.checkItemId,
                          equipmentId: checkItems.find(ci => ci.id === log.checkItemId)?.equipment?.id,
                        });
                        setIssueDrawerOpen(true);
                      }}
                    >
                      登记问题→
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ),
    };
  });

  return (
    <div data-testid="inspection-task-execution" style={{ paddingBottom: 80 }}>
      {/* Page header */}
      <div style={{ marginBottom: 16 }}>
        <Space align="center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/operations/inspection/tasks')}
          >
            返回列表
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            执行巡检
          </Title>
          <RequirementTag componentIds={['task-execution', 'task-batch-normal']} module="inspection" showDetail />
        </Space>
      </div>

      {/* First-time guide */}
      {showGuide && (
        <Alert
          message="💡 点击 ✓正常 或 ✗异常 逐项记录检查结果，也可点击「全部正常」批量标记"
          type="info"
          showIcon
          closable
          onClose={dismissGuide}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Fixed top section: task info + progress */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', alignItems: 'center', marginBottom: 12 }}>
          <Space>
            <Text type="secondary">任务:</Text>
            <Text strong>{task.taskNo}</Text>
          </Space>
          <Space>
            <Text type="secondary">计划:</Text>
            <Link to={`/operations/inspection/plans/${task.plan.id}`}>
              {task.plan.name}
            </Link>
          </Space>
          <Space>
            <Text type="secondary">执行人:</Text>
            <Text>{task.assignee?.name ?? '未分配'}</Text>
          </Space>
          <Space>
            <Text type="secondary">截止:</Text>
            <Text style={{ color: isDueOverdue ? '#ff4d4f' : undefined }}>
              {task.dueDate}
            </Text>
          </Space>
          <Space>
            <Text type="secondary">状态:</Text>
            <TaskStatusTag status={taskStatus} />
          </Space>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text type="secondary">
            进度: {checkedItems}/{totalItems}
          </Text>
          <Progress
            percent={progressPercent}
            style={{ flex: 1, marginBottom: 0 }}
            strokeColor={progressPercent === 100 ? '#52c41a' : '#1890ff'}
            format={(pct) => `${pct}%`}
          />
        </div>
      </Card>

      {/* Check items grouped by category */}
      {categoryGroups.length > 0 ? (
        <Collapse
          defaultActiveKey={categoryGroups.map((g) => g.category)}
          items={collapseItems}
          style={{ background: '#fff' }}
        />
      ) : (
        <Card>
          <Empty description="该任务没有检查项目" />
        </Card>
      )}

      {/* Bottom fixed action bar */}
      {!isCompleted && (
        <Affix offsetBottom={0}>
          <div
            style={{
              background: '#fff',
              borderTop: '1px solid #f0f0f0',
              padding: '12px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {uncheckedItems > 0 && (
              <Text type="secondary">
                还有 {uncheckedItems} 项未检查
              </Text>
            )}
            <Popconfirm
              title="确认提交完成？提交后不可修改。"
              onConfirm={handleSubmit}
              okText="确认"
              cancelText="取消"
              disabled={uncheckedItems > 0}
            >
              <Button
                type="primary"
                size="large"
                disabled={uncheckedItems > 0}
                style={
                  uncheckedItems === 0
                    ? { background: '#52c41a', borderColor: '#52c41a' }
                    : {}
                }
              >
                提交完成
              </Button>
            </Popconfirm>
          </div>
        </Affix>
      )}
      {/* 登记问题抽屉 */}
      <IssueReportDrawer
        open={issueDrawerOpen}
        onClose={() => setIssueDrawerOpen(false)}
        prefill={issueDrawerPrefill}
        onSaved={() => {
          setIssueDrawerOpen(false);
          message.success('问题已登记');
        }}
      />
    </div>
  );
};

export default InspectionTaskExecution;
