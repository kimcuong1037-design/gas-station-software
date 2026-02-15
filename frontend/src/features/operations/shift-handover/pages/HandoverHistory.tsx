import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Space,
  Tag,
  Statistic,
  Typography,
  Tooltip,
} from 'antd';
import {
  ExportOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { ShiftHandover, HandoverStatus } from '../types';
import { HANDOVER_STATUS_CONFIG, DEFAULT_PAGE_SIZE, DEFAULT_DATE_RANGE_DAYS } from '../constants';
import { shiftHandovers } from '../../../../mock/shiftHandovers';
import { stations } from '../../../../mock/stations';
import { shifts } from '../../../../mock/shifts';
import { employees } from '../../../../mock/employees';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const HandoverHistory: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 筛选状态
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(DEFAULT_DATE_RANGE_DAYS, 'day'),
    dayjs(),
  ]);
  const [stationFilter, setStationFilter] = useState<string>();
  const [shiftFilter, setShiftFilter] = useState<string>();
  const [handoverByFilter, setHandoverByFilter] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<HandoverStatus>();

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // 筛选后的数据
  const filteredData = useMemo(() => {
    return shiftHandovers.filter((handover) => {
      // 日期范围筛选
      if (dateRange) {
        const handoverDate = dayjs(handover.shiftDate);
        if (handoverDate.isBefore(dateRange[0], 'day') || handoverDate.isAfter(dateRange[1], 'day')) {
          return false;
        }
      }
      // 站点筛选
      if (stationFilter && handover.stationId !== stationFilter) {
        return false;
      }
      // 班次筛选
      if (shiftFilter && handover.shiftId !== shiftFilter) {
        return false;
      }
      // 交班人筛选
      if (handoverByFilter && handover.handoverBy !== handoverByFilter) {
        return false;
      }
      // 状态筛选
      if (statusFilter && handover.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [dateRange, stationFilter, shiftFilter, handoverByFilter, statusFilter]);

  // 统计数据
  const statistics = useMemo(() => {
    const total = filteredData.length;
    const totalAmount = filteredData.reduce((sum, h) => sum + (h.summary?.totalAmount || 0), 0);
    const withIssues = filteredData.filter((h) => h.issues && h.issues.length > 0).length;
    return { total, totalAmount, withIssues };
  }, [filteredData]);

  // 状态图标
  const getStatusIcon = (status: HandoverStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'initiated':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'pending_review':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'cancelled':
        return <CloseCircleOutlined style={{ color: '#d9d9d9' }} />;
      default:
        return null;
    }
  };

  // 渲染状态标签
  const renderStatusTag = (status: HandoverStatus) => {
    const config = HANDOVER_STATUS_CONFIG[status];
    const colorMap: Record<string, string> = {
      success: 'success',
      warning: 'warning',
      informative: 'processing',
      neutral: 'default',
    };
    return (
      <Tag icon={getStatusIcon(status)} color={colorMap[config.color] || 'default'}>
        {config.label}
      </Tag>
    );
  };

  // 表格列定义
  const columns: ColumnsType<ShiftHandover> = [
    {
      title: t('shiftHandover.handoverNo'),
      dataIndex: 'handoverNo',
      key: 'handoverNo',
      width: 200,
      render: (no: string, record) => (
        <a onClick={() => navigate(`/operations/shift-handover/history/${record.id}`)}>{no}</a>
      ),
    },
    {
      title: t('shiftHandover.shiftDate'),
      dataIndex: 'shiftDate',
      key: 'shiftDate',
      width: 120,
      align: 'center',
      sorter: (a, b) => dayjs(a.shiftDate).unix() - dayjs(b.shiftDate).unix(),
    },
    {
      title: t('shiftHandover.shiftName'),
      dataIndex: 'shiftName',
      key: 'shiftName',
      width: 100,
      align: 'center',
      render: (name: string) => <Tag>{name}</Tag>,
    },
    {
      title: t('shiftHandover.handoverBy'),
      dataIndex: 'handoverByName',
      key: 'handoverByName',
      width: 100,
    },
    {
      title: t('shiftHandover.receivedBy'),
      dataIndex: 'receivedByName',
      key: 'receivedByName',
      width: 100,
      render: (name: string) => name || '-',
    },
    {
      title: t('shiftHandover.totalAmount'),
      key: 'totalAmount',
      width: 130,
      align: 'right',
      render: (_, record) => (
        <Text strong>
          ¥{(record.summary?.totalAmount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </Text>
      ),
      sorter: (a, b) => (a.summary?.totalAmount || 0) - (b.summary?.totalAmount || 0),
    },
    {
      title: t('shiftHandover.totalOrders'),
      key: 'totalOrders',
      width: 80,
      align: 'center',
      render: (_, record) => record.summary?.totalOrders || 0,
      sorter: (a, b) => (a.summary?.totalOrders || 0) - (b.summary?.totalOrders || 0),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: HandoverStatus) => renderStatusTag(status),
    },
    {
      title: t('shiftHandover.issues'),
      key: 'hasIssues',
      width: 60,
      align: 'center',
      render: (_, record) => (
        record.issues && record.issues.length > 0 ? (
          <Tooltip title={`${record.issues.length} ${t('shiftHandover.issuesCount')}`}>
            <WarningOutlined style={{ color: '#faad14' }} />
          </Tooltip>
        ) : null
      ),
    },
    {
      title: t('shiftHandover.handoverTime'),
      dataIndex: 'handoverTime',
      key: 'handoverTime',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.handoverTime).unix() - dayjs(b.handoverTime).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/operations/shift-handover/history/${record.id}`)}
        >
          {t('common.detail')}
        </Button>
      ),
    },
  ];

  // 重置筛选
  const handleReset = () => {
    setDateRange([dayjs().subtract(DEFAULT_DATE_RANGE_DAYS, 'day'), dayjs()]);
    setStationFilter(undefined);
    setShiftFilter(undefined);
    setHandoverByFilter(undefined);
    setStatusFilter(undefined);
    setCurrentPage(1);
  };

  return (
    <div className="handover-history-page">
      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Space>
              <Text>{t('shiftHandover.dateRange')}:</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                    setCurrentPage(1);
                  }
                }}
                allowClear={false}
              />
            </Space>
          </Col>
          <Col>
            <Select
              placeholder={t('shiftHandover.selectStation')}
              value={stationFilter}
              onChange={(value) => {
                setStationFilter(value);
                setCurrentPage(1);
              }}
              allowClear
              style={{ width: 180 }}
              options={stations.map((s) => ({ label: s.name, value: s.id }))}
            />
          </Col>
          <Col>
            <Select
              placeholder={t('shiftHandover.selectShift')}
              value={shiftFilter}
              onChange={(value) => {
                setShiftFilter(value);
                setCurrentPage(1);
              }}
              allowClear
              style={{ width: 120 }}
              options={shifts.map((s) => ({ label: s.name, value: s.id }))}
            />
          </Col>
          <Col>
            <Select
              placeholder={t('shiftHandover.selectHandoverBy')}
              value={handoverByFilter}
              onChange={(value) => {
                setHandoverByFilter(value);
                setCurrentPage(1);
              }}
              allowClear
              style={{ width: 150 }}
              options={employees.map((e) => ({ label: e.name, value: e.id }))}
            />
          </Col>
          <Col>
            <Select
              placeholder={t('common.status')}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              allowClear
              style={{ width: 120 }}
              options={Object.entries(HANDOVER_STATUS_CONFIG).map(([key, config]) => ({
                label: config.label,
                value: key,
              }))}
            />
          </Col>
          <Col>
            <Button onClick={handleReset}>{t('common.reset')}</Button>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button icon={<ExportOutlined />}>{t('common.export')}</Button>
          </Col>
        </Row>
      </Card>

      {/* 统计汇总栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          <Col>
            <Statistic
              title={t('shiftHandover.totalRecords')}
              value={statistics.total}
              suffix={t('shiftHandover.recordsUnit')}
            />
          </Col>
          <Col>
            <Statistic
              title={t('shiftHandover.totalAmountSum')}
              value={statistics.totalAmount}
              precision={2}
              prefix="¥"
            />
          </Col>
          <Col>
            <Statistic
              title={t('shiftHandover.issueRecords')}
              value={statistics.withIssues}
              suffix={t('shiftHandover.recordsUnit')}
              valueStyle={{ color: statistics.withIssues > 0 ? '#faad14' : undefined }}
            />
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('common.totalItems', { total }),
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default HandoverHistory;
