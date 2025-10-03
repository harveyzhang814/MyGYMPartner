import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, Space, message, Row, Col, Switch, Divider } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { createExercise, updateExercise, fetchExercise } from '../store/slices/exerciseSlice';
import { CreateExerciseRequest } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;
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

  const isEditMode = Boolean(id);
  const { currentExercise, loading: createLoading } = useSelector((state: RootState) => state.exercises);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchExercise(id));
    }
  }, [dispatch, isEditMode, id]);

  useEffect(() => {
    if (isEditMode && currentExercise) {
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
  }, [isEditMode, currentExercise, form]);

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
        message.success('动作更新成功！');
      } else {
        await dispatch(createExercise(exerciseData)).unwrap();
        message.success('动作创建成功！');
      }

      navigate('/exercises');
    } catch (error: any) {
      message.error(error.message || `${isEditMode ? '更新' : '创建'}失败，请重试`);
    }
  };

  const muscleGroupOptions = [
    { value: 'chest', label: '胸部' },
    { value: 'back', label: '背部' },
    { value: 'shoulders', label: '肩部' },
    { value: 'biceps', label: '二头肌' },
    { value: 'triceps', label: '三头肌' },
    { value: 'legs', label: '腿部' },
    { value: 'glutes', label: '臀部' },
    { value: 'abs', label: '腹部' },
    { value: 'forearms', label: '前臂' },
    { value: 'calves', label: '小腿' }
  ];

  const equipmentOptions = [
    { value: 'bodyweight', label: '自重' },
    { value: 'dumbbell', label: '哑铃' },
    { value: 'barbell', label: '杠铃' },
    { value: 'kettlebell', label: '壶铃' },
    { value: 'resistance_band', label: '阻力带' },
    { value: 'cable', label: '绳索' },
    { value: 'machine', label: '器械' },
    { value: 'bench', label: '训练凳' },
    { value: 'pull_up_bar', label: '引体向上杆' },
    { value: 'other', label: '其他' }
  ];

  const difficultyOptions = [
    { value: 'BEGINNER', label: '初级' },
    { value: 'INTERMEDIATE', label: '中级' },
    { value: 'ADVANCED', label: '高级' }
  ];

  const categoryOptions = [
    { value: 'strength', label: '力量训练' },
    { value: 'cardio', label: '有氧运动' },
    { value: 'flexibility', label: '柔韧性' },
    { value: 'balance', label: '平衡训练' },
    { value: 'plyometric', label: '爆发力训练' }
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/exercises')}
          >
            返回
          </Button>
          <div>
            <Title level={2} className="page-title">
              {isEditMode ? '编辑动作' : '创建动作'}
            </Title>
            <Text className="page-description">
              {isEditMode ? '修改动作信息' : '添加新的动作到动作库'}
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
                isTemplate: false,
                isPublic: true,
                difficultyLevel: 'BEGINNER',
                category: 'strength'
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="动作名称（英文）"
                    name="name"
                    rules={[{ required: true, message: '请输入动作名称' }]}
                  >
                    <Input placeholder="例如：Push Up" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="动作名称（中文）"
                    name="nameZh"
                  >
                    <Input placeholder="例如：俯卧撑" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="描述（英文）"
                    name="description"
                  >
                    <TextArea placeholder="动作描述" rows={3} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="描述（中文）"
                    name="descriptionZh"
                  >
                    <TextArea placeholder="动作描述" rows={3} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="目标肌肉群"
                    name="muscleGroups"
                    rules={[{ required: true, message: '请选择目标肌肉群' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="选择目标肌肉群"
                      options={muscleGroupOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="所需设备"
                    name="equipment"
                  >
                    <Select
                      placeholder="选择所需设备"
                      options={equipmentOptions}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="难度等级"
                    name="difficultyLevel"
                  >
                    <Select options={difficultyOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="动作分类"
                    name="category"
                  >
                    <Select options={categoryOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="GIF动图URL"
                    name="gifUrl"
                  >
                    <Input placeholder="动图链接（可选）" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>动作说明</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>英文说明</Text>
                      <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddInstruction('instructions')}
                      >
                        添加步骤
                      </Button>
                    </div>
                    {instructions.map((instruction, index) => (
                      <div key={index} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                        <Text style={{ marginRight: 8, minWidth: 20 }}>{index + 1}.</Text>
                        <Input
                          value={instruction}
                          onChange={(e) => handleInstructionChange(index, e.target.value, 'instructions')}
                          placeholder={`步骤 ${index + 1}`}
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
                      <Text strong>中文说明</Text>
                      <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddInstruction('instructionsZh')}
                      >
                        添加步骤
                      </Button>
                    </div>
                    {instructionsZh.map((instruction, index) => (
                      <div key={index} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                        <Text style={{ marginRight: 8, minWidth: 20 }}>{index + 1}.</Text>
                        <Input
                          value={instruction}
                          onChange={(e) => handleInstructionChange(index, e.target.value, 'instructionsZh')}
                          placeholder={`步骤 ${index + 1}`}
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

              <Divider>设置</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="设为模板"
                    name="isTemplate"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="公开动作"
                    name="isPublic"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={createLoading}
                    size="large"
                  >
                    {isEditMode ? '更新动作' : '创建动作'}
                  </Button>
                  <Button
                    onClick={() => navigate('/exercises')}
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
          <Card title="创建提示">
            <div style={{ color: '#666' }}>
              <p><strong>动作信息：</strong></p>
              <p>• 动作名称是必填项</p>
              <p>• 建议同时填写中英文名称</p>
              <p>• 目标肌肉群至少选择一个</p>
              <p>• 详细描述有助于其他用户理解</p>
              <p>• 动作说明按步骤填写</p>
              <p>• 模板动作可供快速创建</p>
              <p>• 公开动作其他用户可见</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateExercise;
