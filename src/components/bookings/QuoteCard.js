import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import LimboTimer from './LimboTimer';

const QuoteCard = ({
  amount,
  durationMinutes,
  expiresAt,
  onAccept,
  onDecline,
  loading = false,
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineLoading, setDeclineLoading] = useState(false);

  const formatPrice = (price) => {
    return price ? price.toLocaleString() + ' XAF' : '-';
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const handleAccept = () => {
    Alert.alert(
      'Accept Quote',
      'You will be redirected to payment after accepting this quote. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Pay',
          onPress: () => {
            if (onAccept) {
              onAccept();
            }
          },
        },
      ]
    );
  };

  const handleDeclinePress = () => {
    setShowDeclineModal(true);
  };

  const handleDeclineConfirm = async () => {
    if (!declineReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for declining the quote.');
      return;
    }

    try {
      setDeclineLoading(true);
      if (onDecline) {
        await onDecline(declineReason);
      }
      setShowDeclineModal(false);
      setDeclineReason('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to decline quote');
    } finally {
      setDeclineLoading(false);
    }
  };

  return (
    <>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginVertical: 12,
          borderWidth: 2,
          borderColor: '#8B5CF6',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-center mb-4">
          <Ionicons name="document-text" size={24} color="#8B5CF6" />
          <Text
            className="text-lg font-bold text-purple-700 ml-2"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            QUOTE RECEIVED
          </Text>
        </View>

        {/* Quote Details */}
        <View className="bg-purple-50 rounded-xl p-4 mb-4">
          {/* Amount */}
          <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-purple-100">
            <Text
              className="text-sm text-gray-600"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Amount
            </Text>
            <Text
              className="text-2xl font-bold text-purple-700"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              {formatPrice(amount)}
            </Text>
          </View>

          {/* Duration */}
          {durationMinutes && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text
                  className="text-sm text-gray-600 ml-1"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  Estimated Duration
                </Text>
              </View>
              <Text
                className="text-base font-semibold text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                {formatDuration(durationMinutes)}
              </Text>
            </View>
          )}
        </View>

        {/* Timer */}
        {expiresAt && (
          <LimboTimer
            limboTimeoutAt={expiresAt}
            limboState="waiting_acceptance"
            onTimeout={() => {
              Alert.alert('Quote Expired', 'This quote has expired.');
            }}
          />
        )}

        {/* Action Buttons */}
        <View className="flex-row mt-4 space-x-3">
          {/* Decline Button */}
          <TouchableOpacity
            className="flex-1 bg-red-50 py-4 rounded-xl items-center justify-center mr-2"
            activeOpacity={0.8}
            onPress={handleDeclinePress}
            disabled={loading || declineLoading}
          >
            <View className="flex-row items-center">
              <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
              <Text
                className="text-red-600 font-semibold ml-2"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Decline
              </Text>
            </View>
          </TouchableOpacity>

          {/* Accept Button */}
          <TouchableOpacity
            className="flex-1 bg-purple-600 py-4 rounded-xl items-center justify-center ml-2"
            activeOpacity={0.8}
            onPress={handleAccept}
            disabled={loading || declineLoading}
            style={{
              opacity: loading || declineLoading ? 0.6 : 1,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text
                className="text-white font-semibold ml-2"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                {loading ? 'Processing...' : 'Accept & Pay'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Note */}
        <View className="flex-row items-start mt-4 p-3 bg-blue-50 rounded-lg">
          <Ionicons name="information-circle" size={16} color="#2563EB" style={{ marginTop: 2 }} />
          <Text
            className="text-xs text-blue-700 ml-2 flex-1"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            By accepting this quote, you agree to proceed with payment. The provider will be notified once payment is confirmed.
          </Text>
        </View>
      </View>

      {/* Decline Modal */}
      <Modal
        visible={showDeclineModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeclineModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-lg font-bold text-gray-900"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                Decline Quote
              </Text>
              <TouchableOpacity
                onPress={() => setShowDeclineModal(false)}
                disabled={declineLoading}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Reason Input */}
            <Text
              className="text-sm text-gray-600 mb-2"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Please provide a reason for declining:
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4"
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              placeholder="E.g., Price too high, need more details, etc."
              value={declineReason}
              onChangeText={setDeclineReason}
              multiline
              numberOfLines={4}
              editable={!declineLoading}
            />

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-3 rounded-xl items-center mr-2"
                activeOpacity={0.8}
                onPress={() => setShowDeclineModal(false)}
                disabled={declineLoading}
              >
                <Text
                  className="text-gray-700 font-medium"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-red-600 py-3 rounded-xl items-center ml-2"
                activeOpacity={0.8}
                onPress={handleDeclineConfirm}
                disabled={declineLoading}
                style={{
                  opacity: declineLoading ? 0.6 : 1,
                }}
              >
                <Text
                  className="text-white font-semibold"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {declineLoading ? 'Declining...' : 'Confirm Decline'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default QuoteCard;
