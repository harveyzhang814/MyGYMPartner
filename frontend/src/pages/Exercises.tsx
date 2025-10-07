import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Input, Select, Button, Typography, Space, Tag, message, Popconfirm } from 'antd';
import { SearchOutlined, StarOutlined, StarFilled, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchExercises, addToFavorites, removeFromFavorites, deleteExercise } from '../store/slices/exerciseSlice';
import { useLanguage } from '../contexts/LanguageContext';
import { getPresetOptions } from '../locales';

const { Title, Text } = Typography;
const { Search } = Input;

const Exercises: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { exercises, favoriteExercises, loading } = useSelector((state: RootState) => state.exercises);
  const { t, language } = useLanguage();
  
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
        message.success(t('exercises.removedFromFavorites'));
      } else {
        await dispatch(addToFavorites(exerciseId)).unwrap();
        message.success(t('exercises.addedToFavorites'));
      }
    } catch (error) {
      message.error(t('exercises.operationFailed'));
    }
  };

  const isFavorite = (exerciseId: string) => {
    return favoriteExercises.some(fav => fav.id === exerciseId);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      await dispatch(deleteExercise(exerciseId)).unwrap();
      message.success(t('exercises.deleteSuccess'));
    } catch (error: any) {
      message.error(error.message || t('exercises.deleteFailed'));
    }
  };

  // 使用多语言预设选项，响应语言变化
  const muscleGroupOptions = getPresetOptions('muscleGroups', language);
  const equipmentOptions = getPresetOptions('equipment', language);
  const difficultyOptions = getPresetOptions('difficulty', language);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">{t('exercises.title')}</Title>
            <Text className="page-description">{t('exercises.description')}</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/exercises/create')}
            size="large"
          >
            {t('exercises.createExercise')}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Search
            placeholder={t('exercises.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
            size="large"
          />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Select
                placeholder={t('exercises.selectMuscleGroup')}
                value={selectedMuscleGroup}
                onChange={setSelectedMuscleGroup}
                style={{ width: '100%' }}
                allowClear
                options={muscleGroupOptions}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder={t('exercises.selectEquipment')}
                value={selectedEquipment}
                onChange={setSelectedEquipment}
                style={{ width: '100%' }}
                allowClear
                options={equipmentOptions}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder={t('exercises.selectDifficulty')}
                value={selectedDifficulty}
                onChange={setSelectedDifficulty}
                style={{ width: '100%' }}
                allowClear
                options={difficultyOptions}
              />
            </Col>
          </Row>
          <Button 
            type="primary" 
            icon={<FilterOutlined />}
            onClick={handleSearch}
            size="large"
          >
            {t('common.search')}
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
                    {isFavorite(exercise.id) ? t('exercises.favorited') : t('exercises.favorite')}
                  </Button>,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/exercises/${exercise.id}/edit`)}
                  >
                    {t('common.edit')}
                  </Button>,
                  <Popconfirm
                    title={t('exercises.deleteConfirm')}
                    description={t('exercises.deleteDescription')}
                    onConfirm={() => handleDeleteExercise(exercise.id)}
                    okText={t('common.confirm')}
                    cancelText={t('common.cancel')}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    >
                      {t('common.delete')}
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div className="exercise-info">
                  <div className="exercise-name">
                    {exercise.nameZh || exercise.name}
                  </div>
                  <div className="exercise-muscles">
                    {exercise.muscleGroups.map(group => {
                      // 使用多语言化的肌肉群翻译
                      const muscleGroupOption = muscleGroupOptions.find(option => option.value === group);
                      return (
                        <Tag key={group} color="blue" style={{ marginBottom: 4 }}>
                          {muscleGroupOption ? muscleGroupOption.label : group}
                        </Tag>
                      );
                    })}
                  </div>
                  <div className="exercise-equipment">
                    {exercise.equipment ? (() => {
                      // 使用多语言化的设备翻译
                      const equipmentOption = equipmentOptions.find(option => option.value === exercise.equipment);
                      return equipmentOption ? equipmentOption.label : exercise.equipment;
                    })() : null}
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
