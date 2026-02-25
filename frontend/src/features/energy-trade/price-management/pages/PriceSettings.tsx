// P07: 价格设置页（防御配置）
import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Descriptions,
  message,
} from 'antd';
import {
  SettingOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { priceDefenseConfigs } from '../../../../mock/priceManagement';
import type { PriceDefenseConfig } from '../types';

const { Title, Text } = Typography;

interface LayoutContext {
  selectedStationId: string;
}

const PriceSettings: React.FC = () => {
  const { t } = useTranslation();
  useOutletContext<LayoutContext>();

  // Separate global vs station-level vs fuel-level configs
  const { globalConfig, stationConfigs, fuelConfigs } = useMemo(() => {
    const global = priceDefenseConfigs.find((c) => !c.stationId && !c.fuelTypeId);
    const station = priceDefenseConfigs.filter((c) => c.stationId && !c.fuelTypeId);
    const fuel = priceDefenseConfigs.filter((c) => c.stationId && c.fuelTypeId);
    return { globalConfig: global, stationConfigs: station, fuelConfigs: fuel };
  }, []);

  const configColumns: ColumnsType<PriceDefenseConfig> = [
    {
      title: t('price.settings.scope', '适用范围'),
      key: 'scope',
      width: 200,
      render: (_, record) => {
        if (!record.stationId) return <Tag color="blue">{t('price.settings.global', '全局默认')}</Tag>;
        if (record.fuelTypeName) {
          return (
            <Space>
              <Tag>{record.stationName}</Tag>
              <Tag color="cyan">{record.fuelTypeName}</Tag>
            </Space>
          );
        }
        return <Tag color="green">{record.stationName}</Tag>;
      },
    },
    {
      title: t('price.settings.maxIncrease', '最大涨幅'),
      dataIndex: 'maxIncreasePct',
      width: 100,
      align: 'center',
      render: (pct: number) => <Text strong style={{ color: '#ff4d4f' }}>+{pct}%</Text>,
    },
    {
      title: t('price.settings.maxDecrease', '最大降幅'),
      dataIndex: 'maxDecreasePct',
      width: 100,
      align: 'center',
      render: (pct: number) => <Text strong style={{ color: '#52c41a' }}>-{pct}%</Text>,
    },
    {
      title: t('price.settings.requireApproval', '需审批'),
      dataIndex: 'requireApproval',
      width: 100,
      align: 'center',
      render: (v: boolean) => v ? <Tag color="orange">{t('common.yes', '是')}</Tag> : <Tag>{t('common.no', '否')}</Tag>,
    },
    {
      title: t('price.settings.approvalThreshold', '审批阈值'),
      dataIndex: 'approvalThresholdPct',
      width: 120,
      align: 'center',
      render: (pct: number) => pct > 0 ? `>= ${pct}%` : '-',
    },
    {
      title: t('price.field.updatedBy', '更新人'),
      dataIndex: 'updatedByName',
      width: 100,
    },
    {
      title: t('price.field.updatedAt', '更新时间'),
      dataIndex: 'updatedAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('common.actions', '操作'),
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_: unknown, _record: PriceDefenseConfig) => (
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
          <SettingOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {t('price.settings.title', '价格设置')}
          </Title>
        </Space>
      </Row>

      {/* Global Defense Config */}
      {globalConfig && (
        <Card
          title={
            <Space>
              <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
              <Text strong>{t('price.settings.globalConfig', '全局防御配置')}</Text>
            </Space>
          }
          extra={
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info(t('common.comingSoon', '功能即将上线'))}>
              {t('common.edit', '编辑')}
            </Button>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t('price.settings.maxIncrease', '最大涨幅')}>
                  <Text strong style={{ color: '#ff4d4f' }}>+{globalConfig.maxIncreasePct}%</Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t('price.settings.maxDecrease', '最大降幅')}>
                  <Text strong style={{ color: '#52c41a' }}>-{globalConfig.maxDecreasePct}%</Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t('price.settings.requireApproval', '需审批')}>
                  {globalConfig.requireApproval
                    ? <Tag color="orange">{t('common.yes', '是')}</Tag>
                    : <Tag>{t('common.no', '否')}</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t('price.settings.approvalThreshold', '审批阈值')}>
                  {globalConfig.approvalThresholdPct > 0 ? `>= ${globalConfig.approvalThresholdPct}%` : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>
      )}

      {/* Station & Fuel Level Configs */}
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
            <Text strong>{t('price.settings.customConfigs', '站点/品类级配置')}</Text>
          </Space>
        }
        extra={
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => message.info(t('common.comingSoon', '功能即将上线'))}>
            {t('price.settings.addConfig', '新增配置')}
          </Button>
        }
      >
        <Table<PriceDefenseConfig>
          columns={configColumns}
          dataSource={[...stationConfigs, ...fuelConfigs]}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: <div style={{ padding: 40 }}><Text type="secondary">{t('price.settings.empty', '暂无自定义配置')}</Text></div>,
          }}
        />
      </Card>
    </div>
  );
};

export default PriceSettings;
