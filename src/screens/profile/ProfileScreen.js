import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const firstName = user?.profile?.firstName || user?.firstName || '';
  const lastName = user?.profile?.lastName || user?.lastName || '';
  const avatarUrl = user?.profile?.avatar || user?.avatar;
  const phone = user?.phone || '';

  const menuItems = [
    {
      id: 'addresses',
      icon: 'location-outline',
      label: 'My Addresses',
      description: 'Manage delivery addresses',
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      id: 'bookings',
      icon: 'calendar-outline',
      label: 'My Bookings',
      description: 'View booking history',
      onPress: () => navigation.navigate('Bookings'),
    },
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Notifications',
      description: 'Manage notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'help',
      icon: 'help-circle-outline',
      label: 'Help & Support',
      description: 'Get help with your account',
      onPress: () => {},
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'About',
      description: 'App version & info',
      onPress: () => {},
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 pt-12 pb-8">
        <Text
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          Profile
        </Text>
      </View>

      {/* Profile Card */}
      <View className="bg-white mx-6 -mt-4 rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center">
          {/* Avatar */}
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 64, height: 64, borderRadius: 32 }}
            />
          ) : (
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center">
              <Ionicons name="person" size={32} color={COLORS.primary} />
            </View>
          )}

          {/* Info */}
          <View className="flex-1 ml-4">
            <Text
              className="text-lg font-semibold text-gray-900"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {firstName} {lastName}
            </Text>
            <Text
              className="text-sm text-gray-500 mt-0.5"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {phone}
            </Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            className="bg-blue-50 p-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1 mt-4">
        <View className="px-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center bg-white p-4 ${
                index === 0 ? 'rounded-t-xl' : ''
              } ${index === menuItems.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'}`}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View className="bg-gray-100 p-2 rounded-lg mr-4">
                <Ionicons name={item.icon} size={22} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-medium text-gray-900"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  {item.label}
                </Text>
                <Text
                  className="text-xs text-gray-500"
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-6 mb-8">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-red-50 py-4 rounded-xl"
            activeOpacity={0.7}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
            <Text
              className="text-base font-medium text-red-500 ml-2"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
