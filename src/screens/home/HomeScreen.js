import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ServicesTab from './ServicesTab';
import BusinessesTab from './BusinessesTab';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { COLORS } from '../../constants/colors';
import { LogoIcon } from '../../components/common/Logo';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';

const Tab = createMaterialTopTabNavigator();

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [primaryAddress, setPrimaryAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.USER_ADDRESSES);
      if (response.success && response.data) {
        const addresses = Array.isArray(response.data) ? response.data : response.data.addresses || [];
        // Find primary address or use first one
        const primary = addresses.find(addr => addr.is_default || addr.isDefault) || addresses[0];
        setPrimaryAddress(primary);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const getAddressText = () => {
    if (!primaryAddress) return 'Add your address';

    const label = primaryAddress.label || primaryAddress.name || '';
    const street = primaryAddress.street || primaryAddress.address_line || '';
    const zone = primaryAddress.zone?.name || primaryAddress.zoneName || '';

    if (label && zone) return `${label}, ${zone}`;
    if (street) return street;
    if (zone) return zone;
    return 'Your location';
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-3">
        <View className="flex-row items-center justify-between">
          {/* Logo & Address */}
          <TouchableOpacity
            className="flex-row items-center flex-1 mr-4"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Addresses')}
          >
            <LogoIcon size={40} />
            <View className="ml-3 flex-1">
              <Text
                className="text-lg text-gray-900"
                style={{ fontFamily: 'Poppins-Bold', letterSpacing: -0.3 }}
              >
                onemarket
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={12} color={COLORS.primary} />
                <Text
                  className="text-xs text-gray-500 ml-1 flex-1"
                  style={{ fontFamily: 'Poppins-Regular' }}
                  numberOfLines={1}
                >
                  {getAddressText()}
                </Text>
                <Ionicons name="chevron-down" size={12} color="#9CA3AF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            className="w-11 h-11 bg-gray-100 rounded-full items-center justify-center"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
            {unreadCount > 0 && (
              <View className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-1">
                <Text
                  className="text-white"
                  style={{ fontFamily: 'Poppins-Bold', fontSize: 10 }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: 14,
            fontFamily: 'Poppins-SemiBold',
            textTransform: 'none',
          },
          tabBarIndicatorStyle: {
            backgroundColor: COLORS.primary,
            height: 3,
            borderRadius: 3,
          },
          tabBarStyle: {
            backgroundColor: 'white',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#F3F4F6',
          },
          tabBarPressColor: 'rgba(37, 99, 235, 0.08)',
        }}
      >
        <Tab.Screen name="Services" component={ServicesTab} />
        <Tab.Screen name="Businesses" component={BusinessesTab} />
      </Tab.Navigator>
    </View>
  );
};

export default HomeScreen;
