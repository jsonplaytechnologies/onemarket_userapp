import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const LimboTimer = ({ limboTimeoutAt, limboState, onTimeout }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!limboTimeoutAt) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const timeout = new Date(limboTimeoutAt);
      const diff = timeout - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
        if (onTimeout) {
          onTimeout();
        }
        return;
      }

      setTimeRemaining(diff);
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [limboTimeoutAt, onTimeout]);

  if (!limboTimeoutAt || timeRemaining === null) {
    return null;
  }

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLimboStateLabel = (state) => {
    switch (state) {
      case 'waiting_approval':
        return 'Provider has';
      case 'waiting_quote':
        return 'Provider has';
      case 'waiting_acceptance':
        return 'You have';
      default:
        return 'Time remaining:';
    }
  };

  const getLimboStateAction = (state) => {
    switch (state) {
      case 'waiting_approval':
        return 'to respond';
      case 'waiting_quote':
        return 'to send quote';
      case 'waiting_acceptance':
        return 'to accept quote';
      default:
        return '';
    }
  };

  // Calculate percentage for progress bar
  const totalTime = 30 * 60 * 1000; // 30 minutes in ms
  const percentage = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));

  // Determine warning level
  const isWarning = timeRemaining < 5 * 60 * 1000; // Less than 5 minutes
  const isCritical = timeRemaining < 2 * 60 * 1000; // Less than 2 minutes

  const bgColor = isCritical ? '#FEF2F2' : isWarning ? '#FEF9C3' : '#EFF6FF';
  const textColor = isCritical ? '#991B1B' : isWarning ? '#CA8A04' : '#1E40AF';
  const iconColor = isCritical ? '#DC2626' : isWarning ? '#F59E0B' : '#3B82F6';
  const progressColor = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#3B82F6';

  if (isExpired) {
    return (
      <View
        style={{
          backgroundColor: '#F3F4F6',
          padding: 16,
          borderRadius: 12,
          marginVertical: 8,
        }}
      >
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text
            className="text-sm text-gray-600 ml-2"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            {limboState === 'waiting_acceptance'
              ? 'Quote expired. Finding another provider...'
              : 'Searching for another provider...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: bgColor,
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
      }}
    >
      {/* Timer Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Ionicons name="time-outline" size={20} color={iconColor} />
          <Text
            className="text-sm ml-2 flex-1"
            style={{ fontFamily: 'Poppins-Regular', color: textColor }}
          >
            {getLimboStateLabel(limboState)} {getLimboStateAction(limboState)}
          </Text>
        </View>
        <Text
          className="text-lg font-bold"
          style={{ fontFamily: 'Poppins-Bold', color: textColor }}
        >
          {formatTime(timeRemaining)}
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: 6,
          backgroundColor: '#E5E7EB',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: progressColor,
            borderRadius: 3,
          }}
        />
      </View>

      {/* Warning Message */}
      {isCritical && (
        <Text
          className="text-xs mt-2"
          style={{ fontFamily: 'Poppins-Regular', color: textColor }}
        >
          {limboState === 'waiting_acceptance'
            ? 'Quote will expire soon! Accept now to proceed.'
            : 'Timeout approaching. Will reassign automatically.'}
        </Text>
      )}
    </View>
  );
};

export default LimboTimer;
