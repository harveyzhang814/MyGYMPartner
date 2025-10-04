import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { supportedLanguages } from '../locales';

const { Option } = Select;

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as any);
  };

  return (
    <Select
      value={language}
      onChange={handleLanguageChange}
      style={{ width: 120 }}
      suffixIcon={<GlobalOutlined />}
    >
      {supportedLanguages.map((lang) => (
        <Option key={lang.language} value={lang.language}>
          <span style={{ marginRight: 8 }}>{lang.flag}</span>
          {lang.name}
        </Option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher;
