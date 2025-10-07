import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Avatar,
  Upload,
  Tabs,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Popover,
} from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { profileService, UpdateProfileRequest, ChangePasswordRequest } from '../services/profileService';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profilePopover, setProfilePopover] = useState<{ visible: boolean; type: 'success' | 'error'; message: string }>({ visible: false, type: 'success', message: '' });
  const [passwordPopover, setPasswordPopover] = useState<{ visible: boolean; type: 'success' | 'error'; message: string }>({ visible: false, type: 'success', message: '' });

  // 加载用户资料
  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await profileService.getProfile();
      setUser(profileData);
      form.setFieldsValue({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatarUrl: profileData.avatarUrl,
        dateOfBirth: profileData.dateOfBirth ? dayjs(profileData.dateOfBirth) : null,
        gender: profileData.gender,
        heightCm: profileData.heightCm,
        weightKg: profileData.weightKg,
        fitnessLevel: profileData.fitnessLevel,
        timezone: profileData.timezone,
        language: profileData.language,
      });
    } catch (error: any) {
      console.error('加载个人资料失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // 更新个人资料
  const handleUpdateProfile = async (values: UpdateProfileRequest) => {
    try {
      setLoading(true);
      
      // 处理日期格式并过滤空值
      const processedValues: any = {};
      
      // 只处理有值的字段
      if (values.firstName !== undefined && values.firstName !== null && values.firstName !== '') {
        processedValues.firstName = values.firstName;
      }
      if (values.lastName !== undefined && values.lastName !== null && values.lastName !== '') {
        processedValues.lastName = values.lastName;
      }
      if (values.avatarUrl !== undefined && values.avatarUrl !== null && values.avatarUrl !== '') {
        processedValues.avatarUrl = values.avatarUrl;
      }
      if (values.dateOfBirth && dayjs.isDayjs(values.dateOfBirth)) {
        processedValues.dateOfBirth = values.dateOfBirth.format('YYYY-MM-DD');
      }
      if (values.gender !== undefined && values.gender !== null) {
        processedValues.gender = values.gender;
      }
      if (values.heightCm !== undefined && values.heightCm !== null) {
        processedValues.heightCm = values.heightCm;
      }
      if (values.weightKg !== undefined && values.weightKg !== null) {
        processedValues.weightKg = values.weightKg;
      }
      if (values.fitnessLevel !== undefined && values.fitnessLevel !== null) {
        processedValues.fitnessLevel = values.fitnessLevel;
      }
      if (values.timezone !== undefined && values.timezone !== null && values.timezone !== '') {
        processedValues.timezone = values.timezone;
      }
      if (values.language !== undefined && values.language !== null && values.language !== '') {
        processedValues.language = values.language;
      }
      
      console.log('发送的数据:', processedValues); // 调试日志
      
      const updatedUser = await profileService.updateProfile(processedValues);
      setUser(updatedUser);
      
      // 显示成功气泡
      setProfilePopover({ visible: true, type: 'success', message: t('profile.saveSuccess') });
      setTimeout(() => setProfilePopover({ visible: false, type: 'success', message: '' }), 3000);
    } catch (error: any) {
      console.error('更新个人资料错误:', error);
      // 显示失败气泡
      setProfilePopover({ 
        visible: true, 
        type: 'error', 
        message: error.response?.data?.error || t('profile.saveFailed') 
      });
      setTimeout(() => setProfilePopover({ visible: false, type: 'error', message: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (values: ChangePasswordRequest) => {
    try {
      setPasswordLoading(true);
      await profileService.changePassword(values);
      // 显示成功气泡
      setPasswordPopover({ visible: true, type: 'success', message: t('profile.passwordChangeSuccess') });
      setTimeout(() => setPasswordPopover({ visible: false, type: 'success', message: '' }), 3000);
      passwordForm.resetFields();
    } catch (error: any) {
      // 显示失败气泡
      setPasswordPopover({ 
        visible: true, 
        type: 'error', 
        message: error.response?.data?.error || t('profile.passwordChangeFailed') 
      });
      setTimeout(() => setPasswordPopover({ visible: false, type: 'error', message: '' }), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  // 头像上传
  const handleAvatarUpload = (info: any) => {
    if (info.file.status === 'done') {
      const avatarUrl = info.file.response?.url;
      if (avatarUrl) {
        form.setFieldsValue({ avatarUrl });
        setUser(prev => prev ? { ...prev, avatarUrl } : null);
      }
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>{t('profile.title')}</Title>
      
      <Tabs defaultActiveKey="profile" size="large">
        <TabPane tab={<span><UserOutlined />{t('profile.basicInfo')}</span>} key="profile">
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              initialValues={{
                timezone: 'Asia/Shanghai',
                language: 'zh-CN',
              }}
            >
              <Row gutter={16}>
                <Col span={24} style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Space direction="vertical" size="large">
                    <Avatar
                      size={120}
                      src={user?.avatarUrl}
                      icon={<UserOutlined />}
                      style={{ fontSize: 48 }}
                    />
                    <div>
                      <Upload
                        name="avatar"
                        listType="text"
                        showUploadList={false}
                        onChange={handleAvatarUpload}
                        beforeUpload={() => false} // 暂时禁用实际上传
                      >
                        <Button icon={<CameraOutlined />} type="dashed">
                          {t('profile.changeAvatar')}
                        </Button>
                      </Upload>
                    </div>
                  </Space>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('profile.firstName')}
                    name="firstName"
                    rules={[{ required: true, message: t('profile.enterFirstName') }]}
                  >
                    <Input placeholder={t('profile.enterFirstName')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('profile.lastName')}
                    name="lastName"
                    rules={[{ required: true, message: t('profile.enterLastName') }]}
                  >
                    <Input placeholder={t('profile.enterLastName')} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={t('profile.dateOfBirth')} name="dateOfBirth">
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder={t('profile.selectDateOfBirth')}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t('profile.gender')} name="gender">
                    <Select placeholder={t('profile.selectGender')}>
                      <Option value="MALE">{t('profile.genderOptions.male')}</Option>
                      <Option value="FEMALE">{t('profile.genderOptions.female')}</Option>
                      <Option value="OTHER">{t('profile.genderOptions.other')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={`${t('profile.height')} (${t('profile.heightUnit')})`} name="heightCm">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder={t('profile.enterHeight')}
                      min={50}
                      max={300}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={`${t('profile.weight')} (${t('profile.weightUnit')})`} name="weightKg">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder={t('profile.enterWeight')}
                      min={20}
                      max={500}
                      step={0.1}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={t('profile.fitnessLevel')} name="fitnessLevel">
                    <Select placeholder={t('profile.selectFitnessLevel')}>
                      <Option value="BEGINNER">{t('profile.fitnessLevelOptions.beginner')}</Option>
                      <Option value="INTERMEDIATE">{t('profile.fitnessLevelOptions.intermediate')}</Option>
                      <Option value="ADVANCED">{t('profile.fitnessLevelOptions.advanced')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t('profile.timezone')} name="timezone">
                    <Select placeholder={t('profile.selectTimezone')}>
                      <Option value="Asia/Shanghai">{t('profile.timezoneOptions.asiaShanghai')}</Option>
                      <Option value="UTC">{t('profile.timezoneOptions.utc')}</Option>
                      <Option value="America/New_York">{t('profile.timezoneOptions.americaNewYork')}</Option>
                      <Option value="Europe/London">{t('profile.timezoneOptions.europeLondon')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={t('profile.language')} name="language">
                <Select placeholder={t('profile.selectLanguage')}>
                  <Option value="zh-CN">{t('profile.languageOptions.zhCN')}</Option>
                  <Option value="en-US">{t('profile.languageOptions.enUS')}</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Popover
                  content={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {profilePopover.type === 'success' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
                      )}
                      <span>{profilePopover.message}</span>
                    </div>
                  }
                  open={profilePopover.visible}
                  placement="right"
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    {t('profile.saveChanges')}
                  </Button>
                </Popover>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><LockOutlined />{t('profile.securitySettings')}</span>} key="security">
          <Card>
            <Title level={4}>{t('profile.changePassword')}</Title>
            <Text type="secondary">{t('profile.forYourSecurity')}</Text>
            
            <Divider />
            
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                label={t('profile.currentPassword')}
                name="currentPassword"
                rules={[
                  { required: true, message: t('profile.enterCurrentPassword') },
                  { min: 6, message: t('profile.passwordMinLength') }
                ]}
              >
                <Input.Password
                  placeholder={t('profile.enterCurrentPassword')}
                  prefix={<LockOutlined />}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                label={t('profile.newPassword')}
                name="newPassword"
                rules={[
                  { required: true, message: t('profile.enterNewPassword') },
                  { min: 8, message: t('profile.newPasswordMinLength') },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
                    message: t('profile.passwordComplexity')
                  }
                ]}
              >
                <Input.Password
                  placeholder={t('profile.enterNewPassword')}
                  prefix={<LockOutlined />}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                label={t('profile.confirmNewPassword')}
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: t('profile.enterConfirmPassword') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('profile.passwordMismatch')));
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder={t('profile.enterConfirmPassword')}
                  prefix={<LockOutlined />}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item>
                <Popover
                  content={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {passwordPopover.type === 'success' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
                      )}
                      <span>{passwordPopover.message}</span>
                    </div>
                  }
                  open={passwordPopover.visible}
                  placement="right"
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={passwordLoading}
                    icon={<LockOutlined />}
                    size="large"
                  >
                    {t('profile.changePassword')}
                  </Button>
                </Popover>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Profile;