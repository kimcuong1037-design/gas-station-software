// P16: 检查报表详情页
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Descriptions, Table, Tag, Space, Empty } from 'antd';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';
import { inspectionReports } from '../../../../mock/inspections';
import { REPORT_TYPE_CONFIG, getLabel } from '../constants';
import { RequirementTag } from '../../../../components/RequirementTag';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/** Generate placeholder table data based on report type */
const getReportContent = (reportType: string) => {
  switch (reportType) {
    case 'completion':
      return {
        columns: [
          { title: '站点', dataIndex: 'station', key: 'station' },
          { title: '计划任务', dataIndex: 'planned', key: 'planned', align: 'center' as const },
          { title: '已完成', dataIndex: 'completed', key: 'completed', align: 'center' as const },
          { title: '完成率', dataIndex: 'rate', key: 'rate', align: 'center' as const, render: (val: string) => <Text strong>{val}</Text> },
        ],
        data: [
          { key: '1', station: '杭州西湖加气站', planned: 42, completed: 38, rate: '90.5%' },
          { key: '2', station: '杭州萧山加气站', planned: 35, completed: 35, rate: '100%' },
          { key: '3', station: '杭州余杭加气站', planned: 28, completed: 22, rate: '78.6%' },
        ],
      };
    case 'abnormal':
      return {
        columns: [
          { title: '分类', dataIndex: 'category', key: 'category' },
          { title: '异常次数', dataIndex: 'count', key: 'count', align: 'center' as const },
          { title: '占比', dataIndex: 'ratio', key: 'ratio', align: 'center' as const },
          { title: '主要问题', dataIndex: 'issue', key: 'issue', ellipsis: true },
        ],
        data: [
          { key: '1', category: '加气机', count: 3, ratio: '37.5%', issue: '加气枪密封件老化、软管裂纹' },
          { key: '2', category: '罐区环保', count: 2, ratio: '25.0%', issue: '泄漏报警器灵敏度下降' },
          { key: '3', category: '配电室', count: 2, ratio: '25.0%', issue: '散热风扇异响' },
          { key: '4', category: '加油区域', count: 1, ratio: '12.5%', issue: '安全标识褪色' },
        ],
      };
    case 'rectification':
      return {
        columns: [
          { title: '问题编号', dataIndex: 'issueNo', key: 'issueNo' },
          { title: '问题描述', dataIndex: 'description', key: 'description', ellipsis: true },
          { title: '等级', dataIndex: 'severity', key: 'severity', align: 'center' as const },
          { title: '状态', dataIndex: 'status', key: 'status', align: 'center' as const },
          { title: '整改天数', dataIndex: 'days', key: 'days', align: 'center' as const },
        ],
        data: [
          { key: '1', issueNo: 'IS-HZXH-0219-001', description: '加气枪#2微量泄漏', severity: '高', status: '处理中', days: 0 },
          { key: '2', issueNo: 'IS-HZXH-0218-001', description: '加气枪#2软管裂纹', severity: '中', status: '已闭环', days: 1 },
          { key: '3', issueNo: 'IS-HZXH-0216-001', description: '配电柜散热风扇异响', severity: '紧急', status: '待验收', days: 3 },
        ],
      };
    default:
      return { columns: [], data: [] };
  }
};

const InspectionReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const report = inspectionReports.find((r) => r.id === id);

  if (!report) {
    return (
      <div data-testid="inspection-report-detail">
        <Card>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/operations/inspection/analytics?tab=reports')}
            style={{ marginBottom: 16 }}
          >
            返回
          </Button>
          <Empty description="报表不存在" />
        </Card>
      </div>
    );
  }

  const typeConfig = REPORT_TYPE_CONFIG[report.reportType];
  const content = getReportContent(report.reportType);

  return (
    <div data-testid="inspection-report-detail">
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/operations/inspection/analytics?tab=reports')}
              >
                返回
              </Button>
              <Title level={4} style={{ margin: 0 }}>{report.name}</Title>
              <RequirementTag componentIds={['report-generate', 'report-export', 'report-scheduled']} module="inspection" showDetail />
            </Space>
            <Button icon={<ExportOutlined />} disabled>
              导出
            </Button>
          </div>

          {/* Report info */}
          <Descriptions bordered column={2}>
            <Descriptions.Item label="报表类型">
              {typeConfig ? <Tag color={typeConfig.color}>{getLabel(typeConfig)}</Tag> : report.reportType}
            </Descriptions.Item>
            <Descriptions.Item label="时间范围">
              {report.timeRange}
            </Descriptions.Item>
            <Descriptions.Item label="生成时间">
              {dayjs(report.generatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="生成人">
              {report.generatedBy.name}
            </Descriptions.Item>
          </Descriptions>

          {/* Content table */}
          <Card title="报表内容" size="small" type="inner">
            {content.columns.length > 0 ? (
              <Table
                rowKey="key"
                columns={content.columns}
                dataSource={content.data as Record<string, unknown>[]}
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="暂无报表内容" />
            )}
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default InspectionReportDetail;
