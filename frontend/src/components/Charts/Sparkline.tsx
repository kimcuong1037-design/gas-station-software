import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { useChartTheme } from './useChartTheme';
import BaseChart from './BaseChart';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 24,
  color,
}) => {
  const chartTheme = useChartTheme();
  const seriesColor = color ?? chartTheme.colorPalette[0];

  const option = useMemo<EChartsOption>(() => {
    if (data.length === 0) return {};

    return {
      animation: false,
      grid: { top: 2, right: 2, bottom: 2, left: 2 },
      xAxis: { type: 'category', show: false },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'line',
        data,
        smooth: true,
        lineStyle: { width: 1, color: seriesColor },
        itemStyle: { color: seriesColor },
        symbolSize: 0,
      }],
    };
  }, [data, seriesColor]);

  return (
    <BaseChart
      option={option}
      height={height}
      empty={data.length === 0}
      style={{ width }}
    />
  );
};

export default Sparkline;
