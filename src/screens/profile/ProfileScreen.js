import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { LogoIcon } from '../../components/common/Logo';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const firstName = user?.profile?.first_name || user?.profile?.firstName || user?.firstName || '';
  const lastName = user?.profile?.last_name || user?.profile?.lastName || user?.lastName || '';
  const avatarUrl = user?.profile?.avatar_url || user?.profile?.avatarUrl || user?.avatar;
  const phone = user?.phone || '';

  const menuItems = [
    {
      id: 'addresses',
      icon: 'location-outline',
      label: 'My Addresses',
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      id: 'bookings',
      icon: 'calendar-outline',
      label: 'My Bookings',
      onPress: () => navigation.navigate('Bookings'),
    },
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'help',
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => {},
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'About',
      onPress: () => {},
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-14 pb-6">
        <Text
          className="text-2xl text-gray-900"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          Profile
        </Text>
      </View>

      {/* Profile Card */}
      <View className="mx-6 mb-6">
        <TouchableOpacity
          className="flex-row items-center bg-gray-50 rounded-2xl p-4"
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditProfile')}
        >
          {/* Avatar */}
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
            />
          ) : (
            <View className="w-14 h-14 bg-blue-100 rounded-full items-center justify-center">
              <Text
                className="text-xl text-primary"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Info */}
          <View className="flex-1 ml-4">
            <Text
              className="text-lg text-gray-900"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {firstName} {lastName}
            </Text>
            <Text
              className="text-sm text-gray-400 mt-0.5"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {phone}
            </Text>
          </View>

          {/* Arrow */}
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center py-4 border-b border-gray-100"
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
                <Ionicons name={item.icon} size={20} color={COLORS.textPrimary} />
              </View>
              <Text
                className="flex-1 text-base text-gray-900"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-8 mb-8">
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 border border-gray-200 rounded-xl"
            activeOpacity={0.7}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text
              className="text-base text-red-500 ml-2"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <LogoIcon size={32} />
          <Text
            className="text-xs text-gray-300 mt-2"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
