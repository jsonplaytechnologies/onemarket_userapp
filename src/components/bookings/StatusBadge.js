import React from 'react';
import { View, Text } from 'react-native';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bgColor: '#FEF3C7',
    textColor: '#B45309',
  },
  accepted: {
    label: 'Accepted',
    bgColor: '#DBEAFE',
    textColor: '#1D4ED8',
  },
  rejected: {
    label: 'Rejected',
    bgColor: '#FEE2E2',
    textColor: '#B91C1C',
  },
  quotation_sent: {
    label: 'Quote Sent',
    bgColor: '#EDE9FE',
    textColor: '#7C3AED',
  },
  paid: {
    label: 'Paid',
    bgColor: '#D1FAE5',
    textColor: '#059669',
  },
  on_the_way: {
    label: 'On Way',
    bgColor: '#CFFAFE',
    textColor: '#0891B2',
  },
  job_start_requested: {
    label: 'Start Req.',
    bgColor: '#FFEDD5',
    textColor: '#C2410C',
  },
  job_started: {
    label: 'In Progress',
    bgColor: '#E0E7FF',
    textColor: '#4338CA',
  },
  job_complete_requested: {
    label: 'Complete Req.',
    bgColor: '#CCFBF1',
    textColor: '#0D9488',
  },
  completed: {
    label: 'Completed',
    bgColor: '#D1FAE5',
    textColor: '#059669',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: '#F3F4F6',
    textColor: '#6B7280',
  },
};

const StatusBadge = ({ status, size = 'medium' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 10 },
    medium: { paddingHorizontal: 10, paddingVertical: 5, fontSize: 11 },
    large: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 },
  };

  const { paddingHorizontal, paddingVertical, fontSize } = sizeStyles[size] || sizeStyles.medium;

  return (
    <View
      style={{
        backgroundColor: config.bgColor,
        paddingHorizontal,
        paddingVertical,
        borderRadius: 100,
      }}
    >
      <Text
        style={{
          color: config.textColor,
          fontSize,
          fontFamily: 'Poppins-Medium',
        }}
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
