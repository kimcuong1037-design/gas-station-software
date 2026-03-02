import { theme } from 'antd';

export interface ChartTheme {
  colorPalette: string[];
  textColor: string;
  textColorSecondary: string;
  splitLineColor: string;
  axisLineColor: string;
  backgroundColor: string;
  referenceLineColor: string;
  tooltipBg: string;
  tooltipBorderColor: string;
  fontFamily: string;
  fontSize: number;
  fontSizeSm: number;
}

export function useChartTheme(): ChartTheme {
  const { token } = theme.useToken();

  return {
    colorPalette: [
      token.colorPrimary,
      token.colorSuccess,
      token.colorInfo,
      token.colorWarning,
      token.colorError,
    ],
    textColor: token.colorText,
    textColorSecondary: token.colorTextSecondary,
    splitLineColor: token.colorBorderSecondary,
    axisLineColor: token.colorBorder,
    backgroundColor: 'transparent',
    referenceLineColor: token.colorError,
    tooltipBg: token.colorBgElevated,
    tooltipBorderColor: token.colorBorderSecondary,
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    fontSizeSm: token.fontSizeSM,
  };
}
