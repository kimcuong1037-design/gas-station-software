import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { useChartTheme } from './useChartTheme';
import { createBaseOption } from './chartDefaults';
import BaseChart from './BaseChart';

interface BarChartProps {
  data: { name: string; value: number; group?: string }[];
  height?: number;
  horizontal?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  highlightPredicate?: (item: { name: string; value: number }) => boolean;
  highlightColor?: string;
  loading?: boolean;
  emptyText?: string;
  onBarClick?: (params: { name: string; value: number; group?: string }) => void;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  horizontal = false,
  xAxisLabel,
  yAxisLabel,
  highlightPredicate,
  highlightColor,
  loading = false,
  emptyText,
  onBarClick,
}) => {
  const chartTheme = useChartTheme();

  const option = useMemo<EChartsOption>(() => {
    if (data.length === 0) return {};

    const base = createBaseOption(chartTheme);

    // Group data by group field
    const groups = new Map<string, { name: string; value: number }[]>();
    const nameSet: string[] = [];
    const nameAdded = new Set<string>();

    for (const item of data) {
      const groupKey = item.group ?? '_default';
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)!.push({ name: item.name, value: item.value });
      if (!nameAdded.has(item.name)) {
        nameAdded.add(item.name);
        nameSet.push(item.name);
      }
    }

    const groupKeys = Array.from(groups.keys());
    const isGrouped = groupKeys.length > 1 || groupKeys[0] !== '_default';

    const categoryAxis = {
      type: 'category' as const,
      data: nameSet,
      axisLine: { lineStyle: { color: chartTheme.axisLineColor } },
      axisLabel: { color: chartTheme.textColorSecondary, fontSize: chartTheme.fontSizeSm },
      name: horizontal ? yAxisLabel : xAxisLabel,
    };

    const valueAxis = {
      type: 'value' as const,
      splitLine: { lineStyle: { color: chartTheme.splitLineColor, type: 'dashed' as const } },
      axisLabel: { color: chartTheme.textColorSecondary, fontSize: chartTheme.fontSizeSm },
      name: horizontal ? xAxisLabel : yAxisLabel,
    };

    const series = groupKeys.map((groupKey, gIdx) => {
      const groupData = groups.get(groupKey)!;
      const nameValueMap = new Map(groupData.map(d => [d.name, d.value]));

      const seriesData = nameSet.map(name => {
        const value = nameValueMap.get(name) ?? 0;
        const itemStyle: Record<string, unknown> = {};
        if (highlightPredicate && highlightPredicate({ name, value })) {
          itemStyle.color = highlightColor ?? chartTheme.colorPalette[0];
        }
        return { value, itemStyle: Object.keys(itemStyle).length > 0 ? itemStyle : undefined };
      });

      return {
        name: isGrouped ? groupKey : undefined,
        type: 'bar' as const,
        data: seriesData,
        itemStyle: {
          color: chartTheme.colorPalette[gIdx % chartTheme.colorPalette.length],
          borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
        },
        barMaxWidth: 40,
        ...(onBarClick ? { emphasis: { itemStyle: { cursor: 'pointer' } }, cursor: 'pointer' } : {}),
      };
    });

    return {
      ...base,
      tooltip: {
        ...base.tooltip as object,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: isGrouped ? { ...base.legend as object } : undefined,
      xAxis: horizontal ? valueAxis : categoryAxis,
      yAxis: horizontal ? categoryAxis : valueAxis,
      series,
    };
  }, [data, chartTheme, horizontal, xAxisLabel, yAxisLabel, highlightPredicate, highlightColor]);

  const events = useMemo(() => {
    if (!onBarClick) return undefined;
    return {
      click: (params: unknown) => {
        const p = params as { name: string; value: number; seriesName: string };
        onBarClick({ name: p.name, value: p.value, group: p.seriesName });
      },
    };
  }, [onBarClick]);

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

export default BarChart;
