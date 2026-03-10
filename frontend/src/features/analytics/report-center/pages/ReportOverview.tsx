import React, { useState } from 'react';
import { Card, Row, Col, List, Tag, Calendar, Popover, Empty, Typography } from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  SwapOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { RequirementTag } from '../../../../components/RequirementTag';
import { REPORT_TYPE_CONFIG, REPORT_CENTER_ROUTES } from '../constants';
import { mockReportInstances, mockCalendarData } from '../mockData/reportInstanceMock';
import type { ReportType } from '../types';

const { Text } = Typography;

const QUICK_ACCESS_ITEMS: { type: ReportType; icon: React.ReactNode }[] = [
  { type: 'daily_operations', icon: <BarChartOutlined style={{ fontSize: 28, color: '#1890ff' }} /> },
  { type: 'monthly_operations', icon: <LineChartOutlined style={{ fontSize: 28, color: '#2f54eb' }} /> },
  { type: 'shift_handover', icon: <SwapOutlined style={{ fontSize: 28, color: '#722ed1' }} /> },
  { type: 'inspection', icon: <SafetyCertificateOutlined style={{ fontSize: 28, color: '#fa8c16' }} /> },
  { type: 'inventory', icon: <DatabaseOutlined style={{ fontSize: 28, color: '#52c41a' }} /> },
];

const ReportOverview: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState(mockReportInstances);

  const favoriteReports = reports.filter(r => r.isFavorite);
  const recentReports = [...reports].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)).slice(0, 5);

  const toggleFavorite = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  const getLastGenerated = (type: ReportType) => {
    const found = reports.filter(r => r.type === type).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
    return found ? dayjs(found.generatedAt).format('YYYY-MM-DD') : '—';
  };

  const calendarDataMap = new Map(mockCalendarData.map(d => [d.date, d.reports]));

  const cellRender = (current: Dayjs) => {
    const dateStr = current.format('YYYY-MM-DD');
    const dayReports = calendarDataMap.get(dateStr);
    if (!dayReports || dayReports.length === 0) {
      return <div style={{ minHeight: 24 }} />;
    }

    const content = (
      <List
        size="small"
        dataSource={dayReports}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: 'pointer', padding: '4px 0' }}
            onClick={() => navigate(`${REPORT_CENTER_ROUTES.STANDARD}?tab=${item.type}`)}
          >
            <Tag color={REPORT_TYPE_CONFIG[item.type]?.color}>
              {t(REPORT_TYPE_CONFIG[item.type]?.labelKey, item.type)}
            </Tag>
            <Text type="secondary">×{item.count}</Text>
          </List.Item>
        )}
      />
    );

    return (
      <Popover content={content} title={dateStr} trigger="click">
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', cursor: 'pointer', minHeight: 24 }}>
          {dayReports.map((r) => {
            const cfg = REPORT_TYPE_CONFIG[r.type];
            const colorMap: Record<string, string> = {
              blue: '#1890ff', geekblue: '#2f54eb', purple: '#722ed1',
              orange: '#fa8c16', green: '#52c41a', default: '#d9d9d9',
            };
            return (
              <span
                key={r.type}
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: colorMap[cfg?.color] || '#d9d9d9',
                }}
              />
            );
          })}
        </div>
      </Popover>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>{t('reportCenter.overview.title', '报表总览')}</h2>
        <RequirementTag componentIds={['report-calendar', 'report-favorite', 'report-search']} module="report-center" showDetail />
      </div>

      {/* 快速入口 */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12 }}>{t('reportCenter.overview.quickAccess', '快速入口')}</h4>
        <Row gutter={[16, 16]}>
          {QUICK_ACCESS_ITEMS.map(({ type, icon }) => {
            const cfg = REPORT_TYPE_CONFIG[type];
            return (
              <Col key={type} xs={12} sm={8} md={8} lg={4} xl={4}>
                <Card
                  hoverable
                  onClick={() => navigate(`${REPORT_CENTER_ROUTES.STANDARD}?tab=${type}`)}
                  style={{ textAlign: 'center' }}
                  styles={{ body: { padding: '20px 12px' } }}
                >
                  <div style={{ marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{t(cfg.labelKey, type)}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t('reportCenter.overview.lastGenerated', '最近生成')}: {getLastGenerated(type)}
                  </Text>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* 收藏 + 最近 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title={t('reportCenter.overview.favorites', '我的收藏')} size="small">
            {favoriteReports.length > 0 ? (
              <List
                size="small"
                dataSource={favoriteReports}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <StarFilled
                        key="star"
                        style={{ color: '#faad14', cursor: 'pointer' }}
                        onClick={() => toggleFavorite(item.id)}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Tag color={REPORT_TYPE_CONFIG[item.type]?.color}>{t(REPORT_TYPE_CONFIG[item.type]?.labelKey, item.type)}</Tag>}
                      title={
                        <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => navigate(`${REPORT_CENTER_ROUTES.STANDARD}?tab=${item.type}`)}>
                          {item.title}
                        </span>
                      }
                      description={dayjs(item.generatedAt).format('YYYY-MM-DD HH:mm')}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={t('reportCenter.overview.noFavorites', '暂无收藏报表')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={t('reportCenter.overview.recent', '最近查看')} size="small">
            {recentReports.length > 0 ? (
              <List
                size="small"
                dataSource={recentReports}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Tag color={REPORT_TYPE_CONFIG[item.type]?.color}>{t(REPORT_TYPE_CONFIG[item.type]?.labelKey, item.type)}</Tag>}
                      title={
                        <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => navigate(`${REPORT_CENTER_ROUTES.STANDARD}?tab=${item.type}`)}>
                          {item.title}
                        </span>
                      }
                      description={dayjs(item.generatedAt).format('YYYY-MM-DD HH:mm')}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={t('reportCenter.overview.noRecent', '暂无查看记录')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>

      {/* 报表日历 */}
      <Card title={t('reportCenter.overview.calendar', '报表日历')}>
        <Calendar
          fullscreen={false}
          cellRender={(current, info) => {
            if (info.type === 'date') return cellRender(current);
            return info.originNode;
          }}
        />
      </Card>
    </div>
  );
};

export default ReportOverview;
