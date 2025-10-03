import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Typography, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, PlayCircleOutlined, EyeOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchExerciseSessions, deleteExerciseSession } from '../store/slices/exerciseSessionSlice';

const { Title, Text } = Typography;

const ExerciseSessions: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { exerciseSessions, loading } = useSelector((state: RootState) => state.exerciseSessions);

  useEffect(() => {
    dispatch(fetchExerciseSessions());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteExerciseSession(id)).unwrap();
      message.success('训练记录删除成功！');
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">训练记录</Title>
            <Text className="page-description">查看和管理您的训练记录</Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/exercise-sessions/create')}
          >
            开始训练
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Text type="secondary">加载中...</Text>
        </div>
      ) : exerciseSessions.length > 0 ? (
        <Row gutter={[16, 16]}>
          {exerciseSessions.map((session) => (
            <Col xs={24} lg={12} xl={8} key={session.id}>
              <Card
                className="session-card"
                hoverable
                actions={[
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={() => navigate(`/exercise-sessions/${session.id}`)}
                  >
                    查看详情
                  </Button>,
                  session.status === 'IN_PROGRESS' && (
                    <Button 
                      type="text" 
                      icon={<PlayCircleOutlined />}
                      onClick={() => navigate(`/exercise-sessions/${session.id}/continue`)}
                    >
                      继续训练
                    </Button>
                  ),
                  <Popconfirm
                    title="确定要删除这个训练记录吗？"
                    onConfirm={() => handleDelete(session.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div className="session-header">
                  <div className="session-name">{session.name}</div>
                  <div className="session-date">
                    {new Date(session.sessionDate).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="session-body">
                  <div className="session-stats">
                    <div className="session-stat">
                      <div className="session-stat-value">
                        {session.exerciseRecords?.length || 0}
                      </div>
                      <div className="session-stat-label">训练组</div>
                    </div>
                    <div className="session-stat">
                      <div className="session-stat-value">
                        {session.totalDurationMinutes || 0}
                      </div>
                      <div className="session-stat-label">分钟</div>
                    </div>
                    <div className="session-stat">
                      <div className="session-stat-value">
                        <Tag color={getStatusColor(session.status)}>
                          {getStatusText(session.status)}
                        </Tag>
                      </div>
                      <div className="session-stat-label">状态</div>
                    </div>
                  </div>
                  {session.notes && (
                    <div style={{ marginTop: 12 }}>
                      <Text type="secondary">{session.notes}</Text>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
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
            onClick={() => navigate('/exercise-sessions/create')}
          >
            开始训练
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExerciseSessions;
