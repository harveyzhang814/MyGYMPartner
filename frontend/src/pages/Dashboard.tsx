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

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { exerciseSessions, loading } = useSelector((state: RootState) => state.exerciseSessions);

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
        return '已完成';
      case 'IN_PROGRESS':
        return '进行中';
      case 'PAUSED':
        return '已暂停';
      case 'CANCELLED':
        return '已取消';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="page-header">
        <Title level={2} className="page-title">
          欢迎回来，{user?.firstName || user?.username}！
        </Title>
        <Text className="page-description">
          今天准备开始新的训练吗？
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="本周训练"
              value={12}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="本月训练"
              value={28}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="总训练时长"
              value={45}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="目标完成率"
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
          <Card title="快速操作" style={{ height: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                size="large" 
                block 
                icon={<PlusOutlined />}
                onClick={() => navigate('/exercise-sessions')}
              >
                开始今日训练
              </Button>
              <Button 
                size="large" 
                block 
                onClick={() => navigate('/training-groups')}
              >
                管理训练组
              </Button>
              <Button 
                size="large" 
                block 
                onClick={() => navigate('/exercises')}
              >
                浏览动作库
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Recent Sessions */}
        <Col xs={24} lg={12}>
          <Card 
            title="最近训练" 
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/exercise-sessions')}
                icon={<RightOutlined />}
              >
                查看全部
              </Button>
            }
            style={{ height: '100%' }}
          >
            {loading ? (
              <div className="loading-container">
                <Text type="secondary">加载中...</Text>
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
                              训练时长: {session.totalDurationMinutes} 分钟
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="empty-container">
                <div className="empty-icon">
                  <TrophyOutlined />
                </div>
                <div className="empty-title">暂无训练记录</div>
                <div className="empty-description">开始您的第一次训练吧！</div>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/exercise-sessions')}
                >
                  开始训练
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
