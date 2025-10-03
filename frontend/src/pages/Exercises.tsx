import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Input, Select, Button, Typography, Space, Tag, message, Popconfirm } from 'antd';
import { SearchOutlined, StarOutlined, StarFilled, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchExercises, addToFavorites, removeFromFavorites, deleteExercise } from '../store/slices/exerciseSlice';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Exercises: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { exercises, favoriteExercises, loading } = useSelector((state: RootState) => state.exercises);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | undefined>();
  const [selectedEquipment, setSelectedEquipment] = useState<string | undefined>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>();

  useEffect(() => {
    dispatch(fetchExercises());
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchExercises({
      search: searchTerm || undefined,
      muscleGroup: selectedMuscleGroup,
      equipment: selectedEquipment,
      difficulty: selectedDifficulty,
    }));
  };

  const handleFavoriteToggle = async (exerciseId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await dispatch(removeFromFavorites(exerciseId)).unwrap();
        message.success('已从收藏中移除');
      } else {
        await dispatch(addToFavorites(exerciseId)).unwrap();
        message.success('已添加到收藏');
      }
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const isFavorite = (exerciseId: string) => {
    return favoriteExercises.some(fav => fav.id === exerciseId);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      await dispatch(deleteExercise(exerciseId)).unwrap();
      message.success('动作删除成功');
    } catch (error: any) {
      message.error(error.message || '删除失败，请重试');
    }
  };

  const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
  const equipmentTypes = ['barbell', 'dumbbell', 'bodyweight', 'machine', 'cable'];
  const difficultyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">动作库</Title>
            <Text className="page-description">浏览、创建和管理健身动作</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/exercises/create')}
            size="large"
          >
            创建动作
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Search
            placeholder="搜索动作名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
            size="large"
          />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Select
                placeholder="选择肌肉群"
                value={selectedMuscleGroup}
                onChange={setSelectedMuscleGroup}
                style={{ width: '100%' }}
                allowClear
              >
                {muscleGroups.map(group => (
                  <Option key={group} value={group}>
                    {group === 'chest' ? '胸部' :
                     group === 'back' ? '背部' :
                     group === 'legs' ? '腿部' :
                     group === 'shoulders' ? '肩部' :
                     group === 'arms' ? '手臂' :
                     group === 'core' ? '核心' : group}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="选择设备"
                value={selectedEquipment}
                onChange={setSelectedEquipment}
                style={{ width: '100%' }}
                allowClear
              >
                {equipmentTypes.map(equipment => (
                  <Option key={equipment} value={equipment}>
                    {equipment === 'barbell' ? '杠铃' :
                     equipment === 'dumbbell' ? '哑铃' :
                     equipment === 'bodyweight' ? '自重' :
                     equipment === 'machine' ? '器械' :
                     equipment === 'cable' ? '绳索' : equipment}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="选择难度"
                value={selectedDifficulty}
                onChange={setSelectedDifficulty}
                style={{ width: '100%' }}
                allowClear
              >
                {difficultyLevels.map(level => (
                  <Option key={level} value={level}>
                    {level === 'BEGINNER' ? '初级' :
                     level === 'INTERMEDIATE' ? '中级' :
                     level === 'ADVANCED' ? '高级' : level}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Button 
            type="primary" 
            icon={<FilterOutlined />}
            onClick={handleSearch}
            size="large"
          >
            搜索
          </Button>
        </Space>
      </Card>

      {/* Exercise Grid */}
      {loading ? (
        <div className="loading-container">
          <Text type="secondary">加载中...</Text>
        </div>
      ) : exercises.length > 0 ? (
        <Row gutter={[16, 16]}>
          {exercises.map((exercise) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={exercise.id}>
              <Card
                className="exercise-card"
                hoverable
                cover={
                  <div className="exercise-image">
                    {exercise.gifUrl ? (
                      <img 
                        src={exercise.gifUrl} 
                        alt={exercise.nameZh || exercise.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: '#f5f5f5',
                        color: '#8c8c8c'
                      }}>
                        暂无图片
                      </div>
                    )}
                  </div>
                }
                actions={[
                  <Button
                    type="text"
                    icon={isFavorite(exercise.id) ? <StarFilled /> : <StarOutlined />}
                    onClick={() => handleFavoriteToggle(exercise.id, isFavorite(exercise.id))}
                    style={{ color: isFavorite(exercise.id) ? '#faad14' : undefined }}
                  >
                    {isFavorite(exercise.id) ? '已收藏' : '收藏'}
                  </Button>,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/exercises/${exercise.id}/edit`)}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    title="确定要删除这个动作吗？"
                    description="删除后无法恢复，请确认。"
                    onConfirm={() => handleDeleteExercise(exercise.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div className="exercise-info">
                  <div className="exercise-name">
                    {exercise.nameZh || exercise.name}
                  </div>
                  <div className="exercise-muscles">
                    {exercise.muscleGroups.map(group => (
                      <Tag key={group} color="blue" style={{ marginBottom: 4 }}>
                        {group === 'chest' ? '胸部' :
                         group === 'back' ? '背部' :
                         group === 'legs' ? '腿部' :
                         group === 'shoulders' ? '肩部' :
                         group === 'arms' ? '手臂' :
                         group === 'core' ? '核心' : group}
                      </Tag>
                    ))}
                  </div>
                  <div className="exercise-equipment">
                    {exercise.equipment === 'barbell' ? '杠铃' :
                     exercise.equipment === 'dumbbell' ? '哑铃' :
                     exercise.equipment === 'bodyweight' ? '自重' :
                     exercise.equipment === 'machine' ? '器械' :
                     exercise.equipment === 'cable' ? '绳索' : exercise.equipment}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="empty-container">
          <div className="empty-icon">
            <SearchOutlined />
          </div>
          <div className="empty-title">未找到相关动作</div>
          <div className="empty-description">尝试调整搜索条件或浏览所有动作</div>
          <Button 
            type="primary" 
            onClick={() => {
              setSearchTerm('');
              setSelectedMuscleGroup(undefined);
              setSelectedEquipment(undefined);
              setSelectedDifficulty(undefined);
              dispatch(fetchExercises());
            }}
          >
            显示所有动作
          </Button>
        </div>
      )}
    </div>
  );
};

export default Exercises;
