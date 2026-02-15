import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Steps,
  Button,
  Row,
  Col,
  Space,
  Typography,
  Checkbox,
  List,
  Statistic,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Modal,
  Alert,
  Table,
  Tag,
  Divider,
  Result,
} from 'antd';
import {
  CheckOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  FireOutlined,
} from '@ant-design/icons';
import type { PrecheckItem, PaymentSummaryItem, FuelSummaryItem } from '../types';
import { PAYMENT_METHOD_CONFIG } from '../constants';
import { currentShiftData, precheckItems } from '../../../../mock/shiftHandovers';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

interface SettlementForm {
  actualAmount: number;
  settlementMethod: string;
  differenceNote?: string;
}

const ShiftHandoverWizard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 当前步骤
  const [currentStep, setCurrentStep] = useState<number>(0);
  // 预检项状态
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  // 现金解缴表单
  const [form] = Form.useForm<SettlementForm>();
  // 交接备注
  const [remarks, setRemarks] = useState<string>('');
  // 提交状态
  const [submitting, setSubmitting] = useState(false);
  // 完成状态
  const [completed, setCompleted] = useState(false);
  // 生成的交接单号
  const [handoverNo, setHandoverNo] = useState<string>('');

  // 步骤定义
  const steps = [
    { title: t('shiftHandover.stepPrecheck'), key: 'precheck' },
    { title: t('shiftHandover.stepSummary'), key: 'summary' },
    { title: t('shiftHandover.stepSettlement'), key: 'settlement' },
    { title: t('shiftHandover.stepConfirm'), key: 'confirm' },
  ];

  // 计算预检完成状态
  const requiredItems = useMemo(
    () => precheckItems.filter((item) => item.required),
    []
  );
  const allRequiredChecked = useMemo(
    () => requiredItems.every((item) => checkedItems[item.id]),
    [requiredItems, checkedItems]
  );

  // 现金支付金额(应缴金额)
  const expectedCashAmount = useMemo(() => {
    const cashPayment = currentShiftData.paymentSummary.find(
      (item) => item.paymentMethod === 'cash'
    );
    return cashPayment?.amount || 0;
  }, []);

  // 全选预检项
  const handleCheckAll = () => {
    const newChecked: Record<string, boolean> = {};
    precheckItems.forEach((item) => {
      newChecked[item.id] = true;
    });
    setCheckedItems(newChecked);
  };

  // 下一步
  const handleNext = () => {
    if (currentStep === 0 && !allRequiredChecked) {
      message.warning(t('shiftHandover.completeRequiredItems'));
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // 取消交接
  const handleCancel = () => {
    confirm({
      title: t('shiftHandover.confirmCancel'),
      icon: <ExclamationCircleOutlined />,
      content: t('shiftHandover.cancelWarning'),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk() {
        navigate('/operations/shift-handover');
      },
    });
  };

  // 提交交接
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // 模拟提交
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // 生成交接单号
      const no = `HO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      setHandoverNo(no);
      setCompleted(true);
      message.success(t('shiftHandover.submitSuccess'));
    } catch {
      message.error(t('shiftHandover.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  // 强制交接
  const handleForceHandover = () => {
    confirm({
      title: t('shiftHandover.forceHandoverTitle'),
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
      content: t('shiftHandover.forceHandoverWarning'),
      okText: t('shiftHandover.confirmForce'),
      okButtonProps: { danger: true },
      cancelText: t('common.cancel'),
      onOk() {
        handleSubmit();
      },
    });
  };

  // 渲染预检步骤
  const renderPrecheckStep = () => (
    <div className="precheck-step">
      <Alert
        message={t('shiftHandover.precheckTip')}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <List
        dataSource={precheckItems}
        renderItem={(item: PrecheckItem) => (
          <List.Item>
            <Checkbox
              checked={checkedItems[item.id]}
              onChange={(e) =>
                setCheckedItems({ ...checkedItems, [item.id]: e.target.checked })
              }
            >
              <Space>
                <Text>{item.name}</Text>
                {item.required && <Text type="danger">*</Text>}
              </Space>
            </Checkbox>
          </List.Item>
        )}
      />
      <Row justify="end" style={{ marginTop: 16 }}>
        <Button type="link" onClick={handleCheckAll}>
          {t('shiftHandover.checkAll')}
        </Button>
      </Row>
    </div>
  );

  // 渲染销售汇总步骤
  const renderSummaryStep = () => (
    <div className="summary-step">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Statistic
            title={t('shiftHandover.totalAmount')}
            value={currentShiftData.summary.totalAmount}
            precision={2}
            prefix="¥"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title={t('shiftHandover.totalOrders')}
            value={currentShiftData.summary.totalOrders}
            suffix={t('shiftHandover.ordersUnit')}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title={t('shiftHandover.abnormalCount')}
            value={currentShiftData.summary.refundOrders}
            valueStyle={{ color: currentShiftData.summary.refundOrders > 0 ? '#faad14' : '#52c41a' }}
          />
        </Col>
      </Row>

      <Divider />

      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Title level={5}>{t('shiftHandover.byPaymentMethod')}</Title>
          <Table
            dataSource={currentShiftData.paymentSummary}
            rowKey="paymentMethod"
            pagination={false}
            size="small"
            columns={[
              {
                title: t('shiftHandover.paymentMethod'),
                dataIndex: 'paymentMethod',
                render: (method: string, record: PaymentSummaryItem) => {
                  const config = PAYMENT_METHOD_CONFIG[method as keyof typeof PAYMENT_METHOD_CONFIG];
                  return config?.label || record.paymentMethodName;
                },
              },
              {
                title: t('shiftHandover.orders'),
                dataIndex: 'orders',
                align: 'right',
              },
              {
                title: t('shiftHandover.amount'),
                dataIndex: 'amount',
                align: 'right',
                render: (val: number) => `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
              },
            ]}
          />
        </Col>
        <Col xs={24} md={12}>
          <Title level={5}>{t('shiftHandover.byFuelType')}</Title>
          <Table
            dataSource={currentShiftData.fuelSummary}
            rowKey="fuelType"
            pagination={false}
            size="small"
            columns={[
              {
                title: t('shiftHandover.fuelType'),
                dataIndex: 'fuelTypeName',
                render: (name: string, record: FuelSummaryItem) => (
                  <Space>
                    <FireOutlined style={{ color: record.fuelType === 'LNG' ? '#f5222d' : '#1890ff' }} />
                    {name}
                  </Space>
                ),
              },
              {
                title: t('shiftHandover.quantity'),
                dataIndex: 'quantity',
                align: 'right',
                render: (val: number, record: FuelSummaryItem) => `${val.toLocaleString()} ${record.unit}`,
              },
              {
                title: t('shiftHandover.amount'),
                dataIndex: 'amount',
                align: 'right',
                render: (val: number) => `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  );

  // 渲染现金解缴步骤
  const renderSettlementStep = () => (
    <div className="settlement-step">
      <Alert
        message={t('shiftHandover.settlementTip')}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Statistic
            title={t('shiftHandover.expectedAmount')}
            value={expectedCashAmount}
            precision={2}
            prefix="¥"
            valueStyle={{ color: '#1890ff', fontSize: 28 }}
          />
        </Col>
      </Row>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          actualAmount: expectedCashAmount,
          settlementMethod: 'cash_box',
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="actualAmount"
              label={t('shiftHandover.actualAmount')}
              rules={[{ required: true, message: t('shiftHandover.enterActualAmount') }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                precision={2}
                min={0}
                prefix="¥"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="settlementMethod"
              label={t('shiftHandover.settlementMethod')}
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Select.Option value="cash_box">{t('shiftHandover.methodCashBox')}</Select.Option>
                <Select.Option value="safe">{t('shiftHandover.methodSafe')}</Select.Option>
                <Select.Option value="bank">{t('shiftHandover.methodBank')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.actualAmount !== cur.actualAmount}
        >
          {({ getFieldValue }) => {
            const actualAmount = getFieldValue('actualAmount') || 0;
            const difference = actualAmount - expectedCashAmount;
            if (Math.abs(difference) >= 0.01) {
              return (
                <>
                  <Alert
                    message={
                      difference > 0
                        ? t('shiftHandover.overage', { amount: difference.toFixed(2) })
                        : t('shiftHandover.shortage', { amount: Math.abs(difference).toFixed(2) })
                    }
                    type={difference > 0 ? 'success' : 'warning'}
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Form.Item
                    name="differenceNote"
                    label={t('shiftHandover.differenceReason')}
                    rules={[{ required: Math.abs(difference) > 10, message: t('shiftHandover.enterDifferenceReason') }]}
                  >
                    <TextArea rows={3} placeholder={t('shiftHandover.differenceReasonPlaceholder')} />
                  </Form.Item>
                </>
              );
            }
            return null;
          }}
        </Form.Item>
      </Form>
    </div>
  );

  // 渲染确认步骤
  const renderConfirmStep = () => {
    const formValues = form.getFieldsValue();
    const difference = (formValues.actualAmount || 0) - expectedCashAmount;

    return (
      <div className="confirm-step">
        <Alert
          message={t('shiftHandover.confirmTip')}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>{t('shiftHandover.shiftInfo')}</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">{t('shiftHandover.stationName')}: </Text>
              <Text strong>{currentShiftData.station.name}</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">{t('shiftHandover.shiftName')}: </Text>
              <Tag>{currentShiftData.shift.name}</Tag>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Text type="secondary">{t('shiftHandover.shiftDate')}: </Text>
              <Text>{currentShiftData.shift.startTime.slice(0, 10)}</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">{t('shiftHandover.shiftTime')}: </Text>
              <Text>{currentShiftData.shift.startTime.slice(11, 16)} - {currentShiftData.shift.endTime.slice(11, 16)}</Text>
            </Col>
          </Row>
        </Card>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>{t('shiftHandover.salesSummary')}</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title={t('shiftHandover.totalAmount')}
                value={currentShiftData.summary.totalAmount}
                precision={2}
                prefix="¥"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={t('shiftHandover.totalOrders')}
                value={currentShiftData.summary.totalOrders}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={t('shiftHandover.abnormalCount')}
                value={currentShiftData.summary.refundOrders}
                valueStyle={{ color: currentShiftData.summary.refundOrders > 0 ? '#faad14' : '#52c41a' }}
              />
            </Col>
          </Row>
        </Card>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>{t('shiftHandover.cashSettlement')}</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title={t('shiftHandover.expectedAmount')}
                value={expectedCashAmount}
                precision={2}
                prefix="¥"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={t('shiftHandover.actualAmount')}
                value={formValues.actualAmount || 0}
                precision={2}
                prefix="¥"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={t('shiftHandover.difference')}
                value={difference}
                precision={2}
                prefix="¥"
                valueStyle={{
                  color: Math.abs(difference) < 0.01 ? '#52c41a' : difference > 0 ? '#1890ff' : '#ff4d4f',
                }}
              />
            </Col>
          </Row>
        </Card>

        <Form.Item label={t('shiftHandover.remarks')}>
          <TextArea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={t('shiftHandover.remarksPlaceholder')}
          />
        </Form.Item>
      </div>
    );
  };

  // 渲染完成结果
  const renderComplete = () => (
    <Result
      status="success"
      title={t('shiftHandover.handoverSuccess')}
      subTitle={
        <Space direction="vertical">
          <Text>{t('shiftHandover.handoverNo')}: <Text strong copyable>{handoverNo}</Text></Text>
          <Text type="secondary">{t('shiftHandover.handoverSuccessTip')}</Text>
        </Space>
      }
      extra={[
        <Button
          type="primary"
          key="view"
          onClick={() => navigate(`/operations/shift-handover/detail/${handoverNo}`)}
        >
          {t('shiftHandover.viewDetail')}
        </Button>,
        <Button
          key="back"
          onClick={() => navigate('/operations/shift-handover')}
        >
          {t('shiftHandover.backToSummary')}
        </Button>,
      ]}
    />
  );

  // 渲染当前步骤内容
  const renderStepContent = () => {
    if (completed) {
      return renderComplete();
    }

    switch (currentStep) {
      case 0:
        return renderPrecheckStep();
      case 1:
        return renderSummaryStep();
      case 2:
        return renderSettlementStep();
      case 3:
        return renderConfirmStep();
      default:
        return null;
    }
  };

  // 渲染底部按钮
  const renderFooter = () => {
    if (completed) {
      return null;
    }

    return (
      <Row justify="space-between" style={{ marginTop: 24 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              {t('shiftHandover.cancelHandover')}
            </Button>
            {currentStep === 0 && !allRequiredChecked && (
              <Button danger icon={<WarningOutlined />} onClick={handleForceHandover}>
                {t('shiftHandover.forceHandover')}
              </Button>
            )}
          </Space>
        </Col>
        <Col>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>{t('common.prevStep')}</Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={handleNext}>
                {t('common.nextStep')}
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleSubmit}
                loading={submitting}
              >
                {t('shiftHandover.confirmSubmit')}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    );
  };

  return (
    <div className="shift-handover-wizard-page">
      <Card>
        <Title level={4}>{t('shiftHandover.wizardTitle')}</Title>
        <Paragraph type="secondary">{t('shiftHandover.wizardSubtitle')}</Paragraph>

        {!completed && (
          <Steps
            current={currentStep}
            items={steps.map((step) => ({ title: step.title }))}
            style={{ marginBottom: 32 }}
          />
        )}

        <div className="step-content" style={{ minHeight: 400 }}>
          {renderStepContent()}
        </div>

        {renderFooter()}
      </Card>
    </div>
  );
};

export default ShiftHandoverWizard;
