import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Booking Created', icon: 'create-outline' },
  { key: 'pending_assignment', label: 'Finding Provider', icon: 'search-outline', phase2Only: true },
  { key: 'finding_provider', label: 'Finding Provider', icon: 'search-outline', phase2Only: true },
  { key: 'waiting_approval', label: 'Awaiting Response', icon: 'time-outline', phase2Only: true },
  { key: 'waiting_quote', label: 'Discussing Scope', icon: 'chatbubbles-outline', phase2Only: true },
  { key: 'waiting_acceptance', label: 'Quote Received', icon: 'document-text-outline', phase2Only: true },
  { key: 'accepted', label: 'Accepted', icon: 'checkmark-outline' },
  { key: 'quotation_sent', label: 'Quotation Received', icon: 'document-text-outline' },
  { key: 'paid', label: 'Payment Confirmed', icon: 'card-outline' },
  { key: 'on_the_way', label: 'On The Way', icon: 'navigate-outline' },
  { key: 'job_start_requested', label: 'Start Requested', icon: 'play-circle-outline' },
  { key: 'job_started', label: 'Job Started', icon: 'construct-outline' },
  { key: 'job_complete_requested', label: 'Completion Requested', icon: 'flag-outline' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done-circle-outline' },
];

const STATUS_ORDER = [
  'pending',
  'pending_assignment',
  'finding_provider',
  'waiting_approval',
  'waiting_quote',
  'waiting_acceptance',
  'accepted',
  'quotation_sent',
  'paid',
  'on_the_way',
  'job_start_requested',
  'job_started',
  'job_complete_requested',
  'completed',
];

const StatusTimeline = ({ currentStatus, history }) => {
  // Ensure history is always an array
  const safeHistory = Array.isArray(history) ? history : [];

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';
  const isRejected = currentStatus === 'rejected';

  const getStepStatus = (stepKey) => {
    const stepIndex = STATUS_ORDER.indexOf(stepKey);

    if (isCancelled || isRejected) {
      // Find where in timeline the cancellation/rejection happened
      const lastCompletedIndex = safeHistory.length > 0
        ? Math.max(...safeHistory.map(h => STATUS_ORDER.indexOf(h.newStatus || h.new_status)))
        : -1;

      if (stepIndex <= lastCompletedIndex) return 'completed';
      return 'pending';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHistoryDate = (stepKey) => {
    const historyItem = safeHistory.find(
      (h) => (h.newStatus || h.new_status) === stepKey
    );
    return historyItem ? formatDate(historyItem.createdAt || historyItem.created_at) : null;
  };

  // Filter timeline steps based on status
  const visibleSteps = TIMELINE_STEPS.filter((step) => {
    // Always show up to current step + 1
    const stepIndex = STATUS_ORDER.indexOf(step.key);
    return stepIndex <= currentIndex + 1 || stepIndex <= 3; // Always show first 4 steps
  });

  return (
    <View className="px-4 py-2">
      {/* Cancelled/Rejected Banner */}
      {(isCancelled || isRejected) && (
        <View
          className={`flex-row items-center p-3 rounded-lg mb-4 ${
            isCancelled ? 'bg-gray-100' : 'bg-red-50'
          }`}
        >
          <Ionicons
            name={isCancelled ? 'ban-outline' : 'close-circle-outline'}
            size={20}
            color={isCancelled ? COLORS.textSecondary : COLORS.error}
          />
          <Text
            className={`ml-2 text-sm font-medium ${
              isCancelled ? 'text-gray-700' : 'text-red-700'
            }`}
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            {isCancelled ? 'Booking Cancelled' : 'Booking Rejected'}
          </Text>
        </View>
      )}

      {/* Timeline */}
      {visibleSteps.map((step, index) => {
        const status = getStepStatus(step.key);
        const isLast = index === visibleSteps.length - 1;
        const historyDate = getHistoryDate(step.key);

        return (
          <View key={step.key} className="flex-row">
            {/* Icon and Line */}
            <View className="items-center mr-4">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  status === 'completed'
                    ? 'bg-green-500'
                    : status === 'current'
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              >
                <Ionicons
                  name={status === 'completed' ? 'checkmark' : step.icon}
                  size={16}
                  color={status === 'pending' ? COLORS.textSecondary : 'white'}
                />
              </View>

              {/* Connecting Line */}
              {!isLast && (
                <View
                  className={`w-0.5 flex-1 min-h-[24px] ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </View>

            {/* Content */}
            <View className={`flex-1 ${!isLast ? 'pb-4' : ''}`}>
              <Text
                className={`text-sm font-medium ${
                  status === 'pending' ? 'text-gray-400' : 'text-gray-900'
                }`}
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {step.label}
              </Text>

              {historyDate && (
                <Text
                  className="text-xs text-gray-500 mt-0.5"
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  {historyDate}
                </Text>
              )}

              {status === 'current' && !isCancelled && !isRejected && (
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                  <Text
                    className="text-xs text-blue-600"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    Current Status
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default StatusTimeline;
