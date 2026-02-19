// P13: 巡检日志列表页
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Input, Select, Table, Space, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { inspectionLogs, checkItems } from '../../../../mock/inspections';
import type { InspectionLog, CheckResult } from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';
import ResultTag from '../components/ResultTag';
import { RequirementTag } from '../../../../components/RequirementTag';
import dayjs from 'dayjs';

const { Title, Text, Link } = Typography;
const { RangePicker } = DatePicker;

const resultOptions = [
  { value: 'all', label: '全部结果' },
  { value: 'normal', label: '正常' },
  { value: 'abnormal', label: '异常' },
];

const InspectionLogList: React.FC = () => {
  const navigate = useNavigate();

  // -- state --
  const [keyword, setKeyword] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [executorFilter, setExecutorFilter] = useState<string | undefined>(undefined);
  const [checkItemFilter, setCheckItemFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);

  // -- executor options (from logs) --
  const executorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    inspectionLogs.forEach((log) => {
      if (log.executor) seen.set(log.executor.id, log.executor.name);
    });
    return Array.from(seen, ([id, name]) => ({ value: id, label: name }));
  }, []);

  // -- check item options --
  const checkItemOptions = useMemo(() => {
    return checkItems
      .filter((ci) => ci.status === 'active')
      .map((ci) => ({ value: ci.id, label: ci.name }));
  }, []);

  // -- filtered & sorted data --
  const filteredData = useMemo(() => {
    // Only show executed logs (not pending)
    let data = inspectionLogs.filter((log) => log.result !== 'pending' && log.executedAt);

    // keyword
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      data = data.filter(
        (log) =>
          log.checkItem.name.toLowerCase().includes(kw) ||
          log.task.taskNo.toLowerCase().includes(kw) ||
          log.executor.name.toLowerCase().includes(kw) ||
          (log.remark && log.remark.toLowerCase().includes(kw)),
      );
    }

    // result filter
    if (resultFilter !== 'all') {
      data = data.filter((log) => log.result === resultFilter);
    }

    // executor filter
    if (executorFilter) {
      data = data.filter((log) => log.executor.id === executorFilter);
    }

    // check item filter
    if (checkItemFilter) {
      data = data.filter((log) => log.checkItemId === checkItemFilter);
    }

    // date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf('day').toISOString();
      const end = dateRange[1].endOf('day').toISOString();
      data = data.filter((log) => {
        if (!log.executedAt) return false;
        return log.executedAt >= start && log.executedAt <= end;
      });
    }

    // sort by executedAt desc
    data.sort((a, b) => {
      const ta = a.executedAt || '';
      const tb = b.executedAt || '';
      return tb.localeCompare(ta);
    });

    return data;
  }, [keyword, resultFilter, executorFilter, checkItemFilter, dateRange]);

  // -- columns --
  const columns: ColumnsType<InspectionLog> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_val, _record, index) => index + 1,
    },
    {
      title: '执行人',
      dataIndex: ['executor', 'name'],
      key: 'executor',
      width: 100,
    },
    {
      title: '关联任务',
      key: 'taskNo',
      width: 180,
      render: (_val, record) => (
        <Link onClick={() => navigate(`/operations/inspection/tasks/${record.taskId}`)}>
          {record.task.taskNo}
        </Link>
      ),
    },
    {
      title: '检查项目',
      dataIndex: ['checkItem', 'name'],
      key: 'checkItem',
      ellipsis: true,
    },
    {
      title: '执行时间',
      dataIndex: 'executedAt',
      key: 'executedAt',
      width: 180,
      render: (val: string | null) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '检查结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result: CheckResult) => <ResultTag result={result} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_val, record) => (
        <Button type="link" size="small" onClick={() => navigate(`/operations/inspection/logs/${record.id}`)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div data-testid="inspection-log-list">
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center">
            <Title level={4} style={{ margin: 0 }}>巡检日志</Title>
            <RequirementTag componentIds={['log-list']} module="inspection" showDetail />
          </Space>
        </div>

        {/* Filters */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索检查项/任务号/执行人"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <Select
            value={resultFilter}
            onChange={setResultFilter}
            options={resultOptions}
            style={{ width: 120 }}
          />
          <Select
            value={executorFilter}
            onChange={setExecutorFilter}
            options={executorOptions}
            placeholder="执行人"
            allowClear
            style={{ width: 120 }}
          />
          <Select
            value={checkItemFilter}
            onChange={setCheckItemFilter}
            options={checkItemOptions}
            placeholder="检查项目"
            allowClear
            style={{ width: 200 }}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
          />
        </Space>

        <Table<InspectionLog>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: DEFAULT_PAGE_SIZE,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0' }}>
                <Text type="secondary" style={{ whiteSpace: 'pre-line' }}>
                  {'暂无巡检执行记录\n完成巡检任务后，日志将自动生成'}
                </Text>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default InspectionLogList;
