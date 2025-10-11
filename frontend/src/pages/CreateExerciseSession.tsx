import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, InputNumber, Space, message, Row, Col, DatePicker, TimePicker, Divider, Empty, Tag } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, PlayCircleOutlined, ImportOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { createExerciseSession, updateExerciseSession, fetchExerciseSession } from '../store/slices/exerciseSessionSlice';
import { fetchTrainingGroups } from '../store/slices/trainingGroupSlice';
import { fetchExercises } from '../store/slices/exerciseSlice';
import { useLanguage } from '../contexts/LanguageContext';
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
  name?: string;
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
  const { t } = useLanguage();
  const [selectedTrainingGroups, setSelectedTrainingGroups] = useState<string[]>([]);
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  const [trainingPlanFromState, setTrainingPlanFromState] = useState<any>(null);
  const [trainingPlanName, setTrainingPlanName] = useState<string>('');
  const [trainingPlanDescription, setTrainingPlanDescription] = useState<string>('');
  const [trainingPlanId, setTrainingPlanId] = useState<string>('');

  // const isCreateMode = location.pathname.includes('/create');
  const isEditMode = location.pathname.includes('/edit');
  const isDetailMode = Boolean(id) && !isEditMode;
  const { trainingGroups, loading: trainingGroupsLoading } = useSelector((state: RootState) => state.trainingGroups);
  const { exercises } = useSelector((state: RootState) => state.exercises);
  const { currentExerciseSession, loading: createLoading } = useSelector((state: RootState) => state.exerciseSessions);

  useEffect(() => {
    dispatch(fetchTrainingGroups());
    dispatch(fetchExercises({ page: 1, limit: 100 }));
    
    // 检查是否有从训练计划传递过来的信息
    if (location.state?.trainingPlan) {
      console.log('Training plan from state:', location.state.trainingPlan);
      console.log('Training plan type:', typeof location.state.trainingPlan);
      console.log('Training plan keys:', Object.keys(location.state.trainingPlan));
      
      const plan = location.state.trainingPlan;
      if (plan && typeof plan === 'object') {
        setTrainingPlanFromState(plan);
        setTrainingPlanName(plan.name || '');
        setTrainingPlanDescription(plan.description || '');
        setTrainingPlanId(plan.id || '');
      }
    }
    
    // 如果是详情模式或编辑模式，加载训练记录数据
    if ((isDetailMode || isEditMode) && id) {
      dispatch(fetchExerciseSession(id));
    }
  }, [dispatch, isDetailMode, isEditMode, id, location.state]);

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
          trainingGroupId: record.trainingGroupId || undefined,
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
      message.warning(t('exerciseSessions.selectTrainingGroupsFirst'));
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
    message.success(t('exerciseSessions.successfullyAddedTrainingGroups').replace('{count}', String(importedRecords.length)));
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
    const currentSets = newRecords[exerciseIndex].sets;
    // 复制上一组的内容，如果没有上一组则使用默认值
    const lastSet = currentSets.length > 0 ? currentSets[currentSets.length - 1] : { reps: 10, weight: 0, restTime: 60, notes: '' };
    newRecords[exerciseIndex].sets.push({ ...lastSet });
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
      // 构建训练动作数据，过滤掉空的动作
      const exercises = exerciseRecords
        .filter(record => record.exerciseId && record.exerciseId.trim() !== '')
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
            isCompleted: false,
            notes: set.notes
          }))
        }));

      // 如果没有任何有效的动作，给出提示
      if (exercises.length === 0) {
        message.error('请至少添加一个训练动作');
        return;
      }

      const sessionData = {
        name: values.name || `训练记录 ${values.date.format('YYYY-MM-DD')}`,
        sessionDate: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.toDate(),
        notes: values.notes || values.description,
        exercises: exercises
      };

      if (isEditMode && id) {
        await dispatch(updateExerciseSession({ id, data: sessionData })).unwrap();
        message.success('训练记录更新成功！');
      } else {
        await dispatch(createExerciseSession(sessionData)).unwrap();
        message.success(t('exerciseSessions.createSuccess'));
      }
      
      navigate('/exercise-sessions');
    } catch (error: any) {
      message.error(error.message || t('exerciseSessions.createFailed'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/exercise-sessions')}
            >
              {t('common.back')}
            </Button>
            <div>
              <Title level={2} className="page-title">
                {isDetailMode ? t('exerciseSessions.detailTitle') : isEditMode ? t('exerciseSessions.continueTraining') : t('exerciseSessions.recordTraining')}
              </Title>
              <Text className="page-description">
                {isDetailMode ? t('exerciseSessions.detailDescription') : isEditMode ? t('exerciseSessions.continueDescription') : t('exerciseSessions.recordDescription')}
              </Text>
            </div>
          </div>
          {isDetailMode && id && (
            <Button 
              icon={<EditOutlined />}
              onClick={() => navigate(`/exercise-sessions/${id}/edit`)}
              size="large"
            >
              {t('common.edit')}
            </Button>
          )}
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
                    label={t('exerciseSessions.trainingDate')}
                    name="date"
                    rules={[{ required: true, message: t('exerciseSessions.selectTrainingDate') }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('exerciseSessions.startTime')}
                    name="startTime"
                    rules={[{ required: true, message: t('exerciseSessions.selectStartTime') }]}
                  >
                    <TimePicker style={{ width: '100%' }} format="HH:mm" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={t('exerciseSessions.trainingDescription')}
                    name="description"
                  >
                    <Input placeholder={t('exerciseSessions.trainingDescriptionPlaceholder')} />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>{t('exerciseSessions.trainingExercises')}</Text>
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
                    className="exercise-card-wrapper"
                    title={
                      <span>
                        {`${t('exerciseSessions.exerciseNumber').replace('{number}', String(exerciseIndex + 1))}`}
                        {record.trainingGroupId && (
                          <Tag icon={<ImportOutlined />} color="blue" style={{ marginLeft: 8 }}>
                            来自训练组
                          </Tag>
                        )}
                      </span>
                    }
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <Text style={{ minWidth: 80 }}>{t('exerciseSessions.selectExercise')}</Text>
                      <Select
                        placeholder={t('exerciseSessions.selectExercisePlaceholder')}
                        value={record.exerciseId}
                        onChange={(value) => handleExerciseChange(exerciseIndex, 'exerciseId', value)}
                        style={{ flex: 1 }}
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
                    </div>
                    
                    <div style={{ marginBottom: 12 }}>

                      {record.sets.map((set, setIndex) => (
                        <div key={setIndex} className="training-set-card-inline">
                          <span className="training-set-number">组{setIndex + 1}</span>
                          <div className="training-set-fields">
                            <div className="training-set-field">
                              <span className="field-label">{t('exerciseSessions.weight')} (kg)</span>
                              <div className="field-input">
                                <InputNumber
                                  min={0}
                                  max={1000}
                                  step={0.5}
                                  value={set.weight}
                                  onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'weight', value || 0)}
                                  size="small"
                                />
                              </div>
                            </div>
                            <div className="training-set-field">
                              <span className="field-label">{t('exerciseSessions.reps')}</span>
                              <div className="field-input">
                                <InputNumber
                                  min={1}
                                  max={100}
                                  value={set.reps}
                                  onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'reps', value || 0)}
                                  size="small"
                                />
                              </div>
                            </div>
                            <div className="training-set-field">
                              <span className="field-label">{t('exerciseSessions.rest')} (秒)</span>
                              <div className="field-input">
                                <InputNumber
                                  min={0}
                                  max={600}
                                  value={set.restTime}
                                  onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'restTime', value || 60)}
                                  size="small"
                                />
                              </div>
                            </div>
                            <div className="training-set-field">
                              <span className="field-label">{t('exerciseSessions.notes')}</span>
                              <div className="field-input">
                                <Input
                                  placeholder={t('exerciseSessions.notesPlaceholder')}
                                  value={set.notes}
                                  onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'notes', e.target.value)}
                                  size="small"
                                />
                              </div>
                            </div>
                          </div>
                          {!isDetailMode && record.sets.length > 1 && (
                            <Button 
                              type="text" 
                              danger 
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                            />
                          )}
                        </div>
                      ))}
                      
                      {!isDetailMode && (
                        <Button 
                          type="dashed" 
                          size="small"
                          icon={<PlusOutlined />} 
                          onClick={() => handleAddSet(exerciseIndex)}
                          style={{ width: '100%', marginTop: 8 }}
                        >
                          {t('exerciseSessions.addSet')}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
                )}

                <Divider />

                {!isDetailMode && (
                  <>
                    <div className="import-section">
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>{t('exerciseSessions.importFromTrainingGroups')}</Text>
                      </div>
                      <Row gutter={16} align="middle">
                        <Col flex="1" style={{ minWidth: 0 }}>
                          <Select
                            mode="multiple"
                            placeholder={t('exerciseSessions.selectTrainingGroupsToImport')}
                            value={selectedTrainingGroups}
                            onChange={setSelectedTrainingGroups}
                            loading={trainingGroupsLoading}
                            style={{ width: '100%' }}
                          >
                            {trainingGroups.map((group) => (
                              <Option key={group.id} value={group.id}>
                                {group.name} - {group.exercise.nameZh || group.exercise.name}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col flex="none">
                          <Button 
                            type="primary" 
                            icon={<ImportOutlined />}
                            onClick={handleImportFromTrainingGroups}
                            disabled={selectedTrainingGroups.length === 0}
                          >
                            导入
                          </Button>
                        </Col>
                      </Row>
                    </div>

                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      onClick={handleAddExercise}
                      block
                    >
                      {t('exerciseSessions.addExerciseManually')}
                    </Button>
                  </>
                )}
              </div>

              <Form.Item
                label={t('exerciseSessions.trainingNotes')}
                name="notes"
              >
                <TextArea 
                  placeholder={t('exerciseSessions.trainingNotesPlaceholder')} 
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
                      {t('exerciseSessions.saveRecord')}
                    </Button>
                    <Button 
                      onClick={() => navigate('/exercise-sessions')}
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
          {(((isDetailMode || isEditMode) && currentExerciseSession?.trainingPlan) || trainingPlanName) && (
            <Card 
              title={t('exerciseSessions.relatedPlan')}
              extra={
                <Button 
                  type="link" 
                  onClick={() => navigate(`/training-plans/${currentExerciseSession?.trainingPlan?.id || trainingPlanId}`)}
                >
                  {t('common.view')}
                </Button>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: '16px' }}>
                  {currentExerciseSession?.trainingPlan?.name || trainingPlanName}
                </Text>
                {(currentExerciseSession?.trainingPlan?.description || trainingPlanDescription) && (
                  <div style={{ marginTop: 8, color: '#666' }}>
                    {currentExerciseSession?.trainingPlan?.description || trainingPlanDescription}
                  </div>
                )}
              </div>
              
              <Divider>{t('exerciseSessions.planContent')}</Divider>
              
              <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                {(() => {
                  const exercises = currentExerciseSession?.trainingPlan?.trainingPlanExercises || 
                    (trainingPlanFromState && typeof trainingPlanFromState === 'object' ? trainingPlanFromState.trainingPlanExercises : null);
                  
                  if (!exercises || !Array.isArray(exercises)) {
                    return <div>暂无训练内容</div>;
                  }
                  
                  return exercises.map((planExercise: any) => {
                    if (!planExercise || typeof planExercise !== 'object') {
                      return null;
                    }
                    
                    return (
                      <div key={planExercise.id || Math.random()} style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                          {planExercise.exercise?.nameZh || planExercise.exercise?.name || '未知动作'}
                          {planExercise.trainingGroup && (
                            <span style={{ fontSize: '10px', color: '#999', marginLeft: 8 }}>
                              (来自: {planExercise.trainingGroup.name})
                            </span>
                          )}
                        </div>
                        {planExercise.trainingPlanExerciseSets && Array.isArray(planExercise.trainingPlanExerciseSets) && planExercise.trainingPlanExerciseSets.length > 0 ? (
                          planExercise.trainingPlanExerciseSets.map((set: any) => (
                            <div key={set.id || Math.random()} style={{ paddingLeft: 16 }}>
                              {set.weight && set.reps 
                                ? `${set.weight}kg × ${set.reps}次` 
                                : set.reps 
                                ? `${set.reps}次`
                                : '-'}
                            </div>
                          ))
                        ) : (
                          <div style={{ paddingLeft: 16 }}>-</div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          )}
          
          {!isDetailMode && !isEditMode && (
            <Card title={t('exerciseSessions.tipsTitle')}>
              <div style={{ color: '#666' }}>
                <p><strong>{t('exerciseSessions.tipsTitle')}</strong></p>
                <p>• {t('exerciseSessions.tip1')}</p>
                <p>• {t('exerciseSessions.tip2')}</p>
                <p>• {t('exerciseSessions.tip3')}</p>
                <p>• {t('exerciseSessions.tip4')}</p>
                <p>• {t('exerciseSessions.tip5')}</p>
                <p>• {t('exerciseSessions.tip6')}</p>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CreateExerciseSession;
