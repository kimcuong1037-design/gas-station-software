/**
 * Fluent-inspired Theme Configuration
 * 
 * 极简专业风主题配置 - 清洁能源绿色主题
 * - 无阴影卡片
 * - 透明表头
 * - 克制的色彩使用
 * - 高对比度文字
 * - 柔和绿色品牌色（代表 LNG 清洁能源）
 */
import type { ThemeConfig } from 'antd';

export const fluentTheme: ThemeConfig = {
  token: {
    // 品牌色 - 柔和绿色系
    colorPrimary: '#22A06B',       // 清新翠绿 - 主操作、链接
    colorSuccess: '#1F845A',       // 深绿 - 成功状态
    colorWarning: '#E79D13',       // 暖黄 - 警告状态
    colorError: '#CA3521',         // 砖红 - 错误状态
    colorInfo: '#22A06B',          // 与主色一致
    
    // 背景色
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#FAFAFA',
    colorBgElevated: '#FFFFFF',
    
    // 边框
    colorBorder: '#E1E1E1',
    colorBorderSecondary: '#F0F0F0',
    
    // 文字
    colorText: '#242424',
    colorTextSecondary: '#605E5C',
    colorTextTertiary: '#8A8A8A',
    colorTextQuaternary: '#A6A6A6',
    
    // 圆角
    borderRadius: 4,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // 字体
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                 'Helvetica Neue', Arial, 'Noto Sans SC', 'PingFang SC',
                 'Microsoft YaHei', sans-serif`,
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeHeading1: 28,
    fontSizeHeading2: 20,
    fontSizeHeading3: 16,
    fontSizeHeading4: 14,
    fontSizeHeading5: 12,
    
    // 行高
    lineHeight: 1.5714,
    
    // 控件尺寸
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
    
    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    
    // 阴影 - 极简风格无阴影
    boxShadow: 'none',
    boxShadowSecondary: 'none',
    boxShadowTertiary: 'none',
  },
  
  components: {
    // 按钮
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
      fontWeight: 500,
    },
    
    // 卡片 - 无阴影，底边框分隔
    Card: {
      boxShadow: 'none',
      boxShadowSecondary: 'none',
      paddingLG: 24,
    },
    
    // 表格 - 透明表头，极淡分隔线
    Table: {
      headerBg: 'transparent',
      headerColor: '#605E5C',
      headerSplitColor: '#E1E1E1',
      borderColor: '#F0F0F0',
      rowHoverBg: '#F5F5F5',
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
    
    // 标签
    Tag: {
      borderRadiusSM: 4,
    },
    
    // 输入框
    Input: {
      activeShadow: '0 0 0 2px rgba(34, 160, 107, 0.2)',
      hoverBorderColor: '#949494',
    },
    
    // 选择器
    Select: {
      optionSelectedBg: 'rgba(34, 160, 107, 0.08)',
    },
    
    // 菜单 (侧边栏)
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(34, 160, 107, 0.1)',
      itemSelectedColor: '#22A06B',
      itemHoverBg: '#F5F5F5',
      itemMarginBlock: 4,
      itemBorderRadius: 4,
    },
    
    // 布局
    Layout: {
      siderBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      bodyBg: '#FAFAFA',
    },
    
    // 面包屑
    Breadcrumb: {
      separatorMargin: 8,
      itemColor: '#8A8A8A',
      linkColor: '#605E5C',
      linkHoverColor: '#22A06B',
    },
    
    // 描述列表
    Descriptions: {
      labelBg: 'transparent',
      contentColor: '#242424',
      titleColor: '#242424',
    },
    
    // 标签页
    Tabs: {
      inkBarColor: '#22A06B',
      itemSelectedColor: '#22A06B',
      itemHoverColor: '#1F845A',
    },
    
    // 步骤条
    Steps: {
      colorPrimary: '#22A06B',
    },
    
    // 分页
    Pagination: {
      itemActiveBg: '#22A06B',
    },
    
    // 气泡确认框
    Popconfirm: {
      colorWarning: '#E79D13',
    },
    
    // 消息提示
    Message: {
      contentBg: '#FFFFFF',
    },
    
    // 统计数值
    Statistic: {
      contentFontSize: 28,
      titleFontSize: 12,
    },
    
    // 徽标
    Badge: {
      statusSize: 8,
    },
  },
};

// 状态颜色映射（供组件使用）
export const statusColors = {
  active: {
    color: '#1F845A',
    bg: 'rgba(31, 132, 90, 0.1)',
    dot: '#1F845A',
  },
  inactive: {
    color: '#8A8A8A',
    bg: '#F0F0F0',
    dot: '#D2D2D2',
  },
  suspended: {
    color: '#E79D13',
    bg: 'rgba(231, 157, 19, 0.1)',
    dot: '#E79D13',
  },
  error: {
    color: '#CA3521',
    bg: 'rgba(202, 53, 33, 0.1)',
    dot: '#CA3521',
  },
};

// 数据展示颜色
export const dataColors = {
  primary: '#22A06B',
  secondary: '#605E5C',
  highlight: '#242424',
  muted: '#8A8A8A',
};

export default fluentTheme;
