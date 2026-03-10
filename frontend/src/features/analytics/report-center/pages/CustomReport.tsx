import React, { useState, useMemo } from 'react';
import {
  Card, Row, Col, Input, Button, Menu, Divider, Descriptions, Tag, Select,
  DatePicker, Table, Segmented, Empty, Drawer, Steps, Radio, Checkbox,
  Form, InputNumber, Popconfirm, message, Typography, Space,
} from 'antd';
import {
  PlusOutlined,
  LockOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  StarFilled,
  StarOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RequirementTag } from '../../../../components/RequirementTag';
import { BarChart, LineChart } from '../../../../components/Charts';
import {
  DATA_SOURCE_CONFIG,
  DIMENSION_OPTIONS_BY_SOURCE,
  METRIC_OPTIONS_BY_SOURCE,
  TEMPLATE_TAG_OPTIONS,
  STATION_OPTIONS,
} from '../constants';
import { mockTemplates } from '../mockData/templateMock';
import { mockCustomReportData } from '../mockData/reportDataMock';
import type { ReportTemplate, ReportDataSource, ReportDimension, ReportMetric } from '../types';

const { Text } = Typography;
const { Search } = Input;

const DATA_SOURCE_ICONS: Record<ReportDataSource, React.ReactNode> = {
  operations: <BarChartOutlined style={{ fontSize: 24 }} />,
  inventory: <DatabaseOutlined style={{ fontSize: 24 }} />,
  inspection: <SafetyCertificateOutlined style={{ fontSize: 24 }} />,
};

const CustomReport: React.FC = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockTemplates);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<string>('table');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Builder form state
  const [builderDataSource, setBuilderDataSource] = useState<ReportDataSource>('operations');
  const [builderDimensions, setBuilderDimensions] = useState<ReportDimension[]>([]);
  const [builderMetrics, setBuilderMetrics] = useState<ReportMetric[]>([]);
  const [builderName, setBuilderName] = useState('');
  const [builderDesc, setBuilderDesc] = useState('');
  const [builderTag, setBuilderTag] = useState<'daily' | 'monthly' | 'special'>('daily');
  const [builderPeriodDays, setBuilderPeriodDays] = useState(30);

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === selectedId) || null,
    [templates, selectedId]
  );

  const systemTemplates = useMemo(
    () => templates.filter(t => t.isSystem && t.name.toLowerCase().includes(searchText.toLowerCase())),
    [templates, searchText]
  );
  const userTemplates = useMemo(
    () => templates.filter(t => !t.isSystem && t.name.toLowerCase().includes(searchText.toLowerCase())),
    [templates, searchText]
  );

  const openBuilder = (template?: ReportTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setBuilderDataSource(template.dataSource);
      setBuilderDimensions(template.dimensions);
      setBuilderMetrics(template.metrics);
      setBuilderName(template.name);
      setBuilderDesc(template.description);
      setBuilderTag(template.tag);
      setBuilderPeriodDays(template.defaultFilters.defaultPeriodDays || 30);
    } else {
      setEditingTemplate(null);
      setBuilderDataSource('operations');
      setBuilderDimensions([]);
      setBuilderMetrics([]);
      setBuilderName('');
      setBuilderDesc('');
      setBuilderTag('daily');
      setBuilderPeriodDays(30);
    }
    setCurrentStep(0);
    setDrawerOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!builderName.trim()) {
      message.warning(t('reportCenter.custom.nameRequired', '请输入模板名称'));
      return;
    }
    if (builderDimensions.length === 0) {
      message.warning(t('reportCenter.custom.dimensionRequired', '请至少选择一个维度'));
      return;
    }
    if (builderMetrics.length === 0) {
      message.warning(t('reportCenter.custom.metricRequired', '请至少选择一个指标'));
      return;
    }

    const now = new Date().toISOString();
    if (editingTemplate) {
      setTemplates(prev => prev.map(tpl =>
        tpl.id === editingTemplate.id
          ? { ...tpl, name: builderName, description: builderDesc, dataSource: builderDataSource, dimensions: builderDimensions, metrics: builderMetrics, tag: builderTag, defaultFilters: { defaultPeriodDays: builderPeriodDays }, updatedAt: now }
          : tpl
      ));
      message.success(t('reportCenter.custom.updateSuccess', '模板更新成功'));
    } else {
      const newTemplate: ReportTemplate = {
        id: `RPT-TPL-${String(templates.length + 1).padStart(4, '0')}`,
        name: builderName,
        description: builderDesc,
        dataSource: builderDataSource,
        dimensions: builderDimensions,
        metrics: builderMetrics,
        timeGranularity: 'month',
        defaultFilters: { defaultPeriodDays: builderPeriodDays },
        tag: builderTag,
        isSystem: false,
        createdBy: 'U001',
        createdAt: now,
        updatedAt: now,
      };
      setTemplates(prev => [...prev, newTemplate]);
      setSelectedId(newTemplate.id);
      message.success(t('reportCenter.custom.createSuccess', '模板创建成功'));
    }
    setDrawerOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
    message.success(t('reportCenter.custom.deleteSuccess', '模板已删除'));
  };

  const handleGenerate = () => {
    setReportGenerated(true);
    message.success(t('reportCenter.generateSuccess', '报表生成成功'));
  };

  const handleExport = () => {
    message.info(t('reportCenter.exportMvpTip', '导出功能将在后端实现后启用'));
  };

  // Dynamic columns for custom report preview
  const previewColumns = useMemo(() => {
    if (!selectedTemplate) return [];
    const cols: Array<{ title: string; dataIndex: string; key: string; width: number; render?: (v: number) => string }> = [
      { title: t('reportCenter.dimension.label', '维度'), dataIndex: 'dimensionLabel', key: 'dimensionLabel', width: 150 },
    ];
    selectedTemplate.metrics.forEach(m => {
      const metricOpts = METRIC_OPTIONS_BY_SOURCE[selectedTemplate.dataSource];
      const opt = metricOpts.find(o => o.value === m);
      cols.push({
        title: opt ? t(opt.labelKey, m) : m,
        dataIndex: m,
        key: m,
        width: 130,
        render: (v: number) => typeof v === 'number' ? v.toLocaleString() : String(v),
      });
    });
    return cols;
  }, [selectedTemplate, t]);

  const scrollX = useMemo(() => previewColumns.reduce((sum, c) => sum + c.width, 0), [previewColumns]);

  const getDimensionLabel = (d: ReportDimension) => {
    const labelMap: Record<ReportDimension, string> = {
      time: t('reportCenter.dimension.time', '时间'),
      station: t('reportCenter.dimension.station', '站点'),
      fuelType: t('reportCenter.dimension.fuelType', '燃料类型'),
      shift: t('reportCenter.dimension.shift', '班次'),
    };
    return labelMap[d] || d;
  };

  const getMetricLabel = (m: ReportMetric) => {
    if (!selectedTemplate) return m;
    const opts = METRIC_OPTIONS_BY_SOURCE[selectedTemplate.dataSource];
    const opt = opts.find(o => o.value === m);
    return opt ? t(opt.labelKey, m) : m;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>{t('reportCenter.custom.title', '自定义报表')}</h2>
        <RequirementTag componentIds={['report-template-create', 'report-template-manage', 'report-generate', 'report-export']} module="report-center" showDetail />
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* 左侧模板列表 */}
        <div style={{ width: 280, flexShrink: 0, background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', padding: 16 }}>
          <Search
            placeholder={t('reportCenter.custom.searchTemplate', '搜索模板')}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Button type="dashed" block icon={<PlusOutlined />} onClick={() => openBuilder()} style={{ marginBottom: 16 }}>
            {t('reportCenter.custom.newTemplate', '新建模板')}
          </Button>

          <Divider style={{ fontSize: 12 }}>{t('reportCenter.custom.systemTemplates', '系统模板')}</Divider>
          <Menu
            mode="inline"
            selectedKeys={selectedId ? [selectedId] : []}
            style={{ border: 'none' }}
            items={systemTemplates.map(tpl => ({
              key: tpl.id,
              icon: <LockOutlined />,
              label: (
                <Space size={4}>
                  <Tag color={DATA_SOURCE_CONFIG[tpl.dataSource]?.color} style={{ fontSize: 10, padding: '0 4px' }}>
                    {t(DATA_SOURCE_CONFIG[tpl.dataSource]?.labelKey, tpl.dataSource)}
                  </Tag>
                  <span>{tpl.name}</span>
                </Space>
              ),
              onClick: () => { setSelectedId(tpl.id); setReportGenerated(false); },
            }))}
          />

          <Divider style={{ fontSize: 12 }}>{t('reportCenter.custom.myTemplates', '我的模板')}</Divider>
          {userTemplates.length > 0 ? (
            <Menu
              mode="inline"
              selectedKeys={selectedId ? [selectedId] : []}
              style={{ border: 'none' }}
              items={userTemplates.map(tpl => ({
                key: tpl.id,
                label: (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={4}>
                      <Tag color={DATA_SOURCE_CONFIG[tpl.dataSource]?.color} style={{ fontSize: 10, padding: '0 4px' }}>
                        {t(DATA_SOURCE_CONFIG[tpl.dataSource]?.labelKey, tpl.dataSource)}
                      </Tag>
                      <span>{tpl.name}</span>
                    </Space>
                  </div>
                ),
                onClick: () => { setSelectedId(tpl.id); setReportGenerated(false); },
              }))}
            />
          ) : (
            <Empty description={t('reportCenter.custom.noTemplates', '暂无自定义模板')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>

        {/* 右侧操作区 */}
        <div style={{ flex: 1 }}>
          {!selectedTemplate ? (
            <Card style={{ textAlign: 'center', padding: '60px 0' }}>
              <Empty description={t('reportCenter.custom.selectPrompt', '请选择左侧模板或创建新模板')} />
            </Card>
          ) : (
            <>
              <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedTemplate.name}</h3>
                    <Text type="secondary">{selectedTemplate.description}</Text>
                  </div>
                  {!selectedTemplate.isSystem && (
                    <Space>
                      <Button icon={<EditOutlined />} onClick={() => openBuilder(selectedTemplate)}>
                        {t('common.edit', '编辑')}
                      </Button>
                      <Popconfirm title={t('reportCenter.custom.deleteConfirm', '确定删除此模板？')} onConfirm={() => handleDeleteTemplate(selectedTemplate.id)}>
                        <Button danger icon={<DeleteOutlined />}>{t('common.delete', '删除')}</Button>
                      </Popconfirm>
                    </Space>
                  )}
                </div>

                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label={t('reportCenter.dataSourceLabel', '数据源')}>
                    <Tag color={DATA_SOURCE_CONFIG[selectedTemplate.dataSource]?.color}>
                      {t(DATA_SOURCE_CONFIG[selectedTemplate.dataSource]?.labelKey, selectedTemplate.dataSource)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('reportCenter.dimensionLabel', '维度')}>
                    {selectedTemplate.dimensions.map(d => <Tag key={d}>{getDimensionLabel(d)}</Tag>)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('reportCenter.metricLabel', '指标')}>
                    {selectedTemplate.metrics.map(m => <Tag key={m}>{getMetricLabel(m)}</Tag>)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('reportCenter.granularityLabel', '时间粒度')}>
                    {selectedTemplate.timeGranularity}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Row gutter={16} align="middle">
                  <Col>
                    <DatePicker.RangePicker />
                  </Col>
                  <Col>
                    <Select
                      mode="multiple"
                      placeholder={t('common.selectStation', '选择站点')}
                      options={STATION_OPTIONS}
                      style={{ minWidth: 200 }}
                    />
                  </Col>
                  <Col>
                    <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleGenerate}>
                      {t('reportCenter.actions.generate', '生成报表')}
                    </Button>
                  </Col>
                </Row>
              </Card>

              {reportGenerated && (
                <Card
                  title={`${selectedTemplate.name} — ${t('reportCenter.custom.preview', '预览')}`}
                  extra={
                    <Space>
                      <Segmented
                        options={[
                          { label: t('reportCenter.viewMode.table', '表格'), value: 'table' },
                          { label: t('reportCenter.viewMode.chart', '图表'), value: 'chart' },
                        ]}
                        value={viewMode}
                        onChange={(v) => setViewMode(v as string)}
                      />
                      <Button icon={<DownloadOutlined />} onClick={handleExport}>
                        {t('reportCenter.actions.exportExcel', '导出 Excel')}
                      </Button>
                      <Button onClick={handleExport}>
                        {t('reportCenter.actions.exportPdf', '导出 PDF')}
                      </Button>
                      <Button
                        type="text"
                        aria-label={t('reportCenter.actions.favorite', '收藏')}
                        icon={isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                        onClick={() => { setIsFavorite(!isFavorite); message.success(isFavorite ? '已取消收藏' : '已收藏'); }}
                      />
                    </Space>
                  }
                >
                  {viewMode === 'table' ? (
                    <Table
                      columns={previewColumns}
                      dataSource={mockCustomReportData.rows}
                      rowKey="dimensionKey"
                      scroll={{ x: scrollX }}
                      pagination={false}
                      size="small"
                    />
                  ) : (
                    <div>
                      {selectedTemplate.dimensions.includes('time') ? (
                        <LineChart
                          data={mockCustomReportData.rows.map(r => ({ date: r.dimensionLabel, value: Number(r[selectedTemplate.metrics[0]] || 0), seriesName: selectedTemplate.metrics[0] }))}
                          height={350}
                        />
                      ) : (
                        <BarChart
                          data={mockCustomReportData.rows.map(r => ({ name: r.dimensionLabel, value: Number(r[selectedTemplate.metrics[0]] || 0) }))}
                          height={350}
                        />
                      )}
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* 模板构建器 Drawer */}
      <Drawer
        title={editingTemplate
          ? t('reportCenter.custom.editTemplate', '编辑报表模板')
          : t('reportCenter.custom.buildTemplate', '创建报表模板')
        }
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
              {t('common.prev', '上一步')}
            </Button>
            <Space>
              {currentStep < 3 && (
                <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  {t('common.next', '下一步')}
                </Button>
              )}
              {currentStep === 3 && (
                <Button type="primary" onClick={handleSaveTemplate}>
                  {t('common.save', '保存')}
                </Button>
              )}
            </Space>
          </div>
        }
      >
        <Steps
          current={currentStep}
          size="small"
          style={{ marginBottom: 32 }}
          items={[
            { title: t('reportCenter.builder.step1', '数据源') },
            { title: t('reportCenter.builder.step2', '维度') },
            { title: t('reportCenter.builder.step3', '指标') },
            { title: t('reportCenter.builder.step4', '命名') },
          ]}
        />

        {currentStep === 0 && (
          <Radio.Group
            value={builderDataSource}
            onChange={e => {
              setBuilderDataSource(e.target.value);
              setBuilderDimensions([]);
              setBuilderMetrics([]);
            }}
            style={{ width: '100%' }}
          >
            <Row gutter={[16, 16]}>
              {(Object.keys(DATA_SOURCE_CONFIG) as ReportDataSource[]).map(ds => (
                <Col span={8} key={ds}>
                  <Radio.Button value={ds} style={{ width: '100%', height: 'auto', textAlign: 'center', padding: '16px 8px' }}>
                    <div>{DATA_SOURCE_ICONS[ds]}</div>
                    <div style={{ marginTop: 8 }}>{t(DATA_SOURCE_CONFIG[ds].labelKey, ds)}</div>
                  </Radio.Button>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        )}

        {currentStep === 1 && (
          <Checkbox.Group
            value={builderDimensions}
            onChange={vals => setBuilderDimensions(vals as ReportDimension[])}
            style={{ width: '100%' }}
          >
            <Row gutter={[0, 12]}>
              {DIMENSION_OPTIONS_BY_SOURCE[builderDataSource].map(opt => (
                <Col span={24} key={opt.value}>
                  <Checkbox value={opt.value}>{getDimensionLabel(opt.value)}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        )}

        {currentStep === 2 && (
          <Checkbox.Group
            value={builderMetrics}
            onChange={vals => setBuilderMetrics(vals as ReportMetric[])}
            style={{ width: '100%' }}
          >
            <Row gutter={[0, 12]}>
              {METRIC_OPTIONS_BY_SOURCE[builderDataSource].map(opt => (
                <Col span={24} key={opt.value}>
                  <Checkbox value={opt.value}>{t(opt.labelKey, opt.value)}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        )}

        {currentStep === 3 && (
          <Form layout="vertical">
            <Form.Item label={t('reportCenter.builder.templateName', '模板名称')} required>
              <Input value={builderName} onChange={e => setBuilderName(e.target.value)} maxLength={50} />
            </Form.Item>
            <Form.Item label={t('reportCenter.builder.description', '描述')}>
              <Input.TextArea value={builderDesc} onChange={e => setBuilderDesc(e.target.value)} maxLength={200} rows={3} />
            </Form.Item>
            <Form.Item label={t('reportCenter.builder.tag', '标签')}>
              <Select value={builderTag} onChange={setBuilderTag} options={TEMPLATE_TAG_OPTIONS.map(o => ({ value: o.value, label: t(o.labelKey, o.value) }))} />
            </Form.Item>
            <Form.Item label={t('reportCenter.builder.defaultPeriod', '默认时间范围')}>
              <InputNumber value={builderPeriodDays} onChange={v => setBuilderPeriodDays(v || 30)} min={1} max={365} addonAfter={t('common.days', '天')} />
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default CustomReport;
