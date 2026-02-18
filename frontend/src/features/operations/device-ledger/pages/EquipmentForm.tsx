// P09/P11: 设备台账表单页 (新增/编辑共用)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  Select,
  Form,
  DatePicker,
  InputNumber,
  Space,
  Popconfirm,
  message,
} from 'antd';
import { SaveOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { equipments } from '../../../../mock/equipments';
import { stations } from '../../../../mock/stations';
import type { DeviceType, EquipmentFormData, MaintenanceCycle } from '../types';
import {
  DEVICE_TYPE_CONFIG,
  DEVICE_TYPE_ABBR,
  MAINTENANCE_CYCLE_CONFIG,
  getLabel,
} from '../constants';

const { Title } = Typography;
const { TextArea } = Input;

interface Props {
  mode?: 'create' | 'edit';
}

const EquipmentForm: React.FC<Props> = ({ mode: propMode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  // 判断是编辑还是新增
  const isEdit = propMode === 'edit' || !!id;
  const editRecord = useMemo(() => (isEdit && id ? equipments.find((e) => e.id === id) : undefined), [isEdit, id]);

  const [selectedType, setSelectedType] = useState<DeviceType | undefined>(
    editRecord?.deviceType ?? (searchParams.get('type') as DeviceType) ?? undefined
  );
  const [isModified, setIsModified] = useState(false);

  // 自动生成设备编号
  const generateCode = (type: DeviceType) => {
    const abbr = DEVICE_TYPE_ABBR[type] || 'DEV';
    const existing = equipments.filter((e) => e.deviceType === type);
    const seq = (existing.length + 1).toString().padStart(3, '0');
    return `DEV-${abbr}-${seq}`;
  };

  // 编辑模式填充数据
  useEffect(() => {
    if (editRecord) {
      form.setFieldsValue({
        ...editRecord,
        installDate: editRecord.installDate ? dayjs(editRecord.installDate) : undefined,
        nextMaintenanceDate: editRecord.nextMaintenanceDate ? dayjs(editRecord.nextMaintenanceDate) : undefined,
      });
      setSelectedType(editRecord.deviceType);
    }
  }, [editRecord, form]);

  const handleTypeChange = (type: DeviceType) => {
    setSelectedType(type);
    if (!isEdit) {
      form.setFieldValue('deviceCode', generateCode(type));
    }
    setIsModified(true);
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const data: EquipmentFormData = {
          ...values,
          installDate: values.installDate?.format('YYYY-MM-DD'),
          nextMaintenanceDate: values.nextMaintenanceDate?.format('YYYY-MM-DD'),
        };
        console.log('Save equipment:', data);
        message.success(isEdit ? '设备信息已更新' : '设备已创建');
        navigate('/operations/device-ledger/equipment');
      })
      .catch(() => {
        message.warning('请检查表单必填项');
      });
  };

  const handleSaveAndCreate = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('Save and create next:', values);
        message.success('设备已创建，请继续添加');
        // 保留: deviceType, manufacturer, stationId, maintenanceCycle
        const preserved = {
          deviceType: values.deviceType,
          manufacturer: values.manufacturer,
          stationId: values.stationId,
          maintenanceCycle: values.maintenanceCycle,
        };
        form.resetFields();
        form.setFieldsValue(preserved);
        form.setFieldValue('deviceCode', generateCode(values.deviceType));
        setIsModified(false);
      })
      .catch(() => {
        message.warning('请检查表单必填项');
      });
  };

  const handleCancel = () => {
    if (isModified) return; // Popconfirm will handle
    navigate(-1);
  };

  // 设备类型特有字段
  const renderTypeSpecificFields = () => {
    if (!selectedType) return null;

    switch (selectedType) {
      case 'tank':
        return (
          <>
            <Col span={12}>
              <Form.Item label="容量 (L)" name="capacity">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="例: 60000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="最大工作压力 (MPa)" name="maxPressure">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例: 1.6" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="介质" name="medium">
                <Select
                  placeholder="选择介质类型"
                  options={[
                    { value: 'LNG', label: 'LNG (液化天然气)' },
                    { value: 'CNG', label: 'CNG (压缩天然气)' },
                    { value: 'LPG', label: 'LPG (液化石油气)' },
                  ]}
                />
              </Form.Item>
            </Col>
          </>
        );
      case 'dispenser':
        return (
          <>
            <Col span={12}>
              <Form.Item label="加注口数量" name="nozzleCount">
                <InputNumber min={1} max={8} style={{ width: '100%' }} placeholder="例: 2" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="支持燃料类型" name="fuelTypes">
                <Select
                  mode="multiple"
                  placeholder="选择燃料类型"
                  options={[
                    { value: 'LNG', label: 'LNG' },
                    { value: 'CNG', label: 'CNG' },
                    { value: 'LPG', label: 'LPG' },
                  ]}
                />
              </Form.Item>
            </Col>
          </>
        );
      case 'pump':
      case 'valve':
      case 'sensor':
      case 'fire_equipment':
      case 'electrical':
        return (
          <Col span={24}>
            <Form.Item label="技术规格" name="specification">
              <TextArea rows={3} placeholder="输入设备技术规格参数..." maxLength={500} showCount />
            </Form.Item>
          </Col>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      {/* 页面头部 */}
      <Row align="middle" style={{ marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }} />
        <Title level={4} style={{ margin: 0 }}>
          {isEdit
            ? t('deviceLedger.equipment.edit', '编辑设备')
            : t('deviceLedger.equipment.create', '新增设备')}
        </Title>
      </Row>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => setIsModified(true)}
        initialValues={{
          maintenanceCycle: 'monthly' as MaintenanceCycle,
          stationId: 'station-001',
        }}
      >
        {/* 基础信息 */}
        <Card title="基础信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="设备类型"
                name="deviceType"
                rules={[{ required: true, message: '请选择设备类型' }]}
              >
                <Select
                  placeholder="选择设备类型"
                  disabled={isEdit}
                  onChange={handleTypeChange}
                  options={Object.entries(DEVICE_TYPE_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: `${config.icon} ${getLabel(config)}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="设备编号"
                name="deviceCode"
                rules={[{ required: true, message: '请输入设备编号' }]}
              >
                <Input placeholder="自动生成" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="设备名称"
                name="name"
                rules={[{ required: true, message: '请输入设备名称' }]}
              >
                <Input placeholder="例: 1号LNG储罐" maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所属站点" name="stationId" rules={[{ required: true, message: '请选择站点' }]}>
                <Select
                  placeholder="选择站点"
                  disabled={isEdit}
                  options={stations.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 设备参数 */}
        <Card title="设备参数" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="型号" name="model">
                <Input placeholder="例: WNS-T60A" maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="厂商" name="manufacturer">
                <Input placeholder="输入设备厂商" maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="安装日期" name="installDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="序列号" name="serialNumber">
                <Input placeholder="输入产品序列号" maxLength={100} />
              </Form.Item>
            </Col>
            {renderTypeSpecificFields()}
          </Row>
        </Card>

        {/* 维保设置 */}
        <Card title="维保设置" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="维保周期" name="maintenanceCycle">
                <Select
                  options={Object.entries(MAINTENANCE_CYCLE_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: getLabel(config),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="下次维保日期" name="nextMaintenanceDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 备注 */}
        <Card title="备注" style={{ marginBottom: 24 }}>
          <Form.Item name="remark">
            <TextArea rows={3} placeholder="输入备注信息..." maxLength={500} showCount />
          </Form.Item>
        </Card>

        {/* 操作按钮 */}
        <Row justify="end">
          <Space>
            {isModified ? (
              <Popconfirm title="放弃未保存的内容？" onConfirm={() => navigate(-1)}>
                <Button>{t('common.cancel', '取消')}</Button>
              </Popconfirm>
            ) : (
              <Button onClick={handleCancel}>{t('common.cancel', '取消')}</Button>
            )}
            {!isEdit && (
              <Button icon={<PlusOutlined />} onClick={handleSaveAndCreate}>
                保存并创建下一条
              </Button>
            )}
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              {isEdit ? t('common.save', '保存') : t('common.create', '创建')}
            </Button>
          </Space>
        </Row>
      </Form>
    </div>
  );
};

export default EquipmentForm;
