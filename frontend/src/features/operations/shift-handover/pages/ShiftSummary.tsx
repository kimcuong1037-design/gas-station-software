import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Typography,
  Space,
  Progress,
  List,
  Badge,
  Tooltip,
  message,
} from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SwapOutlined,
  DollarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { CurrentShiftData, PaymentSummaryItem, FuelSummaryItem } from '../types';
import { PAYMENT_METHOD_CONFIG, AUTO_REFRESH_INTERVAL } from '../constants';
import { currentShiftData as mockCurrentShiftData } from '../../../../mock/shiftHandovers';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Text } = Typography;

const ShiftSummary: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 状态
  const [shiftData, setShiftData] = useState<CurrentShiftData>(mockCurrentShiftData);
  const [loading, setLoading] = useState(false);
  const [masked, setMasked] = useState(() => {
    return localStorage.getItem('shiftSummary_masked') === 'true';
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 刷新数据
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      setShiftData(mockCurrentShiftData);
      setLastUpdated(new Date());
      message.success(t('shiftHandover.dataRefreshed'));
    } catch {
      message.error(t('shiftHandover.refreshFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // 自动刷新
  useEffect(() => {
    const timer = setInterval(() => {
      refreshData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, [refreshData]);

  // 切换脱敏状态
  const toggleMask = () => {
    const newValue = !masked;
    setMasked(newValue);
    localStorage.setItem('shiftSummary_masked', String(newValue));
  };

  // 格式化金额
  const formatAmount = (amount: number): string => {
    if (masked) return '*****';
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
  };

  // 计算较上班次变化
  const calculateChange = (current: number, previous?: number) => {
    if (!previous || masked) return null;
    const diff = current - previous;
    const percent = ((diff / previous) * 100).toFixed(1);
    return {
      diff,
      percent,
      isPositive: diff >= 0,
    };
  };

  const amountChange = calculateChange(shiftData.summary.totalAmount, shiftData.previousShift?.totalAmount);
  const ordersChange = calculateChange(shiftData.summary.totalOrders, shiftData.previousShift?.totalOrders);

  // 计算支付方式百分比
  const totalPayment = shiftData.paymentSummary.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="shift-summary-page">
      {/* 页面级需求标记 */}
      <div style={{ marginBottom: 8 }}>
        <RequirementTag componentId="shift-summary" module="shift-handover" showDetail />
      </div>

      {/* 班次信息栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Space>
                <ClockCircleOutlined />
                <Text strong>{shiftData.shift.name}</Text>
                <Text type="secondary">
                  ({shiftData.shift.startTime.split('T')[1]?.slice(0, 5)} -{' '}
                  {shiftData.shift.endTime.split('T')[1]?.slice(0, 5)})
                </Text>
              </Space>
              <Space>
                <UserOutlined />
                <Text>{shiftData.shift.supervisor}</Text>
              </Space>
              <Space>
                <EnvironmentOutlined />
                <Text>{shiftData.station.name}</Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title={masked ? t('shiftHandover.showAmount') : t('shiftHandover.hideAmount')}>
                <Button
                  icon={masked ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={toggleMask}
                />
              </Tooltip>
              <RequirementTag componentId="amount-mask-toggle" module="shift-handover" />
              <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
                {t('common.refresh')}
              </Button>
              <RequirementTag componentId="data-refresh-button" module="shift-handover" />
              <Button icon={<DollarOutlined />} onClick={() => navigate('/operations/shift-handover/settlement')}>
                {t('shiftHandover.cashSettlement')}
              </Button>
              <Button type="primary" icon={<SwapOutlined />} onClick={() => navigate('/operations/shift-handover/handover')}>
                {t('shiftHandover.handover')}
              </Button>
              <RequirementTag componentId="start-handover-button" module="shift-handover" />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 核心指标区 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t('shiftHandover.totalAmount')}
              value={masked ? '*****' : shiftData.summary.totalAmount}
              precision={2}
              prefix={masked ? '' : '¥'}
              valueStyle={{ color: '#1890ff', fontSize: 32 }}
            />
            {amountChange && (
              <Text type={amountChange.isPositive ? 'success' : 'danger'}>
                {amountChange.isPositive ? '+' : ''}
                {formatAmount(amountChange.diff)} ({amountChange.percent}%)
              </Text>
            )}
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              {t('shiftHandover.comparedToPrevious')}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t('shiftHandover.totalOrders')}
              value={shiftData.summary.totalOrders}
              valueStyle={{ color: '#52c41a', fontSize: 32 }}
              suffix={t('shiftHandover.ordersUnit')}
            />
            {ordersChange && (
              <Text type={ordersChange.isPositive ? 'success' : 'danger'}>
                {ordersChange.isPositive ? '+' : ''}{ordersChange.diff} {t('shiftHandover.ordersUnit')} ({ordersChange.percent}%)
              </Text>
            )}
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              {t('shiftHandover.comparedToPrevious')}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t('shiftHandover.fuelQuantity')}
              value=""
              valueStyle={{ fontSize: 32 }}
            />
            <div style={{ marginTop: 8 }}>
              {shiftData.fuelSummary.map((fuel: FuelSummaryItem) => (
                <div key={fuel.fuelType} style={{ marginBottom: 4 }}>
                  <Space>
                    <FireOutlined style={{ color: fuel.fuelType === 'LNG' ? '#f5222d' : '#1890ff' }} />
                    <Text strong>{fuel.fuelTypeName}:</Text>
                    <Text>{fuel.quantity.toLocaleString()} {fuel.unit}</Text>
                  </Space>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 明细区 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 支付方式明细 */}
        <Col xs={24} lg={12}>
          <Card title={t('shiftHandover.byPaymentMethod')}>
            <List
              dataSource={shiftData.paymentSummary}
              renderItem={(item: PaymentSummaryItem) => {
                const config = PAYMENT_METHOD_CONFIG[item.paymentMethod];
                const percent = totalPayment > 0 ? (item.amount / totalPayment) * 100 : 0;
                return (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <Row justify="space-between" align="middle">
                        <Col span={6}>
                          <Space>
                            <Text strong>{config?.label || item.paymentMethodName}</Text>
                          </Space>
                        </Col>
                        <Col span={6} style={{ textAlign: 'right' }}>
                          <Text strong>{formatAmount(item.amount)}</Text>
                        </Col>
                        <Col span={4} style={{ textAlign: 'center' }}>
                          <Text type="secondary">{item.orders}{t('shiftHandover.ordersUnit')}</Text>
                        </Col>
                        <Col span={8}>
                          <Progress
                            percent={percent}
                            showInfo={!masked}
                            format={(val) => `${val?.toFixed(1)}%`}
                            size="small"
                          />
                        </Col>
                      </Row>
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        {/* 燃料类型明细 */}
        <Col xs={24} lg={12}>
          <Card title={t('shiftHandover.byFuelType')}>
            <List
              dataSource={shiftData.fuelSummary}
              renderItem={(item: FuelSummaryItem) => {
                const totalFuelAmount = shiftData.fuelSummary.reduce((sum, f) => sum + f.amount, 0);
                const percent = totalFuelAmount > 0 ? (item.amount / totalFuelAmount) * 100 : 0;
                return (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <Row justify="space-between" align="middle">
                        <Col span={8}>
                          <Space>
                            <FireOutlined style={{ color: item.fuelType === 'LNG' ? '#f5222d' : '#1890ff' }} />
                            <Text strong>{item.fuelTypeName}</Text>
                          </Space>
                        </Col>
                        <Col span={6} style={{ textAlign: 'center' }}>
                          <Text>{item.quantity.toLocaleString()} {item.unit}</Text>
                        </Col>
                        <Col span={5} style={{ textAlign: 'right' }}>
                          <Text strong>{formatAmount(item.amount)}</Text>
                        </Col>
                        <Col span={5} style={{ textAlign: 'right' }}>
                          <Text type="secondary">{masked ? '**' : percent.toFixed(1)}%</Text>
                        </Col>
                      </Row>
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 底部状态栏 */}
      <Card size="small" style={{ marginTop: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text type="secondary">
                {t('shiftHandover.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
              </Text>
              <Text type="secondary">
                {t('shiftHandover.autoRefresh')}: {AUTO_REFRESH_INTERVAL / 1000}{t('shiftHandover.seconds')}
              </Text>
            </Space>
          </Col>
          <Col>
            {shiftData.unsettledCash > 0 && (
              <Badge status="warning" text={
                <Text type="warning">
                  {t('shiftHandover.unsettledCash')}: {formatAmount(shiftData.unsettledCash)}
                </Text>
              } />
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ShiftSummary;
