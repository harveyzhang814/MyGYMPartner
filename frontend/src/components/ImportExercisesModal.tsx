import React, { useState, useMemo } from 'react';
import { Modal, Input, Upload, Button, Space, Typography, message, Alert, List, Progress } from 'antd';
import { DownloadOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { exerciseService } from '../services/exerciseService';
import { CreateExerciseRequest, BatchCreateExerciseResponse } from '../types';

const { TextArea } = Input;
const { Text, Title } = Typography;

// 常量定义
const MAX_FILE_SIZE_MB = 10; // 最大文件大小（MB）
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const RECOMMENDED_BATCH_SIZE = 100; // 推荐的批量大小

interface ImportExercisesModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const ImportExercisesModal: React.FC<ImportExercisesModalProps> = ({ visible, onCancel, onSuccess }) => {
  const { t } = useLanguage();
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<BatchCreateExerciseResponse | null>(null);

  // 生成JSON模版
  const generateTemplate = (): CreateExerciseRequest[] => {
    return [
      {
        name: 'Bench Press',
        nameZh: '卧推',
        description: 'Classic chest exercise using a barbell',
        descriptionZh: '使用杠铃的经典胸部训练动作',
        muscleGroups: ['chest-middle', 'chest-upper'],
        equipment: 'barbell',
        difficultyLevel: 'INTERMEDIATE',
        category: 'strength',
        instructions: [
          'Lie flat on the bench',
          'Grip the bar slightly wider than shoulder width',
          'Lower the bar to your chest',
          'Press the bar back up'
        ],
        instructionsZh: [
          '平躺在卧推凳上',
          '握住杠铃，略宽于肩宽',
          '将杠铃降至胸部',
          '将杠铃推回起始位置'
        ],
        gifUrl: '',
        isTemplate: true,
        isPublic: true
      },
      {
        name: 'Squat',
        nameZh: '深蹲',
        description: 'Fundamental lower body exercise',
        descriptionZh: '基础的下肢训练动作',
        muscleGroups: ['legs-quadriceps', 'legs-gluteus-maximus', 'legs-hamstrings'],
        equipment: 'barbell',
        difficultyLevel: 'INTERMEDIATE',
        category: 'strength',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body by bending knees',
          'Keep your back straight',
          'Push through heels to return'
        ],
        instructionsZh: [
          '双脚与肩同宽站立',
          '弯曲膝盖降低身体',
          '保持背部挺直',
          '通过脚跟发力回到起始位置'
        ],
        isTemplate: true,
        isPublic: true
      }
    ];
  };

  // 下载JSON模版
  const handleDownloadTemplate = () => {
    const template = generateTemplate();
    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exercise-template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success(t('exercises.templateDownloaded'));
  };

  // 处理文件上传
  const handleFileUpload = (file: File) => {
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE_BYTES) {
      message.error(t('exercises.fileTooLarge').replace('{size}', String(MAX_FILE_SIZE_MB)));
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // 检查内容大小
      const contentSize = new Blob([content]).size;
      if (contentSize > MAX_FILE_SIZE_BYTES) {
        message.error(t('exercises.contentTooLarge').replace('{size}', String(MAX_FILE_SIZE_MB)));
        return;
      }
      
      setJsonInput(content);
      message.success(t('exercises.fileLoaded'));
    };
    reader.onerror = () => {
      message.error(t('exercises.fileLoadFailed'));
    };
    reader.readAsText(file);
    return false; // 阻止自动上传
  };

  // 计算 JSON 统计信息
  const jsonStats = useMemo(() => {
    if (!jsonInput.trim()) {
      return { size: 0, sizeText: '0 KB', count: 0, isOverSize: false, isLargeCount: false };
    }

    const size = new Blob([jsonInput]).size;
    const sizeInKB = size / 1024;
    const sizeInMB = sizeInKB / 1024;
    const sizeText = sizeInMB >= 1 
      ? `${sizeInMB.toFixed(2)} MB` 
      : `${sizeInKB.toFixed(2)} KB`;
    
    let count = 0;
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        count = parsed.length;
      }
    } catch (error) {
      // 解析失败，count 保持为 0
    }

    return {
      size,
      sizeText,
      count,
      isOverSize: size > MAX_FILE_SIZE_BYTES,
      isLargeCount: count > RECOMMENDED_BATCH_SIZE
    };
  }, [jsonInput]);

  // 验证和解析JSON
  const validateAndParseJson = (jsonString: string): CreateExerciseRequest[] | null => {
    // 检查大小
    const size = new Blob([jsonString]).size;
    if (size > MAX_FILE_SIZE_BYTES) {
      message.error(t('exercises.contentTooLarge').replace('{size}', String(MAX_FILE_SIZE_MB)));
      return null;
    }

    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        message.error(t('exercises.invalidJsonFormat'));
        return null;
      }
      return parsed;
    } catch (error) {
      message.error(t('exercises.invalidJson'));
      return null;
    }
  };

  // 执行导入
  const handleImport = async () => {
    if (!jsonInput.trim()) {
      message.warning(t('exercises.emptyJson'));
      return;
    }

    const exercises = validateAndParseJson(jsonInput);
    if (!exercises) {
      return;
    }

    setLoading(true);
    try {
      const result = await exerciseService.batchCreateExercises(exercises);
      setImportResult(result);
      
      if (result.success > 0) {
        message.success(
          t('exercises.importResult')
            .replace('{success}', String(result.success))
            .replace('{failed}', String(result.failed))
        );
        
        // 如果全部成功，关闭弹窗并刷新
        if (result.failed === 0) {
          setTimeout(() => {
            handleClose();
            onSuccess();
          }, 1500);
        }
      } else {
        message.error(t('exercises.importAllFailed'));
      }
    } catch (error: any) {
      message.error(error.message || t('exercises.importFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 关闭弹窗
  const handleClose = () => {
    setJsonInput('');
    setImportResult(null);
    onCancel();
  };

  return (
    <Modal
      title={t('exercises.importModalTitle')}
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          {t('common.cancel')}
        </Button>,
        <Button 
          key="import" 
          type="primary" 
          onClick={handleImport}
          loading={loading}
          disabled={!jsonInput.trim() || jsonStats.isOverSize}
        >
          {t('exercises.startImport')}
        </Button>
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 下载模版按钮 */}
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
          block
          type="dashed"
        >
          {t('exercises.downloadTemplate')}
        </Button>

        {/* 文件上传 */}
        <Upload
          accept=".json"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />} block>
            {t('exercises.importFromFile')}
          </Button>
        </Upload>

        {/* JSON 输入框 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>{t('exercises.orInputJson')}</Text>
            {jsonInput.trim() && (
              <Space size="small">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('exercises.jsonSize')}: {jsonStats.sizeText}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  |
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('exercises.exerciseCount')}: {jsonStats.count}
                </Text>
              </Space>
            )}
          </div>
          <TextArea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={t('exercises.importJsonPlaceholder')}
            rows={12}
            style={{ 
              marginTop: 8, 
              fontFamily: 'monospace',
              borderColor: jsonStats.isOverSize ? '#ff4d4f' : undefined
            }}
            status={jsonStats.isOverSize ? 'error' : undefined}
          />
          {jsonStats.isOverSize && (
            <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
              {t('exercises.contentTooLarge').replace('{size}', String(MAX_FILE_SIZE_MB))}
            </Text>
          )}
          {jsonStats.isLargeCount && !jsonStats.isOverSize && (
            <Text type="warning" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
              {t('exercises.largeCountWarning').replace('{count}', String(RECOMMENDED_BATCH_SIZE))}
            </Text>
          )}
        </div>

        {/* 显示导入结果 */}
        {importResult && (
          <Alert
            message={t('exercises.importComplete')}
            description={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>
                  {t('exercises.importSuccessCount')}: <Text strong style={{ color: '#52c41a' }}>{importResult.success}</Text>
                </Text>
                <Text>
                  {t('exercises.importFailedCount')}: <Text strong style={{ color: '#ff4d4f' }}>{importResult.failed}</Text>
                </Text>
                
                {/* 显示失败详情 */}
                {importResult.errors.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>{t('exercises.failedDetails')}:</Text>
                    <List
                      size="small"
                      dataSource={importResult.errors}
                      renderItem={(error) => (
                        <List.Item>
                          <Text type="danger">
                            #{error.index + 1} - {error.name}: {error.error}
                          </Text>
                        </List.Item>
                      )}
                      style={{ 
                        maxHeight: 200, 
                        overflow: 'auto',
                        marginTop: 8,
                        border: '1px solid #f0f0f0',
                        borderRadius: 4,
                        padding: 8
                      }}
                    />
                  </div>
                )}
              </Space>
            }
            type={importResult.failed === 0 ? 'success' : 'warning'}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {/* 使用说明 */}
        <Alert
          message={t('exercises.importInstructions')}
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>{t('exercises.importInstruction1')}</li>
              <li>{t('exercises.importInstruction2')}</li>
              <li>{t('exercises.importInstruction3')}</li>
              <li>{t('exercises.importInstruction4')}</li>
              <li>{t('exercises.importInstruction5')}</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Space>
    </Modal>
  );
};

export default ImportExercisesModal;

