import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Dropdown, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  HistoryOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import LanguageSwitcher from './LanguageSwitcher';
import SecureAvatar from './SecureAvatar';
import { useLanguage } from '../contexts/LanguageContext';
import './Layout.css';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useLanguage();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('navigation.dashboard'),
    },
    {
      key: '/training-groups',
      icon: <TeamOutlined />,
      label: t('navigation.trainingGroups'),
    },
    {
      key: '/training-plans',
      icon: <CalendarOutlined />,
      label: t('navigation.trainingPlans'),
    },
    {
      key: '/exercise-sessions',
      icon: <HistoryOutlined />,
      label: t('navigation.exerciseSessions'),
    },
    {
      key: '/exercises',
      icon: <AppstoreOutlined />,
      label: t('navigation.exercises'),
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'profile') {
      navigate('/profile');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout className="layout-container">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="layout-sider"
      >
        <div className="layout-logo">
          <Text strong className={`layout-logo-text ${collapsed ? 'layout-logo-text-collapsed' : ''}`}>
            {collapsed ? 'MG' : 'MyGYMPartner'}
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="layout-menu"
        />
      </Sider>
      
      <AntLayout>
        <Header className="layout-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="layout-header-trigger"
          />
          
          <div className="layout-header-right">
            <Text className="layout-header-welcome">
              {t('dashboard.welcome')}，{user?.firstName || user?.username}！
            </Text>
            <LanguageSwitcher />
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              arrow
            >
              <SecureAvatar 
                size="large" 
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </div>
        </Header>
        
        <Content className="layout-content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
