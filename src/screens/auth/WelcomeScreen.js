import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { Logo, LogoIcon } from '../../components/common/Logo';

const { height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('PhoneInput');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8">
        {/* Top Section - Logo & Branding */}
        <View className="flex-1 items-center justify-center">
          {/* Logo Icon - Large */}
          <View className="mb-6">
            <LogoIcon size={100} />
          </View>

          {/* App Name */}
          <Text
            className="text-4xl text-gray-900 text-center tracking-tight"
            style={{ fontFamily: 'Poppins-Bold', letterSpacing: -1 }}
          >
            onemarket
          </Text>

          {/* Tagline */}
          <Text
            className="text-base text-gray-400 text-center mt-3"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Services at your fingertips
          </Text>
        </View>

        {/* Middle Section - Features */}
        <View className="py-8">
          <View className="flex-row justify-center space-x-6">
            <FeaturePill icon="shield-checkmark" label="Verified" />
            <FeaturePill icon="flash" label="Instant" />
            <FeaturePill icon="star" label="Rated" />
          </View>
        </View>

        {/* Bottom Section - CTA */}
        <View className="pb-8">
          <Button title="Get Started" onPress={handleGetStarted} />

          <Text
            className="text-xs text-gray-400 text-center mt-5"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FeaturePill = ({ icon, label }) => (
  <View className="items-center">
    <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mb-2">
      <Ionicons name={icon} size={24} color="#2563EB" />
    </View>
    <Text
      className="text-xs text-gray-500"
      style={{ fontFamily: 'Poppins-Medium' }}
    >
      {label}
    </Text>
  </View>
);

export default WelcomeScreen;
