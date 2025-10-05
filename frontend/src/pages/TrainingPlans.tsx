import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Input, Select, Button, Typography, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchTrainingPlans, deleteTrainingPlan, duplicateTrainingPlan } from '../store/slices/trainingPlanSlice';
import { useLanguage } from '../contexts/LanguageContext';
import { TrainingPlan } from '../types';
import './TrainingPlans.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const TrainingPlans: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useLanguage();
  
  const { trainingPlans, loading } = useSelector((state: RootState) => state.trainingPlans);
  
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTrainingPlans({
      page: currentPage,
      limit: 10,
      search: searchText || undefined,
      status: statusFilter || undefined
    }));
  }, [dispatch, currentPage, searchText, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteTrainingPlan(id)).unwrap();
      message.success(t('trainingPlans.deleteSuccess'));
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await dispatch(duplicateTrainingPlan(id)).unwrap();
      message.success('训练计划复制成功！');
    } catch (error: any) {
      message.error(error.message || '复制失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'ACTIVE': return 'processing';
      case 'COMPLETED': return 'success';
      case 'PAUSED': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return t('trainingPlans.statusDraft');
      case 'ACTIVE': return t('trainingPlans.statusActive');
      case 'COMPLETED': return t('trainingPlans.statusCompleted');
      case 'PAUSED': return t('trainingPlans.statusPaused');
      case 'CANCELLED': return t('trainingPlans.statusCancelled');
      default: return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">{t('trainingPlans.title')}</Title>
            <Text className="page-description">{t('trainingPlans.description')}</Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/training-plans/create')}
          >
            {t('trainingPlans.createTrainingPlan')}
          </Button>
        </div>
      </div>

      <div className="filters">
        <Space wrap>
          <Search
            placeholder={t('common.search')}
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder={t('trainingPlans.planStatus')}
            allowClear
            value={statusFilter}
            onChange={handleStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="DRAFT">{t('trainingPlans.statusDraft')}</Option>
            <Option value="ACTIVE">{t('trainingPlans.statusActive')}</Option>
            <Option value="COMPLETED">{t('trainingPlans.statusCompleted')}</Option>
            <Option value="PAUSED">{t('trainingPlans.statusPaused')}</Option>
            <Option value="CANCELLED">{t('trainingPlans.statusCancelled')}</Option>
          </Select>
        </Space>
      </div>

      {loading ? (
        <div className="loading-container">
          <Text type="secondary">{t('common.loading')}</Text>
        </div>
      ) : trainingPlans.length > 0 ? (
        <Row gutter={[16, 16]}>
          {trainingPlans.map((plan: TrainingPlan) => (
            <Col xs={24} lg={12} xl={8} key={plan.id}>
              <Card
                className="plan-card"
                hoverable
                actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/training-plans/${plan.id}/edit`)}
                    >
                      {t('common.edit')}
                    </Button>,
                    <Button
                      key="duplicate"
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => handleDuplicate(plan.id)}
                    >
                      {t('trainingPlans.duplicateTrainingPlan')}
                    </Button>,
                  <Popconfirm
                    key="delete"
                    title={t('trainingPlans.deleteConfirm')}
                    description={t('trainingPlans.deleteDescription')}
                    onConfirm={() => handleDelete(plan.id)}
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
                <div className="plan-header">
                  <div className="plan-name">{plan.name}</div>
                  <div className="plan-date">
                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                  </div>
                </div>
                <div className="plan-body">
                  <div className="plan-stats">
                    <div className="plan-stat">
                      <div className="plan-stat-value">
                        {plan._count.trainingPlanGroups}
                      </div>
                      <div className="plan-stat-label">{t('trainingPlans.trainingGroups')}</div>
                    </div>
                    <div className="plan-stat">
                      <div className="plan-stat-value">
                        <Tag color={getStatusColor(plan.status)}>
                          {getStatusText(plan.status)}
                        </Tag>
                      </div>
                      <div className="plan-stat-label">{t('exerciseSessions.status')}</div>
                    </div>
                    <div className="plan-stat">
                      <div className="plan-stat-value">
                        {plan.isTemplate && <Tag color="blue" style={{ marginRight: 4 }}>模板</Tag>}
                        {plan.isPublic && <Tag color="green">公开</Tag>}
                      </div>
                      <div className="plan-stat-label">类型</div>
                    </div>
                  </div>
                  {plan.description && (
                    <div style={{ marginTop: 12 }}>
                      <Text type="secondary">{plan.description}</Text>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="empty-container">
          <div className="empty-icon">
            <CalendarOutlined />
          </div>
          <div className="empty-title">{t('trainingPlans.noTrainingPlans')}</div>
          <div className="empty-description">{t('trainingPlans.createFirstPlanDescription')}</div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/training-plans/create')}
          >
            {t('trainingPlans.createTrainingPlan')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TrainingPlans;
