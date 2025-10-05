import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, InputNumber, Space, message, Row, Col } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { createTrainingGroup, updateTrainingGroup, fetchTrainingGroup } from '../store/slices/trainingGroupSlice';
import { fetchExercises } from '../store/slices/exerciseSlice';
import { useLanguage } from '../contexts/LanguageContext';

const { Title, Text } = Typography;
const { Option } = Select;

interface TrainingSet {
  reps: number;
  weight: number;
  restTime?: number;
}

interface TrainingGroupForm {
  name: string;
  description?: string;
  exerciseId: string;
  sets: TrainingSet[];
}

const CreateTrainingGroup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [sets, setSets] = useState<TrainingSet[]>([
    { reps: 10, weight: 0, restTime: 60 }
  ]);
  const { t } = useLanguage();

  const isEditMode = Boolean(id) && window.location.pathname.includes('/edit');
  const isDetailMode = Boolean(id) && !isEditMode;
  const { exercises, loading: exercisesLoading } = useSelector((state: RootState) => state.exercises);
  const { currentTrainingGroup, loading: createLoading } = useSelector((state: RootState) => state.trainingGroups);

  useEffect(() => {
    dispatch(fetchExercises({ page: 1, limit: 100 }));
    
    // 如果是编辑模式或详情模式，加载训练组数据
    if ((isEditMode || isDetailMode) && id) {
      dispatch(fetchTrainingGroup(id));
    }
  }, [dispatch, isEditMode, isDetailMode, id]);

  // 当训练组数据加载完成后，填充表单
  useEffect(() => {
    if ((isEditMode || isDetailMode) && currentTrainingGroup) {
      form.setFieldsValue({
        name: currentTrainingGroup.name,
        description: currentTrainingGroup.description,
        exerciseId: currentTrainingGroup.exerciseId
      });

      // 根据训练组数据生成训练组设置
      const generatedSets: TrainingSet[] = [];
      const repsMin = currentTrainingGroup.repsMin || 10;
      const repsMax = currentTrainingGroup.repsMax || 12;
      const weightMin = currentTrainingGroup.weightMin || 0;
      const weightMax = currentTrainingGroup.weightMax || 0;
      const restTime = currentTrainingGroup.restTimeSeconds || 60;

      // 生成训练组数据（简化版本，实际应该从TrainingGroupSet表获取）
      for (let i = 0; i < (currentTrainingGroup.sets || 1); i++) {
        generatedSets.push({
          reps: Math.floor(repsMin + (repsMax - repsMin) * Math.random()),
          weight: weightMin + (weightMax - weightMin) * Math.random(),
          restTime: restTime
        });
      }
      setSets(generatedSets);
    }
  }, [isEditMode, isDetailMode, currentTrainingGroup, form]);

  const handleAddSet = () => {
    setSets([...sets, { reps: 10, weight: 0, restTime: 60 }]);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const handleSetChange = (index: number, field: keyof TrainingSet, value: number) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const handleSubmit = async (values: TrainingGroupForm) => {
    try {
      // 计算训练组的基本参数
      const repsValues = sets.map(set => set.reps);
      const weightValues = sets.map(set => set.weight);
      const restTimeValues = sets.map(set => set.restTime || 60);

      const trainingGroupData = {
        name: values.name,
        exerciseId: values.exerciseId,
        description: values.description,
        sets: sets.length, // 训练组数量
        repsMin: Math.min(...repsValues),
        repsMax: Math.max(...repsValues),
        weightMin: Math.min(...weightValues),
        weightMax: Math.max(...weightValues),
        restTimeSeconds: Math.round(restTimeValues.reduce((a, b) => a + b, 0) / restTimeValues.length),
        notes: t('trainingGroups.containsSets').replace('{count}', String(sets.length)),
        tags: []
      };

      if (isEditMode && id) {
        await dispatch(updateTrainingGroup({ id, data: trainingGroupData })).unwrap();
        message.success(t('trainingGroups.updateSuccess'));
      } else {
        await dispatch(createTrainingGroup(trainingGroupData)).unwrap();
        message.success(t('trainingGroups.createSuccess'));
      }
      
      navigate('/training-groups');
    } catch (error: any) {
      message.error(error.message || t('trainingGroups.operationFailed'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/training-groups')}
          >
            {t('common.back')}
          </Button>
          <div>
            <Title level={2} className="page-title">
              {isDetailMode ? t('trainingGroups.detailTitle') : isEditMode ? t('trainingGroups.editTitle') : t('trainingGroups.createTitle')}
            </Title>
            <Text className="page-description">
              {isDetailMode ? t('trainingGroups.detailDescription') : isEditMode ? t('trainingGroups.editDescription') : t('trainingGroups.createDescription')}
            </Text>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={isDetailMode}
              initialValues={{
                name: '',
                description: '',
                exerciseId: undefined
              }}
            >
              <Form.Item
                label={t('trainingGroups.nameLabel')}
                name="name"
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Input placeholder={t('trainingGroups.namePlaceholder')} />
              </Form.Item>

              <Form.Item
                label={t('trainingGroups.descriptionLabel')}
                name="description"
              >
                <Input.TextArea 
                  placeholder={t('trainingGroups.descriptionPlaceholder')} 
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                label={t('trainingGroups.selectExercise')}
                name="exerciseId"
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Select
                  placeholder={t('trainingGroups.selectExercisePlaceholder')}
                  loading={exercisesLoading}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {exercises.map((exercise) => (
                    <Option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text strong>{t('trainingGroups.trainingSets')}</Text>
                  {!isDetailMode && (
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      onClick={handleAddSet}
                    >
                      {t('trainingGroups.addSet')}
                    </Button>
                  )}
                </div>

                {sets.map((set, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    style={{ marginBottom: 12 }}
                    title={`${t('trainingGroups.set')} ${index + 1}`}
                    extra={
                      !isDetailMode && sets.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveSet(index)}
                        >
                          {t('common.delete')}
                        </Button>
                      )
                    }
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Text>{t('trainingGroups.reps')}</Text>
                        <InputNumber
                          min={1}
                          max={100}
                          value={set.reps}
                          onChange={(value) => handleSetChange(index, 'reps', value || 0)}
                          style={{ width: '100%' }}
                          disabled={isDetailMode}
                        />
                      </Col>
                      <Col span={8}>
                        <Text>{t('trainingGroups.weight')} (kg)</Text>
                        <InputNumber
                          min={0}
                          max={1000}
                          step={0.5}
                          value={set.weight}
                          onChange={(value) => handleSetChange(index, 'weight', value || 0)}
                          style={{ width: '100%' }}
                          disabled={isDetailMode}
                        />
                      </Col>
                      <Col span={8}>
                        <Text>{t('trainingGroups.restTime')} (秒)</Text>
                        <InputNumber
                          min={0}
                          max={600}
                          value={set.restTime}
                          onChange={(value) => handleSetChange(index, 'restTime', value || 60)}
                          style={{ width: '100%' }}
                          disabled={isDetailMode}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>

              {!isDetailMode && (
                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={createLoading}
                      size="large"
                    >
                      {isEditMode ? t('common.update') : t('common.create')}
                    </Button>
                    <Button 
                      onClick={() => navigate('/training-groups')}
                      size="large"
                    >
                      {t('common.cancel')}
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={t('trainingGroups.tipsTitle')}>
            <div style={{ color: '#666' }}>
              <p>• {t('trainingGroups.tip1')}</p>
              <p>• {t('trainingGroups.tip2')}</p>
              <p>• {t('trainingGroups.tip3')}</p>
              <p>• {t('trainingGroups.tip4')}</p>
              <p>• {t('trainingGroups.tip5')}</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateTrainingGroup;
