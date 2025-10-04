import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, Space, message, Row, Col, Switch, Divider } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { createExercise, updateExercise, fetchExercise } from '../store/slices/exerciseSlice';
import { CreateExerciseRequest } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getPresetOptions } from '../locales';

const { Title, Text } = Typography;
// const { Option } = Select; // Not used in this component
const { TextArea } = Input;

interface ExerciseForm {
  name: string;
  nameZh?: string;
  description?: string;
  descriptionZh?: string;
  muscleGroups: string[];
  equipment?: string;
  difficultyLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category?: string;
  gifUrl?: string;
  isTemplate?: boolean;
  isPublic?: boolean;
  instructions: string[];
  instructionsZh: string[];
}

const CreateExercise: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [instructionsZh, setInstructionsZh] = useState<string[]>(['']);
  const { t } = useLanguage();

  const isEditMode = Boolean(id) && window.location.pathname.includes('/edit');
  const isDetailMode = Boolean(id) && !isEditMode;
  const { currentExercise, loading: createLoading } = useSelector((state: RootState) => state.exercises);

  useEffect(() => {
    if ((isEditMode || isDetailMode) && id) {
      dispatch(fetchExercise(id));
    }
  }, [dispatch, isEditMode, isDetailMode, id]);

  useEffect(() => {
    if ((isEditMode || isDetailMode) && currentExercise) {
      form.setFieldsValue({
        name: currentExercise.name,
        nameZh: currentExercise.nameZh,
        description: currentExercise.description,
        descriptionZh: currentExercise.descriptionZh,
        muscleGroups: currentExercise.muscleGroups,
        equipment: currentExercise.equipment,
        difficultyLevel: currentExercise.difficultyLevel,
        category: currentExercise.category,
        gifUrl: currentExercise.gifUrl,
        isTemplate: currentExercise.isTemplate,
        isPublic: currentExercise.isPublic
      });

      setInstructions(currentExercise.instructions || ['']);
      setInstructionsZh(currentExercise.instructionsZh || ['']);
    }
  }, [isEditMode, isDetailMode, currentExercise, form]);

  const handleAddInstruction = (type: 'instructions' | 'instructionsZh') => {
    if (type === 'instructions') {
      setInstructions([...instructions, '']);
    } else {
      setInstructionsZh([...instructionsZh, '']);
    }
  };

  const handleRemoveInstruction = (index: number, type: 'instructions' | 'instructionsZh') => {
    if (type === 'instructions') {
      if (instructions.length > 1) {
        setInstructions(instructions.filter((_, i) => i !== index));
      }
    } else {
      if (instructionsZh.length > 1) {
        setInstructionsZh(instructionsZh.filter((_, i) => i !== index));
      }
    }
  };

  const handleInstructionChange = (index: number, value: string, type: 'instructions' | 'instructionsZh') => {
    if (type === 'instructions') {
      const newInstructions = [...instructions];
      newInstructions[index] = value;
      setInstructions(newInstructions);
    } else {
      const newInstructionsZh = [...instructionsZh];
      newInstructionsZh[index] = value;
      setInstructionsZh(newInstructionsZh);
    }
  };

  const handleSubmit = async (values: ExerciseForm) => {
    try {
      const exerciseData: CreateExerciseRequest = {
        ...values,
        instructions: instructions.filter(inst => inst.trim() !== ''),
        instructionsZh: instructionsZh.filter(inst => inst.trim() !== '')
      };

      if (isEditMode && id) {
        await dispatch(updateExercise({ id, data: exerciseData })).unwrap();
        message.success(t('exercises.updateSuccess'));
      } else {
        await dispatch(createExercise(exerciseData)).unwrap();
        message.success(t('exercises.createSuccess'));
      }

      navigate('/exercises');
    } catch (error: any) {
      message.error(error.message || t('exercises.operationFailed'));
    }
  };

  // 使用多语言预设选项
  const muscleGroupOptions = getPresetOptions('muscleGroups');
  const equipmentOptions = getPresetOptions('equipment');
  const difficultyOptions = getPresetOptions('difficulty');
  const categoryOptions = getPresetOptions('categories');

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/exercises')}
          >
            {t('common.back')}
          </Button>
          <div>
            <Title level={2} className="page-title">
              {isDetailMode ? t('exercises.detailTitle') : isEditMode ? t('exercises.editExercise') : t('exercises.createExercise')}
            </Title>
            <Text className="page-description">
              {isDetailMode ? t('exercises.detailDescription') : isEditMode ? t('exercises.editExerciseDescription') : t('exercises.createExerciseDescription')}
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
                isTemplate: false,
                isPublic: true,
                difficultyLevel: 'BEGINNER',
                category: 'strength'
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('exercises.exerciseName')}
                    name="name"
                    rules={[{ required: true, message: t('common.error') }]}
                  >
                    <Input placeholder={t('exercises.namePlaceholder')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('exercises.exerciseNameZh')}
                    name="nameZh"
                  >
                    <Input placeholder={t('exercises.nameZhPlaceholder')} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('exercises.descriptionEn')}
                    name="description"
                  >
                    <TextArea placeholder={t('exercises.descriptionPlaceholder')} rows={3} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('exercises.descriptionZh')}
                    name="descriptionZh"
                  >
                    <TextArea placeholder={t('exercises.descriptionPlaceholder')} rows={3} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('exercises.targetMuscleGroups')}
                    name="muscleGroups"
                    rules={[{ required: true, message: t('exercises.selectTargetMuscleGroups') }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder={t('exercises.selectTargetMuscleGroupsPlaceholder')}
                      options={muscleGroupOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('exercises.requiredEquipment')}
                    name="equipment"
                  >
                    <Select
                      placeholder={t('exercises.selectEquipmentPlaceholder')}
                      options={equipmentOptions}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label={t('exercises.difficultyLevel')}
                    name="difficultyLevel"
                  >
                    <Select options={difficultyOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={t('exercises.exerciseCategory')}
                    name="category"
                  >
                    <Select options={categoryOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={t('exercises.gifUrl')}
                    name="gifUrl"
                  >
                    <Input placeholder={t('exercises.gifUrlPlaceholder')} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>{t('exercises.instructions')}</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t('exercises.instructionsEn')}</Text>
                      <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddInstruction('instructions')}
                      >
                        {t('exercises.addStep')}
                      </Button>
                    </div>
                    {instructions.map((instruction, index) => (
                      <div key={index} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                        <Text style={{ marginRight: 8, minWidth: 20 }}>{index + 1}.</Text>
                        <Input
                          value={instruction}
                          onChange={(e) => handleInstructionChange(index, e.target.value, 'instructions')}
                          placeholder={`${t('exercises.stepPlaceholder').replace('{number}', String(index + 1))}`}
                          style={{ flex: 1 }}
                        />
                        {instructions.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveInstruction(index, 'instructions')}
                            style={{ marginLeft: 8 }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t('exercises.instructionsZh')}</Text>
                      <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddInstruction('instructionsZh')}
                      >
                        {t('exercises.addStep')}
                      </Button>
                    </div>
                    {instructionsZh.map((instruction, index) => (
                      <div key={index} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                        <Text style={{ marginRight: 8, minWidth: 20 }}>{index + 1}.</Text>
                        <Input
                          value={instruction}
                          onChange={(e) => handleInstructionChange(index, e.target.value, 'instructionsZh')}
                          placeholder={`${t('exercises.stepPlaceholder').replace('{number}', String(index + 1))}`}
                          style={{ flex: 1 }}
                        />
                        {instructionsZh.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveInstruction(index, 'instructionsZh')}
                            style={{ marginLeft: 8 }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>

              <Divider>{t('exercises.settings')}</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('exercises.setAsTemplate')}
                    name="isTemplate"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('exercises.makePublic')}
                    name="isPublic"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

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
                      onClick={() => navigate('/exercises')}
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
          <Card title={t('exercises.tipsTitle')}>
            <div style={{ color: '#666' }}>
              <p><strong>{t('exercises.tipsExerciseInfo')}</strong></p>
              <p>• {t('exercises.tip1')}</p>
              <p>• {t('exercises.tip2')}</p>
              <p>• {t('exercises.tip3')}</p>
              <p>• {t('exercises.tip4')}</p>
              <p>• {t('exercises.tip5')}</p>
              <p>• {t('exercises.tip6')}</p>
              <p>• {t('exercises.tip7')}</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateExercise;
