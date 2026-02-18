import React, { useState } from 'react';
import { Layout, Menu, Select, theme, Typography, Breadcrumb, Dropdown, Avatar, Tag, Space, message } from 'antd';
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
  CalendarOutlined,
  HistoryOutlined,
  AuditOutlined,
  MonitorOutlined,
  DatabaseOutlined,
  FileProtectOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { stations } from '../../mock/stations';

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
              key: '/operations/shift-handover/schedule',
              icon: <CalendarOutlined />,
              label: t('menu.shiftSchedule'),
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
        },
      ],
    },
  ];

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

  // Check if on shift-handover or device-ledger pages to show station selector
  const isShiftHandoverPage = location.pathname.startsWith('/operations/shift-handover');
  const isDeviceLedgerPage = location.pathname.startsWith('/operations/device-ledger');
  const showStationSelector = isShiftHandoverPage || isDeviceLedgerPage;

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
      if (pathSegments.includes('schedule')) {
        items.push({ title: t('menu.shiftSchedule') as string });
      } else if (pathSegments.includes('history')) {
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
      >
        <div style={{ 
          height: 64, 
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text strong style={{ fontSize: collapsed ? 14 : 16 }}>
            {collapsed ? 'GS' : t('app.title')}
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={['/operations', '/operations/shift-handover', '/operations/device-ledger']}
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
