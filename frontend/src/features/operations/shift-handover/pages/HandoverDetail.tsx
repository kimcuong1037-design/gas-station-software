import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Statistic,
  Button,
  Space,
  Typography,
  Table,
  Divider,
  Empty,
  List,
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PaymentSummaryItem, FuelSummaryItem } from '../types';
import {
  HANDOVER_STATUS_CONFIG,
  SETTLEMENT_STATUS_CONFIG,
  DIFFERENCE_TYPE_CONFIG,
  ISSUE_TYPE_CONFIG,
  ISSUE_SEVERITY_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '../constants';
import { shiftHandovers } from '../../../../mock/shiftHandovers';

const { Title, Text } = Typography;

const HandoverDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 查找交接班记录
  const handover = shiftHandovers.find((h) => h.id === id);

  if (!handover) {
    return (
      <Card>
        <Empty description={t('shiftHandover.recordNotFound')} />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={() => navigate('/operations/shift-handover/history')}>
            {t('common.back')}
          </Button>
        </div>
      </Card>
    );
  }

  const statusConfig = HANDOVER_STATUS_CONFIG[handover.status];

  // 状态图标
  const getStatusIcon = () => {
    switch (handover.status) {
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

  // 计算支付方式百分比
  const totalPayment = handover.summary?.paymentSummary.reduce((sum, item) => sum + item.amount, 0) || 0;

  // 异常表格列
  const issueColumns = [
    {
      title: t('shiftHandover.issueType'),
      dataIndex: 'issueType',
      key: 'issueType',
      width: 100,
      render: (type: string) => {
        const config = ISSUE_TYPE_CONFIG[type as keyof typeof ISSUE_TYPE_CONFIG];
        return config?.label || type;
      },
    },
    {
      title: t('shiftHandover.severity'),
      dataIndex: 'severity',
      key: 'severity',
      width: 80,
      render: (severity: string) => {
        const config = ISSUE_SEVERITY_CONFIG[severity as keyof typeof ISSUE_SEVERITY_CONFIG];
        const colorMap: Record<string, string> = {
          informative: 'processing',
          warning: 'warning',
          severe: 'error',
          danger: 'error',
        };
        return <Tag color={colorMap[config?.color] || 'default'}>{config?.label || severity}</Tag>;
      },
    },
    {
      title: t('shiftHandover.description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('shiftHandover.reportedBy'),
      dataIndex: 'reportedByName',
      key: 'reportedByName',
      width: 100,
    },
    {
      title: t('common.status'),
      dataIndex: 'resolved',
      key: 'resolved',
      width: 80,
      render: (resolved: boolean) => (
        <Tag color={resolved ? 'success' : 'warning'}>
          {resolved ? t('shiftHandover.resolved') : t('shiftHandover.unresolved')}
        </Tag>
      ),
    },
  ];

  return (
    <div className="handover-detail-page">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/operations/shift-handover/history')}>
                {t('common.back')}
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                {t('shiftHandover.detailTitle')} - {handover.handoverNo}
              </Title>
              <Tag icon={getStatusIcon()} color={statusConfig.color === 'success' ? 'success' : statusConfig.color === 'warning' ? 'warning' : 'default'}>
                {statusConfig.label}
              </Tag>
              {handover.isForced && (
                <Tag color="error">{t('shiftHandover.forcedHandover')}</Tag>
              )}
            </Space>
          </Col>
          <Col>
            <Button icon={<PrinterOutlined />}>{t('shiftHandover.print')}</Button>
          </Col>
        </Row>
      </Card>

      {/* 基本信息 */}
      <Card title={t('shiftHandover.basicInfo')} style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label={t('shiftHandover.handoverNo')}>
            {handover.handoverNo}
          </Descriptions.Item>
          <Descriptions.Item label={t('shiftHandover.stationName')}>
            {handover.stationName}
          </Descriptions.Item>
          <Descriptions.Item label={t('shiftHandover.shiftName')}>
            <Tag>{handover.shiftName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('shiftHandover.shiftDate')}>
            {handover.shiftDate}
          </Descriptions.Item>
          <Descriptions.Item label={t('shiftHandover.handoverTime')}>
            {dayjs(handover.handoverTime).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label={t('shiftHandover.handoverBy')}>
            {handover.handoverByName}
          </Descriptions.Item>
          <Descriptions.Item label={t('shiftHandover.receivedBy')}>
            {handover.receivedByName || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 销售汇总 */}
      {handover.summary && (
        <Card title={t('shiftHandover.salesSummary')} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic
                title={t('shiftHandover.totalAmount')}
                value={handover.summary.totalAmount}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title={t('shiftHandover.totalOrders')}
                value={handover.summary.totalOrders}
                suffix={t('shiftHandover.ordersUnit')}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title={t('shiftHandover.netAmount')}
                value={handover.summary.netAmount}
                precision={2}
                prefix="¥"
              />
            </Col>
          </Row>

          <Divider />

          <Row gutter={[24, 16]}>
            {/* 支付方式明细 */}
            <Col xs={24} lg={12}>
              <Title level={5}>{t('shiftHandover.byPaymentMethod')}</Title>
              <List
                size="small"
                dataSource={handover.summary.paymentSummary}
                renderItem={(item: PaymentSummaryItem) => {
                  const config = PAYMENT_METHOD_CONFIG[item.paymentMethod];
                  const percent = totalPayment > 0 ? (item.amount / totalPayment) * 100 : 0;
                  return (
                    <List.Item>
                      <Row style={{ width: '100%' }} align="middle" gutter={8}>
                        <Col span={6}>
                          <Text>{config?.label || item.paymentMethodName}</Text>
                        </Col>
                        <Col span={6} style={{ textAlign: 'right' }}>
                          <Text strong>¥{item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</Text>
                        </Col>
                        <Col span={4} style={{ textAlign: 'center' }}>
                          <Text type="secondary">{item.orders}{t('shiftHandover.ordersUnit')}</Text>
                        </Col>
                        <Col span={8}>
                          <Progress percent={percent} size="small" format={(val) => `${val?.toFixed(1)}%`} />
                        </Col>
                      </Row>
                    </List.Item>
                  );
                }}
              />
            </Col>

            {/* 燃料类型明细 */}
            <Col xs={24} lg={12}>
              <Title level={5}>{t('shiftHandover.byFuelType')}</Title>
              <List
                size="small"
                dataSource={handover.summary.fuelSummary}
                renderItem={(item: FuelSummaryItem) => (
                  <List.Item>
                    <Row style={{ width: '100%' }} align="middle">
                      <Col span={8}>
                        <Space>
                          <FireOutlined style={{ color: item.fuelType === 'LNG' ? '#f5222d' : '#1890ff' }} />
                          <Text>{item.fuelTypeName}</Text>
                        </Space>
                      </Col>
                      <Col span={8} style={{ textAlign: 'center' }}>
                        <Text>{item.quantity.toLocaleString()} {item.unit}</Text>
                      </Col>
                      <Col span={8} style={{ textAlign: 'right' }}>
                        <Text strong>¥{item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</Text>
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* 现金解缴 */}
      {handover.settlement && (
        <Card title={t('shiftHandover.cashSettlement')} style={{ marginBottom: 16 }}>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label={t('shiftHandover.expectedAmount')}>
              ¥{handover.settlement.expectedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </Descriptions.Item>
            <Descriptions.Item label={t('shiftHandover.actualAmount')}>
              ¥{handover.settlement.actualAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </Descriptions.Item>
            <Descriptions.Item label={t('shiftHandover.difference')}>
              {(() => {
                const config = DIFFERENCE_TYPE_CONFIG[handover.settlement!.differenceType];
                const colorMap: Record<string, string> = {
                  success: '#52c41a',
                  danger: '#ff4d4f',
                  neutral: '#8c8c8c',
                };
                return (
                  <Text style={{ color: colorMap[config.color] || '#8c8c8c' }}>
                    {config.label} ¥{Math.abs(handover.settlement!.difference).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </Text>
                );
              })()}
            </Descriptions.Item>
            {handover.settlement.differenceReason && (
              <Descriptions.Item label={t('shiftHandover.differenceReason')}>
                {handover.settlement.differenceNote || '-'}
              </Descriptions.Item>
            )}
            <Descriptions.Item label={t('shiftHandover.settlementMethod')}>
              {handover.settlement.settlementMethod}
            </Descriptions.Item>
            <Descriptions.Item label={t('shiftHandover.settlementStatus')}>
              {(() => {
                const config = SETTLEMENT_STATUS_CONFIG[handover.settlement!.status];
                const colorMap: Record<string, string> = {
                  success: 'success',
                  warning: 'warning',
                  danger: 'error',
                };
                return <Tag color={colorMap[config.color] || 'default'}>{config.label}</Tag>;
              })()}
            </Descriptions.Item>
            {handover.settlement.reviewedByName && (
              <>
                <Descriptions.Item label={t('shiftHandover.reviewedBy')}>
                  {handover.settlement.reviewedByName}
                </Descriptions.Item>
                <Descriptions.Item label={t('shiftHandover.reviewedAt')}>
                  {handover.settlement.reviewedAt ? dayjs(handover.settlement.reviewedAt).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>
      )}

      {/* 交接备注 */}
      {handover.remarks && (
        <Card title={t('shiftHandover.remarks')} style={{ marginBottom: 16 }}>
          <Text>{handover.remarks}</Text>
        </Card>
      )}

      {/* 异常记录 */}
      <Card title={t('shiftHandover.issueRecords')} style={{ marginBottom: 16 }}>
        {handover.issues && handover.issues.length > 0 ? (
          <Table
            columns={issueColumns}
            dataSource={handover.issues}
            rowKey="id"
            pagination={false}
            size="small"
          />
        ) : (
          <Empty description={t('shiftHandover.noIssues')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  );
};

export default HandoverDetail;
