import React, { useState, useEffect } from 'react';
import { Badge, Layout, Menu, Select, theme, Typography, Breadcrumb, Dropdown, Avatar, Tag, Space, message } from 'antd';
import {
  HomeOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  HistoryOutlined,
  AuditOutlined,
  MonitorOutlined,
  DatabaseOutlined,
  FileProtectOutlined,
  ApiOutlined,
  ScheduleOutlined,
  CheckSquareOutlined,
  BugOutlined,
  FileTextOutlined,
  BarChartOutlined,
  DollarOutlined,
  FundViewOutlined,
  TeamOutlined,
  FileSearchOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  TransactionOutlined,
  TagsOutlined,
  ContainerOutlined,
  AlertOutlined,
  SwapRightOutlined,
  ReconciliationOutlined,
  StockOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { stations } from '../../mock/stations';
import { issueRecords } from '../../mock/inspections';
import { priceAdjustments } from '../../mock/priceManagement';
import { fuelingOrders, refundRecords } from '../../mock/orderTransaction';
import { getActiveAlertCount } from '../../mock/inventory';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Mock current user (demo mode: default as station master)
const currentUser = {
  id: 'user-001',
  name: '张建国',
  role: 'station_master' as const,
  avatar: undefined as string | undefined,
};

const AppLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string>('station-001');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const selectedStation = stations.find(s => s.id === selectedStationId);

  const menuItems = [
    {
      key: '/operations',
      icon: <HomeOutlined />,
      label: t('menu.operations'),
      children: [
        {
          key: '/operations/station',
          icon: <EnvironmentOutlined />,
          label: t('menu.station'),
        },
        {
          key: '/operations/shift-handover',
          icon: <SwapOutlined />,
          label: t('menu.shift'),
          children: [
            {
              key: '/operations/shift-handover',
              icon: <DashboardOutlined />,
              label: t('menu.shiftOverview'),
            },

            {
              key: '/operations/shift-handover/history',
              icon: <HistoryOutlined />,
              label: t('menu.shiftHistory'),
            },
            {
              key: '/operations/shift-handover/settlement-review',
              icon: <AuditOutlined />,
              label: t('menu.shiftSettlementReview'),
            },
          ],
        },
        {
          key: '/operations/device-ledger',
          icon: <ToolOutlined />,
          label: t('menu.deviceLedger', '设备设施'),
          children: [
            {
              key: '/operations/device-ledger',
              icon: <MonitorOutlined />,
              label: t('menu.facilityMonitoring', '设施监控'),
            },
            {
              key: '/operations/device-ledger/equipment',
              icon: <DatabaseOutlined />,
              label: t('menu.equipmentLedger', '设备台账'),
            },
            {
              key: '/operations/device-ledger/maintenance',
              icon: <FileProtectOutlined />,
              label: t('menu.maintenanceOrders', '维保工单'),
            },
            {
              key: '/operations/device-ledger/connectivity',
              icon: <ApiOutlined />,
              label: t('menu.deviceConnectivity', '设备连接'),
            },
          ],
        },
        {
          key: '/operations/inspection',
          icon: <SafetyCertificateOutlined />,
          label: t('menu.inspection'),
          children: [
            {
              key: '/operations/inspection',
              icon: <ScheduleOutlined />,
              label: t('menu.inspectionTasks', '安检任务'),
            },
            {
              key: '/operations/inspection/check-items',
              icon: <CheckSquareOutlined />,
              label: t('menu.inspectionCheckItems', '检查项目'),
            },
            {
              key: '/operations/inspection/issues',
              icon: <BugOutlined />,
              label: (
                <span>
                  {t('menu.inspectionIssues', '问题记录')}
                  {issueRecords.filter(i => ['pending', 'processing'].includes(i.status)).length > 0 && (
                    <span style={{ marginLeft: 8, display: 'inline-block', minWidth: 18, height: 18, lineHeight: '18px', borderRadius: 9, background: '#ff4d4f', color: '#fff', fontSize: 11, textAlign: 'center', padding: '0 5px' }}>
                      {issueRecords.filter(i => ['pending', 'processing'].includes(i.status)).length}
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: '/operations/inspection/logs',
              icon: <FileTextOutlined />,
              label: t('menu.inspectionLogs', '巡检日志'),
            },
            {
              key: '/operations/inspection/analytics',
              icon: <BarChartOutlined />,
              label: t('menu.inspectionAnalytics', '统计报表'),
            },
          ],
        },
      ],
    },
    {
      key: '/energy-trade',
      icon: <DollarOutlined />,
      label: t('menu.energyTrade', '能源交易'),
      children: [
        {
          key: '/energy-trade/price-management',
          icon: <FundViewOutlined />,
          label: t('menu.priceManagement', '价格管理'),
          children: [
            {
              key: '/energy-trade/price-management',
              icon: <DashboardOutlined />,
              label: t('menu.priceOverview', '价格总览'),
            },
            {
              key: '/energy-trade/price-management/history',
              icon: <HistoryOutlined />,
              label: t('menu.priceHistory', '调价历史'),
            },
            {
              key: '/energy-trade/price-management/board',
              icon: <FundViewOutlined />,
              label: t('menu.priceBoard', '价格公示'),
            },
            {
              key: '/energy-trade/price-management/approvals',
              icon: <AuditOutlined />,
              label: (
                <span>
                  {t('menu.priceApproval', '调价审批')}
                  {priceAdjustments.filter(a => a.status === 'pending_approval').length > 0 && (
                    <span style={{ marginLeft: 8, display: 'inline-block', minWidth: 18, height: 18, lineHeight: '18px', borderRadius: 9, background: '#ff4d4f', color: '#fff', fontSize: 11, textAlign: 'center', padding: '0 5px' }}>
                      {priceAdjustments.filter(a => a.status === 'pending_approval').length}
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: '/energy-trade/price-management/member-prices',
              icon: <TeamOutlined />,
              label: t('menu.memberPrices', '会员专享价'),
            },
            {
              key: '/energy-trade/price-management/agreements',
              icon: <FileSearchOutlined />,
              label: t('menu.priceAgreements', '价格协议'),
            },
            {
              key: '/energy-trade/price-management/settings',
              icon: <SettingOutlined />,
              label: t('menu.priceSettings', '价格设置'),
            },
          ],
        },
        {
          key: '/energy-trade/inventory',
          icon: <ContainerOutlined />,
          label: t('menu.inventoryManagement', '库存管理'),
          children: [
            {
              key: '/energy-trade/inventory/overview',
              icon: <DashboardOutlined />,
              label: t('menu.inventoryOverview', '库存总览'),
            },
            {
              key: '/energy-trade/inventory/inbound',
              icon: <SwapRightOutlined />,
              label: t('menu.inventoryInbound', '入库管理'),
            },
            {
              key: '/energy-trade/inventory/outbound',
              icon: <ReconciliationOutlined />,
              label: t('menu.inventoryOutbound', '出库记录'),
            },
            {
              key: '/energy-trade/inventory/ledger',
              icon: <StockOutlined />,
              label: t('menu.inventoryLedger', '进销存流水'),
            },
            {
              key: '/energy-trade/inventory/tank-comparison',
              icon: <LineChartOutlined />,
              label: t('menu.inventoryTankComparison', '罐存比对'),
            },
            {
              key: '/energy-trade/inventory/alerts',
              icon: <AlertOutlined />,
              label: (
                <span>
                  {t('menu.inventoryAlerts', '预警管理')}
                  {getActiveAlertCount('station-001') > 0 && (
                    <Badge count={getActiveAlertCount('station-001')} size="small" style={{ marginLeft: 8 }} />
                  )}
                </span>
              ),
            },
          ],
        },
        {
          key: '/energy-trade/order',
          icon: <ShoppingCartOutlined />,
          label: t('menu.orderTransaction', '订单交易'),
          children: [
            {
              key: '/energy-trade/order',
              icon: <FileTextOutlined />,
              label: t('menu.orderList', '订单列表'),
            },
            {
              key: '/energy-trade/order/exceptions',
              icon: <ExclamationCircleOutlined />,
              label: (
                <span>
                  {t('menu.orderExceptions', '异常订单')}
                  {fuelingOrders.filter(o => o.exceptionType && o.handleStatus === 'pending').length > 0 && (
                    <span style={{ marginLeft: 8, display: 'inline-block', minWidth: 18, height: 18, lineHeight: '18px', borderRadius: 9, background: '#ff4d4f', color: '#fff', fontSize: 11, textAlign: 'center', padding: '0 5px' }}>
                      {fuelingOrders.filter(o => o.exceptionType && o.handleStatus === 'pending').length}
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: '/energy-trade/order/refunds',
              icon: <TransactionOutlined />,
              label: (
                <span>
                  {t('menu.orderRefunds', '退款管理')}
                  {refundRecords.filter(r => r.refundStatus === 'pending_approval').length > 0 && (
                    <span style={{ marginLeft: 8, display: 'inline-block', minWidth: 18, height: 18, lineHeight: '18px', borderRadius: 9, background: '#faad14', color: '#fff', fontSize: 11, textAlign: 'center', padding: '0 5px' }}>
                      {refundRecords.filter(r => r.refundStatus === 'pending_approval').length}
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: '/energy-trade/order/settings',
              icon: <TagsOutlined />,
              label: t('menu.orderSettings', '订单设置'),
            },
          ],
        },
      ],
    },
    {
      key: '/analytics',
      icon: <PieChartOutlined />,
      label: t('menu.analytics', '数据分析与报表'),
      children: [
        {
          key: '/analytics/data-analytics',
          icon: <BarChartOutlined />,
          label: t('menu.dataAnalytics', '数据分析'),
          children: [
            {
              key: '/analytics/data-analytics/dashboard',
              icon: <DashboardOutlined />,
              label: t('menu.analyticsDashboard', '经营看板'),
            },
            {
              key: '/analytics/data-analytics/sales',
              icon: <LineChartOutlined />,
              label: t('menu.analyticsSales', '多维分析'),
            },
            {
              key: '/analytics/data-analytics/customers',
              icon: <UserSwitchOutlined />,
              label: t('menu.analyticsCustomers', '客户分析'),
            },
          ],
        },
      ],
    },
  ];

  // --- Sidebar accordion: only one submenu open per level ---
  const rootSubmenuKeys = menuItems.map(item => item.key);

  const computeOpenKeys = (pathname: string): string[] => {
    const keys: string[] = [];
    for (const item of menuItems) {
      if (pathname.startsWith(item.key)) {
        keys.push(item.key);
        if (item.children) {
          for (const child of item.children) {
            if ('children' in child && child.children && pathname.startsWith(child.key)) {
              keys.push(child.key);
              break;
            }
          }
        }
        break;
      }
    }
    return keys;
  };

  const [openKeys, setOpenKeys] = useState<string[]>(() => computeOpenKeys(location.pathname));

  // Sync open keys when route changes (e.g. breadcrumb / direct navigation)
  useEffect(() => {
    setOpenKeys(computeOpenKeys(location.pathname));
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMenuOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find(key => !openKeys.includes(key));
    if (!latestOpenKey) {
      // User is closing a submenu
      setOpenKeys(keys);
      return;
    }

    if (rootSubmenuKeys.includes(latestOpenKey)) {
      // Opening a domain — close other domains and their descendants
      setOpenKeys([latestOpenKey]);
    } else {
      // Opening a sub-group — close sibling sub-groups under the same domain
      const parentRoot = rootSubmenuKeys.find(rk => latestOpenKey.startsWith(rk));
      if (parentRoot) {
        const siblingKeys = (menuItems.find(item => item.key === parentRoot)?.children || [])
          .filter(child => 'children' in child)
          .map(child => child.key);
        setOpenKeys(keys.filter(key => !siblingKeys.includes(key) || key === latestOpenKey));
      } else {
        setOpenKeys(keys);
      }
    }
  };

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleStationChange = (stationId: string) => {
    setSelectedStationId(stationId);
    message.success(t('station.switchStation') + ': ' + stations.find(s => s.id === stationId)?.name);
  };

  const handleSignOut = () => {
    message.info(t('user.signedOut'));
  };

  // User dropdown menu
  const userMenuItems = {
    items: [
      {
        key: 'signout',
        icon: <LogoutOutlined />,
        label: t('user.signOut'),
        onClick: handleSignOut,
      },
    ],
  };

  // Check if on pages that need station selector
  const isShiftHandoverPage = location.pathname.startsWith('/operations/shift-handover');
  const isDeviceLedgerPage = location.pathname.startsWith('/operations/device-ledger');
  const isInspectionPage = location.pathname.startsWith('/operations/inspection');
  const isPriceManagementPage = location.pathname.startsWith('/energy-trade/price-management');
  const isOrderTransactionPage = location.pathname.startsWith('/energy-trade/order');
  const isInventoryPage = location.pathname.startsWith('/energy-trade/inventory');
  const isAnalyticsPage = location.pathname.startsWith('/analytics');
  const showStationSelector = isShiftHandoverPage || isDeviceLedgerPage || isInspectionPage || isPriceManagementPage || isOrderTransactionPage || isInventoryPage || isAnalyticsPage;

  // 生成当前路径的面包屑
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: { title: React.ReactNode; onClick?: () => void; className?: string }[] = [
      { 
        title: <HomeOutlined />, 
        onClick: () => navigate('/'),
        className: 'breadcrumb-link'
      }
    ];
    
    if (pathSegments.includes('operations')) {
      items.push({ 
        title: t('menu.operations') as string,
        onClick: () => navigate('/operations'),
        className: 'breadcrumb-link'
      });
    }
    if (pathSegments.includes('station')) {
      items.push({ 
        title: t('menu.station') as string,
        onClick: () => navigate('/operations/station'),
        className: 'breadcrumb-link'
      });
    }
    if (pathSegments.includes('shift-handover')) {
      items.push({ 
        title: t('menu.shift') as string,
        onClick: () => navigate('/operations/shift-handover'),
        className: 'breadcrumb-link'
      });
      // Add sub-page breadcrumbs
      if (pathSegments.includes('history')) {
        items.push({ 
          title: t('menu.shiftHistory') as string,
          onClick: () => navigate('/operations/shift-handover/history'),
          className: 'breadcrumb-link'
        });
      } else if (pathSegments.includes('settlement-review')) {
        items.push({ title: t('menu.shiftSettlementReview') as string });
      } else if (pathSegments.includes('handover')) {
        items.push({ title: t('shiftHandover.wizardTitle') as string });
      } else if (pathSegments.includes('detail')) {
        items.push({ 
          title: t('menu.shiftHistory') as string,
          onClick: () => navigate('/operations/shift-handover/history'),
          className: 'breadcrumb-link'
        });
        items.push({ title: t('shiftHandover.detailTitle') as string });
      }
    }
    if (pathSegments.includes('device-ledger')) {
      items.push({ 
        title: t('menu.deviceLedger', '设备设施') as string,
        onClick: () => navigate('/operations/device-ledger'),
        className: 'breadcrumb-link'
      });
      if (pathSegments.includes('equipment')) {
        items.push({ 
          title: t('menu.equipmentLedger', '设备台账') as string,
          onClick: () => navigate('/operations/device-ledger/equipment'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.includes('create')) {
          items.push({ title: '新增设备' });
        } else if (pathSegments.includes('edit')) {
          items.push({ title: '编辑设备' });
        } else if (pathSegments.some(seg => seg.startsWith('equip-'))) {
          items.push({ title: '设备详情' });
        }
      } else if (pathSegments.includes('maintenance')) {
        items.push({ 
          title: t('menu.maintenanceOrders', '维保工单') as string,
          onClick: () => navigate('/operations/device-ledger/maintenance'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.includes('create')) {
          items.push({ title: '创建工单' });
        } else if (pathSegments.some(seg => seg.startsWith('order-'))) {
          items.push({ title: '工单详情' });
        }
      } else if (pathSegments.includes('monitoring')) {
        items.push({ title: t('menu.facilityMonitoring', '设施监控') as string });
        if (pathSegments.includes('tanks')) {
          items.push({ title: '储罐监控' });
        } else if (pathSegments.includes('dispensers')) {
          items.push({ title: '加气机状态' });
        }
      } else if (pathSegments.includes('connectivity')) {
        items.push({ title: t('menu.deviceConnectivity', '设备连接') as string });
      }
    }
    if (pathSegments.includes('inspection')) {
      items.push({ 
        title: t('menu.inspection') as string,
        onClick: () => navigate('/operations/inspection'),
        className: 'breadcrumb-link'
      });
      if (pathSegments.includes('tasks')) {
        items.push({ 
          title: t('menu.inspectionTasks', '安检任务') as string,
          onClick: () => navigate('/operations/inspection/tasks'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.some(seg => seg.startsWith('task-'))) {
          items.push({ title: '任务执行' });
        }
      } else if (pathSegments.includes('plans')) {
        items.push({ 
          title: t('menu.inspectionPlans', '安检计划') as string,
          onClick: () => navigate('/operations/inspection/plans'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.includes('create')) {
          items.push({ title: '新建计划' });
        } else if (pathSegments.includes('edit')) {
          items.push({ title: '编辑计划' });
        } else if (pathSegments.some(seg => seg.startsWith('plan-'))) {
          items.push({ title: '计划详情' });
        }
      } else if (pathSegments.includes('check-items')) {
        items.push({ title: t('menu.inspectionCheckItems', '检查项目') as string });
      } else if (pathSegments.includes('issues')) {
        items.push({ 
          title: t('menu.inspectionIssues', '问题记录') as string,
          onClick: () => navigate('/operations/inspection/issues'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.some(seg => seg.startsWith('issue-'))) {
          items.push({ title: '问题详情' });
        }
      } else if (pathSegments.includes('logs')) {
        items.push({ 
          title: t('menu.inspectionLogs', '巡检日志') as string,
          onClick: () => navigate('/operations/inspection/logs'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.some(seg => seg.startsWith('log-'))) {
          items.push({ title: '日志详情' });
        }
      } else if (pathSegments.includes('analytics')) {
        items.push({ 
          title: t('menu.inspectionAnalytics', '统计报表') as string,
          onClick: () => navigate('/operations/inspection/analytics'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.includes('reports') && pathSegments.some(seg => seg.startsWith('report-'))) {
          items.push({ title: '报表详情' });
        }
      }
    }
    if (pathSegments.includes('energy-trade')) {
      items.push({
        title: t('menu.energyTrade', '能源交易') as string,
        onClick: () => navigate('/energy-trade'),
        className: 'breadcrumb-link'
      });
      if (pathSegments.includes('price-management')) {
        items.push({
          title: t('menu.priceManagement', '价格管理') as string,
          onClick: () => navigate('/energy-trade/price-management'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.includes('history')) {
          items.push({ title: t('menu.priceHistory', '调价历史') as string });
        } else if (pathSegments.includes('board')) {
          items.push({ title: t('menu.priceBoard', '价格公示') as string });
        } else if (pathSegments.includes('approvals')) {
          items.push({ title: t('menu.priceApproval', '调价审批') as string });
        } else if (pathSegments.includes('member-prices')) {
          items.push({ title: t('menu.memberPrices', '会员专享价') as string });
        } else if (pathSegments.includes('agreements')) {
          items.push({ title: t('menu.priceAgreements', '价格协议') as string });
        } else if (pathSegments.includes('settings')) {
          items.push({ title: t('menu.priceSettings', '价格设置') as string });
        }
      }
      if (pathSegments.includes('order')) {
        items.push({
          title: t('menu.orderTransaction', '订单交易') as string,
          onClick: () => navigate('/energy-trade/order'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.includes('exceptions')) {
          items.push({ title: t('menu.orderExceptions', '异常订单') as string });
        } else if (pathSegments.includes('refunds')) {
          items.push({ title: t('menu.orderRefunds', '退款管理') as string });
        } else if (pathSegments.includes('settings')) {
          items.push({ title: t('menu.orderSettings', '订单设置') as string });
        }
      }
      if (pathSegments.includes('inventory')) {
        items.push({
          title: t('menu.inventoryManagement', '库存管理') as string,
          onClick: () => navigate('/energy-trade/inventory/overview'),
          className: 'breadcrumb-link'
        });
        if (pathSegments.includes('overview')) {
          items.push({ title: t('menu.inventoryOverview', '库存总览') as string });
        } else if (pathSegments.includes('inbound')) {
          items.push({ title: t('menu.inventoryInbound', '入库管理') as string });
        } else if (pathSegments.includes('outbound')) {
          items.push({ title: t('menu.inventoryOutbound', '出库记录') as string });
        } else if (pathSegments.includes('ledger')) {
          items.push({ title: t('menu.inventoryLedger', '进销存流水') as string });
        } else if (pathSegments.includes('tank-comparison')) {
          items.push({ title: t('menu.inventoryTankComparison', '罐存比对') as string });
        } else if (pathSegments.includes('alerts')) {
          items.push({ title: t('menu.inventoryAlerts', '预警管理') as string });
        }
      }
    }

    if (pathSegments.includes('analytics')) {
      items.push({
        title: t('menu.analytics', '数据分析与报表') as string,
        onClick: () => navigate('/analytics'),
        className: 'breadcrumb-link'
      });
      if (pathSegments.includes('data-analytics')) {
        items.push({
          title: t('menu.dataAnalytics', '数据分析') as string,
        });
        if (pathSegments.includes('dashboard')) {
          items.push({ title: t('menu.analyticsDashboard', '经营看板') as string });
        } else if (pathSegments.includes('sales')) {
          items.push({ title: t('menu.analyticsSales', '多维分析') as string });
        } else if (pathSegments.includes('customers')) {
          items.push({ title: t('menu.analyticsCustomers', '客户分析') as string });
        }
      }
    }

    return items;
  };

  // Determine which menu keys should be selected/opened
  const getSelectedKeys = () => {
    const path = location.pathname;
    // Exact match for shift-handover root (overview)
    if (path === '/operations/shift-handover') {
      return ['/operations/shift-handover'];
    }
    return [path];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          scrollbarWidth: 'thin',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {collapsed ? (
            <span style={{
              fontFamily: 'FangSong, STFangsong, "仿宋", serif',
              fontSize: 15,
              fontWeight: 600,
              color: '#333',
              letterSpacing: 2,
              lineHeight: 1,
            }}>
              万山
            </span>
          ) : (
            <span style={{
              fontFamily: 'FangSong, STFangsong, "仿宋", serif',
              fontSize: 17,
              fontWeight: 600,
              color: '#333',
              letterSpacing: 3,
              lineHeight: 1,
            }}>
              万山智慧气站
            </span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={onMenuOpenChange}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Breadcrumb items={getBreadcrumbItems()} />
            {showStationSelector && (
              <Select
                value={selectedStationId}
                onChange={handleStationChange}
                style={{ width: 200 }}
                options={stations.filter(s => s.status === 'active').map(s => ({
                  value: s.id,
                  label: s.name,
                }))}
                prefix={<EnvironmentOutlined />}
                size="small"
              />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              style={{ width: 120 }}
              options={[
                { value: 'zh-CN', label: '中文' },
                { value: 'en-US', label: 'English' },
              ]}
              suffixIcon={<GlobalOutlined />}
            />
            <Dropdown menu={userMenuItems} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} size="small" />
                <Text>{currentUser.name}</Text>
                <Tag color="blue">{t(`user.role.${currentUser.role}`)}</Tag>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet context={{ selectedStationId, selectedStation }} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
