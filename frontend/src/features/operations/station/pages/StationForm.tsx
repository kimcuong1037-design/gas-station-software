import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Steps,
  Row,
  Col,
  TreeSelect,
  InputNumber,
  Descriptions,
  Tag,
  Space,
  Typography,
  Divider,
  message,
  Popconfirm,
} from 'antd';
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import type { StationFormData, StationStatus } from '../types';
import { stations } from '../../../../mock/stations';
import { regions } from '../../../../mock/regions';
import { groups } from '../../../../mock/groups';

const { Title, Text } = Typography;
const { TextArea } = Input;

const StationForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<StationFormData>();

  const isEdit = !!id;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<StationFormData>>({});

  // 获取现有站点数据（编辑模式）
  const existingStation = useMemo(() => {
    if (!id) return null;
    return stations.find((s) => s.id === id);
  }, [id]);

  // 初始化表单数据
  useEffect(() => {
    if (existingStation) {
      const initialData: Partial<StationFormData> = {
        codeMode: 'manual',
        code: existingStation.code,
        name: existingStation.name,
        address: existingStation.address,
        latitude: existingStation.latitude,
        longitude: existingStation.longitude,
        contactName: existingStation.contactName,
        contactPhone: existingStation.contactPhone,
        businessHours: existingStation.businessHours,
        regionId: existingStation.regionId,
        groupId: existingStation.groupId,
        status: existingStation.status,
        employeeSyncMode: existingStation.employeeSyncMode,
      };
      form.setFieldsValue(initialData);
      setFormData(initialData);
    } else {
      // 默认值（新增模式）
      form.setFieldsValue({
        codeMode: 'auto',
        status: 'active',
        employeeSyncMode: 'sync',
        businessHours: {
          weekday: '06:00-22:00',
          weekend: '07:00-21:00',
        },
      });
    }
  }, [existingStation, form]);

  // 生成自动编码
  const generateCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const seq = String(stations.length + 1).padStart(4, '0');
    return `ST${year}${month}${day}${seq}`;
  };

  const autoCode = useMemo(() => generateCode(), []);

  // 区域 TreeSelect 数据
  const regionTreeData = useMemo(() => {
    const convert = (items: typeof regions): any[] =>
      items.map((item) => ({
        title: item.name,
        value: item.id,
        key: item.id,
        children: item.children ? convert(item.children) : undefined,
      }));
    return convert(regions);
  }, []);

  // 步骤配置
  const steps = [
    { title: '基础信息', description: '站点名称与编码' },
    { title: '位置信息', description: '地址与区域' },
    { title: '联系与营业', description: '联系方式与营业时间' },
    { title: '确认提交', description: '信息预览' },
  ];

  // 校验当前步骤
  const validateCurrentStep = async (): Promise<boolean> => {
    try {
      const fieldsToValidate: string[][] = [
        ['codeMode', 'code', 'name', 'status'],
        ['address', 'regionId', 'groupId'],
        ['contactName', 'contactPhone', 'employeeSyncMode'],
        [],
      ];
      
      if (fieldsToValidate[currentStep].length > 0) {
        await form.validateFields(fieldsToValidate[currentStep]);
      }
      return true;
    } catch {
      return false;
    }
  };

  // 下一步
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setFormData({ ...formData, ...form.getFieldsValue() });
      setCurrentStep(currentStep + 1);
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      const finalData = { ...formData, ...values };
      
      // 如果是自动生成编码模式，使用自动编码
      if (finalData.codeMode === 'auto') {
        finalData.code = autoCode;
      }

      console.log('提交数据:', finalData);
      message.success(isEdit ? '站点更新成功' : '站点创建成功');
      
      // 返回列表或详情页
      if (isEdit && id) {
        navigate(`/operations/station/${id}`);
      } else {
        navigate('/operations/station');
      }
    } catch (error) {
      message.error('提交失败，请检查表单');
    }
  };

  // 监听编码模式变化
  const codeMode = Form.useWatch('codeMode', form);

  // 渲染步骤 1: 基础信息
  const renderStep1 = () => (
    <div>
      <Title level={5}>基础信息</Title>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item
            name="codeMode"
            label="编码方式"
            rules={[{ required: true }]}
          >
            <Radio.Group disabled={isEdit}>
              <Radio value="auto">自动生成</Radio>
              <Radio value="manual">手工输入</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="code"
            label={t('station.code')}
            rules={[
              { required: codeMode === 'manual', message: '请输入站点编码' },
              { min: 2, max: 32, message: '编码长度 2-32 字符' },
              { pattern: /^[A-Za-z0-9_]+$/, message: '只能包含字母、数字、下划线' },
            ]}
            tooltip={isEdit ? '编码创建后不可修改' : undefined}
          >
            {codeMode === 'auto' ? (
              <Input
                disabled
                placeholder={autoCode}
                addonAfter={<Text type="secondary">自动生成</Text>}
              />
            ) : (
              <Input
                placeholder="请输入站点编码"
                disabled={isEdit}
                maxLength={32}
              />
            )}
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label={t('station.name')}
            rules={[
              { required: true, message: '请输入站点名称' },
              { min: 2, max: 100, message: '名称长度 2-100 字符' },
            ]}
          >
            <Input placeholder="请输入站点名称" maxLength={100} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="status"
            label={t('station.status')}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: t('station.statusActive'), value: 'active' },
                { label: t('station.statusInactive'), value: 'inactive' },
                { label: t('station.statusMaintenance'), value: 'suspended' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  // 渲染步骤 2: 位置信息
  const renderStep2 = () => (
    <div>
      <Title level={5}>位置信息</Title>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item
            name="address"
            label={t('station.address')}
            rules={[
              { required: true, message: '请输入详细地址' },
              { min: 5, max: 255, message: '地址长度 5-255 字符' },
            ]}
          >
            <TextArea
              placeholder="请输入详细地址"
              rows={2}
              maxLength={255}
              showCount
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="latitude"
            label={t('station.latitude')}
            rules={[
              { type: 'number', min: -90, max: 90, message: '纬度范围 -90 到 90' },
            ]}
          >
            <InputNumber
              placeholder="请输入纬度"
              style={{ width: '100%' }}
              step={0.0000001}
              precision={7}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="longitude"
            label={t('station.longitude')}
            rules={[
              { type: 'number', min: -180, max: 180, message: '经度范围 -180 到 180' },
            ]}
          >
            <InputNumber
              placeholder="请输入经度"
              style={{ width: '100%' }}
              step={0.0000001}
              precision={7}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="regionId" label={t('station.region')}>
            <TreeSelect
              placeholder="请选择所属区域"
              treeData={regionTreeData}
              allowClear
              showSearch
              treeNodeFilterProp="title"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="groupId" label={t('station.group')}>
            <Select
              placeholder="请选择所属分组"
              options={groups.map((g) => ({ label: g.name, value: g.id }))}
              allowClear
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  // 渲染步骤 3: 联系与营业
  const renderStep3 = () => (
    <div>
      <Title level={5}>联系与营业</Title>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name="contactName"
            label={t('station.contact')}
            rules={[{ min: 2, max: 50, message: '联系人长度 2-50 字符' }]}
          >
            <Input placeholder="请输入联系人姓名" maxLength={50} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="contactPhone"
            label={t('station.phone')}
            rules={[
              {
                pattern: /^(\d{3,4}-?\d{7,8}|1[3-9]\d{9})$/,
                message: '请输入正确的电话号码',
              },
            ]}
          >
            <Input placeholder="请输入联系电话" maxLength={20} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name={['businessHours', 'weekday']}
            label="工作日营业时间"
          >
            <Input placeholder="如: 06:00-22:00" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name={['businessHours', 'weekend']}
            label="周末营业时间"
          >
            <Input placeholder="如: 07:00-21:00" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="employeeSyncMode"
            label="员工管理模式"
            rules={[{ required: true }]}
            tooltip="同步模式：员工从系统用户同步；本地模式：站点独立维护员工"
          >
            <Radio.Group>
              <Radio value="sync">从用户模块同步</Radio>
              <Radio value="local">本地独立维护</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  // 渲染步骤 4: 确认提交
  const renderStep4 = () => {
    const allData = { ...formData, ...form.getFieldsValue() };
    const findRegionName = (id?: string) => {
      if (!id) return '-';
      const flatRegions: typeof regions = [];
      const flatten = (items: typeof regions) => {
        items.forEach((item) => {
          flatRegions.push(item);
          if (item.children) flatten(item.children);
        });
      };
      flatten(regions);
      return flatRegions.find((r) => r.id === id)?.name || '-';
    };
    const findGroupName = (id?: string) =>
      groups.find((g) => g.id === id)?.name || '-';

    const statusTextMap: Record<StationStatus, string> = {
      active: t('station.statusActive'),
      inactive: t('station.statusInactive'),
      suspended: t('station.statusMaintenance'),
    };

    return (
      <div>
        <Title level={5}>确认信息</Title>
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label={t('station.code')}>
            {allData.codeMode === 'auto' ? autoCode : allData.code}
          </Descriptions.Item>
          <Descriptions.Item label={t('station.name')}>
            {allData.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('station.status')}>
            <Tag color={allData.status === 'active' ? 'green' : allData.status === 'suspended' ? 'orange' : 'default'}>
              {statusTextMap[allData.status as StationStatus] || '-'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('station.address')} span={2}>
            {allData.address}
          </Descriptions.Item>
          {allData.latitude && allData.longitude && (
            <Descriptions.Item label="坐标">
              {allData.latitude}, {allData.longitude}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={t('station.region')}>
            {findRegionName(allData.regionId)}
          </Descriptions.Item>
          <Descriptions.Item label={t('station.group')}>
            {findGroupName(allData.groupId)}
          </Descriptions.Item>
          <Descriptions.Item label={t('station.contact')}>
            {allData.contactName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('station.phone')}>
            {allData.contactPhone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('station.businessHours')}>
            {allData.businessHours ? (
              <Space direction="vertical" size={0}>
                <Text>工作日: {allData.businessHours.weekday}</Text>
                <Text>周末: {allData.businessHours.weekend}</Text>
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="员工管理模式">
            <Tag color={allData.employeeSyncMode === 'sync' ? 'blue' : 'green'}>
              {allData.employeeSyncMode === 'sync' ? '系统同步' : '本地维护'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      case 3:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <Popconfirm
                title="确定要离开吗？未保存的数据将丢失"
                onConfirm={() => navigate(-1)}
              >
                <Button icon={<ArrowLeftOutlined />}>{t('common.back')}</Button>
              </Popconfirm>
              <Title level={4} style={{ marginBottom: 0 }}>
                {isEdit ? t('station.edit') : t('station.add')}
              </Title>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 步骤条 */}
      <Card style={{ marginBottom: 16 }}>
        <Steps
          current={currentStep}
          items={steps.map((step) => ({
            title: step.title,
            description: step.description,
          }))}
        />
      </Card>

      {/* 表单内容 */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            codeMode: 'auto',
            status: 'active',
            employeeSyncMode: 'sync',
          }}
        >
          {renderStepContent()}

          <Divider />

          {/* 操作按钮 */}
          <Row justify="end">
            <Space>
              {currentStep > 0 && (
                <Button onClick={handlePrev}>{t('common.back')}</Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  下一步
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleSubmit}
                >
                  {t('common.save')}
                </Button>
              )}
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default StationForm;
