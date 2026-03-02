import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { useChartTheme } from './useChartTheme';
import { createBaseOption } from './chartDefaults';
import BaseChart from './BaseChart';

export interface ReferenceLine {
  value: number;
  label: string;
  color?: string;
  lineStyle?: 'solid' | 'dashed';
}

interface LineChartProps {
  data: { date: string; value: number; seriesName: string }[];
  height?: number;
  yAxisLabel?: string;
  yAxisUnit?: string;
  smooth?: boolean;
  referenceLines?: ReferenceLine[];
  loading?: boolean;
  emptyText?: string;
  onPointClick?: (params: { date: string; seriesName: string; value: number }) => void;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 300,
  yAxisLabel,
  yAxisUnit,
  smooth = true,
  referenceLines,
  loading = false,
  emptyText,
  onPointClick,
}) => {
  const chartTheme = useChartTheme();

  const option = useMemo<EChartsOption>(() => {
    if (data.length === 0) return {};

    const base = createBaseOption(chartTheme);

    // Group data by seriesName
    const seriesMap = new Map<string, { date: string; value: number }[]>();
    const dateSet = new Set<string>();
    for (const point of data) {
      dateSet.add(point.date);
      if (!seriesMap.has(point.seriesName)) {
        seriesMap.set(point.seriesName, []);
      }
      seriesMap.get(point.seriesName)!.push({ date: point.date, value: point.value });
    }

    const dates = Array.from(dateSet).sort();
    const seriesNames = Array.from(seriesMap.keys());

    // Build markLine for reference lines (attach to first series only)
    const markLineData = referenceLines?.map(ref => ({
      yAxis: ref.value,
      name: ref.label,
      label: { formatter: ref.label, position: 'insideEndTop' as const },
      lineStyle: {
        color: ref.color ?? chartTheme.referenceLineColor,
        type: (ref.lineStyle ?? 'dashed') as 'solid' | 'dashed',
      },
    }));

    const series = seriesNames.map((name, index) => {
      const seriesData = seriesMap.get(name)!;
      // Create a date-indexed map for O(1) lookup
      const dateValueMap = new Map(seriesData.map(d => [d.date, d.value]));

      const result: Record<string, unknown> = {
        name,
        type: 'line',
        smooth,
        data: dates.map(d => dateValueMap.get(d) ?? null),
        itemStyle: { color: chartTheme.colorPalette[index % chartTheme.colorPalette.length] },
        lineStyle: { width: 2 },
        symbolSize: 4,
      };

      // Attach markLine only to the first series to avoid duplicates
      if (index === 0 && markLineData && markLineData.length > 0) {
        result.markLine = {
          silent: true,
          symbol: 'none',
          data: markLineData,
        };
      }

      return result;
    });

    return {
      ...base,
      xAxis: {
        ...base.xAxis as object,
        data: dates,
      },
      yAxis: {
        ...base.yAxis as object,
        name: yAxisLabel ?? (yAxisUnit ? `(${yAxisUnit})` : undefined),
      },
      series,
    };
  }, [data, chartTheme, smooth, referenceLines, yAxisLabel, yAxisUnit]);

  const events = useMemo(() => {
    if (!onPointClick) return undefined;
    return {
      click: (params: unknown) => {
        const p = params as { name: string; seriesName: string; value: number };
        onPointClick({ date: p.name, seriesName: p.seriesName, value: p.value });
      },
    };
  }, [onPointClick]);

  return (
    <BaseChart
      option={option}
      height={height}
      loading={loading}
      empty={data.length === 0}
      emptyText={emptyText}
      onEvents={events}
    />
  );
};

export default LineChart;
