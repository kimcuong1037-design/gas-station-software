import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Row,
  Col,
  Space,
  Typography,
  Button,
  DatePicker,
  Select,
  Tag,
  Statistic,
  Modal,
  Form,
  Input,
  Radio,
  message,
  Descriptions,
  theme,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { CashSettlement, SettlementStatus } from '../types';
import { SETTLEMENT_STATUS_CONFIG, DIFFERENCE_TYPE_CONFIG, getLabel } from '../constants';
import { pendingSettlements, shiftHandovers } from '../../../../mock/shiftHandovers';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface ReviewForm {
  approved: boolean;
  reviewNote?: string;
}

const SettlementReview: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  // 筛选条件
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [stationFilter, setStationFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<SettlementStatus | undefined>();
  // 审核弹窗
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentSettlement, setCurrentSettlement] = useState<CashSettlement | null>(null);
  const [form] = Form.useForm<ReviewForm>();
  const [submitting, setSubmitting] = useState(false);

  // 获取站点列表(去重)
  const stations = useMemo(() => {
    const stationMap = new Map<string, string>();
    shiftHandovers.forEach((h) => {
      if (!stationMap.has(h.stationId)) {
        stationMap.set(h.stationId, h.stationName || '');
      }
    });
    return Array.from(stationMap.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  // 合并所有解缴记录
  const allSettlements = useMemo(() => {
    const settlementsFromHandovers = shiftHandovers
      .filter((h) => h.settlement)
      .map((h) => ({
        ...h.settlement!,
        stationId: h.stationId,
        stationName: h.stationName,
        shiftName: h.shiftName,
        shiftDate: h.shiftDate,
        handoverNo: h.handoverNo,
        handoverByName: h.handoverByName,
      }));
    
    // 合并待审核列表
    const pendingWithInfo = pendingSettlements.map((s) => {
      const handover = shiftHandovers.find((h) => h.id === s.handoverId);
      return {
        ...s,
        stationId: handover?.stationId || '',
        stationName: handover?.stationName || '',
        shiftName: handover?.shiftName || '',
        shiftDate: handover?.shiftDate || '',
        handoverNo: handover?.handoverNo || '',
        handoverByName: handover?.handoverByName || '',
      };
    });

    // 去重并合并
    const uniqueSettlements = new Map<string, typeof settlementsFromHandovers[0]>();
    [...settlementsFromHandovers, ...pendingWithInfo].forEach((s) => {
      if (!uniqueSettlements.has(s.id)) {
        uniqueSettlements.set(s.id, s);
      }
    });

    return Array.from(uniqueSettlements.values());
  }, []);

  // 筛选后的数据
  const filteredData = useMemo(() => {
    let result = [...allSettlements];

    if (dateRange && dateRange[0] && dateRange[1]) {
      result = result.filter((item) => {
        const itemDate = dayjs(item.createdAt);
        return itemDate.isAfter(dateRange[0]!.startOf('day')) &&
               itemDate.isBefore(dateRange[1]!.endOf('day'));
      });
    }

    if (stationFilter) {
      result = result.filter((item) => item.stationId === stationFilter);
    }

    if (statusFilter) {
      result = result.filter((item) => item.status === statusFilter);
    }

    return result.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [allSettlements, dateRange, stationFilter, statusFilter]);

  // 统计数据
  const statistics = useMemo(() => {
    const pending = filteredData.filter((s) => s.status === 'pending').length;
    const approved = filteredData.filter((s) => s.status === 'approved').length;
    const rejected = filteredData.filter((s) => s.status === 'rejected').length;
    const totalDifference = filteredData.reduce((sum, s) => sum + s.difference, 0);
    return { pending, approved, rejected, totalDifference };
  }, [filteredData]);

  // 打开审核弹窗
  const handleOpenReview = (settlement: CashSettlement) => {
    setCurrentSettlement(settlement);
    form.resetFields();
    setReviewModalVisible(true);
  };

  // 提交审核
  const handleSubmitReview = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      // 模拟提交
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      message.success(
        values.approved
          ? t('shiftHandover.reviewApproveSuccess')
          : t('shiftHandover.reviewRejectSuccess')
      );
      setReviewModalVisible(false);
    } catch {
      // 表单验证失败
    } finally {
      setSubmitting(false);
    }
  };

  // 重置筛选
  const handleReset = () => {
    setDateRange(null);
    setStationFilter(undefined);
    setStatusFilter(undefined);
  };

  // 表格列定义
  const columns = [
    {
      title: t('shiftHandover.settlementNo'),
      dataIndex: 'settlementNo',
      key: 'settlementNo',
      width: 150,
    },
    {
      title: t('shiftHandover.stationName'),
      dataIndex: 'stationName',
      key: 'stationName',
      width: 120,
    },
    {
      title: t('shiftHandover.shiftInfo'),
      key: 'shiftInfo',
      width: 150,
      render: (_: unknown, record: typeof allSettlements[0]) => (
        <Space direction="vertical" size={0}>
          <Text>{record.shiftDate}</Text>
          <Tag>{record.shiftName}</Tag>
        </Space>
      ),
    },
    {
      title: t('shiftHandover.expectedAmount'),
      dataIndex: 'expectedAmount',
      key: 'expectedAmount',
      width: 120,
      align: 'right' as const,
      render: (val: number) => `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: t('shiftHandover.actualAmount'),
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 120,
      align: 'right' as const,
      render: (val: number) => `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: t('shiftHandover.difference'),
      key: 'difference',
      width: 120,
      render: (_: unknown, record: CashSettlement) => {
        const config = DIFFERENCE_TYPE_CONFIG[record.differenceType];
        const colorMap: Record<string, string> = {
          success: token.colorSuccess,
          danger: token.colorError,
          neutral: token.colorTextSecondary,
        };
        return (
          <Text style={{ color: colorMap[config.color] }}>
            {getLabel(config)} ¥{Math.abs(record.difference).toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: t('shiftHandover.submittedBy'),
      dataIndex: 'handoverByName',
      key: 'handoverByName',
      width: 100,
    },
    {
      title: t('shiftHandover.settlementTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SettlementStatus) => {
        const config = SETTLEMENT_STATUS_CONFIG[status];
        const colorMap: Record<string, string> = {
          success: 'success',
          warning: 'warning',
          danger: 'error',
        };
        return <Tag color={colorMap[config.color] || 'default'}>{getLabel(config)}</Tag>;
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: CashSettlement) => {
        if (record.status === 'pending') {
          return (
            <Button type="primary" size="small" onClick={() => handleOpenReview(record)}>
              {t('shiftHandover.review')}
            </Button>
          );
        }
        return (
          <Text type="secondary">
            {record.reviewedByName} {record.reviewedAt ? dayjs(record.reviewedAt).format('MM-DD HH:mm') : ''}
          </Text>
        );
      },
    },
  ];

  return (
    <div className="settlement-review-page">
      {/* 页面级需求标记 */}
      <div style={{ marginBottom: 8 }}>
        <RequirementTag componentId="settlement-review" module="shift-handover" showDetail />
      </div>

      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('shiftHandover.pendingReview')}
              value={statistics.pending}
              suffix={t('shiftHandover.recordsUnit')}
              valueStyle={{ color: statistics.pending > 0 ? token.colorWarning : token.colorSuccess }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('shiftHandover.approved')}
              value={statistics.approved}
              suffix={t('shiftHandover.recordsUnit')}
              valueStyle={{ color: token.colorSuccess }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('shiftHandover.rejected')}
              value={statistics.rejected}
              suffix={t('shiftHandover.recordsUnit')}
              valueStyle={{ color: token.colorError }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('shiftHandover.totalDifferenceSum')}
              value={statistics.totalDifference}
              precision={2}
              prefix="¥"
              valueStyle={{ color: statistics.totalDifference >= 0 ? token.colorSuccess : token.colorError }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text>{t('shiftHandover.dateRange')}:</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                style={{ width: 240 }}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Text>{t('shiftHandover.station')}:</Text>
              <Select
                placeholder={t('common.all')}
                style={{ width: 150 }}
                allowClear
                value={stationFilter}
                onChange={setStationFilter}
              >
                {stations.map((station) => (
                  <Select.Option key={station.id} value={station.id}>
                    {station.name}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Text>{t('common.status')}:</Text>
              <Select
                placeholder={t('common.all')}
                style={{ width: 120 }}
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
              >
                {Object.entries(SETTLEMENT_STATUS_CONFIG).map(([key, config]) => (
                  <Select.Option key={key} value={key}>
                    {getLabel(config)}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button icon={<SearchOutlined />} type="primary">
                {t('common.search')}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                {t('common.reset')}
              </Button>
            </Space>
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
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('common.totalRecords', { total }),
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      {/* 审核弹窗 */}
      <Modal
        title={t('shiftHandover.reviewSettlement')}
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={600}
      >
        {currentSettlement && (
          <>
            <Descriptions column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label={t('shiftHandover.settlementNo')}>
                {currentSettlement.settlementNo}
              </Descriptions.Item>
              <Descriptions.Item label={t('shiftHandover.handoverNo')}>
                {(currentSettlement as typeof allSettlements[0]).handoverNo}
              </Descriptions.Item>
              <Descriptions.Item label={t('shiftHandover.expectedAmount')}>
                ¥{currentSettlement.expectedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </Descriptions.Item>
              <Descriptions.Item label={t('shiftHandover.actualAmount')}>
                ¥{currentSettlement.actualAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </Descriptions.Item>
              <Descriptions.Item label={t('shiftHandover.difference')}>
                <Text
                  style={{
                    color:
                      currentSettlement.differenceType === 'balanced'
                        ? token.colorSuccess
                        : currentSettlement.difference > 0
                        ? token.colorPrimary
                        : token.colorError,
                  }}
                >
                  {getLabel(DIFFERENCE_TYPE_CONFIG[currentSettlement.differenceType])} ¥
                  {Math.abs(currentSettlement.difference).toFixed(2)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('shiftHandover.settlementMethod')}>
                {currentSettlement.settlementMethod}
              </Descriptions.Item>
              {currentSettlement.differenceNote && (
                <Descriptions.Item label={t('shiftHandover.differenceReason')} span={2}>
                  {currentSettlement.differenceNote}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Form form={form} layout="vertical" initialValues={{ approved: true }}>
              <Form.Item
                name="approved"
                label={t('shiftHandover.reviewResult')}
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio.Button value={true}>
                    <CheckOutlined /> {t('shiftHandover.approve')}
                  </Radio.Button>
                  <Radio.Button value={false}>
                    <CloseOutlined /> {t('shiftHandover.reject')}
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) => prev.approved !== cur.approved}
              >
                {({ getFieldValue }) => {
                  const approved = getFieldValue('approved');
                  return (
                    <Form.Item
                      name="reviewNote"
                      label={t('shiftHandover.reviewNote')}
                      rules={[{ required: !approved, message: t('shiftHandover.enterRejectReason') }]}
                    >
                      <TextArea
                        rows={3}
                        placeholder={
                          approved
                            ? t('shiftHandover.reviewNotePlaceholder')
                            : t('shiftHandover.rejectReasonPlaceholder')
                        }
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>

              <Row justify="end" style={{ marginTop: 24 }}>
                <Space>
                  <Button onClick={() => setReviewModalVisible(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="primary" onClick={handleSubmitReview} loading={submitting}>
                    {t('shiftHandover.submitReview')}
                  </Button>
                </Space>
              </Row>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SettlementReview;
