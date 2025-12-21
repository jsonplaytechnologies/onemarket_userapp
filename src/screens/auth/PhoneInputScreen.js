import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import CountryPicker from '../../components/common/CountryPicker';
import { DEFAULT_COUNTRY } from '../../constants/countries';
import { LogoIcon } from '../../components/common/Logo';
import apiService, { ApiError } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';

const MIN_PHONE_LENGTH = 8;
const MAX_PHONE_LENGTH = 10;

const PhoneInputScreen = ({ navigation }) => {
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const validatePhoneNumber = () => {
    if (!phoneNumber || phoneNumber.length < MIN_PHONE_LENGTH) {
      setError(`Enter ${MIN_PHONE_LENGTH}-${MAX_PHONE_LENGTH} digits`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber()) return;

    setLoading(true);
    try {
      const response = await apiService.post(API_ENDPOINTS.SEND_OTP, {
        phone: phoneNumber,
        countryCode: selectedCountry.code,
      });

      if (response.success) {
        navigation.navigate('OTPVerification', {
          phone: phoneNumber,
          countryCode: selectedCountry.code,
          fullPhone: `${selectedCountry.code} ${phoneNumber}`,
        });
      }
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        Alert.alert(
          'Please Wait',
          `Too many requests. Try again in ${error.retryAfter} seconds.`
        );
      } else if (error.code === 'VALIDATION_ERROR') {
        // Display validation errors
        const errorMsg = error.errors && error.errors.length > 0
          ? error.errors.map(e => e.msg).join('\n')
          : error.message;
        Alert.alert('Validation Error', errorMsg);
      } else {
        Alert.alert('Error', error.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, MAX_PHONE_LENGTH);
    setPhoneNumber(cleaned);
    setError('');
  };

  const isPhoneValid = phoneNumber.length >= MIN_PHONE_LENGTH;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-2 pb-8">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50 mb-8"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>

        <View className="mb-6">
          <LogoIcon size={48} />
        </View>

        <Text
          className="text-2xl text-gray-900 mb-2"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          What's your number?
        </Text>

        <Text
          className="text-base text-gray-400"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          We'll send you a code to verify
        </Text>
      </View>

      {/* Form */}
      <View className="px-6">
        {/* Phone Input Container */}
        <View className="flex-row items-center">
          {/* Country Code Picker */}
          <TouchableOpacity
            className="h-14 flex-row items-center bg-gray-50 rounded-xl px-4 mr-3"
            onPress={() => setShowCountryPicker(true)}
            activeOpacity={0.7}
          >
            <Text className="text-lg mr-2">{selectedCountry.flag}</Text>
            <Text
              className="text-base text-gray-900"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              {selectedCountry.code}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#9CA3AF" className="ml-1" />
          </TouchableOpacity>

          {/* Phone Number Input */}
          <View className="flex-1">
            <View
              className={`h-14 flex-row items-center bg-gray-50 rounded-xl px-4 ${
                error ? 'border-2 border-red-400' : phoneNumber ? 'border-2 border-primary' : ''
              }`}
            >
              <TextInput
                className="flex-1 text-base text-gray-900"
                style={{ fontFamily: 'Poppins-Regular' }}
                placeholder="Phone number"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={MAX_PHONE_LENGTH}
                autoFocus
              />
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <Text
            className="text-red-500 text-sm mt-2"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {error}
          </Text>
        )}

        {/* Send OTP Button */}
        <View className="mt-8">
          <Button
            title="Continue"
            onPress={handleSendOTP}
            disabled={!isPhoneValid}
            loading={loading}
          />
        </View>
      </View>

      {/* Country Picker Modal */}
      <CountryPicker
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={setSelectedCountry}
        selectedCountry={selectedCountry}
      />
    </SafeAreaView>
  );
};

export default PhoneInputScreen;
