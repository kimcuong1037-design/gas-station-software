import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, InputNumber, message, Popconfirm, Radio, Space, Table, Tabs, Tag, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
interface LayoutContext {
  selectedStationId: string;
}
import { RequirementTag } from '../../../../components/RequirementTag';
import type { AlertConfig, InventoryAlert, ThresholdType } from '../types';
import { ALERT_LEVEL_CONFIG, ALERT_TYPE_CONFIG, HANDLE_STATUS_CONFIG, getLabel } from '../constants';
import { inventoryAlerts, alertConfigs, getActiveAlertCount } from '../../../../mock/inventory';

const { Title, Text } = Typography;

const AlertManagement: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const [activeTab, setActiveTab] = useState<string>('notifications');
  const [alertSubTab, setAlertSubTab] = useState<string>('active');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<AlertConfig>>({});

  const activeAlertCount = useMemo(() => getActiveAlertCount(selectedStationId), [selectedStationId]);

  const activeAlerts = useMemo(
    () => inventoryAlerts.filter(a => a.stationId === selectedStationId && a.handleStatus === 'active'),
    [selectedStationId],
  );

  const historyAlerts = useMemo(
    () => inventoryAlerts.filter(a => a.stationId === selectedStationId && a.handleStatus !== 'active'),
    [selectedStationId],
  );

  const configs = useMemo(
    () => alertConfigs.filter(c => c.stationId === selectedStationId),
    [selectedStationId],
  );

  const handleAcknowledge = (id: string) => {
    message.info(t('inventory.alert.acknowledged', '预警已确认'));
    void id;
  };

  const handleDismiss = (id: string) => {
    message.info(t('inventory.alert.dismissed', '预警已忽略'));
    void id;
  };

  const handleEditRule = (record: AlertConfig) => {
    setEditingRuleId(record.id);
    setEditingValues({
      safeThreshold: record.safeThreshold,
      warningThreshold: record.warningThreshold,
      criticalThreshold: record.criticalThreshold,
      lossDeviationThreshold: record.lossDeviationThreshold,
      thresholdType: record.thresholdType,
    });
  };

  const handleSaveRule = () => {
    const { criticalThreshold, warningThreshold, safeThreshold, lossDeviationThreshold } = editingValues;
    if (criticalThreshold != null && warningThreshold != null && safeThreshold != null) {
      if (criticalThreshold >= warningThreshold || warningThreshold >= safeThreshold) {
        message.error(t('inventory.config.thresholdError', '阈值设置不合理：紧急 < 预警 < 安全'));
        return;
      }
    }
    if (lossDeviationThreshold != null && (lossDeviationThreshold < 0.5 || lossDeviationThreshold > 10)) {
      message.error(t('inventory.config.lossThresholdError', '损耗偏差阈值范围：0.5% ~ 10%'));
      return;
    }
    message.success(t('inventory.config.saved', '预警规则已更新，新阈值立即生效'));
    setEditingRuleId(null);
    setEditingValues({});
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditingValues({});
  };

  const activeColumns: ColumnsType<InventoryAlert> = [
    {
      title: t('inventory.alert.level', '预警级别'), dataIndex: 'alertLevel', width: 90,
      render: (v: InventoryAlert['alertLevel']) => {
        const cfg = ALERT_LEVEL_CONFIG[v];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    {
      title: t('inventory.alert.type', '预警类型'), dataIndex: 'alertType', width: 110,
      render: (v: InventoryAlert['alertType']) => getLabel(ALERT_TYPE_CONFIG[v]),
    },
    { title: t('inventory.field.fuelType', '燃料类型'), dataIndex: 'fuelTypeName', width: 100 },
    { title: t('inventory.field.tank', '储罐'), dataIndex: 'tankName', width: 120, render: (v: string) => v || '—' },
    { title: t('inventory.alert.currentValue', '当前值'), dataIndex: 'currentValue', width: 120 },
    { title: t('inventory.alert.threshold', '阈值'), dataIndex: 'thresholdValue', width: 100 },
    {
      title: t('inventory.alert.triggeredAt', '触发时间'), dataIndex: 'triggeredAt', width: 170,
      sorter: (a, b) => a.triggeredAt.localeCompare(b.triggeredAt),
      defaultSortOrder: 'descend',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: t('common.actions', '操作'), width: 140,
      render: (_: unknown, record: InventoryAlert) => (
        <Space>
          <Popconfirm title={t('inventory.alert.confirmAck', '确认已知晓此预警？')} onConfirm={() => handleAcknowledge(record.id)}>
            <Button size="small" type="primary">{t('inventory.alert.action.acknowledge', '确认')}</Button>
          </Popconfirm>
          <Popconfirm title={t('inventory.alert.confirmDismiss', '确认忽略此预警？')} onConfirm={() => handleDismiss(record.id)}>
            <Button size="small">{t('inventory.alert.action.dismiss', '忽略')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const historyColumns: ColumnsType<InventoryAlert> = [
    {
      title: t('inventory.alert.level', '预警级别'), dataIndex: 'alertLevel', width: 90,
      render: (v: InventoryAlert['alertLevel']) => {
        const cfg = ALERT_LEVEL_CONFIG[v];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    {
      title: t('inventory.alert.type', '预警类型'), dataIndex: 'alertType', width: 110,
      render: (v: InventoryAlert['alertType']) => getLabel(ALERT_TYPE_CONFIG[v]),
    },
    { title: t('inventory.field.fuelType', '燃料类型'), dataIndex: 'fuelTypeName', width: 100 },
    {
      title: t('inventory.alert.triggeredAt', '触发时间'), dataIndex: 'triggeredAt', width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    },
    {
      title: t('inventory.alert.handleStatus', '处理状态'), dataIndex: 'handleStatus', width: 100,
      render: (v: InventoryAlert['handleStatus']) => {
        const cfg = HANDLE_STATUS_CONFIG[v];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    {
      title: t('inventory.alert.handler', '处理人'), dataIndex: 'handlerName', width: 100,
      render: (v: string) => v || '—',
    },
    {
      title: t('inventory.alert.resolvedAt', '恢复/关闭时间'), width: 160,
      render: (_: unknown, record: InventoryAlert) => {
        const time = record.resolvedAt || record.handledAt;
        return time ? new Date(time).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
      },
    },
  ];

  const configColumns: ColumnsType<AlertConfig> = [
    { title: t('inventory.field.fuelType', '燃料类型'), dataIndex: 'fuelTypeName', width: 120 },
    {
      title: t('inventory.config.safeThreshold', '安全阈值'), dataIndex: 'safeThreshold', width: 120,
      render: (v: number, record: AlertConfig) =>
        editingRuleId === record.id
          ? <InputNumber size="small" value={editingValues.safeThreshold} onChange={val => setEditingValues(prev => ({ ...prev, safeThreshold: val ?? 0 }))} min={0} max={100} suffix="%" style={{ width: '100%' }} />
          : `${v}%`,
    },
    {
      title: t('inventory.config.warningThreshold', '预警阈值'), dataIndex: 'warningThreshold', width: 120,
      render: (v: number, record: AlertConfig) =>
        editingRuleId === record.id
          ? <InputNumber size="small" value={editingValues.warningThreshold} onChange={val => setEditingValues(prev => ({ ...prev, warningThreshold: val ?? 0 }))} min={0} max={100} suffix="%" style={{ width: '100%' }} />
          : `${v}%`,
    },
    {
      title: t('inventory.config.criticalThreshold', '紧急阈值'), dataIndex: 'criticalThreshold', width: 120,
      render: (v: number, record: AlertConfig) =>
        editingRuleId === record.id
          ? <InputNumber size="small" value={editingValues.criticalThreshold} onChange={val => setEditingValues(prev => ({ ...prev, criticalThreshold: val ?? 0 }))} min={0} max={100} suffix="%" style={{ width: '100%' }} />
          : `${v}%`,
    },
    {
      title: t('inventory.config.lossDeviationThreshold', '损耗偏差阈值'), dataIndex: 'lossDeviationThreshold', width: 140,
      render: (v: number, record: AlertConfig) =>
        editingRuleId === record.id
          ? <InputNumber size="small" value={editingValues.lossDeviationThreshold} onChange={val => setEditingValues(prev => ({ ...prev, lossDeviationThreshold: val ?? 0 }))} min={0.5} max={10} step={0.1} suffix="%" style={{ width: '100%' }} />
          : `${v}%`,
    },
    {
      title: (
        <Space>
          {t('inventory.config.thresholdType', '阈值类型')}
          <Tooltip title={t('inventory.config.thresholdTypeTooltip', '百分比按罐容比判定，绝对值按实际库存(kg)判定')}>
            <InfoCircleOutlined style={{ color: '#999' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'thresholdType', width: 120,
      render: (v: ThresholdType, record: AlertConfig) =>
        editingRuleId === record.id
          ? <Radio.Group size="small" value={editingValues.thresholdType} onChange={e => setEditingValues(prev => ({ ...prev, thresholdType: e.target.value }))}>
              <Radio value="percentage">{t('inventory.config.percentage', '百分比')}</Radio>
              <Radio value="absolute">{t('inventory.config.absolute', '绝对值')}</Radio>
            </Radio.Group>
          : v === 'percentage' ? t('inventory.config.percentage', '百分比') : t('inventory.config.absolute', '绝对值'),
    },
    {
      title: t('common.actions', '操作'), width: 100,
      render: (_: unknown, record: AlertConfig) =>
        editingRuleId === record.id
          ? <Space>
              <Button size="small" type="primary" onClick={handleSaveRule}>{t('inventory.action.save', '保存')}</Button>
              <Button size="small" onClick={handleCancelEdit}>{t('inventory.action.cancel', '取消')}</Button>
            </Space>
          : <Button size="small" type="link" onClick={() => handleEditRule(record)}>{t('inventory.action.edit', '编辑')}</Button>,
    },
  ];

  const renderNotificationsTab = () => (
    <Tabs
      type="card"
      activeKey={alertSubTab}
      onChange={setAlertSubTab}
      items={[
        {
          key: 'active',
          label: (
            <span>{t('inventory.alert.activeAlerts', '活跃预警')} <Badge count={activeAlertCount} size="small" /></span>
          ),
          children: (
            <Table<InventoryAlert>
              columns={activeColumns}
              dataSource={activeAlerts}
              rowKey="id"
              scroll={{ x: 950 }}
              pagination={false}
              locale={{ emptyText: <div style={{ padding: 24 }}><Text type="secondary">{t('inventory.alert.noActive', '当前无活跃预警')}</Text><br /><Text type="success">✅ {t('inventory.alert.allNormal', '所有指标正常')}</Text></div> }}
            />
          ),
        },
        {
          key: 'history',
          label: t('inventory.alert.historyAlerts', '历史预警'),
          children: (
            <Table<InventoryAlert>
              columns={historyColumns}
              dataSource={historyAlerts}
              rowKey="id"
              scroll={{ x: 820 }}
              pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `${t('inventory.pagination.total', '共')} ${total} ${t('inventory.pagination.items', '条')}` }}
              locale={{ emptyText: t('inventory.alert.noHistory', '暂无历史预警记录') }}
            />
          ),
        },
      ]}
    />
  );

  const renderConfigTab = () => (
    <Card size="small">
      <Table<AlertConfig>
        columns={configColumns}
        dataSource={configs}
        rowKey="id"
        pagination={false}
        scroll={{ x: 840 }}
      />
    </Card>
  );

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('inventory.alerts', '预警管理')}</Title>
          <RequirementTag
            componentIds={['low-stock-alert', 'threshold-config', 'alert-notifications', 'loss-anomaly-alert', 'alert-dashboard']}
            module="inventory-management"
            showDetail
          />
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'notifications',
            label: <span>{t('inventory.alert.notificationsTab', '预警通知')} <Badge count={activeAlertCount} size="small" /></span>,
            children: renderNotificationsTab(),
          },
          {
            key: 'config',
            label: t('inventory.alert.configTab', '阈值配置'),
            children: renderConfigTab(),
          },
        ]}
      />
    </div>
  );
};

export default AlertManagement;
