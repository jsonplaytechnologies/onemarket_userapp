import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

const BookingPathScreen = ({ route, navigation }) => {
  const { service, address, answers, description, photos } = route.params;
  const insets = useSafeAreaInsets();

  const handlePathSelection = (path) => {
    if (path === 'auto') {
      // Navigate to time selection screen
      navigation.navigate('TimeSelection', {
        service,
        address,
        answers,
        description,
        photos,
        bookingPath: 'auto',
      });
    } else {
      // Navigate to provider selection screen
      navigation.navigate('ProviderSelection', {
        service,
        address,
        answers,
        description,
        photos,
        bookingPath: 'manual',
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity
          className="mr-4"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text
          className="text-xl font-semibold text-gray-900 flex-1"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          Choose Booking Method
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      >
        <Text
          className="text-base text-gray-600 mb-6"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          How would you like to proceed with your booking?
        </Text>

        {/* Auto Booking Card */}
        <TouchableOpacity
          className="bg-white rounded-2xl p-6 mb-4 border-2 border-blue-500 shadow-sm"
          activeOpacity={0.8}
          onPress={() => handlePathSelection('auto')}
        >
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-100 rounded-full p-3 mr-3">
              <Ionicons name="flash" size={24} color={COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Let OneMarket Book
              </Text>
              <Text
                className="text-xs text-blue-600"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                RECOMMENDED
              </Text>
            </View>
            <View className="bg-blue-600 rounded-full p-2">
              <Ionicons name="chevron-forward" size={20} color="white" />
            </View>
          </View>

          <Text
            className="text-sm text-gray-600 mb-3"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            We'll automatically find and assign the best available provider based on ratings, experience, and availability.
          </Text>

          <View className="bg-blue-50 rounded-xl p-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text
                className="text-xs text-gray-700 ml-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Fastest matching process
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text
                className="text-xs text-gray-700 ml-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Auto-reassignment if provider doesn't respond
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text
                className="text-xs text-gray-700 ml-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Book now or schedule for later
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Manual Booking Card */}
        <TouchableOpacity
          className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm"
          activeOpacity={0.8}
          onPress={() => handlePathSelection('manual')}
        >
          <View className="flex-row items-center mb-3">
            <View className="bg-gray-100 rounded-full p-3 mr-3">
              <Ionicons name="person-outline" size={24} color={COLORS.textSecondary} />
            </View>
            <View className="flex-1">
              <Text
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Book a Provider Myself
              </Text>
            </View>
            <View className="bg-gray-300 rounded-full p-2">
              <Ionicons name="chevron-forward" size={20} color="white" />
            </View>
          </View>

          <Text
            className="text-sm text-gray-600 mb-3"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Browse and choose your preferred provider from a list of available professionals.
          </Text>

          <View className="bg-gray-50 rounded-xl p-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color={COLORS.textSecondary} />
              <Text
                className="text-xs text-gray-700 ml-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Choose your preferred provider
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color={COLORS.textSecondary} />
              <Text
                className="text-xs text-gray-700 ml-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                View provider calendars
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color={COLORS.textSecondary} />
              <Text
                className="text-xs text-gray-700 ml-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                More control over selection
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text
          className="text-xs text-gray-500 text-center mt-6"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          You can change your booking method later if needed
        </Text>
      </ScrollView>
    </View>
  );
};

export default BookingPathScreen;
