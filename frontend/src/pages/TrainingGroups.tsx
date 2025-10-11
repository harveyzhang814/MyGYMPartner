import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Typography, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchTrainingGroups, deleteTrainingGroup } from '../store/slices/trainingGroupSlice';
import { useLanguage } from '../contexts/LanguageContext';

const { Title, Text } = Typography;

const TrainingGroups: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { trainingGroups, loading } = useSelector((state: RootState) => state.trainingGroups);
  const { t } = useLanguage();

  useEffect(() => {
    dispatch(fetchTrainingGroups());
  }, [dispatch]);


  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteTrainingGroup(id)).unwrap();
      message.success(t('trainingGroups.deleteSuccess'));
    } catch (error) {
      message.error(t('common.deleteFailed'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">{t('trainingGroups.title')}</Title>
            <Text className="page-description">{t('trainingGroups.description')}</Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/training-groups/create')}
          >
            {t('trainingGroups.createTrainingGroup')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Text type="secondary">{t('common.loading')}</Text>
        </div>
      ) : trainingGroups.length > 0 ? (
        <Row gutter={[16, 16]}>
          {trainingGroups.map((group) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={group.id}>
              <Card
                className="training-group-card"
                hoverable
                actions={[
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={() => navigate(`/training-groups/${group.id}`)}
                  >
                    {t('common.view')}
                  </Button>,
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/training-groups/${group.id}/edit`)}
                  >
                    {t('common.edit')}
                  </Button>,
                  <Popconfirm
                    title={t('trainingGroups.deleteConfirm')}
                    onConfirm={() => handleDelete(group.id)}
                    okText={t('common.confirm')}
                    cancelText={t('common.cancel')}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      {t('common.delete')}
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div className="training-group-header">
                  <div className="training-group-name">{group.name}</div>
                  <div className="training-group-exercise">
                    {group.exercise.nameZh || group.exercise.name}
                  </div>
                </div>
                <div className="training-group-body">
                  <div className="training-group-stats">
                    <div className="training-group-stat">
                      <div className="training-group-stat-value">{group.sets}</div>
                      <div className="training-group-stat-label">{t('trainingGroups.sets')}</div>
                    </div>
                    <div className="training-group-stat">
                      <div className="training-group-stat-value">
                        {group.repsMin && group.repsMax 
                          ? `${group.repsMin}-${group.repsMax}`
                          : group.repsMin || group.repsMax || '-'
                        }
                      </div>
                      <div className="training-group-stat-label">{t('trainingGroups.reps')}</div>
                    </div>
                    <div className="training-group-stat">
                      <div className="training-group-stat-value">
                        {group.weightMin && group.weightMax 
                          ? `${group.weightMin}-${group.weightMax}kg`
                          : group.weightMin 
                            ? `${group.weightMin}kg`
                            : group.weightMax 
                              ? `${group.weightMax}kg`
                              : '-'
                        }
                      </div>
                      <div className="training-group-stat-label">{t('trainingGroups.weight')}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {group.tags.map((tag) => (
                      <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="empty-container empty-container-vertical">
          <div className="empty-icon">
            <PlusOutlined />
          </div>
          <div className="empty-content">
            <div className="empty-title">{t('trainingGroups.noTrainingGroups')}</div>
            <div className="empty-description">{t('trainingGroups.createFirstGroup')}</div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/training-groups/create')}
              className="empty-action-button"
            >
              {t('trainingGroups.createTrainingGroup')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingGroups;
