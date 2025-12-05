import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import CountryPicker from '../../components/common/CountryPicker';
import { DEFAULT_COUNTRY } from '../../constants/countries';
import apiService from '../../services/api';
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
      setError(`Phone number must be ${MIN_PHONE_LENGTH}-${MAX_PHONE_LENGTH} digits`);
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
      Alert.alert('Error', error.message || 'Failed to send OTP');
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
          Enter your phone number
        </Text>

        <Text
          className="text-base text-gray-500"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          We'll send you a verification code
        </Text>
      </View>

      {/* Form */}
      <View className="px-6">
        {/* Phone Input Container */}
        <View className="flex-row items-center">
          {/* Country Code Picker */}
          <TouchableOpacity
            className="h-14 flex-row items-center border border-gray-300 rounded-xl px-3 mr-3 bg-white"
            onPress={() => setShowCountryPicker(true)}
          >
            <Text className="text-xl mr-2">{selectedCountry.flag}</Text>
            <Text
              className="text-base text-gray-900 mr-1"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              {selectedCountry.code}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>

          {/* Phone Number Input */}
          <View className="flex-1">
            <View
              className={`h-14 flex-row items-center border rounded-xl px-4 bg-white ${
                error ? 'border-error' : phoneNumber ? 'border-primary' : 'border-gray-300'
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
              {phoneNumber.length > 0 && (
                <Text className="text-sm text-gray-400">
                  {phoneNumber.length}/{MAX_PHONE_LENGTH}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text className="text-error text-sm ml-1">{error}</Text>
          </View>
        )}

        {/* Helper Text */}
        <Text
          className="text-sm text-gray-400 mt-4"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          Enter your {MIN_PHONE_LENGTH}-{MAX_PHONE_LENGTH} digit mobile number
        </Text>

        {/* Send OTP Button */}
        <View className="mt-8">
          <Button
            title={loading ? 'Sending...' : 'Continue'}
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
