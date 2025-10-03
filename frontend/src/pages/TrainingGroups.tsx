import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Typography, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchTrainingGroups, deleteTrainingGroup } from '../store/slices/trainingGroupSlice';

const { Title, Text } = Typography;

const TrainingGroups: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { trainingGroups, loading } = useSelector((state: RootState) => state.trainingGroups);

  useEffect(() => {
    dispatch(fetchTrainingGroups());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteTrainingGroup(id)).unwrap();
      message.success('训练组删除成功！');
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">训练组管理</Title>
            <Text className="page-description">创建和管理您的训练组</Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/training-groups/create')}
          >
            创建训练组
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Text type="secondary">加载中...</Text>
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
                    查看
                  </Button>,
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/training-groups/${group.id}/edit`)}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    title="确定要删除这个训练组吗？"
                    onConfirm={() => handleDelete(group.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      删除
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
                      <div className="training-group-stat-label">组数</div>
                    </div>
                    <div className="training-group-stat">
                      <div className="training-group-stat-value">
                        {group.repsMin && group.repsMax 
                          ? `${group.repsMin}-${group.repsMax}`
                          : group.repsMin || group.repsMax || '-'
                        }
                      </div>
                      <div className="training-group-stat-label">次数</div>
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
                      <div className="training-group-stat-label">重量</div>
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
        <div className="empty-container">
          <div className="empty-icon">
            <PlusOutlined />
          </div>
          <div className="empty-title">暂无训练组</div>
          <div className="empty-description">创建您的第一个训练组开始训练吧！</div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/training-groups/create')}
          >
            创建训练组
          </Button>
        </div>
      )}
    </div>
  );
};

export default TrainingGroups;
