import React, { useState } from 'react';
import { Card, Tabs, Row, Col, DatePicker, Select, Button, Table, Tag, Typography, Alert, Statistic, message } from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { RequirementTag } from '../../../../components/RequirementTag';
import { BarChart, PieChart, LineChart } from '../../../../components/Charts';
import GrowthBadge from '../../data-analytics/components/GrowthBadge';
import { STANDARD_REPORT_TABS, STATION_OPTIONS } from '../constants';
import {
  mockDailyOperationsData,
  mockMonthlyOperationsData,
  mockShiftReportData,
  mockInspectionReportData,
  mockInventoryReportData,
} from '../mockData/reportDataMock';

const { Text } = Typography;

const formatCurrency = (val: number) => `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatVolume = (val: number) => `${val.toLocaleString()} m³`;

const StandardReport: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'daily_operations';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isFavorite, setIsFavorite] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerated(true);
    message.success(t('reportCenter.generateSuccess', '报表生成成功'));
  };

  const handleExport = () => {
    message.info(t('reportCenter.exportMvpTip', '导出功能将在后端实现后启用'));
  };

  const tabItems = STANDARD_REPORT_TABS.map(tab => ({
    key: tab.key,
    label: t(tab.labelKey, tab.key),
  }));

  // ===== 经营日报/月报内容 =====
  const renderOperationsContent = (isMonthly: boolean) => {
    const data = isMonthly ? mockMonthlyOperationsData : mockDailyOperationsData;
    const { kpiSummary, stationBreakdown, fuelTypeBreakdown, dailyTrend } = data;

    const stationColumns = [
      { title: t('common.station', '站点'), dataIndex: 'stationName', key: 'stationName', width: 150 },
      { title: t('reportCenter.kpi.revenue', '营业额'), dataIndex: 'revenue', key: 'revenue', width: 140, render: formatCurrency, sorter: (a: typeof stationBreakdown[0], b: typeof stationBreakdown[0]) => a.revenue - b.revenue },
      { title: t('reportCenter.kpi.orders', '订单数'), dataIndex: 'orders', key: 'orders', width: 100, sorter: (a: typeof stationBreakdown[0], b: typeof stationBreakdown[0]) => a.orders - b.orders },
      { title: t('reportCenter.kpi.fuelVolume', '充装量'), dataIndex: 'fuelVolume', key: 'fuelVolume', width: 140, render: formatVolume, sorter: (a: typeof stationBreakdown[0], b: typeof stationBreakdown[0]) => a.fuelVolume - b.fuelVolume },
      { title: t('reportCenter.kpi.avgOrderValue', '客单价'), dataIndex: 'avgOrderValue', key: 'avgOrderValue', width: 130, render: formatCurrency, sorter: (a: typeof stationBreakdown[0], b: typeof stationBreakdown[0]) => a.avgOrderValue - b.avgOrderValue },
    ];

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('reportCenter.kpi.revenue', '营业额')} value={kpiSummary.totalRevenue} precision={2} prefix="¥" />
              <GrowthBadge value={kpiSummary.revenueGrowth} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('reportCenter.kpi.orders', '订单数')} value={kpiSummary.totalOrders} />
              <GrowthBadge value={kpiSummary.ordersGrowth} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('reportCenter.kpi.fuelVolume', '充装量')} value={kpiSummary.totalFuelVolume} precision={1} suffix="m³" />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('reportCenter.kpi.avgOrderValue', '客单价')} value={kpiSummary.avgOrderValue} precision={2} prefix="¥" />
            </Card>
          </Col>
        </Row>

        <Card title={t('reportCenter.stationDetail', '站点明细')} style={{ marginBottom: 24 }}>
          <Table
            columns={stationColumns}
            dataSource={stationBreakdown}
            rowKey="stationId"
            scroll={{ x: 660 }}
            pagination={false}
            size="small"
          />
        </Card>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title={t('reportCenter.charts.fuelBreakdown', '燃料类型占比')}>
              <PieChart
                data={fuelTypeBreakdown.map(f => ({ name: f.fuelTypeName, value: f.revenue }))}
                height={280}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title={t('reportCenter.charts.stationComparison', '站点对比')}>
              <BarChart
                data={stationBreakdown.map(s => ({ name: s.stationName, value: s.revenue }))}
                height={280}
              />
            </Card>
          </Col>
        </Row>

        {isMonthly && dailyTrend && (
          <Card title={t('reportCenter.charts.dailyTrend', '日均趋势')}>
            <LineChart
              data={dailyTrend.map(d => ({ date: d.date.slice(5), value: d.revenue, seriesName: '营业额' }))}
              height={300}
            />
          </Card>
        )}
      </div>
    );
  };

  // ===== 交接班报表内容 =====
  const renderShiftContent = () => {
    const { shifts, paymentDistribution } = mockShiftReportData;

    const shiftColumns = [
      { title: t('reportCenter.shift.date', '日期'), dataIndex: 'date', key: 'date', width: 110 },
      { title: t('reportCenter.shift.name', '班次'), dataIndex: 'shiftName', key: 'shiftName', width: 100 },
      { title: t('reportCenter.shift.operator', '操作员'), dataIndex: 'operatorName', key: 'operatorName', width: 100 },
      { title: t('reportCenter.kpi.revenue', '营业额'), dataIndex: 'revenue', key: 'revenue', width: 130, render: formatCurrency },
      { title: t('reportCenter.kpi.orders', '订单数'), dataIndex: 'orders', key: 'orders', width: 90 },
      { title: t('reportCenter.kpi.fuelVolume', '充装量'), dataIndex: 'fuelVolume', key: 'fuelVolume', width: 130, render: formatVolume },
      { title: t('reportCenter.shift.cash', '现金'), dataIndex: 'cashAmount', key: 'cashAmount', width: 120, render: formatCurrency },
      { title: t('reportCenter.shift.online', '在线支付'), dataIndex: 'onlineAmount', key: 'onlineAmount', width: 120, render: formatCurrency },
      { title: t('reportCenter.shift.card', '刷卡'), dataIndex: 'cardAmount', key: 'cardAmount', width: 120, render: formatCurrency },
    ];

    return (
      <div>
        <Card title={t('reportCenter.shiftDetail', '班次明细')} style={{ marginBottom: 24 }}>
          <Table
            columns={shiftColumns}
            dataSource={shifts}
            rowKey={(r) => `${r.date}-${r.shiftName}`}
            scroll={{ x: 1020 }}
            pagination={false}
            size="small"
          />
        </Card>
        <Row gutter={16}>
          <Col span={12}>
            <Card title={t('reportCenter.charts.paymentDistribution', '支付方式分布')}>
              <PieChart
                data={paymentDistribution.map(p => ({ name: p.method, value: p.amount }))}
                height={280}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title={t('reportCenter.charts.shiftComparison', '班次对比')}>
              <BarChart
                data={shifts.map(s => ({ name: s.shiftName, value: s.revenue }))}
                height={280}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // ===== 巡检报表内容 =====
  const renderInspectionContent = () => {
    const { summary, areaBreakdown, unresolvedCritical } = mockInspectionReportData;

    const areaColumns = [
      { title: t('reportCenter.inspection.area', '检查区域'), dataIndex: 'areaLabel', key: 'areaLabel', width: 150 },
      { title: t('reportCenter.inspection.issueCount', '问题发现数'), dataIndex: 'issueCount', key: 'issueCount', width: 120, sorter: (a: typeof areaBreakdown[0], b: typeof areaBreakdown[0]) => a.issueCount - b.issueCount },
      { title: t('reportCenter.inspection.criticalCount', '高危问题数'), dataIndex: 'criticalCount', key: 'criticalCount', width: 120, render: (val: number) => val > 0 ? <Text type="danger">{val}</Text> : val },
      { title: t('reportCenter.inspection.rectifiedCount', '已整改数'), dataIndex: 'rectifiedCount', key: 'rectifiedCount', width: 120 },
    ];

    const criticalColumns = [
      { title: t('reportCenter.inspection.area', '区域'), dataIndex: 'area', key: 'area', width: 120 },
      { title: t('reportCenter.inspection.description', '问题描述'), dataIndex: 'description', key: 'description', width: 250 },
      { title: t('reportCenter.inspection.severity', '严重程度'), dataIndex: 'severity', key: 'severity', width: 100, render: (val: string) => <Tag color={val === 'urgent' ? 'red' : 'orange'}>{val === 'urgent' ? '紧急' : '高'}</Tag> },
      { title: t('reportCenter.inspection.discoveredDate', '发现日期'), dataIndex: 'discoveredDate', key: 'discoveredDate', width: 120 },
      { title: t('reportCenter.inspection.daysPending', '待整改天数'), dataIndex: 'daysPending', key: 'daysPending', width: 100, render: (val: number) => <Text type="danger">{val}{t('common.days', '天')}</Text> },
    ];

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title={t('reportCenter.inspection.completionRate', '计划完成率')}
                value={summary.completionRate}
                suffix="%"
                valueStyle={{ color: summary.completionRate >= 90 ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title={t('reportCenter.inspection.issueCount', '问题发现数')} value={summary.totalIssues} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title={t('reportCenter.inspection.rectificationRate', '整改完成率')}
                value={summary.rectificationRate}
                suffix="%"
                valueStyle={{ color: summary.rectificationRate >= 80 ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title={t('reportCenter.inspection.areaDistribution', '区域问题分布')} style={{ marginBottom: 24 }}>
          <Table
            columns={areaColumns}
            dataSource={areaBreakdown}
            rowKey="area"
            scroll={{ x: 510 }}
            pagination={false}
            size="small"
          />
        </Card>

        {unresolvedCritical.length > 0 && (
          <>
            <Alert
              type="error"
              message={t('reportCenter.inspection.unresolvedAlert', '以下高/紧急级别问题尚未整改')}
              style={{ marginBottom: 16 }}
              showIcon
            />
            <Card>
              <Table
                columns={criticalColumns}
                dataSource={unresolvedCritical}
                rowKey="inspectionId"
                scroll={{ x: 690 }}
                pagination={false}
                size="small"
              />
            </Card>
          </>
        )}
      </div>
    );
  };

  // ===== 库存报表内容 =====
  const renderInventoryContent = () => {
    const { summary, stationFuelBreakdown, tankLevelTrend } = mockInventoryReportData;

    const inventoryColumns = [
      { title: t('common.station', '站点'), dataIndex: 'stationName', key: 'stationName', width: 140 },
      { title: t('reportCenter.inventory.fuelType', '燃料类型'), dataIndex: 'fuelTypeName', key: 'fuelTypeName', width: 100 },
      { title: t('reportCenter.inventory.inbound', '入库量'), dataIndex: 'inboundVolume', key: 'inboundVolume', width: 120, render: (v: number) => v.toLocaleString() },
      { title: t('reportCenter.inventory.outbound', '出库量'), dataIndex: 'outboundVolume', key: 'outboundVolume', width: 120, render: (v: number) => v.toLocaleString() },
      {
        title: t('reportCenter.inventory.loss', '损耗量'), dataIndex: 'lossVolume', key: 'lossVolume', width: 110,
        render: (val: number, row: typeof stationFuelBreakdown[0]) => row.abnormalLoss ? <Text type="danger">{val}</Text> : val,
      },
      { title: t('reportCenter.inventory.ending', '期末库存'), dataIndex: 'endingVolume', key: 'endingVolume', width: 120, render: (v: number) => v.toLocaleString() },
      { title: t('reportCenter.inventory.tankRatio', '罐容比'), dataIndex: 'tankLevelRatio', key: 'tankLevelRatio', width: 110, render: (val: number) => `${(val * 100).toFixed(1)}%` },
    ];

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('reportCenter.inventory.inbound', '总入库量')} value={summary.totalInbound} precision={1} suffix="m³" />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('reportCenter.inventory.outbound', '总出库量')} value={summary.totalOutbound} precision={1} suffix="m³" />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('reportCenter.inventory.loss', '总损耗量')} value={summary.totalLoss} precision={1} suffix="m³" />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('reportCenter.inventory.ending', '期末库存')} value={summary.endingInventory} precision={1} suffix="m³" />
            </Card>
          </Col>
        </Row>

        <Card title={t('reportCenter.inventory.detail', '库存明细')} style={{ marginBottom: 24 }}>
          <Table
            columns={inventoryColumns}
            dataSource={stationFuelBreakdown}
            rowKey={(r) => `${r.stationId}-${r.fuelTypeName}`}
            scroll={{ x: 820 }}
            pagination={false}
            size="small"
            rowClassName={(record) => record.abnormalLoss ? 'danger-row' : ''}
          />
        </Card>

        {tankLevelTrend && (
          <Card title={t('reportCenter.charts.tankTrend', '罐容比趋势')}>
            <LineChart
              data={tankLevelTrend.map(d => ({ date: d.date.slice(5), value: Math.round(d.tankLevelRatio * 100), seriesName: '罐容比' }))}
              height={300}
            />
          </Card>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!generated) {
      return (
        <Card style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">{t('reportCenter.selectAndGenerate', '请选择日期和站点后点击"生成报表"')}</Text>
        </Card>
      );
    }

    switch (activeTab) {
      case 'daily_operations': return renderOperationsContent(false);
      case 'monthly_operations': return renderOperationsContent(true);
      case 'shift_handover': return renderShiftContent();
      case 'inspection': return renderInspectionContent();
      case 'inventory': return renderInventoryContent();
      default: return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>{t('reportCenter.standard.title', '标准报表')}</h2>
        <RequirementTag componentIds={['report-daily-operations', 'report-monthly-operations', 'report-shift-handover', 'report-inspection', 'report-inventory', 'report-export', 'report-favorite']} module="report-center" showDetail />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => { setActiveTab(key); setGenerated(false); }}
        items={tabItems}
        style={{ marginBottom: 16 }}
      />

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            {activeTab === 'daily_operations' ? (
              <DatePicker defaultValue={dayjs().subtract(1, 'day')} />
            ) : activeTab === 'monthly_operations' ? (
              <DatePicker.MonthPicker defaultValue={dayjs().subtract(1, 'month')} />
            ) : (
              <DatePicker.RangePicker defaultValue={[dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')]} />
            )}
          </Col>
          <Col>
            <Select
              mode="multiple"
              placeholder={t('common.selectStation', '选择站点')}
              options={STATION_OPTIONS}
              style={{ minWidth: 200 }}
              defaultValue={['ST001', 'ST002', 'ST003']}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<FileTextOutlined />} onClick={handleGenerate}>
              {t('reportCenter.actions.generate', '生成报表')}
            </Button>
          </Col>
          <Col>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              {t('reportCenter.actions.export', '导出')}
            </Button>
          </Col>
          <Col>
            <Button
              type="text"
              aria-label={t('reportCenter.actions.favorite', '收藏')}
              icon={isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={() => { setIsFavorite(!isFavorite); message.success(isFavorite ? '已取消收藏' : '已收藏'); }}
            />
          </Col>
        </Row>
      </Card>

      {renderContent()}
    </div>
  );
};

export default StandardReport;
