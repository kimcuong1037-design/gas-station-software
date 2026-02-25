// P06: 价格协议列表页 [MVP+]
import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Typography,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Space,
  Drawer,
  Descriptions,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { priceAgreements } from '../../../../mock/priceManagement';
import type { PriceAgreement } from '../types';
import { AGREEMENT_STATUS_CONFIG, getLabel } from '../constants';

const { Title, Text } = Typography;

interface LayoutContext {
  selectedStationId: string;
}

const AgreementList: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const statusOptions = useMemo(() => [
    { value: 'all', label: t('price.filter.allStatus', '全部状态') },
    { value: 'active', label: t('price.agreementStatus.active', '生效中') },
    { value: 'expired', label: t('price.agreementStatus.expired', '已过期') },
    { value: 'terminated', label: t('price.agreementStatus.terminated', '已终止') },
  ], [t]);

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<PriceAgreement | null>(null);

  const filteredData = useMemo(() => {
    let data = priceAgreements.filter((a) => a.stationId === selectedStationId);

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      data = data.filter(
        (a) =>
          a.enterpriseName.toLowerCase().includes(kw) ||
          a.fuelTypeName.toLowerCase().includes(kw),
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter((a) => a.status === statusFilter);
    }

    return data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [keyword, statusFilter, selectedStationId]);

  const isExpiringSoon = (validTo: string) => {
    return dayjs(validTo).diff(dayjs(), 'day') <= 30 && dayjs(validTo).isAfter(dayjs());
  };

  const handleViewDetail = (record: PriceAgreement) => {
    setSelectedAgreement(record);
    setDetailVisible(true);
  };

  const columns: ColumnsType<PriceAgreement> = [
    {
      title: t('price.agreement.enterprise', '企业名称'),
      dataIndex: 'enterpriseName',
      width: 200,
      render: (name: string, record) => (
        <Space>
          <Text strong>{name}</Text>
          {record.status === 'active' && isExpiringSoon(record.validTo) && (
            <Tag color="warning" icon={<WarningOutlined />}>{t('price.agreement.expiringSoon', '即将到期')}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('price.field.fuelType', '油品'),
      dataIndex: 'fuelTypeName',
      width: 100,
    },
    {
      title: t('price.agreement.agreedPrice', '协议价'),
      dataIndex: 'agreedPrice',
      width: 130,
      align: 'right',
      render: (price: number, record) => (
        <Text strong style={{ color: '#1890ff' }}>
          ¥{price.toFixed(2)}/{record.fuelUnit}
        </Text>
      ),
    },
    {
      title: t('price.field.basePrice', '基准价'),
      dataIndex: 'basePrice',
      width: 120,
      align: 'right',
      render: (price: number, record) => `¥${price.toFixed(2)}/${record.fuelUnit}`,
    },
    {
      title: t('price.agreement.discount', '优惠幅度'),
      key: 'discount',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const diff = record.basePrice - record.agreedPrice;
        return <Text style={{ color: '#52c41a' }}>-¥{diff.toFixed(2)}</Text>;
      },
    },
    {
      title: t('price.agreement.period', '有效期'),
      key: 'period',
      width: 200,
      render: (_, record) => (
        <Text>
          {dayjs(record.validFrom).format('YYYY-MM-DD')} ~ {dayjs(record.validTo).format('YYYY-MM-DD')}
        </Text>
      ),
    },
    {
      title: t('price.field.status', '状态'),
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const config = AGREEMENT_STATUS_CONFIG[status as keyof typeof AGREEMENT_STATUS_CONFIG];
        return config ? <Tag color={config.color}>{getLabel(config)}</Tag> : status;
      },
    },
    {
      title: t('common.actions', '操作'),
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
          {t('common.view', '查看')}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {t('price.agreement.title', '价格协议')}
          </Title>
          <Tag color="blue">MVP+</Tag>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info(t('common.comingSoon', '功能即将上线'))}>
          {t('price.agreement.add', '新增协议')}
        </Button>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size={[16, 12]}>
          <Input
            placeholder={t('price.agreement.searchPlaceholder', '搜索企业名称/油品')}
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} style={{ width: 140 }} />
          <Button onClick={() => { setKeyword(''); setStatusFilter('all'); }}>
            {t('common.reset', '重置')}
          </Button>
        </Space>
      </Card>

      <Card>
        <Table<PriceAgreement>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `${t('common.total', '共')} ${total} ${t('common.records', '条')}`,
          }}
          locale={{
            emptyText: <div style={{ padding: 40 }}><Text type="secondary">{t('price.agreement.empty', '暂无价格协议')}</Text></div>,
          }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={t('price.agreement.detailTitle', '协议详情')}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={560}
      >
        {selectedAgreement && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('price.agreement.enterprise', '企业名称')}>
              {selectedAgreement.enterpriseName}
            </Descriptions.Item>
            <Descriptions.Item label={t('price.field.fuelType', '油品')}>
              {selectedAgreement.fuelTypeName}
            </Descriptions.Item>
            <Descriptions.Item label={t('price.agreement.agreedPrice', '协议价')}>
              <Text strong style={{ color: '#1890ff' }}>
                ¥{selectedAgreement.agreedPrice.toFixed(2)}/{selectedAgreement.fuelUnit}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('price.field.basePrice', '基准价')}>
              ¥{selectedAgreement.basePrice.toFixed(2)}/{selectedAgreement.fuelUnit}
            </Descriptions.Item>
            <Descriptions.Item label={t('price.agreement.discount', '优惠幅度')}>
              <Text style={{ color: '#52c41a' }}>
                -¥{(selectedAgreement.basePrice - selectedAgreement.agreedPrice).toFixed(2)}/{selectedAgreement.fuelUnit}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('price.agreement.period', '有效期')}>
              {dayjs(selectedAgreement.validFrom).format('YYYY-MM-DD')} ~ {dayjs(selectedAgreement.validTo).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label={t('price.field.status', '状态')}>
              {(() => {
                const config = AGREEMENT_STATUS_CONFIG[selectedAgreement.status];
                return <Tag color={config.color}>{getLabel(config)}</Tag>;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label={t('price.field.createdBy', '创建人')}>
              {selectedAgreement.createdByName}
            </Descriptions.Item>
            <Descriptions.Item label={t('price.field.createdAt', '创建时间')}>
              {dayjs(selectedAgreement.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            {selectedAgreement.terminationReason && (
              <Descriptions.Item label={t('price.agreement.terminationReason', '终止原因')}>
                {selectedAgreement.terminationReason}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default AgreementList;
