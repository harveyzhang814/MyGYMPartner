import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Space, List, Avatar, Tag } from 'antd';
import { 
  TrophyOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  AimOutlined,
  PlusOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchExerciseSessions } from '../store/slices/exerciseSessionSlice';
import { useLanguage } from '../contexts/LanguageContext';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { exerciseSessions, loading } = useSelector((state: RootState) => state.exerciseSessions);
  const { t } = useLanguage();

  useEffect(() => {
    dispatch(fetchExerciseSessions({ page: 1, limit: 5 }));
  }, [dispatch]);

  const recentSessions = exerciseSessions.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'processing';
      case 'PAUSED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return t('exerciseSessions.completed');
      case 'IN_PROGRESS':
        return t('exerciseSessions.inProgress');
      case 'PAUSED':
        return t('exerciseSessions.paused');
      case 'CANCELLED':
        return t('exerciseSessions.cancelled');
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="page-header">
        <Title level={2} className="page-title">
          {t('dashboard.welcome')}，{user?.firstName || user?.username}！
        </Title>
        <Text className="page-description">
          {t('dashboard.todayPlan')}
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title={t('dashboard.recentSessions')}
              value={12}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title={t('dashboard.totalSessions')}
              value={28}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title={t('dashboard.totalDuration')}
              value={45}
              suffix={t('dashboard.hours')}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title={t('dashboard.goalCompletion')}
              value={85}
              suffix="%"
              prefix={<AimOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.quickActions')} style={{ height: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                size="large" 
                block 
                icon={<PlusOutlined />}
                onClick={() => navigate('/exercise-sessions')}
              >
                {t('dashboard.startTodayTraining')}
              </Button>
              <Button 
                size="large" 
                block 
                onClick={() => navigate('/training-groups')}
              >
                {t('dashboard.manageTrainingGroups')}
              </Button>
              <Button 
                size="large" 
                block 
                onClick={() => navigate('/exercises')}
              >
                {t('dashboard.browseExerciseLibrary')}
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Recent Sessions */}
        <Col xs={24} lg={12}>
          <Card 
            title={t('dashboard.recentSessions')} 
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/exercise-sessions')}
                icon={<RightOutlined />}
              >
                {t('dashboard.viewAll')}
              </Button>
            }
            style={{ height: '100%' }}
          >
            {loading ? (
              <div className="loading-container">
                <Text type="secondary">{t('common.loading')}</Text>
              </div>
            ) : recentSessions.length > 0 ? (
              <List
                dataSource={recentSessions}
                renderItem={(session) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: session.status === 'COMPLETED' ? '#52c41a' : '#1890ff' 
                          }}
                        >
                          <TrophyOutlined />
                        </Avatar>
                      }
                      title={
                        <Space>
                          <Text strong>{session.name}</Text>
                          <Tag color={getStatusColor(session.status)}>
                            {getStatusText(session.status)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            {new Date(session.sessionDate).toLocaleDateString('zh-CN')}
                          </Text>
                          {session.totalDurationMinutes && (
                            <Text type="secondary">
                              {t('dashboard.trainingDuration')}: {session.totalDurationMinutes} {t('dashboard.minutes')}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="empty-container empty-container-vertical">
                <div className="empty-icon">
                  <TrophyOutlined />
                </div>
                <div className="empty-content">
                  <div className="empty-title">{t('dashboard.noTrainingRecords')}</div>
                  <div className="empty-description">{t('dashboard.startFirstTraining')}</div>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/exercise-sessions')}
                    className="empty-action-button"
                  >
                    {t('dashboard.startTraining')}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
