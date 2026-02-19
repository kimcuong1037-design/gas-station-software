// P15: 巡检统计分析页
import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Typography, Tabs, Row, Col, Table, DatePicker, Radio, Button, Space, Progress, Tag, Statistic, Modal, Form, Select, message } from 'antd';
import { CalendarOutlined, BankOutlined, BarChartOutlined, FileTextOutlined, ExportOutlined, WarningOutlined, CheckCircleOutlined, BugOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getDailyReport, getStationReports, inspectionReports, issueRecords, inspectionTasks } from '../../../../mock/inspections';
import { stations } from '../../../../mock/stations';
import type { DailyReportData, StationReportData, InspectionReport } from '../types';
import { REPORT_TYPE_CONFIG, CATEGORY_CONFIG, getLabel } from '../constants';
import ResultTag from '../components/ResultTag';
import CategoryTag from '../components/CategoryTag';
import { RequirementTag } from '../../../../components/RequirementTag';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// ============================================================
// Tab 1: 巡检日报 (daily)
// ============================================================

const DailyTab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const report = useMemo(() => {
    return getDailyReport(selectedDate.format('YYYY-MM-DD'));
  }, [selectedDate]);

  const executorColumns: ColumnsType<DailyReportData['executorDetails'][0]> = [
    { title: '执行人', dataIndex: ['executor', 'name'], key: 'executor', width: 100 },
    { title: '分配任务', dataIndex: 'assignedTasks', key: 'assigned', width: 100, align: 'center' },
    { title: '已完成', dataIndex: 'completedTasks', key: 'completed', width: 100, align: 'center' },
    { title: '正常项', dataIndex: 'normalItems', key: 'normal', width: 100, align: 'center' },
    { title: '异常项', dataIndex: 'abnormalItems', key: 'abnormal', width: 100, align: 'center', render: (val: number) => val > 0 ? <Text type="danger">{val}</Text> : val },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 160,
      render: (val: number) => <Progress percent={val} size="small" status={val >= 100 ? 'success' : 'active'} />,
    },
  ];

  const abnormalColumns: ColumnsType<DailyReportData['abnormalDetails'][0]> = [
    { title: '检查项目', dataIndex: ['checkItem', 'name'], key: 'checkItem', ellipsis: true },
    {
      title: '分类',
      key: 'category',
      width: 100,
      render: (_val, record) => <CategoryTag category={record.checkItem.category} />,
    },
    { title: '执行人', dataIndex: ['executor', 'name'], key: 'executor', width: 100 },
    {
      title: '检查结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => <ResultTag result={result} />,
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Date picker */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <DatePicker value={selectedDate} onChange={(date) => date && setSelectedDate(date)} />
      </div>

      {/* Stat cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="计划任务" value={report.plannedTasks} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成" value={report.completedTasks} suffix="个" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="完成率" value={report.completionRate} suffix="%" valueStyle={{ color: report.completionRate >= 100 ? '#52c41a' : '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="异常项" value={report.abnormalItems} suffix="项" valueStyle={{ color: report.abnormalItems > 0 ? '#ff4d4f' : undefined }} />
          </Card>
        </Col>
      </Row>

      {/* Executor detail table */}
      <Card title="执行人明细" size="small">
        <Table
          rowKey={(r) => r.executor.id}
          columns={executorColumns}
          dataSource={report.executorDetails}
          pagination={false}
          size="small"
          locale={{ emptyText: '当日无任务分配' }}
        />
      </Card>

      {/* Abnormal detail table */}
      {report.abnormalItems > 0 && (
        <Card title="异常项明细" size="small">
          <Table
            rowKey={(_r, idx) => `abnormal-${idx}`}
            columns={abnormalColumns}
            dataSource={report.abnormalDetails}
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </Space>
  );
};

// ============================================================
// Tab 2: 站点报表 (station)
// ============================================================

const StationTab: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<string>('month');

  const stationData = useMemo(() => getStationReports(), []);

  const columns: ColumnsType<StationReportData> = [
    { title: '站点名称', dataIndex: ['station', 'name'], key: 'station' },
    { title: '总任务', dataIndex: 'totalTasks', key: 'total', width: 90, align: 'center' },
    { title: '已完成', dataIndex: 'completedTasks', key: 'completed', width: 90, align: 'center' },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 160,
      render: (val: number) => <Progress percent={val} size="small" status={val >= 100 ? 'success' : val >= 80 ? 'active' : 'exception'} />,
    },
    {
      title: '异常数',
      dataIndex: 'abnormalCount',
      key: 'abnormal',
      width: 90,
      align: 'center',
      render: (val: number, record) =>
        val > 0 ? (
          <Button type="link" size="small" onClick={() => navigate(`/operations/inspection/logs?station=${record.station.id}`)}>
            {val}
          </Button>
        ) : (
          val
        ),
    },
    { title: '问题数', dataIndex: 'issueCount', key: 'issues', width: 90, align: 'center' },
    {
      title: '整改率',
      dataIndex: 'rectificationRate',
      key: 'rectification',
      width: 160,
      render: (val: number) => (
        <Button type="link" size="small" style={{ padding: 0, width: '100%' }}>
          <Progress percent={val} size="small" status={val >= 100 ? 'success' : val >= 60 ? 'active' : 'exception'} />
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Time range controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Radio.Group value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <Radio.Button value="today">今日</Radio.Button>
          <Radio.Button value="week">本周</Radio.Button>
          <Radio.Button value="month">本月</Radio.Button>
          <Radio.Button value="custom">自定义</Radio.Button>
        </Radio.Group>
        <Button icon={<ExportOutlined />} disabled>
          导出
        </Button>
      </div>

      <Table<StationReportData>
        rowKey={(r) => r.station.id}
        columns={columns}
        dataSource={stationData}
        pagination={false}
        size="small"
      />
    </Space>
  );
};

// ============================================================
// Tab 3: 安检统计 (statistics)
// ============================================================

const StatisticsTab: React.FC = () => {
  const [subTab, setSubTab] = useState<string>('time');

  // Overall stats (from mock data)
  const overallStats = useMemo(() => {
    const totalTasks = inspectionTasks.length;
    const completedTasks = inspectionTasks.filter((t) => t.status === 'completed').length;
    const totalLogs = inspectionTasks.reduce((sum, t) => sum + t.checkedItems, 0);
    const abnormalLogs = inspectionTasks.reduce((sum, t) => sum + t.abnormalItems, 0);
    const pendingIssues = issueRecords.filter((i) => i.status !== 'closed').length;

    return {
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      abnormalRate: totalLogs > 0 ? Math.round((abnormalLogs / totalLogs) * 100) : 0,
      pendingIssueCount: pendingIssues,
      monthlyInspectionCount: totalTasks,
    };
  }, []);

  // Sub-tab: time data
  const timeData = useMemo(
    () => [
      { key: '2026-02-19', date: '2026-02-19', tasks: 3, completed: 0, abnormal: 1, completionRate: 0 },
      { key: '2026-02-18', date: '2026-02-18', tasks: 2, completed: 2, abnormal: 1, completionRate: 100 },
      { key: '2026-02-17', date: '2026-02-17', tasks: 1, completed: 0, abnormal: 0, completionRate: 0 },
    ],
    [],
  );

  // Sub-tab: station data
  const stationData = useMemo(() => getStationReports().map((s) => ({ key: s.station.id, ...s })), []);

  // Sub-tab: check item data
  const checkItemData = useMemo(() => {
    const categoryMap = new Map<string, { category: string; total: number; abnormal: number }>();
    Object.keys(CATEGORY_CONFIG).forEach((cat) => {
      categoryMap.set(cat, { category: cat, total: 0, abnormal: 0 });
    });
    // simplified: categories are populated with sample data
    return Array.from(categoryMap.values()).map((v, idx) => ({
      key: `cat-${idx}`,
      category: v.category,
      categoryLabel: getLabel(CATEGORY_CONFIG[v.category as keyof typeof CATEGORY_CONFIG]),
      totalChecks: Math.floor(Math.random() * 20) + 5,
      abnormalCount: Math.floor(Math.random() * 3),
    }));
  }, []);

  const timeColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '任务数', dataIndex: 'tasks', key: 'tasks', align: 'center' as const },
    { title: '已完成', dataIndex: 'completed', key: 'completed', align: 'center' as const },
    { title: '异常项', dataIndex: 'abnormal', key: 'abnormal', align: 'center' as const, render: (val: number) => val > 0 ? <Text type="danger">{val}</Text> : val },
    { title: '完成率', dataIndex: 'completionRate', key: 'rate', width: 160, render: (val: number) => <Progress percent={val} size="small" /> },
  ];

  const stationColumns = [
    { title: '站点', dataIndex: ['station', 'name'], key: 'station' },
    { title: '总任务', dataIndex: 'totalTasks', key: 'total', align: 'center' as const },
    { title: '已完成', dataIndex: 'completedTasks', key: 'completed', align: 'center' as const },
    { title: '异常数', dataIndex: 'abnormalCount', key: 'abnormal', align: 'center' as const },
    { title: '完成率', dataIndex: 'completionRate', key: 'rate', width: 160, render: (val: number) => <Progress percent={val} size="small" /> },
  ];

  const checkItemColumns = [
    { title: '检查项分类', dataIndex: 'categoryLabel', key: 'category' },
    { title: '检查次数', dataIndex: 'totalChecks', key: 'total', align: 'center' as const },
    { title: '异常次数', dataIndex: 'abnormalCount', key: 'abnormal', align: 'center' as const, render: (val: number) => val > 0 ? <Text type="danger">{val}</Text> : val },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Stat cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="总完成率" value={overallStats.completionRate} suffix="%" valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="异常率" value={overallStats.abnormalRate} suffix="%" valueStyle={{ color: overallStats.abnormalRate > 10 ? '#ff4d4f' : '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理问题" value={overallStats.pendingIssueCount} suffix="个" valueStyle={{ color: overallStats.pendingIssueCount > 0 ? '#faad14' : undefined }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月巡检任务" value={overallStats.monthlyInspectionCount} suffix="个" />
          </Card>
        </Col>
      </Row>

      {/* Sub-tabs */}
      <Card>
        <Tabs
          activeKey={subTab}
          onChange={setSubTab}
          items={[
            {
              key: 'time',
              label: '按时间',
              children: (
                <Table
                  rowKey="key"
                  columns={timeColumns}
                  dataSource={timeData}
                  pagination={false}
                  size="small"
                />
              ),
            },
            {
              key: 'station',
              label: '按站点',
              children: (
                <Table
                  rowKey="key"
                  columns={stationColumns}
                  dataSource={stationData}
                  pagination={false}
                  size="small"
                />
              ),
            },
            {
              key: 'checkItem',
              label: '按检查项目',
              children: (
                <Table
                  rowKey="key"
                  columns={checkItemColumns}
                  dataSource={checkItemData}
                  pagination={false}
                  size="small"
                />
              ),
            },
          ]}
        />
      </Card>
    </Space>
  );
};

// ============================================================
// Tab 4: 检查报表 (reports)
// ============================================================

const ReportsTab: React.FC = () => {
  const navigate = useNavigate();
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Report type cards
  const reportTypes: Array<{
    type: keyof typeof REPORT_TYPE_CONFIG;
    icon: React.ReactNode;
    lastGenerated: string | null;
    disabled?: boolean;
  }> = [
    { type: 'completion', icon: <CheckCircleOutlined style={{ fontSize: 28, color: '#1677ff' }} />, lastGenerated: '2026-02-18' },
    { type: 'abnormal', icon: <WarningOutlined style={{ fontSize: 28, color: '#fa8c16' }} />, lastGenerated: '2026-02-15' },
    { type: 'rectification', icon: <BugOutlined style={{ fontSize: 28, color: '#52c41a' }} />, lastGenerated: '2026-02-17' },
    { type: 'compliance', icon: <FileTextOutlined style={{ fontSize: 28, color: '#722ed1' }} />, lastGenerated: null, disabled: true },
  ];

  // History report columns
  const historyColumns: ColumnsType<InspectionReport> = [
    { title: '报表名称', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: '报表类型',
      dataIndex: 'reportType',
      key: 'type',
      width: 140,
      render: (type: keyof typeof REPORT_TYPE_CONFIG) => {
        const config = REPORT_TYPE_CONFIG[type];
        return config ? <Tag color={config.color}>{getLabel(config)}</Tag> : type;
      },
    },
    { title: '时间范围', dataIndex: 'timeRange', key: 'timeRange', width: 200 },
    {
      title: '生成时间',
      dataIndex: 'generatedAt',
      key: 'generatedAt',
      width: 160,
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_val, record) => (
        <Button type="link" size="small" onClick={() => navigate(`/operations/inspection/analytics/reports/${record.id}`)}>
          查看
        </Button>
      ),
    },
  ];

  const handleGenerate = () => {
    form.validateFields().then(() => {
      message.success('报表生成任务已提交');
      setGenerateModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Report type cards 2x2 */}
      <Row gutter={[16, 16]}>
        {reportTypes.map((rt) => {
          const config = REPORT_TYPE_CONFIG[rt.type];
          return (
            <Col span={12} key={rt.type}>
              <Card hoverable={!rt.disabled} style={{ opacity: rt.disabled ? 0.6 : 1 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div>{rt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ margin: 0 }}>{getLabel(config)}</Title>
                    <Text type="secondary" style={{ display: 'block', margin: '4px 0 8px' }}>{config.desc}</Text>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {rt.lastGenerated ? `最近生成：${rt.lastGenerated}` : '暂未生成'}
                      </Text>
                      <Button
                        type="primary"
                        size="small"
                        disabled={rt.disabled}
                        onClick={() => setGenerateModalOpen(true)}
                      >
                        {rt.disabled ? 'MVP+' : '生成报表'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* History report table */}
      <Card title="历史报表" size="small">
        <Table<InspectionReport>
          rowKey="id"
          columns={historyColumns}
          dataSource={inspectionReports}
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无历史报表' }}
        />
      </Card>

      {/* Generate modal */}
      <Modal
        title="生成报表"
        open={generateModalOpen}
        onOk={handleGenerate}
        onCancel={() => {
          setGenerateModalOpen(false);
          form.resetFields();
        }}
        okText="生成"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="时间范围" name="timeRange" rules={[{ required: true, message: '请选择时间范围' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="站点" name="stationIds" rules={[{ required: true, message: '请选择站点' }]}>
            <Select
              mode="multiple"
              placeholder="选择站点"
              options={stations.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

// ============================================================
// Main Component
// ============================================================

const tabItems = [
  { key: 'daily', label: '巡检日报', icon: <CalendarOutlined />, children: <DailyTab /> },
  { key: 'station', label: '站点报表', icon: <BankOutlined />, children: <StationTab /> },
  { key: 'statistics', label: '安检统计', icon: <BarChartOutlined />, children: <StatisticsTab /> },
  { key: 'reports', label: '检查报表', icon: <FileTextOutlined />, children: <ReportsTab /> },
];

const InspectionAnalytics: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'daily';

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  return (
    <div data-testid="inspection-analytics">
      <Card>
        <Space align="center" style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>巡检统计分析</Title>
          <RequirementTag componentIds={['daily-report', 'station-report', 'station-report-drill', 'station-report-trend', 'statistics', 'statistics-chart', 'report-generate']} module="inspection" showDetail />
        </Space>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          items={tabItems.map((item) => ({
            key: item.key,
            label: (
              <span>
                {item.icon} {item.label}
              </span>
            ),
            children: item.children,
          }))}
        />
      </Card>
    </div>
  );
};

export default InspectionAnalytics;
