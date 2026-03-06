import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { useChartTheme } from './useChartTheme';
import BaseChart from './BaseChart';

interface PieChartProps {
  data: { name: string; value: number }[];
  height?: number;
  doughnut?: boolean;
  centerLabel?: string;
  centerValue?: string;
  loading?: boolean;
  emptyText?: string;
  colors?: string[];
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  doughnut = true,
  centerLabel,
  centerValue,
  loading = false,
  emptyText,
  colors,
}) => {
  const chartTheme = useChartTheme();

  const option = useMemo<EChartsOption>(() => {
    if (data.length === 0) return {};

    const palette = colors ?? chartTheme.colorPalette;

    const seriesData = data.map((item, i) => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: palette[i % palette.length] },
    }));

    const graphic = doughnut && centerValue
      ? [
          {
            type: 'group' as const,
            left: 'center',
            top: 'center',
            children: [
              {
                type: 'text' as const,
                style: {
                  text: centerValue,
                  textAlign: 'center' as const,
                  fill: chartTheme.textColor,
                  fontSize: 20,
                  fontWeight: 'bold' as const,
                  fontFamily: chartTheme.fontFamily,
                },
                z: 10,
              },
              ...(centerLabel
                ? [{
                    type: 'text' as const,
                    style: {
                      text: centerLabel,
                      textAlign: 'center' as const,
                      fill: chartTheme.textColorSecondary,
                      fontSize: chartTheme.fontSizeSm,
                      fontFamily: chartTheme.fontFamily,
                    },
                    top: 24,
                    z: 10,
                  }]
                : []),
            ],
          },
        ]
      : undefined;

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorderColor,
        textStyle: {
          color: chartTheme.textColor,
          fontFamily: chartTheme.fontFamily,
          fontSize: chartTheme.fontSize,
        },
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; percent: number };
          return `${p.name}<br/>¥${p.value.toLocaleString()}<br/>${p.percent}%`;
        },
      },
      legend: {
        orient: 'horizontal' as const,
        bottom: 0,
        textStyle: {
          color: chartTheme.textColor,
          fontFamily: chartTheme.fontFamily,
        },
      },
      graphic,
      series: [
        {
          type: 'pie',
          radius: doughnut ? ['50%', '75%'] : ['0%', '75%'],
          center: ['50%', '45%'],
          data: seriesData,
          label: { show: false },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
        },
      ],
    };
  }, [data, chartTheme, doughnut, centerLabel, centerValue, colors]);

  return (
    <BaseChart
      option={option}
      height={height}
      loading={loading}
      empty={data.length === 0}
      emptyText={emptyText}
    />
  );
};

export default PieChart;
