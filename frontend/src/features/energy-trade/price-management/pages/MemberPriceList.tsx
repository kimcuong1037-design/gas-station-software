// P05: 会员专享价列表页 [MVP+]
import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Typography,
  Button,
  Select,
  Table,
  Tag,
  Space,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { memberPriceRules, fuelTypePrices } from '../../../../mock/priceManagement';
import type { MemberPriceRule } from '../types';
import {
  MEMBER_TIER_CONFIG,
  DISCOUNT_TYPE_CONFIG,
  PRICE_STATUS_CONFIG,
  getLabel,
} from '../constants';

const { Title, Text } = Typography;

interface LayoutContext {
  selectedStationId: string;
}

const MemberPriceList: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const fuelTypeOptions = useMemo(() => {
    const types = fuelTypePrices
      .filter((f) => f.stationId === selectedStationId)
      .map((f) => ({ value: f.fuelTypeId, label: f.fuelTypeName }));
    return [{ value: 'all', label: t('price.filter.allFuelTypes', '全部油品') }, ...types];
  }, [selectedStationId, t]);

  const tierOptions = useMemo(() => [
    { value: 'all', label: t('price.filter.allTiers', '全部等级') },
    { value: 'normal', label: t('price.tier.normal', '普通会员') },
    { value: 'vip', label: 'VIP' },
    { value: 'svip', label: 'SVIP' },
  ], [t]);

  const filteredData = useMemo(() => {
    let data = memberPriceRules.filter((r) => r.stationId === selectedStationId);
    if (fuelTypeFilter !== 'all') {
      data = data.filter((r) => r.fuelTypeId === fuelTypeFilter);
    }
    if (tierFilter !== 'all') {
      data = data.filter((r) => r.memberTier === tierFilter);
    }
    return data;
  }, [fuelTypeFilter, tierFilter, selectedStationId]);

  const calculateMemberPrice = (rule: MemberPriceRule) => {
    if (rule.discountType === 'fixed_amount') {
      return rule.basePrice - rule.discountValue;
    }
    return rule.basePrice * (1 - rule.discountValue / 100);
  };

  const columns: ColumnsType<MemberPriceRule> = [
    {
      title: t('price.field.fuelType', '油品'),
      dataIndex: 'fuelTypeName',
      width: 120,
    },
    {
      title: t('price.field.memberTier', '会员等级'),
      dataIndex: 'memberTier',
      width: 120,
      render: (tier: string) => {
        const config = MEMBER_TIER_CONFIG[tier as keyof typeof MEMBER_TIER_CONFIG];
        return config ? <Tag color={config.color}>{getLabel(config)}</Tag> : tier;
      },
    },
    {
      title: t('price.field.basePrice', '基准价'),
      dataIndex: 'basePrice',
      width: 120,
      align: 'right',
      render: (price: number, record) => `¥${price.toFixed(2)}/${record.fuelUnit}`,
    },
    {
      title: t('price.field.discountType', '优惠类型'),
      dataIndex: 'discountType',
      width: 120,
      render: (type: string) => {
        const config = DISCOUNT_TYPE_CONFIG[type as keyof typeof DISCOUNT_TYPE_CONFIG];
        return config ? <Tag color={config.color}>{getLabel(config)}</Tag> : type;
      },
    },
    {
      title: t('price.field.discountValue', '优惠值'),
      dataIndex: 'discountValue',
      width: 100,
      align: 'right',
      render: (val: number, record) =>
        record.discountType === 'fixed_amount'
          ? `¥${val.toFixed(2)}`
          : `${val}%`,
    },
    {
      title: t('price.field.memberPrice', '会员价'),
      key: 'memberPrice',
      width: 130,
      align: 'right',
      render: (_, record) => (
        <Text strong style={{ color: '#faad14' }}>
          ¥{calculateMemberPrice(record).toFixed(2)}/{record.fuelUnit}
        </Text>
      ),
    },
    {
      title: t('price.field.status', '状态'),
      dataIndex: 'status',
      width: 80,
      align: 'center',
      render: (status: string) => {
        const config = PRICE_STATUS_CONFIG[status as keyof typeof PRICE_STATUS_CONFIG];
        return config ? <Tag color={config.color}>{getLabel(config)}</Tag> : status;
      },
    },
    {
      title: t('common.actions', '操作'),
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_: unknown, _record: MemberPriceRule) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => message.info(t('common.comingSoon', '功能即将上线'))}
        >
          {t('common.edit', '编辑')}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {t('price.member.title', '会员专享价')}
          </Title>
          <Tag color="blue">MVP+</Tag>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info(t('common.comingSoon', '功能即将上线'))}>
          {t('price.member.add', '新增规则')}
        </Button>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size={[16, 12]}>
          <Select value={fuelTypeFilter} onChange={setFuelTypeFilter} options={fuelTypeOptions} style={{ width: 160 }} />
          <Select value={tierFilter} onChange={setTierFilter} options={tierOptions} style={{ width: 140 }} />
          <Button onClick={() => { setFuelTypeFilter('all'); setTierFilter('all'); }}>
            {t('common.reset', '重置')}
          </Button>
        </Space>
      </Card>

      <Card>
        <Table<MemberPriceRule>
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
            emptyText: <div style={{ padding: 40 }}><Text type="secondary">{t('price.member.empty', '暂无会员专享价规则')}</Text></div>,
          }}
        />
      </Card>
    </div>
  );
};

export default MemberPriceList;
