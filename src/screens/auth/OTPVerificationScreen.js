import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import OTPInput from '../../components/auth/OTPInput';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

const OTPVerificationScreen = ({ navigation, route }) => {
  const { phone, countryCode, fullPhone } = route.params;
  const { login } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30); // 30 seconds for resend
  const verifyingRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (otpCode = otp) => {
    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    // Prevent double verification
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    setLoading(true);
    setError('');

    try {
      const response = await apiService.post(API_ENDPOINTS.VERIFY_OTP, {
        phone,
        code: otpCode,
        countryCode,
      });

      if (response.success) {
        if (response.data.isNewUser) {
          navigation.navigate('Signup', { phone: response.data.phone });
        } else {
          await login(response.data.token, response.data.user);
          navigation.replace('Main');
        }
      }
    } catch (error) {
      setError(error.message || 'Invalid or expired code');
      setOtp('');
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  };

  const handleOTPComplete = (otpCode) => {
    handleVerify(otpCode);
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      const response = await apiService.post(API_ENDPOINTS.SEND_OTP, {
        phone,
        countryCode,
      });

      if (response.success) {
        Alert.alert('Success', 'A new code has been sent to your phone');
        setCountdown(30);
        setOtp('');
        setError('');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const canResend = countdown === 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mb-6"
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          Verify your phone
        </Text>

        <Text
          className="text-base text-gray-500"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          Enter the 6-digit code sent to
        </Text>
        <Text
          className="text-base text-gray-900 font-semibold"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          {fullPhone}
        </Text>
      </View>

      {/* OTP Input */}
      <View className="px-4 mt-4">
        <OTPInput
          length={6}
          value={otp}
          onChange={setOtp}
          onComplete={handleOTPComplete}
        />

        {/* Error Message */}
        {error && (
          <View className="flex-row items-center justify-center mt-4">
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text
              className="text-error text-sm ml-2"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Resend Section */}
        <View className="items-center mt-8">
          {countdown > 0 ? (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text
                className="text-gray-500 ml-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Resend code in {countdown}s
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={resendLoading}
              className="flex-row items-center"
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={resendLoading ? '#9CA3AF' : '#2563EB'}
              />
              <Text
                className={`ml-2 ${resendLoading ? 'text-gray-400' : 'text-primary'}`}
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <View className="mt-8 px-2">
          <Button
            title={loading ? 'Verifying...' : 'Verify'}
            onPress={() => handleVerify()}
            disabled={otp.length !== 6 || loading}
            loading={loading}
          />
        </View>

        {/* Help Text */}
        <Text
          className="text-sm text-gray-400 text-center mt-6"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          Didn't receive the code? Check your spam folder or try resending
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default OTPVerificationScreen;
