import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Typography, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, PlayCircleOutlined, EyeOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchExerciseSessions, deleteExerciseSession } from '../store/slices/exerciseSessionSlice';
import { useLanguage } from '../contexts/LanguageContext';

const { Title, Text } = Typography;

const ExerciseSessions: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { exerciseSessions, loading } = useSelector((state: RootState) => state.exerciseSessions);
  const { t } = useLanguage();

  useEffect(() => {
    dispatch(fetchExerciseSessions({
      sortBy: 'sessionDate',
      sortOrder: 'desc'
    }));
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteExerciseSession(id)).unwrap();
      message.success(t('exerciseSessions.deleteSuccess'));
    } catch (error) {
      message.error(t('common.deleteFailed'));
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">{t('exerciseSessions.title')}</Title>
            <Text className="page-description">{t('exerciseSessions.description')}</Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/exercise-sessions/create')}
          >
            {t('exerciseSessions.startTraining')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Text type="secondary">{t('common.loading')}</Text>
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
                    {t('exerciseSessions.viewDetails')}
                  </Button>,
                  session.status === 'IN_PROGRESS' && (
                    <Button 
                      type="text" 
                      icon={<PlayCircleOutlined />}
                      onClick={() => navigate(`/exercise-sessions/${session.id}/edit`)}
                    >
                      {t('exerciseSessions.continueTraining')}
                    </Button>
                  ),
                  <Popconfirm
                    title={t('exerciseSessions.deleteConfirm')}
                    onConfirm={() => handleDelete(session.id)}
                    okText={t('common.confirm')}
                    cancelText={t('common.cancel')}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      {t('common.delete')}
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
                      <div className="session-stat-label">{t('exerciseSessions.trainingGroupsLabel')}</div>
                    </div>
                    <div className="session-stat">
                      <div className="session-stat-value">
                        {session.totalDurationMinutes || 0}
                      </div>
                      <div className="session-stat-label">{t('exerciseSessions.minutes')}</div>
                    </div>
                    <div className="session-stat">
                      <div className="session-stat-value">
                        <Tag color={getStatusColor(session.status)}>
                          {getStatusText(session.status)}
                        </Tag>
                      </div>
                      <div className="session-stat-label">{t('exerciseSessions.status')}</div>
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
        <div className="empty-container empty-container-vertical">
          <div className="empty-icon">
            <TrophyOutlined />
          </div>
          <div className="empty-content">
            <div className="empty-title">{t('exerciseSessions.noSessions')}</div>
            <div className="empty-description">{t('exerciseSessions.startFirstSession')}</div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/exercise-sessions/create')}
              className="empty-action-button"
            >
              {t('exerciseSessions.startTraining')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseSessions;
