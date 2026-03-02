import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Empty, Spin } from 'antd';
import type { EChartsOption } from 'echarts';

interface BaseChartProps {
  option: EChartsOption;
  height?: number;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  style?: React.CSSProperties;
  onEvents?: Record<string, (params: unknown) => void>;
}

const BaseChart: React.FC<BaseChartProps> = ({
  option,
  height = 300,
  loading = false,
  empty = false,
  emptyText,
  style,
  onEvents,
}) => {
  if (empty) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        <Empty description={emptyText} />
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <ReactECharts
        option={option}
        style={{ height, ...style }}
        notMerge
        lazyUpdate
        opts={{ renderer: 'svg' }}
        onEvents={onEvents}
      />
    </Spin>
  );
};

export default BaseChart;
