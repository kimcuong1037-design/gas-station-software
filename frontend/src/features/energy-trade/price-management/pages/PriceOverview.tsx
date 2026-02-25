// P01: 价格总览页 - 默认落地页
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Collapse,
  Popconfirm,
  message,
} from 'antd';
import {
  DashboardOutlined,
  ScheduleOutlined,
  BranchesOutlined,
  FundViewOutlined,
  EditOutlined,
  UndoOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getPriceOverviewData } from '../../../../mock/priceManagement';
import type {
  FuelTypePriceWithNozzles,
  NozzlePrice,
  PriceAdjustment,
} from '../types';
import {
  ADJUSTMENT_STATUS_CONFIG,
  ADJUSTMENT_TYPE_CONFIG,
  PRICE_STATUS_CONFIG,
  getLabel,
} from '../constants';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;

interface LayoutContext {
  selectedStationId: string;
}

const PriceOverview: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const [loading] = useState(false);

  const overviewData = useMemo(() => {
    return getPriceOverviewData(selectedStationId);
  }, [selectedStationId]);

  const handleAdjustFuelType = useCallback((_record: FuelTypePriceWithNozzles) => {
    message.info(t('common.comingSoon', '功能即将上线'));
  }, []);

  const handleNozzleOverride = useCallback((nozzle: NozzlePrice) => {
    message.info(`${t('price.field.nozzleNo', '枪号')} ${nozzle.nozzleNo} ${t('common.comingSoon', '功能即将上线')}`);
  }, []);

  const handleNozzleRestore = useCallback((nozzle: NozzlePrice, _fuelTypeName: string) => {
    message.success(`${t('price.field.nozzleNo', '枪号')} ${nozzle.nozzleNo} ${t('price.action.restored', '已恢复基准价')}`);
  }, []);

  const handleGoToBoard = useCallback(() => {
    navigate('/energy-trade/price-management/board');
  }, [navigate]);

  // ============================================================
  // Stat cards
  // ============================================================
  const statCards = useMemo(() => [
    {
      key: 'fuelTypes',
      title: t('price.overview.fuelTypes', '在售油品'),
      value: overviewData.fuelTypeCount,
      suffix: t('price.unit.types', '种'),
      icon: <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      color: '#e6f7ff',
    },
    {
      key: 'overrides',
      title: t('price.overview.overrides', '独立定价枪'),
      value: overviewData.overrideNozzleCount,
      suffix: t('price.unit.nozzles', '把'),
      icon: <BranchesOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      color: '#fffbe6',
    },
    {
      key: 'pending',
      title: t('price.overview.pending', '待生效调价'),
      value: overviewData.pendingScheduleCount,
      suffix: t('price.unit.items', '条'),
      icon: <ScheduleOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      color: '#f9f0ff',
    },
    {
      key: 'board',
      title: t('price.overview.board', '价格公示'),
      value: null as number | null,
      suffix: '',
      icon: <FundViewOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
      color: '#e6fffb',
      action: (
        <Button type="link" size="small" onClick={handleGoToBoard}>
          {t('price.overview.viewBoard', '查看看板')} &rarr;
        </Button>
      ),
    },
  ], [overviewData, handleGoToBoard, t]);

  // ============================================================
  // Pending adjustments
  // ============================================================
  const pendingAdjustments = overviewData.pendingAdjustments || [];

  const pendingColumns: ColumnsType<PriceAdjustment> = [
    {
      title: t('price.field.adjustmentNo', '调价单号'),
      dataIndex: 'adjustmentNo',
      width: 180,
      render: (text: string) => <Text copyable={{ text }}>{text}</Text>,
    },
    {
      title: t('price.field.fuelType', '油品'),
      dataIndex: 'fuelTypeName',
      width: 100,
    },
    {
      title: t('price.field.adjustmentType', '调价类型'),
      dataIndex: 'adjustmentType',
      width: 100,
      render: (type: string) => {
        const config = ADJUSTMENT_TYPE_CONFIG[type as keyof typeof ADJUSTMENT_TYPE_CONFIG];
        return config ? <Tag color={config.color}>{getLabel(config)}</Tag> : type;
      },
    },
    {
      title: t('price.field.newPrice', '新价格'),
      dataIndex: 'newPrice',
      width: 120,
      render: (price: number, record) => (
        <Text strong style={{ color: '#1890ff' }}>
          {price.toFixed(2)} {t('price.unit.yuan', '元')}/{record.fuelUnit}
        </Text>
      ),
    },
    {
      title: t('price.field.effectiveAt', '生效时间'),
      dataIndex: 'effectiveAt',
      width: 170,
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#722ed1' }} />
          <Text>{dayjs(date).format('YYYY-MM-DD HH:mm')}</Text>
        </Space>
      ),
    },
    {
      title: t('price.field.status', '状态'),
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const config = ADJUSTMENT_STATUS_CONFIG[status as keyof typeof ADJUSTMENT_STATUS_CONFIG];
        return config ? <Tag color={config.color}>{getLabel(config)}</Tag> : status;
      },
    },
  ];

  // ============================================================
  // Main fuel type table columns
  // ============================================================
  const fuelTypeColumns: ColumnsType<FuelTypePriceWithNozzles> = [
    {
      title: t('price.field.fuelTypeName', '油品名称'),
      dataIndex: 'fuelTypeName',
      width: 140,
      render: (name: string, record) => (
        <Space>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>({record.fuelTypeCode})</Text>
        </Space>
      ),
    },
    {
      title: t('price.field.basePrice', '基准价'),
      dataIndex: 'basePrice',
      width: 130,
      align: 'right',
      render: (price: number, record) => (
        <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
          &yen;{price.toFixed(2)}<Text type="secondary" style={{ fontSize: 12 }}>/{record.fuelUnit}</Text>
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
      title: t('price.field.nozzleCount', '枪数'),
      dataIndex: 'nozzleCount',
      width: 100,
      align: 'center',
      render: (count: number, record) => (
        <Space size={4}>
          <Text>{count}</Text>
          {record.overrideCount > 0 && (
            <Tag color="orange" style={{ marginLeft: 4 }}>{record.overrideCount} {t('price.label.override', '独立')}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('price.field.effectiveFrom', '生效时间'),
      dataIndex: 'effectiveFrom',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('price.field.lastAdjusted', '最后调价'),
      dataIndex: 'lastAdjustedAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('common.actions', '操作'),
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleAdjustFuelType(record)}
        >
          {t('price.action.adjust', '调价')}
        </Button>
      ),
    },
  ];

  // ============================================================
  // Expandable nozzle row renderer
  // ============================================================
  const expandedRowRender = (record: FuelTypePriceWithNozzles) => {
    const nozzleColumns: ColumnsType<NozzlePrice> = [
      {
        title: t('price.field.nozzleNo', '枪号'),
        dataIndex: 'nozzleNo',
        width: 100,
        render: (no: string) => <Text strong>{no}</Text>,
      },
      {
        title: t('price.field.currentPrice', '当前价格'),
        dataIndex: 'currentPrice',
        width: 130,
        align: 'right',
        render: (price: number) => <Text strong>&yen;{price.toFixed(2)}</Text>,
      },
      {
        title: t('price.field.pricingStatus', '定价状态'),
        dataIndex: 'isOverride',
        width: 120,
        align: 'center',
        render: (isOverride: boolean) =>
          isOverride
            ? <Tag color="orange">{t('price.label.overridePrice', '独立定价')}</Tag>
            : <Tag color="green">{t('price.label.followBase', '跟随基准')}</Tag>,
      },
      {
        title: t('price.field.diff', '与基准差异'),
        key: 'diff',
        width: 130,
        align: 'right',
        render: (_, nozzle) => {
          const diff = nozzle.currentPrice - record.basePrice;
          if (Math.abs(diff) < 0.001) return <Text type="secondary">--</Text>;
          const color = diff > 0 ? '#ff4d4f' : '#52c41a';
          return <Text style={{ color }}>{diff > 0 ? '+' : ''}{diff.toFixed(2)}</Text>;
        },
      },
      {
        title: t('common.actions', '操作'),
        key: 'actions',
        width: 200,
        align: 'center',
        render: (_, nozzle) => (
          <Space>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleNozzleOverride(nozzle)}>
              {t('price.action.nozzleAdjust', '单独调价')}
            </Button>
            {nozzle.isOverride && (
              <Popconfirm
                title={t('price.confirm.restoreTitle', '确认恢复基准价？')}
                description={`${t('price.confirm.restoreDesc', '枪号')} ${nozzle.nozzleNo} ${t('price.confirm.restoreTo', '将恢复为基准价')} ¥${record.basePrice.toFixed(2)}`}
                onConfirm={() => handleNozzleRestore(nozzle, record.fuelTypeName)}
                okText={t('common.confirm', '确认')}
                cancelText={t('common.cancel', '取消')}
              >
                <Button type="link" size="small" danger icon={<UndoOutlined />}>
                  {t('price.action.restoreBase', '恢复基准价')}
                </Button>
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ];

    return (
      <Table<NozzlePrice>
        columns={nozzleColumns}
        dataSource={record.nozzles}
        rowKey="nozzleId"
        pagination={false}
        size="small"
        style={{ margin: '0 0 0 48px' }}
      />
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>
            {t('price.overview.title', '价格总览')}
          </Title>
          <RequirementTag componentIds={['price-overview', 'fuel-type-adjust', 'nozzle-override', 'nozzle-restore']} module="price-management" showDetail />
        </Space>
      </Row>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.key}>
            <Card hoverable style={{ borderRadius: 8 }} styles={{ body: { padding: '20px 24px' } }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, backgroundColor: card.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {card.icon}
                  </div>
                </Col>
                <Col flex="auto">
                  {card.value !== null ? (
                    <Statistic title={card.title} value={card.value} suffix={card.suffix} valueStyle={{ fontSize: 24, fontWeight: 600 }} />
                  ) : (
                    <>
                      <Text type="secondary" style={{ fontSize: 12 }}>{card.title}</Text>
                      <div>{card.action}</div>
                    </>
                  )}
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pending Schedule Panel */}
      {pendingAdjustments.length > 0 && (
        <Collapse
          style={{ marginBottom: 24 }}
          defaultActiveKey={['pending']}
          items={[{
            key: 'pending',
            label: (
              <Space>
                <ScheduleOutlined style={{ color: '#722ed1' }} />
                <Text strong>{t('price.overview.pendingSchedule', '待生效调价计划')}</Text>
                <Tag color="purple">{pendingAdjustments.length}</Tag>
              </Space>
            ),
            children: (
              <Table<PriceAdjustment>
                columns={pendingColumns}
                dataSource={pendingAdjustments}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ),
          }]}
        />
      )}

      {/* Main Fuel Type Price Table */}
      <Card
        title={<Space><DashboardOutlined /><Text strong>{t('price.overview.detail', '油品价格明细')}</Text></Space>}
      >
        <Table<FuelTypePriceWithNozzles>
          columns={fuelTypeColumns}
          dataSource={overviewData.fuelTypePrices}
          rowKey="id"
          loading={loading}
          scroll={{ x: 960 }}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.nozzles.length > 0,
          }}
          pagination={false}
          locale={{
            emptyText: <div style={{ padding: 40 }}><Text type="secondary">{t('price.empty', '暂无油品价格数据')}</Text></div>,
          }}
        />
      </Card>
    </div>
  );
};

export default PriceOverview;
