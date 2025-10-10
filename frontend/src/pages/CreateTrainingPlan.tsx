import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Switch, Button, Card, Typography, Space, message, Empty, Row, Col, InputNumber, Divider, List, Tag } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, DeleteOutlined, ImportOutlined, PlayCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchTrainingPlan, createTrainingPlan, updateTrainingPlan } from '../store/slices/trainingPlanSlice';
import { fetchTrainingGroups } from '../store/slices/trainingGroupSlice';
import { fetchExercises } from '../store/slices/exerciseSlice';
import { useLanguage } from '../contexts/LanguageContext';
import { CreateTrainingPlanRequest } from '../types';
import { trainingPlanService } from '../services/trainingPlanService';
import dayjs from 'dayjs';
import './CreateTrainingPlan.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TrainingSet {
  reps: number;
  weight: number;
  restTime?: number;
  notes?: string;
}

interface ExerciseRecord {
  exerciseId: string;
  trainingGroupId?: string;
  sets: TrainingSet[];
}

interface TrainingPlanForm {
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  planDate?: dayjs.Dayjs;
  isTemplate: boolean;
  isPublic: boolean;
}

const CreateTrainingPlan: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useLanguage();
  
  const { currentTrainingPlan, loading } = useSelector((state: RootState) => state.trainingPlans);
  const { trainingGroups, loading: trainingGroupsLoading } = useSelector((state: RootState) => state.trainingGroups);
  const { exercises, loading: exercisesLoading } = useSelector((state: RootState) => state.exercises);
  
  const [form] = Form.useForm<TrainingPlanForm>();
  const [selectedTrainingGroups, setSelectedTrainingGroups] = useState<string[]>([]);
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  
  // 根据路径判断页面模式
  const isEditMode = location.pathname.includes('/edit');
  const isDetailMode = Boolean(id) && !isEditMode;

  useEffect(() => {
    // 加载训练组和动作数据
    dispatch(fetchTrainingGroups());
    dispatch(fetchExercises({ page: 1, limit: 100 }));

    // 如果是编辑或详情模式，加载训练计划数据
    if (id) {
      dispatch(fetchTrainingPlan(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTrainingPlan && (isEditMode || isDetailMode)) {
      form.setFieldsValue({
        name: currentTrainingPlan.name,
        description: currentTrainingPlan.description,
        status: currentTrainingPlan.status,
        planDate: currentTrainingPlan.planDate ? dayjs(currentTrainingPlan.planDate) : undefined,
        isTemplate: currentTrainingPlan.isTemplate,
        isPublic: currentTrainingPlan.isPublic
      });
      
      // 根据训练计划数据生成动作记录
      if (currentTrainingPlan.trainingPlanExercises && currentTrainingPlan.trainingPlanExercises.length > 0) {
        const records: ExerciseRecord[] = currentTrainingPlan.trainingPlanExercises.map(planExercise => {
          const sets = planExercise.trainingPlanExerciseSets.map(set => ({
            reps: set.reps || 0,
            weight: set.weight || 0,
            restTime: set.restTimeSeconds || 60,
            notes: set.notes || ''
          }));

          return {
            exerciseId: planExercise.exerciseId,
            trainingGroupId: planExercise.trainingGroupId || undefined,
            sets: sets.length > 0 ? sets : [{ reps: 10, weight: 0, restTime: 60, notes: '' }]
          };
        });
        setExerciseRecords(records);
      }
    }
  }, [currentTrainingPlan, isEditMode, isDetailMode, form]);

  const handleSubmit = async (values: TrainingPlanForm) => {
    try {
      // 构建训练动作数据，过滤掉空的动作
      const exercises = exerciseRecords
        .filter(record => record.exerciseId && record.exerciseId.trim() !== '') // 只包含已选择动作的记录
        .map((record, index) => ({
          exerciseId: record.exerciseId,
          trainingGroupId: record.trainingGroupId || null,
          orderIndex: index,
          notes: undefined,
          sets: record.sets.map((set, setIndex) => ({
            setNumber: setIndex + 1,
            reps: set.reps,
            weight: set.weight,
            restTimeSeconds: set.restTime,
            notes: set.notes
          }))
        }));

      // 如果没有任何有效的动作，给出提示
      if (exercises.length === 0) {
        message.error('请至少添加一个训练动作');
        return;
      }

      const planData: CreateTrainingPlanRequest = {
        name: values.name,
        description: values.description,
        status: values.status,
        planDate: values.planDate?.format('YYYY-MM-DD'),
        isTemplate: values.isTemplate,
        isPublic: values.isPublic,
        exercises: exercises
      };

      if (isEditMode && id) {
        await dispatch(updateTrainingPlan({ id, data: planData })).unwrap();
        message.success('训练计划更新成功！');
      } else {
        await dispatch(createTrainingPlan(planData)).unwrap();
        message.success('训练计划创建成功！');
      }
      
      navigate('/training-plans');
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 从训练组导入数据
  const handleImportFromTrainingGroups = () => {
    if (selectedTrainingGroups.length === 0) {
      message.warning(t('trainingPlans.selectTrainingGroupsFirst'));
      return;
    }

    const importedRecords: ExerciseRecord[] = selectedTrainingGroups.map(groupId => {
      const group = trainingGroups.find(g => g.id === groupId);
      if (!group) return null;

      let sets = [];
      
      // 优先使用训练组的预设数据
      if (group.trainingGroupSets && group.trainingGroupSets.length > 0) {
        sets = group.trainingGroupSets.map(set => ({
          reps: set.reps || 0,
          weight: set.weight || 0,
          restTime: set.restTimeSeconds || 60,
          notes: set.notes || ''
        }));
      } else {
        // 如果没有预设数据，使用范围生成
        const repsMin = group.repsMin || 10;
        const repsMax = group.repsMax || 12;
        const weightMin = group.weightMin || 0;
        const weightMax = group.weightMax || 0;
        const restTime = group.restTimeSeconds || 60;

        for (let i = 0; i < (group.sets || 1); i++) {
          sets.push({
            reps: Math.floor(repsMin + (repsMax - repsMin) * Math.random()),
            weight: weightMin + (weightMax - weightMin) * Math.random(),
            restTime: restTime,
            notes: ''
          });
        }
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
    message.success(t('trainingPlans.successfullyAddedTrainingGroups').replace('{count}', String(importedRecords.length)));
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

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: keyof TrainingSet, value: any) => {
    const newRecords = [...exerciseRecords];
    newRecords[exerciseIndex].sets[setIndex] = { 
      ...newRecords[exerciseIndex].sets[setIndex], 
      [field]: value 
    };
    setExerciseRecords(newRecords);
  };

  const getPageTitle = () => {
    if (isDetailMode) return t('trainingPlans.detailTitle');
    if (isEditMode) return t('trainingPlans.editTitle');
    return t('trainingPlans.createTitle');
  };

  const getPageDescription = () => {
    if (isDetailMode) return t('trainingPlans.detailDescription');
    if (isEditMode) return t('trainingPlans.editDescription');
    return t('trainingPlans.createDescription');
  };

  // 开始训练
  const handleStartTraining = async () => {
    if (!id) return;
    
    try {
      const session = await trainingPlanService.startTrainingFromPlan(id);
      message.success(t('trainingPlans.startTrainingSuccess'));
      // 跳转到训练记录编辑页
      navigate(`/exercise-sessions/${session.id}/edit`);
    } catch (error: any) {
      message.error(error.message || t('trainingPlans.startTrainingFailed'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/training-plans')}
            >
              {t('common.back')}
            </Button>
            <div>
              <Title level={2} className="page-title">
                {getPageTitle()}
              </Title>
              <Text className="page-description">
                {getPageDescription()}
              </Text>
            </div>
          </div>
          <Space>
            {isDetailMode && id && (
              <Button 
                icon={<EditOutlined />}
                onClick={() => navigate(`/training-plans/${id}/edit`)}
                size="large"
              >
                {t('common.edit')}
              </Button>
            )}
            {(isDetailMode || isEditMode) && id && (
              <Button 
                type="primary" 
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleStartTraining}
              >
                {t('trainingPlans.startTraining')}
              </Button>
            )}
          </Space>
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
                status: 'DRAFT',
                isTemplate: false,
                isPublic: false
              }}
              disabled={isDetailMode}
            >
              <Form.Item
                name="name"
                label={t('trainingPlans.planName')}
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Input placeholder={t('trainingPlans.planNamePlaceholder')} />
              </Form.Item>

              <Form.Item
                name="description"
                label={t('trainingPlans.planDescription')}
              >
                <TextArea 
                  rows={3} 
                  placeholder={t('trainingPlans.planDescriptionPlaceholder')}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label={t('trainingPlans.planStatus')}
              >
                <Select>
                  <Option value="DRAFT">{t('trainingPlans.statusDraft')}</Option>
                  <Option value="ACTIVE">{t('trainingPlans.statusActive')}</Option>
                  <Option value="COMPLETED">{t('trainingPlans.statusCompleted')}</Option>
                  <Option value="PAUSED">{t('trainingPlans.statusPaused')}</Option>
                  <Option value="CANCELLED">{t('trainingPlans.statusCancelled')}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="planDate"
                label={t('trainingPlans.planDate')}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder={t('trainingPlans.selectPlanDate')}
                />
              </Form.Item>

              <Form.Item
                name="isTemplate"
                valuePropName="checked"
              >
                <Switch checkedChildren={t('trainingPlans.isTemplate')} unCheckedChildren={t('trainingPlans.normalPlan')} />
              </Form.Item>

              <Form.Item
                name="isPublic"
                valuePropName="checked"
              >
                <Switch checkedChildren={t('trainingPlans.isPublic')} unCheckedChildren={t('trainingPlans.privatePlan')} />
              </Form.Item>

              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>{t('trainingPlans.trainingExercises')}</Text>
                </div>

                {exerciseRecords.length === 0 && !isDetailMode ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无训练动作，请通过下方添加"
                    style={{ margin: '40px 0' }}
                  />
                ) : (
                  exerciseRecords.map((record, exerciseIndex) => (
                  <Card 
                    key={exerciseIndex} 
                    size="small" 
                    style={{ marginBottom: 16 }}
                    title={`${t('trainingPlans.exerciseNumber').replace('{number}', String(exerciseIndex + 1))}`}
                    extra={
                      !isDetailMode && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveExercise(exerciseIndex)}
                        >
                          删除动作
                        </Button>
                      )
                    }
                  >
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={24}>
                        <Text>{t('trainingPlans.selectExercise')}</Text>
                        {isDetailMode ? (
                          <div style={{ 
                            padding: '8px 12px', 
                            marginTop: 4,
                            backgroundColor: '#f5f5f5', 
                            borderRadius: '6px',
                            border: '1px solid #d9d9d9'
                          }}>
                            {exercises.find(e => e.id === record.exerciseId)?.nameZh || 
                             exercises.find(e => e.id === record.exerciseId)?.name || 
                             '未选择动作'}
                          </div>
                        ) : (
                          <Select
                            placeholder={t('trainingPlans.selectExercisePlaceholder')}
                            value={record.exerciseId}
                            onChange={(value) => handleExerciseChange(exerciseIndex, 'exerciseId', value)}
                            style={{ width: '100%', marginTop: 4 }}
                            loading={exercisesLoading}
                            showSearch
                            filterOption={(input, option) =>
                              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                            }
                          >
                            {exercises.map((exercise) => (
                              <Option key={exercise.id} value={exercise.id}>
                                {exercise.nameZh || exercise.name}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </Col>
                    </Row>
                    
                    {record.trainingGroupId && (
                      <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#e6f7ff', borderRadius: 4 }}>
                        <Text type="secondary">
                          <ImportOutlined /> {t('trainingPlans.fromTrainingGroup')}: {trainingGroups.find(g => g.id === record.trainingGroupId)?.name}
                        </Text>
                      </div>
                    )}

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text strong>{t('trainingPlans.trainingSets')}</Text>
                        {!isDetailMode && (
                          <Button 
                            type="dashed" 
                            size="small"
                            icon={<PlusOutlined />} 
                            onClick={() => handleAddSet(exerciseIndex)}
                          >
                            {t('trainingPlans.addSet')}
                          </Button>
                        )}
                      </div>

                      {record.sets.map((set, setIndex) => (
                        <Card 
                          key={setIndex} 
                          size="small" 
                          style={{ marginBottom: 8 }}
                          title={`${t('trainingPlans.set')} ${setIndex + 1}`}
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
                          <Row gutter={16}>
                            <Col span={6}>
                              <Text>{t('trainingPlans.reps')}</Text>
                              {isDetailMode ? (
                                <div style={{ 
                                  padding: '8px 12px', 
                                  marginTop: 4,
                                  backgroundColor: '#f5f5f5', 
                                  borderRadius: '6px',
                                  border: '1px solid #d9d9d9'
                                }}>
                                  {set.reps}
                                </div>
                              ) : (
                                <InputNumber
                                  min={1}
                                  max={100}
                                  value={set.reps}
                                  onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'reps', value || 0)}
                                  style={{ width: '100%', marginTop: 4 }}
                                />
                              )}
                            </Col>
                            <Col span={6}>
                              <Text>{t('trainingPlans.weight')} (kg)</Text>
                              {isDetailMode ? (
                                <div style={{ 
                                  padding: '8px 12px', 
                                  marginTop: 4,
                                  backgroundColor: '#f5f5f5', 
                                  borderRadius: '6px',
                                  border: '1px solid #d9d9d9'
                                }}>
                                  {set.weight}
                                </div>
                              ) : (
                                <InputNumber
                                  min={0}
                                  max={1000}
                                  step={0.5}
                                  value={set.weight}
                                  onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'weight', value || 0)}
                                  style={{ width: '100%', marginTop: 4 }}
                                />
                              )}
                            </Col>
                            <Col span={6}>
                              <Text>{t('trainingPlans.restTime')} (秒)</Text>
                              {isDetailMode ? (
                                <div style={{ 
                                  padding: '8px 12px', 
                                  marginTop: 4,
                                  backgroundColor: '#f5f5f5', 
                                  borderRadius: '6px',
                                  border: '1px solid #d9d9d9'
                                }}>
                                  {set.restTime}
                                </div>
                              ) : (
                                <InputNumber
                                  min={0}
                                  max={600}
                                  value={set.restTime}
                                  onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'restTime', value || 60)}
                                  style={{ width: '100%', marginTop: 4 }}
                                />
                              )}
                            </Col>
                            <Col span={6}>
                              <Text>{t('trainingPlans.notes')}</Text>
                              {isDetailMode ? (
                                <div style={{ 
                                  padding: '8px 12px', 
                                  marginTop: 4,
                                  backgroundColor: '#f5f5f5', 
                                  borderRadius: '6px',
                                  border: '1px solid #d9d9d9',
                                  minHeight: '32px'
                                }}>
                                  {set.notes || '-'}
                                </div>
                              ) : (
                                <Input
                                  placeholder={t('trainingPlans.notesPlaceholder')}
                                  value={set.notes}
                                  onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'notes', e.target.value)}
                                  style={{ width: '100%', marginTop: 4 }}
                                />
                              )}
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  </Card>
                ))
                )}

                <Divider />

                {!isDetailMode && (
                  <>
                    <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>{t('trainingPlans.importFromTrainingGroups')}</Text>
                      </div>
                      <Select
                        mode="multiple"
                        placeholder={t('trainingPlans.selectTrainingGroupsToImport')}
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
                        {t('trainingPlans.addTrainingGroups')}
                      </Button>
                    </Card>

                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      onClick={handleAddExercise}
                      block
                    >
                      {t('trainingPlans.addExerciseManually')}
                    </Button>
                  </>
                )}
              </div>

              {!isDetailMode && (
                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      size="large"
                    >
                      {isEditMode ? t('common.update') : t('common.create')}
                    </Button>
                    <Button 
                      onClick={() => navigate('/training-plans')}
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
          {isDetailMode && currentTrainingPlan?.exerciseSessions && currentTrainingPlan.exerciseSessions.length > 0 && (
            <Card 
              title={t('trainingPlans.relatedSessions')}
              extra={
                <Text type="secondary">
                  {t('trainingPlans.sessionCount').replace('{count}', String(currentTrainingPlan.exerciseSessions.length))}
                </Text>
              }
            >
              <List
                dataSource={currentTrainingPlan.exerciseSessions}
                renderItem={(session) => (
                  <List.Item
                    key={session.id}
                    actions={[
                      <Button 
                        type="link" 
                        onClick={() => navigate(`/exercise-sessions/${session.id}`)}
                      >
                        {t('common.view')}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{session.name}</span>
                          <Tag color={
                            session.status === 'COMPLETED' ? 'success' : 
                            session.status === 'IN_PROGRESS' ? 'processing' : 
                            session.status === 'PAUSED' ? 'warning' : 'default'
                          }>
                            {session.status === 'IN_PROGRESS' ? t('exerciseSessions.inProgress') :
                             session.status === 'COMPLETED' ? t('exerciseSessions.completed') :
                             session.status === 'PAUSED' ? t('exerciseSessions.paused') :
                             t('exerciseSessions.cancelled')}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>{dayjs(session.sessionDate).format('YYYY-MM-DD')}</div>
                          {session.exerciseRecords && session.exerciseRecords.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              {session.exerciseRecords.map((record) => (
                                <div key={record.id} style={{ fontSize: '12px', color: '#666' }}>
                                  {record.exercise.nameZh || record.exercise.name}
                                  {record.exerciseSetRecords && record.exerciseSetRecords.length > 0 && (
                                    <span style={{ marginLeft: 8 }}>
                                      {record.exerciseSetRecords.map((set) => (
                                        set.weight && set.reps ? `${set.weight}kg×${set.reps}` : ''
                                      )).filter(Boolean).join(', ')}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
          
          {!isDetailMode && !isEditMode && (
            <Card title={t('trainingPlans.tipsTitle')}>
              <div style={{ color: '#666' }}>
                <p>• {t('trainingPlans.tip1')}</p>
                <p>• {t('trainingPlans.tip2')}</p>
                <p>• {t('trainingPlans.tip3')}</p>
                <p>• {t('trainingPlans.tip4')}</p>
                <p>• {t('trainingPlans.tip5')}</p>
                <p>• {t('trainingPlans.tip6')}</p>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CreateTrainingPlan;
