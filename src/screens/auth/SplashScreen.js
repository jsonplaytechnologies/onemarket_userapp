import React, { useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LogoIcon } from '../../components/common/Logo';

const SplashScreen = ({ navigation }) => {
  const { loading, isAuthenticated } = useAuth();
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace('Main');
        } else {
          navigation.replace('Welcome');
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, navigation]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LogoIcon size={80} />
      </Animated.View>

      <Text
        className="text-3xl text-gray-900 mt-6 tracking-tight"
        style={{ fontFamily: 'Poppins-Bold', letterSpacing: -0.5 }}
      >
        onemarket
      </Text>

      <Text
        className="text-sm text-gray-400 mt-2"
        style={{ fontFamily: 'Poppins-Regular' }}
      >
        Services at your fingertips
      </Text>
    </View>
  );
};

export default SplashScreen;
