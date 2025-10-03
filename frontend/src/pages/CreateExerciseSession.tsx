import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, InputNumber, Space, message, Row, Col, DatePicker, TimePicker, Radio, Divider } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, PlayCircleOutlined, ImportOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { createExerciseSession, fetchExerciseSession } from '../store/slices/exerciseSessionSlice';
import { fetchTrainingGroups } from '../store/slices/trainingGroupSlice';
import { fetchExercises } from '../store/slices/exerciseSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ExerciseRecord {
  exerciseId: string;
  trainingGroupId?: string;
  sets: {
    reps: number;
    weight: number;
    restTime?: number;
    notes?: string;
  }[];
}

interface ExerciseSessionForm {
  description?: string;
  date: dayjs.Dayjs;
  startTime: dayjs.Dayjs;
  notes?: string;
}

const CreateExerciseSession: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [form] = Form.useForm();
  const [selectedTrainingGroups, setSelectedTrainingGroups] = useState<string[]>([]);
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([
    {
      exerciseId: '',
      sets: [{ reps: 10, weight: 0, restTime: 60, notes: '' }]
    }
  ]);

  const isCreateMode = location.pathname.includes('/create');
  const isEditMode = location.pathname.includes('/edit');
  const isDetailMode = Boolean(id) && !isEditMode;
  const { trainingGroups, loading: trainingGroupsLoading } = useSelector((state: RootState) => state.trainingGroups);
  const { exercises, loading: exercisesLoading } = useSelector((state: RootState) => state.exercises);
  const { currentExerciseSession, loading: createLoading } = useSelector((state: RootState) => state.exerciseSessions);

  useEffect(() => {
    dispatch(fetchTrainingGroups());
    dispatch(fetchExercises({ page: 1, limit: 100 }));
    
    // 如果是详情模式或编辑模式，加载训练记录数据
    if ((isDetailMode || isEditMode) && id) {
      dispatch(fetchExerciseSession(id));
    }
  }, [dispatch, isDetailMode, isEditMode, id]);

  // 当训练记录数据加载完成后，填充表单
  useEffect(() => {
    if ((isDetailMode || isEditMode) && currentExerciseSession) {
      form.setFieldsValue({
        description: currentExerciseSession.notes,
        date: dayjs(currentExerciseSession.sessionDate),
        startTime: currentExerciseSession.startTime ? dayjs(currentExerciseSession.startTime) : dayjs(),
        notes: currentExerciseSession.notes
      });

      // 根据训练记录数据生成训练组设置
      if (currentExerciseSession.exerciseRecords && currentExerciseSession.exerciseRecords.length > 0) {
        const records: ExerciseRecord[] = currentExerciseSession.exerciseRecords.map(record => ({
          exerciseId: record.exerciseId,
          trainingGroupId: record.trainingGroupId,
          sets: record.exerciseSetRecords.map(setRecord => ({
            reps: setRecord.reps || 0,
            weight: setRecord.weight || 0,
            restTime: setRecord.restTimeSeconds || 60,
            notes: setRecord.notes || ''
          }))
        }));
        setExerciseRecords(records);
      }
    }
  }, [isDetailMode, isEditMode, currentExerciseSession, form]);

  // 从训练组导入数据
  const handleImportFromTrainingGroups = () => {
    if (selectedTrainingGroups.length === 0) {
      message.warning('请先选择要导入的训练组');
      return;
    }

    const importedRecords: ExerciseRecord[] = selectedTrainingGroups.map(groupId => {
      const group = trainingGroups.find(g => g.id === groupId);
      if (!group) return null;

      // 根据训练组数据生成训练组设置
      const sets = [];
      const repsMin = group.repsMin || 10;
      const repsMax = group.repsMax || 12;
      const weightMin = group.weightMin || 0;
      const weightMax = group.weightMax || 0;
      const restTime = group.restTimeSeconds || 60;

      // 生成训练组数据
      for (let i = 0; i < (group.sets || 1); i++) {
        sets.push({
          reps: Math.floor(repsMin + (repsMax - repsMin) * Math.random()),
          weight: weightMin + (weightMax - weightMin) * Math.random(),
          restTime: restTime,
          notes: ''
        });
      }

      return {
        exerciseId: group.exerciseId,
        trainingGroupId: groupId,
        sets: sets
      };
    }).filter(Boolean) as ExerciseRecord[];

    // 添加到现有记录中，而不是替换
    setExerciseRecords([...exerciseRecords, ...importedRecords]);
    setSelectedTrainingGroups([]); // 清空选择
    message.success(`成功添加 ${importedRecords.length} 个训练组`);
  };

  const handleAddExercise = () => {
    setExerciseRecords([
      ...exerciseRecords,
      {
        exerciseId: '',
        sets: [{ reps: 10, weight: 0, restTime: 60, notes: '' }]
      }
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    if (exerciseRecords.length > 1) {
      setExerciseRecords(exerciseRecords.filter((_, i) => i !== index));
    }
  };

  const handleExerciseChange = (index: number, field: keyof ExerciseRecord, value: any) => {
    const newRecords = [...exerciseRecords];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setExerciseRecords(newRecords);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newRecords = [...exerciseRecords];
    newRecords[exerciseIndex].sets.push({ reps: 10, weight: 0, restTime: 60, notes: '' });
    setExerciseRecords(newRecords);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newRecords = [...exerciseRecords];
    if (newRecords[exerciseIndex].sets.length > 1) {
      newRecords[exerciseIndex].sets = newRecords[exerciseIndex].sets.filter((_, i) => i !== setIndex);
      setExerciseRecords(newRecords);
    }
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: string, value: any) => {
    const newRecords = [...exerciseRecords];
    newRecords[exerciseIndex].sets[setIndex] = {
      ...newRecords[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setExerciseRecords(newRecords);
  };

  const handleSubmit = async (values: ExerciseSessionForm) => {
    try {
      // 验证所有动作都已选择
      const hasEmptyExercise = exerciseRecords.some(record => !record.exerciseId);
      if (hasEmptyExercise) {
        message.error('请为所有动作选择具体的动作');
        return;
      }

      // 验证所有训练组都有数据
      const hasEmptySets = exerciseRecords.some(record => 
        record.sets.some(set => set.reps === 0 || set.weight === 0)
      );
      if (hasEmptySets) {
        message.error('请填写完整的训练组数据');
        return;
      }

      const sessionData = {
        sessionDate: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.toDate(),
        notes: values.notes || values.description
      };

      await dispatch(createExerciseSession(sessionData)).unwrap();
      message.success('训练记录创建成功！');
      navigate('/exercise-sessions');
    } catch (error: any) {
      message.error(error.message || '创建失败，请重试');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/exercise-sessions')}
          >
            返回
          </Button>
          <div>
            <Title level={2} className="page-title">
              {isDetailMode ? '训练记录详情' : isEditMode ? '进行训练' : '记录训练'}
            </Title>
            <Text className="page-description">
              {isDetailMode ? '查看训练记录详情' : isEditMode ? '继续您的训练' : '记录您的训练过程'}
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
                description: '',
                date: dayjs(),
                startTime: dayjs(),
                notes: ''
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="训练日期"
                    name="date"
                    rules={[{ required: true, message: '请选择训练日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="开始时间"
                    name="startTime"
                    rules={[{ required: true, message: '请选择开始时间' }]}
                  >
                    <TimePicker style={{ width: '100%' }} format="HH:mm" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="训练描述"
                    name="description"
                  >
                    <Input placeholder="训练描述（可选）" />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text strong>训练动作</Text>
                  {!isDetailMode && (
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      onClick={handleAddExercise}
                    >
                      手动添加动作
                    </Button>
                  )}
                </div>

                {!isDetailMode && (
                  <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text strong>从训练组导入：</Text>
                    </div>
                    <Select
                      mode="multiple"
                      placeholder="选择要导入的训练组"
                      value={selectedTrainingGroups}
                      onChange={setSelectedTrainingGroups}
                      style={{ width: '100%', marginBottom: 12 }}
                      loading={trainingGroupsLoading}
                    >
                      {trainingGroups.map((group) => (
                        <Option key={group.id} value={group.id}>
                          {group.name} - {group.exercise.nameZh || group.exercise.name}
                        </Option>
                      ))}
                    </Select>
                    <Button 
                      type="primary" 
                      icon={<ImportOutlined />}
                      onClick={handleImportFromTrainingGroups}
                      disabled={selectedTrainingGroups.length === 0}
                    >
                      添加训练组
                    </Button>
                  </Card>
                )}

                <Divider />

                {exerciseRecords.map((record, exerciseIndex) => (
                  <Card 
                    key={exerciseIndex} 
                    size="small" 
                    style={{ marginBottom: 16 }}
                    title={`动作 ${exerciseIndex + 1}`}
                    extra={
                      !isDetailMode && exerciseRecords.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveExercise(exerciseIndex)}
                        />
                      )
                    }
                  >
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={24}>
                        <Text>选择动作</Text>
                        <Select
                          placeholder="选择动作"
                          value={record.exerciseId}
                          onChange={(value) => handleExerciseChange(exerciseIndex, 'exerciseId', value)}
                          style={{ width: '100%' }}
                          showSearch
                          filterOption={(input, option) =>
                            (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {exercises.map((exercise) => (
                            <Option key={exercise.id} value={exercise.id}>
                              {exercise.nameZh || exercise.name}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                    </Row>
                    
                    {record.trainingGroupId && (
                      <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#e6f7ff', borderRadius: 4 }}>
                        <Text type="secondary">
                          <ImportOutlined /> 来自训练组: {trainingGroups.find(g => g.id === record.trainingGroupId)?.name}
                        </Text>
                      </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text strong>训练组</Text>
                        {!isDetailMode && (
                          <Button 
                            type="dashed" 
                            size="small"
                            icon={<PlusOutlined />} 
                            onClick={() => handleAddSet(exerciseIndex)}
                          >
                            添加组
                          </Button>
                        )}
                      </div>

                      {record.sets.map((set, setIndex) => (
                        <Card 
                          key={setIndex} 
                          size="small" 
                          style={{ marginBottom: 8 }}
                          title={`第 ${setIndex + 1} 组`}
                          extra={
                            !isDetailMode && record.sets.length > 1 && (
                              <Button 
                                type="text" 
                                danger 
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                              />
                            )
                          }
                        >
                          <Row gutter={8}>
                            <Col span={6}>
                              <Text>次数</Text>
                              <InputNumber
                                min={1}
                                max={100}
                                value={set.reps}
                                onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'reps', value || 0)}
                                style={{ width: '100%' }}
                              />
                            </Col>
                            <Col span={6}>
                              <Text>重量 (kg)</Text>
                              <InputNumber
                                min={0}
                                max={1000}
                                step={0.5}
                                value={set.weight}
                                onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'weight', value || 0)}
                                style={{ width: '100%' }}
                              />
                            </Col>
                            <Col span={6}>
                              <Text>休息 (秒)</Text>
                              <InputNumber
                                min={0}
                                max={600}
                                value={set.restTime}
                                onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'restTime', value || 60)}
                                style={{ width: '100%' }}
                              />
                            </Col>
                            <Col span={6}>
                              <Text>备注</Text>
                              <Input
                                placeholder="备注"
                                value={set.notes}
                                onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'notes', e.target.value)}
                                style={{ width: '100%' }}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              <Form.Item
                label="训练备注"
                name="notes"
              >
                <TextArea 
                  placeholder="记录训练感受、注意事项等" 
                  rows={3}
                />
              </Form.Item>

              {!isDetailMode && (
                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={createLoading}
                      size="large"
                      icon={<PlayCircleOutlined />}
                    >
                      保存记录
                    </Button>
                    <Button 
                      onClick={() => navigate('/exercise-sessions')}
                      size="large"
                    >
                      取消
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="训练提示">
            <div style={{ color: '#666' }}>
              <p><strong>灵活添加训练内容：</strong></p>
              <p>• 可以同时使用导入和手动创建</p>
              <p>• 从训练组导入：快速添加已有训练组</p>
              <p>• 手动添加：自由创建新的训练内容</p>
              <p>• 可以多次导入不同的训练组</p>
              <p>• 可以混合使用两种方式</p>
              <p>• 记录每组的具体数据和感受</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateExerciseSession;
