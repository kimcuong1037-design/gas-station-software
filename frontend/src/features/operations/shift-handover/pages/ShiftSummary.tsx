import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
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
  Tag,
  Divider,
  Alert,
  message,
  theme,
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
  CalendarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import type { CurrentShiftData, PaymentSummaryItem, FuelSummaryItem } from '../types';
import { PAYMENT_METHOD_CONFIG, AUTO_REFRESH_INTERVAL } from '../constants';
import { currentShiftData as mockCurrentShiftData } from '../../../../mock/shiftHandovers';
import { getCurrentShiftSchedule, getNextShiftSchedule } from '../../../../mock/shiftSchedules';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;

interface LayoutContext {
  selectedStationId: string;
  selectedStation?: { id: string; name: string };
}

const ShiftSummary: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedStationId } = useOutletContext<LayoutContext>();
  const { token } = theme.useToken();

  // 状态
  const [shiftData, setShiftData] = useState<CurrentShiftData>(mockCurrentShiftData);
  const [loading, setLoading] = useState(false);
  const [masked, setMasked] = useState(() => {
    return localStorage.getItem('shiftSummary_masked') === 'true';
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Get schedule info
  const currentSchedule = getCurrentShiftSchedule(selectedStationId);
  const nextSchedule = getNextShiftSchedule(selectedStationId);

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

      {/* 页面标题与操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>{t('shiftHandover.overviewTitle')}</Title>
        <Space>
          <Tooltip title={masked ? t('shiftHandover.showAmount') : t('shiftHandover.hideAmount')}>
            <Button
              icon={masked ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={toggleMask}
              aria-label={masked ? t('shiftHandover.showAmount') : t('shiftHandover.hideAmount')}
            />
          </Tooltip>
          <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
            {t('common.refresh')}
          </Button>
        </Space>
      </div>

      {/* 当前班次 + 下一班次 信息栏 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={14}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>{t('shiftHandover.currentShiftInfo')}</span>
              </Space>
            }
            extra={
              <Space>
                <Button icon={<DollarOutlined />} onClick={() => navigate('/operations/shift-handover/settlement-review')}>
                  {t('shiftHandover.cashSettlement')}
                </Button>
                <Button type="primary" icon={<SwapOutlined />} onClick={() => navigate('/operations/shift-handover/handover')}>
                  {t('shiftHandover.startHandover')}
                </Button>
              </Space>
            }
          >
            {currentSchedule ? (
              <Row gutter={16} align="middle">
                <Col>
                  <Tag color="blue" style={{ fontSize: 16, padding: '4px 12px' }}>
                    {currentSchedule.shiftName}
                  </Tag>
                </Col>
                <Col>
                  <Text type="secondary">{currentSchedule.shiftStartTime} - {currentSchedule.shiftEndTime}</Text>
                </Col>
                <Col>
                  <Space>
                    <UserOutlined />
                    <Text strong>{currentSchedule.employeeName}</Text>
                  </Space>
                </Col>
                <Col>
                  <Text type="secondary">
                    {t('shiftHandover.shiftDuration')}: 4{t('shiftHandover.hoursUnit')}30{t('shiftHandover.minutes', '分')}
                  </Text>
                </Col>
              </Row>
            ) : (
              <Alert
                type="warning"
                message={t('shiftHandover.noScheduleHint')}
                action={
                  <Button size="small" type="link" onClick={() => navigate('/operations/shift-handover/schedule')}>
                    {t('shiftHandover.scheduleGoToSchedule')}
                  </Button>
                }
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card
            title={
              <Space>
                <ArrowRightOutlined />
                <span>{t('shiftHandover.nextShiftInfo')}</span>
              </Space>
            }
            extra={
              <Button
                size="small"
                icon={<CalendarOutlined />}
                onClick={() => navigate('/operations/shift-handover/schedule')}
              >
                {t('menu.shiftSchedule')}
              </Button>
            }
          >
            {nextSchedule ? (
              <Row gutter={16} align="middle">
                <Col>
                  <Tag color="green" style={{ fontSize: 14, padding: '2px 8px' }}>
                    {nextSchedule.shiftName}
                  </Tag>
                </Col>
                <Col>
                  <Text type="secondary">{nextSchedule.shiftStartTime} - {nextSchedule.shiftEndTime}</Text>
                </Col>
                <Col>
                  <Space>
                    <UserOutlined />
                    <Text>{nextSchedule.employeeName}</Text>
                    <Tag color="cyan">{t('shiftHandover.scheduled')}</Tag>
                  </Space>
                </Col>
              </Row>
            ) : (
              <Text type="secondary">{t('shiftHandover.noScheduleHint')}</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '8px 0 16px' }} />

      {/* 核心指标区 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t('shiftHandover.totalAmount')}
              value={masked ? '*****' : shiftData.summary.totalAmount}
              precision={2}
              prefix={masked ? '' : '¥'}
              valueStyle={{ color: token.colorPrimary, fontSize: 32 }}
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
              valueStyle={{ color: token.colorSuccess, fontSize: 32 }}
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
                    <FireOutlined style={{ color: fuel.fuelType === 'LNG' ? token.colorError : token.colorPrimary }} />
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
                            <FireOutlined style={{ color: item.fuelType === 'LNG' ? token.colorError : token.colorPrimary }} />
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
        <Row justify="space-between" align="middle" aria-live="polite">
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
