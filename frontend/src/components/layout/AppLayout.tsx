import React, { useState } from 'react';
import { Layout, Menu, Select, theme, Typography, Breadcrumb } from 'antd';
import {
  HomeOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
        },
        {
          key: '/operations/equipment',
          icon: <ToolOutlined />,
          label: t('menu.equipment'),
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
    }
    
    return items;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
      >
        <div style={{ 
          height: 64, 
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text strong style={{ fontSize: collapsed ? 14 : 16 }}>
            {collapsed ? 'GS' : '加气站管理系统'}
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/operations']}
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
          <Breadcrumb items={getBreadcrumbItems()} />
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
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
