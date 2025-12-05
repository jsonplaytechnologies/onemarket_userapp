import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const SplashScreen = ({ navigation }) => {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Navigate after 2 seconds
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace('Main');
        } else {
          navigation.replace('Welcome');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, navigation]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      {/* Logo placeholder - replace with actual logo */}
      <View className="w-32 h-32 bg-primary rounded-3xl items-center justify-center mb-4">
        <Text className="text-white text-4xl font-bold">OM</Text>
      </View>

      <Text
        className="text-2xl font-bold text-gray-900 mb-8"
        style={{ fontFamily: 'Poppins-Bold' }}
      >
        OneMarket
      </Text>

      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
};

export default SplashScreen;
