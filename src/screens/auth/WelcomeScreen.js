import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';

const { height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('PhoneInput');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Top Section - Logo & Branding */}
        <View className="flex-1 items-center justify-center">
          {/* Logo */}
          <View className="w-24 h-24 bg-primary rounded-2xl items-center justify-center mb-8 shadow-lg">
            <Text className="text-white text-3xl font-bold">OM</Text>
          </View>

          {/* App Name */}
          <Text
            className="text-3xl font-bold text-gray-900 mb-3 text-center"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            OneMarket
          </Text>

          {/* Tagline */}
          <Text
            className="text-base text-gray-500 text-center px-4 mb-10"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Find trusted services and local businesses in your area
          </Text>

          {/* Feature Highlights */}
          <View className="w-full space-y-4">
            <FeatureItem
              icon="search-outline"
              title="Discover Services"
              description="Browse hundreds of local service providers"
            />
            <FeatureItem
              icon="star-outline"
              title="Trusted Professionals"
              description="Verified and reviewed by your community"
            />
            <FeatureItem
              icon="time-outline"
              title="Quick Booking"
              description="Book appointments in just a few taps"
            />
          </View>
        </View>

        {/* Bottom Section - CTA */}
        <View className="pb-8">
          <Button title="Get Started" onPress={handleGetStarted} />

          <Text
            className="text-xs text-gray-400 text-center mt-4"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3">
    <View className="w-12 h-12 bg-primary-light rounded-full items-center justify-center mr-4">
      <Ionicons name={icon} size={24} color="#2563EB" />
    </View>
    <View className="flex-1">
      <Text
        className="text-base font-semibold text-gray-900"
        style={{ fontFamily: 'Poppins-SemiBold' }}
      >
        {title}
      </Text>
      <Text
        className="text-sm text-gray-500"
        style={{ fontFamily: 'Poppins-Regular' }}
      >
        {description}
      </Text>
    </View>
  </View>
);

export default WelcomeScreen;
