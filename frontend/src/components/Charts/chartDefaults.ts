import type { EChartsOption } from 'echarts';
import type { ChartTheme } from './useChartTheme';

export function createBaseOption(chartTheme: ChartTheme): EChartsOption {
  return {
    grid: { top: 40, right: 16, bottom: 24, left: 48, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartTheme.tooltipBg,
      borderColor: chartTheme.tooltipBorderColor,
      textStyle: {
        color: chartTheme.textColor,
        fontFamily: chartTheme.fontFamily,
        fontSize: chartTheme.fontSize,
      },
    },
    legend: {
      textStyle: {
        color: chartTheme.textColor,
        fontFamily: chartTheme.fontFamily,
      },
    },
    xAxis: {
      type: 'category',
      axisLine: { lineStyle: { color: chartTheme.axisLineColor } },
      axisLabel: { color: chartTheme.textColorSecondary, fontSize: chartTheme.fontSizeSm },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: chartTheme.splitLineColor, type: 'dashed' } },
      axisLabel: { color: chartTheme.textColorSecondary, fontSize: chartTheme.fontSizeSm },
    },
  };
}
