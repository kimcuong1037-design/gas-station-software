import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { useChartTheme } from './useChartTheme';
import BaseChart from './BaseChart';

interface MiniChartProps {
  data: { date: string; value: number }[];
  height?: number;
  color?: string;
  referenceValue?: number;
  showTooltip?: boolean;
}

const MiniChart: React.FC<MiniChartProps> = ({
  data,
  height = 80,
  color,
  referenceValue,
  showTooltip = true,
}) => {
  const chartTheme = useChartTheme();
  const seriesColor = color ?? chartTheme.colorPalette[0];

  const option = useMemo<EChartsOption>(() => {
    if (data.length === 0) return {};

    const dates = data.map(d => d.date);
    const values = data.map(d => d.value);

    const markLineData = referenceValue != null
      ? [{
          yAxis: referenceValue,
          label: { show: false },
          lineStyle: { color: chartTheme.referenceLineColor, type: 'dashed' as const, width: 1 },
        }, {
          yAxis: -referenceValue,
          label: { show: false },
          lineStyle: { color: chartTheme.referenceLineColor, type: 'dashed' as const, width: 1 },
        }]
      : undefined;

    return {
      grid: { top: 4, right: 4, bottom: 4, left: 4 },
      tooltip: showTooltip ? {
        trigger: 'axis',
        backgroundColor: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorderColor,
        textStyle: { color: chartTheme.textColor, fontSize: chartTheme.fontSizeSm },
      } : undefined,
      xAxis: {
        type: 'category',
        data: dates,
        show: false,
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [{
        type: 'line',
        data: values,
        smooth: true,
        lineStyle: { width: 1.5, color: seriesColor },
        itemStyle: { color: seriesColor },
        areaStyle: { color: seriesColor, opacity: 0.1 },
        symbolSize: 0,
        ...(markLineData ? {
          markLine: {
            silent: true,
            symbol: 'none',
            data: markLineData,
          },
        } : {}),
      }],
    };
  }, [data, seriesColor, referenceValue, showTooltip, chartTheme]);

  return (
    <BaseChart
      option={option}
      height={height}
      empty={data.length === 0}
      style={{ marginTop: 8 }}
    />
  );
};

export default MiniChart;
