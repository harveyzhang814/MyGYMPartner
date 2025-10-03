import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, InputNumber, Space, message, Row, Col } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { createTrainingGroup, updateTrainingGroup, fetchTrainingGroup } from '../store/slices/trainingGroupSlice';
import { fetchExercises } from '../store/slices/exerciseSlice';

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

  const isEditMode = Boolean(id);
  const { exercises, loading: exercisesLoading } = useSelector((state: RootState) => state.exercises);
  const { currentTrainingGroup, loading: createLoading } = useSelector((state: RootState) => state.trainingGroups);

  useEffect(() => {
    dispatch(fetchExercises({ page: 1, limit: 100 }));
    
    // 如果是编辑模式，加载训练组数据
    if (isEditMode && id) {
      dispatch(fetchTrainingGroup(id));
    }
  }, [dispatch, isEditMode, id]);

  // 当训练组数据加载完成后，填充表单
  useEffect(() => {
    if (isEditMode && currentTrainingGroup) {
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
  }, [isEditMode, currentTrainingGroup, form]);

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
        notes: `包含${sets.length}个训练组`,
        tags: []
      };

      if (isEditMode && id) {
        await dispatch(updateTrainingGroup({ id, data: trainingGroupData })).unwrap();
        message.success('训练组更新成功！');
      } else {
        await dispatch(createTrainingGroup(trainingGroupData)).unwrap();
        message.success('训练组创建成功！');
      }
      
      navigate('/training-groups');
    } catch (error: any) {
      message.error(error.message || `${isEditMode ? '更新' : '创建'}失败，请重试`);
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
            返回
          </Button>
          <div>
            <Title level={2} className="page-title">
              {isEditMode ? '编辑训练组' : '创建训练组'}
            </Title>
            <Text className="page-description">
              {isEditMode ? '修改您的训练组参数' : '设置您的训练组参数'}
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
              initialValues={{
                name: '',
                description: '',
                exerciseId: undefined
              }}
            >
              <Form.Item
                label="训练组名称"
                name="name"
                rules={[{ required: true, message: '请输入训练组名称' }]}
              >
                <Input placeholder="例如：胸部训练" />
              </Form.Item>

              <Form.Item
                label="描述"
                name="description"
              >
                <Input.TextArea 
                  placeholder="训练组描述（可选）" 
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                label="选择动作"
                name="exerciseId"
                rules={[{ required: true, message: '请选择动作' }]}
              >
                <Select
                  placeholder="选择动作"
                  loading={exercisesLoading}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
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
                  <Text strong>训练组设置</Text>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddSet}
                  >
                    添加组
                  </Button>
                </div>

                {sets.map((set, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    style={{ marginBottom: 12 }}
                    title={`第 ${index + 1} 组`}
                    extra={
                      sets.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveSet(index)}
                        />
                      )
                    }
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Text>次数</Text>
                        <InputNumber
                          min={1}
                          max={100}
                          value={set.reps}
                          onChange={(value) => handleSetChange(index, 'reps', value || 0)}
                          style={{ width: '100%' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Text>重量 (kg)</Text>
                        <InputNumber
                          min={0}
                          max={1000}
                          step={0.5}
                          value={set.weight}
                          onChange={(value) => handleSetChange(index, 'weight', value || 0)}
                          style={{ width: '100%' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Text>休息时间 (秒)</Text>
                        <InputNumber
                          min={0}
                          max={600}
                          value={set.restTime}
                          onChange={(value) => handleSetChange(index, 'restTime', value || 60)}
                          style={{ width: '100%' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={createLoading}
                    size="large"
                  >
                    {isEditMode ? '更新训练组' : '创建训练组'}
                  </Button>
                  <Button 
                    onClick={() => navigate('/training-groups')}
                    size="large"
                  >
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="提示">
            <div style={{ color: '#666' }}>
              <p>• 训练组名称应该简洁明了</p>
              <p>• 选择合适的动作进行训练</p>
              <p>• 设置合理的次数和重量</p>
              <p>• 休息时间建议60-180秒</p>
              <p>• 可以添加多个训练组</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateTrainingGroup;
