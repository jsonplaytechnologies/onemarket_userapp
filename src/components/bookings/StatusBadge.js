import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    iconName: 'time-outline',
    iconColor: '#B45309',
  },
  accepted: {
    label: 'Accepted',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconName: 'checkmark-circle-outline',
    iconColor: '#1D4ED8',
  },
  rejected: {
    label: 'Rejected',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    iconName: 'close-circle-outline',
    iconColor: '#B91C1C',
  },
  quotation_sent: {
    label: 'Quotation Sent',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    iconName: 'document-text-outline',
    iconColor: '#7C3AED',
  },
  paid: {
    label: 'Paid',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    iconName: 'card-outline',
    iconColor: '#15803D',
  },
  on_the_way: {
    label: 'On The Way',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    iconName: 'navigate-outline',
    iconColor: '#0E7490',
  },
  job_start_requested: {
    label: 'Start Requested',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    iconName: 'play-circle-outline',
    iconColor: '#C2410C',
  },
  job_started: {
    label: 'In Progress',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    iconName: 'construct-outline',
    iconColor: '#4338CA',
  },
  job_complete_requested: {
    label: 'Completion Requested',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-700',
    iconName: 'checkmark-done-outline',
    iconColor: '#0F766E',
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    iconName: 'checkmark-done-circle-outline',
    iconColor: '#15803D',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    iconName: 'ban-outline',
    iconColor: '#374151',
  },
};

const StatusBadge = ({ status, size = 'medium', showIcon = true }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const sizeClasses = {
    small: 'px-2 py-0.5',
    medium: 'px-3 py-1',
    large: 'px-4 py-1.5',
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-xs',
    large: 'text-sm',
  };

  const iconSizes = {
    small: 12,
    medium: 14,
    large: 16,
  };

  return (
    <View
      className={`flex-row items-center rounded-full ${config.bgColor} ${sizeClasses[size]}`}
    >
      {showIcon && (
        <Ionicons
          name={config.iconName}
          size={iconSizes[size]}
          color={config.iconColor}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        className={`font-medium ${config.textColor} ${textSizeClasses[size]}`}
        style={{ fontFamily: 'Poppins-Medium' }}
      >
        {config.label}
      </Text>
    </View>
  );
};

export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
};

export default StatusBadge;
