import React, { useState, useEffect } from 'react';
import { Avatar, AvatarProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface SecureAvatarProps extends Omit<AvatarProps, 'src'> {
  userId?: string;
}

const SecureAvatar: React.FC<SecureAvatarProps> = ({ 
  userId, 
  size = 32, 
  icon = <UserOutlined />,
  ...props 
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // 使用当前用户ID或传入的userId
  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) return;

    const fetchAvatar = async () => {
      try {
        const response = await api.get(`/profile/avatar/${targetUserId}`);
        if (response.data.success) {
          setAvatarUrl(response.data.data.url);
        }
      } catch (error) {
        console.error('获取头像失败:', error);
        setAvatarUrl(null);
      }
    };

    fetchAvatar();
  }, [targetUserId]);

  return (
    <Avatar
      {...props}
      size={size}
      src={avatarUrl}
      icon={icon}
    />
  );
};

export default SecureAvatar;
