import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { useBookingSocket } from '../../hooks/useSocket';

const PAYMENT_STATUS = {
  IDLE: 'idle',
  INITIATING: 'initiating',
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const PaymentScreen = ({ route, navigation }) => {
  const { bookingId, booking } = route.params;
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState('');

  const { isConnected, bookingStatus, on, off } = useBookingSocket(bookingId);

  // Pre-fill phone from user profile
  useEffect(() => {
    if (user?.phone) {
      // Remove country code if present
      const phone = user.phone.replace(/^\+\d{1,3}/, '');
      setPhoneNumber(phone);
    }
  }, [user]);

  // Listen for socket payment events
  useEffect(() => {
    if (isConnected) {
      on('payment-confirmed', (data) => {
        if (data.bookingId === bookingId) {
          setPaymentStatus(PAYMENT_STATUS.COMPLETED);
        }
      });

      on('payment-failed', (data) => {
        if (data.bookingId === bookingId) {
          setPaymentStatus(PAYMENT_STATUS.FAILED);
          setErrorMessage(data.reason || 'Payment failed. Please try again.');
        }
      });

      on('booking-status-changed', (data) => {
        if (data.bookingId === bookingId && data.status === 'paid') {
          setPaymentStatus(PAYMENT_STATUS.COMPLETED);
        }
      });

      return () => {
        off('payment-confirmed');
        off('payment-failed');
        off('booking-status-changed');
      };
    }
  }, [isConnected, bookingId]);

  // Also check bookingStatus from hook
  useEffect(() => {
    if (bookingStatus?.status === 'paid') {
      setPaymentStatus(PAYMENT_STATUS.COMPLETED);
    }
  }, [bookingStatus]);

  const handleInitiatePayment = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    try {
      setPaymentStatus(PAYMENT_STATUS.INITIATING);
      setErrorMessage('');

      const response = await apiService.post(API_ENDPOINTS.BOOKING_PAY(bookingId), {
        phone: phoneNumber.trim(),
      });

      if (response.success) {
        const pawaPayStatus = response.data?.status;

        // Check if PawaPay immediately rejected the payment
        if (pawaPayStatus === 'REJECTED' || pawaPayStatus === 'FAILED') {
          setPaymentStatus(PAYMENT_STATUS.FAILED);
          setErrorMessage('Payment was rejected. Please check your phone number and try again.');
        } else if (pawaPayStatus === 'COMPLETED') {
          // Sandbox mode - immediate success
          setPaymentStatus(PAYMENT_STATUS.COMPLETED);
        } else {
          // ACCEPTED or PENDING - waiting for user confirmation
          setPaymentStatus(PAYMENT_STATUS.PENDING);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus(PAYMENT_STATUS.FAILED);
      setErrorMessage(error.message || 'Failed to initiate payment');
    }
  };

  const handleRetry = () => {
    setPaymentStatus(PAYMENT_STATUS.IDLE);
    setErrorMessage('');
  };

  const handleGoBack = () => {
    if (paymentStatus === PAYMENT_STATUS.COMPLETED) {
      navigation.navigate('BookingDetails', { bookingId });
    } else {
      navigation.goBack();
    }
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString() + ' XAF' : '-';
  };

  const quotationAmount = booking?.quotationAmount || booking?.quotation_amount;
  const serviceName = booking?.serviceName || booking?.service_name || 'Service';
  const proFirstName = booking?.pro?.firstName || booking?.pro?.first_name || '';
  const proLastName = booking?.pro?.lastName || booking?.pro?.last_name || '';
  const proAvatar = booking?.pro?.avatar || booking?.pro?.avatarUrl || booking?.pro?.avatar_url;
  const proName = `${proFirstName} ${proLastName}`.trim() || 'Service Provider';

  const renderIdleState = () => (
    <>
      {/* Payment Summary */}
      <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
        <Text
          className="text-sm font-medium text-gray-500 mb-3"
          style={{ fontFamily: 'Poppins-Medium' }}
        >
          PAYMENT SUMMARY
        </Text>

        <View className="flex-row justify-between py-2 border-b border-gray-100">
          <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins-Regular' }}>
            Service
          </Text>
          <Text className="text-sm text-gray-900" style={{ fontFamily: 'Poppins-Medium' }}>
            {serviceName}
          </Text>
        </View>

        <View className="flex-row justify-between py-2 border-b border-gray-100">
          <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins-Regular' }}>
            Provider
          </Text>
          <Text className="text-sm text-gray-900" style={{ fontFamily: 'Poppins-Medium' }}>
            {proName}
          </Text>
        </View>

        <View className="flex-row justify-between py-3">
          <Text className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Poppins-SemiBold' }}>
            Total Amount
          </Text>
          <Text className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins-Bold' }}>
            {formatPrice(quotationAmount)}
          </Text>
        </View>
      </View>

      {/* Phone Input */}
      <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
        <Text
          className="text-sm font-medium text-gray-500 mb-3"
          style={{ fontFamily: 'Poppins-Medium' }}
        >
          MOBILE MONEY NUMBER
        </Text>

        <View className="flex-row items-center border border-gray-200 rounded-xl overflow-hidden">
          <View className="bg-gray-100 px-4 py-4 border-r border-gray-200">
            <Text
              className="text-base text-gray-700"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              +241
            </Text>
          </View>
          <TextInput
            className="flex-1 px-4 py-4 text-base text-gray-900"
            style={{ fontFamily: 'Poppins-Regular' }}
            placeholder="Enter phone number"
            placeholderTextColor="#9CA3AF"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <Text
          className="text-xs text-gray-500 mt-2"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          You will receive a payment prompt on this number
        </Text>
      </View>

      {/* Payment Methods */}
      <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
        <Text
          className="text-sm font-medium text-gray-500 mb-3"
          style={{ fontFamily: 'Poppins-Medium' }}
        >
          PAYMENT METHOD
        </Text>

        <View className="flex-row items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
          <View className="bg-green-100 rounded-full p-2 mr-3">
            <Ionicons name="phone-portrait-outline" size={24} color="#15803D" />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-medium text-gray-900"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Mobile Money
            </Text>
            <Text
              className="text-sm text-gray-500"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Airtel Money, Moov Money
            </Text>
          </View>
          <View className="bg-blue-500 rounded-full p-1">
            <Ionicons name="checkmark" size={14} color="white" />
          </View>
        </View>
      </View>

      {/* Payment Protection Info */}
      <View className="bg-green-50 mx-6 mt-4 p-4 rounded-xl border border-green-200">
        <View className="flex-row items-start">
          <Ionicons name="shield-checkmark" size={20} color="#15803D" />
          <View className="ml-3 flex-1">
            <Text
              className="text-sm font-medium text-green-800"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Payment Protection
            </Text>
            <Text
              className="text-xs text-green-700 mt-1"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Your payment is held securely. The service provider will only receive the money after you confirm the job is completed.
            </Text>
          </View>
        </View>
      </View>

      {/* Pay Button */}
      <View className="px-6 mt-6">
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-xl items-center"
          activeOpacity={0.8}
          onPress={handleInitiatePayment}
        >
          <Text
            className="text-white text-base font-semibold"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Pay {formatPrice(quotationAmount)}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderPendingState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-blue-50 rounded-full p-6 mb-6">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>

      <Text
        className="text-xl font-semibold text-gray-900 text-center"
        style={{ fontFamily: 'Poppins-SemiBold' }}
      >
        Waiting for Confirmation
      </Text>

      <Text
        className="text-base text-gray-500 text-center mt-3 px-4"
        style={{ fontFamily: 'Poppins-Regular' }}
      >
        Please check your phone and approve the payment request from your mobile money app.
      </Text>

      <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6 w-full">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={24} color="#B45309" />
          <View className="ml-3 flex-1">
            <Text
              className="text-sm font-medium text-yellow-800"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Payment Request Sent
            </Text>
            <Text
              className="text-sm text-yellow-700 mt-1"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Check your phone for the mobile money prompt. Enter your PIN to confirm the payment.
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="mt-8"
        activeOpacity={0.7}
        onPress={() => {
          setPaymentStatus(PAYMENT_STATUS.IDLE);
        }}
      >
        <Text
          className="text-blue-600 text-base"
          style={{ fontFamily: 'Poppins-Medium' }}
        >
          Use a different number
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCompletedState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-green-100 rounded-full p-6 mb-6">
        <Ionicons name="checkmark-circle" size={64} color="#15803D" />
      </View>

      <Text
        className="text-2xl font-bold text-gray-900 text-center"
        style={{ fontFamily: 'Poppins-Bold' }}
      >
        Payment Successful!
      </Text>

      <Text
        className="text-base text-gray-500 text-center mt-3"
        style={{ fontFamily: 'Poppins-Regular' }}
      >
        Your payment of {formatPrice(quotationAmount)} has been confirmed.
      </Text>

      <View className="bg-gray-50 rounded-xl p-4 mt-6 w-full">
        <View className="flex-row items-center">
          {proAvatar ? (
            <Image
              source={{ uri: proAvatar }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          ) : (
            <View
              className="bg-gray-200 items-center justify-center"
              style={{ width: 48, height: 48, borderRadius: 24 }}
            >
              <Ionicons name="person" size={24} color={COLORS.textSecondary} />
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text
              className="text-base font-medium text-gray-900"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              {proName}
            </Text>
            <Text
              className="text-sm text-gray-500"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              will be notified and is on the way soon
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="bg-blue-600 py-4 rounded-xl items-center w-full mt-8"
        activeOpacity={0.8}
        onPress={() => navigation.navigate('BookingDetails', { bookingId })}
      >
        <Text
          className="text-white text-base font-semibold"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          View Booking
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFailedState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-red-100 rounded-full p-6 mb-6">
        <Ionicons name="close-circle" size={64} color="#B91C1C" />
      </View>

      <Text
        className="text-2xl font-bold text-gray-900 text-center"
        style={{ fontFamily: 'Poppins-Bold' }}
      >
        Payment Failed
      </Text>

      <Text
        className="text-base text-gray-500 text-center mt-3"
        style={{ fontFamily: 'Poppins-Regular' }}
      >
        {errorMessage || 'Something went wrong. Please try again.'}
      </Text>

      <TouchableOpacity
        className="bg-blue-600 py-4 rounded-xl items-center w-full mt-8"
        activeOpacity={0.8}
        onPress={handleRetry}
      >
        <Text
          className="text-white text-base font-semibold"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          Try Again
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="py-4 items-center w-full mt-2"
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
      >
        <Text
          className="text-gray-500 text-base"
          style={{ fontFamily: 'Poppins-Medium' }}
        >
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (paymentStatus) {
      case PAYMENT_STATUS.PENDING:
      case PAYMENT_STATUS.INITIATING:
        return renderPendingState();
      case PAYMENT_STATUS.COMPLETED:
        return renderCompletedState();
      case PAYMENT_STATUS.FAILED:
        return renderFailedState();
      default:
        return renderIdleState();
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity
          className="mr-4"
          activeOpacity={0.7}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text
          className="text-xl font-semibold text-gray-900 flex-1"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          Payment
        </Text>

        {/* Socket Connection Indicator */}
        <View className="flex-row items-center">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <Text
            className="text-xs text-gray-500"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {isConnected ? 'Live' : 'Offline'}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default PaymentScreen;
