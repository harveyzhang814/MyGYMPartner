import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { register, clearError } from '../store/slices/authSlice';
import { useLanguage } from '../contexts/LanguageContext';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onFinish = async (values: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = values;
      await dispatch(register(registerData)).unwrap();
      message.success('注册成功！');
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
        }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            MyGYMPartner
          </Title>
          <Text type="secondary">{t('common.startJourney')}</Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('common.error') },
              { type: 'email', message: t('common.error') }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t('common.email')}
            />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[
              { required: true, message: t('common.error') },
              { min: 3, max: 20, message: t('common.error') },
              { pattern: /^[a-zA-Z0-9_]+$/, message: t('common.error') }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('common.username')}
            />
          </Form.Item>

          <Form.Item
            name="firstName"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('common.firstName')}
            />
          </Form.Item>

          <Form.Item
            name="lastName"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('common.lastName')}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: t('common.error') },
              { min: 8, message: t('common.error') },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
                message: t('common.error')
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('common.password')}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: t('common.error') }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('common.confirmPassword')}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<UserAddOutlined />}
              style={{ height: 48, borderRadius: 8 }}
            >
              {t('common.register')}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space>
            <Text type="secondary">{t('common.haveAccount')}</Text>
            <Link to="/login">
              <Button type="link" style={{ padding: 0 }}>
                {t('common.loginNow')}
              </Button>
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Register;
