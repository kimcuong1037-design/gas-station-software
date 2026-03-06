import React, { useState } from 'react';
import { Card, Statistic, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Sparkline } from '../../../../components/Charts';
import GrowthBadge from './GrowthBadge';
import { GROWTH_BG_THRESHOLD, GROWTH_HIGHLIGHT_THRESHOLD } from '../constants';

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  precision?: number;
  growth?: number | null;
  sparklineData?: number[];
  tooltip?: string;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  growth,
  sparklineData,
  tooltip,
  onClick,
}) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const absGrowth = Math.abs(growth ?? 0);
  const isHighlight = absGrowth >= GROWTH_HIGHLIGHT_THRESHOLD;
  const isBgHighlight = absGrowth >= GROWTH_BG_THRESHOLD;

  let bgColor: string | undefined;
  if (isBgHighlight && growth !== null && growth !== undefined) {
    bgColor = growth > 0 ? '#f6ffed' : '#fff2f0';
  }

  return (
    <Card
      size="small"
      hoverable={!!onClick}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: bgColor, position: 'relative' }}
      styles={{ body: { padding: '16px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: '#999', fontSize: 13 }}>{title}</span>
        {tooltip && (
          <Tooltip title={tooltip}>
            <QuestionCircleOutlined style={{ color: '#999', fontSize: 13 }} />
          </Tooltip>
        )}
      </div>
      <Statistic
        value={value}
        prefix={prefix}
        suffix={suffix}
        precision={precision}
        valueStyle={{ fontWeight: isHighlight ? 700 : 500, fontSize: 24 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <GrowthBadge value={growth ?? null} tooltip={t('analytics.dashboard.kpi.growthTooltip', '与去年同期相比的增长百分比')} />
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline data={sparklineData} width={80} height={40} />
        )}
      </div>
      {onClick && hovered && (
        <div style={{ textAlign: 'right', marginTop: 4, fontSize: 12, color: '#1890ff' }}>
          {t('analytics.dashboard.kpi.viewDetail', '查看详情 ›')}
        </div>
      )}
    </Card>
  );
};

export default KPICard;
