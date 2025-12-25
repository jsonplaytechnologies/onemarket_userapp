import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const TimeSelectionScreen = ({ route, navigation }) => {
  const { service, address, answers, description, photos, bookingPath } = route.params;
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const combineDateAndTime = () => {
    const combined = new Date(selectedDate);
    combined.setHours(selectedTime.getHours());
    combined.setMinutes(selectedTime.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  const handleBookNow = async () => {
    const requestedDateTime = new Date();
    await submitBooking(requestedDateTime, true);
  };

  const handleScheduleBooking = async () => {
    const requestedDateTime = combineDateAndTime();

    // Validate future date
    if (requestedDateTime <= new Date()) {
      Alert.alert('Invalid Time', 'Please select a future date and time');
      return;
    }

    await submitBooking(requestedDateTime, false);
  };

  const submitBooking = async (requestedDateTime, isBookNow) => {
    try {
      setSubmitting(true);

      const serviceId = service.id || service.service_id || service.serviceId;
      const addressId = address.id;

      const bookingData = {
        serviceId,
        userAddressId: addressId,
        bookingPath,
        requestedDatetime: requestedDateTime.toISOString(),
        isBookNow,
        description: description || undefined,
        answers: answers || [],
        // Photos would need to be uploaded separately or as base64
      };

      const response = await apiService.post(API_ENDPOINTS.BOOKINGS_V2, bookingData);

      if (response.success) {
        const createdBooking = response.data.booking || response.data;
        const newBookingId = createdBooking.id;

        // Navigate to finding provider screen for auto booking
        navigation.replace('FindingProvider', {
          bookingId: newBookingId,
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <View className="flex-1">
          <Text
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Select Time
          </Text>
          <Text
            className="text-xs text-gray-500"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            When do you need the service?
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      >
        {/* Book Now Card */}
        <View className="bg-blue-600 rounded-2xl p-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-500 rounded-full p-2 mr-3">
              <Ionicons name="flash" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                Book Now
              </Text>
              <Text
                className="text-sm text-white/90"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Get service as soon as possible
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-white py-4 rounded-xl items-center"
            activeOpacity={0.8}
            onPress={handleBookNow}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text
                className="text-blue-600 text-base font-semibold"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Book Now
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text
            className="text-gray-500 text-sm mx-4"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            OR
          </Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Schedule for Later */}
        <View className="bg-white rounded-2xl p-6">
          <View className="flex-row items-center mb-4">
            <View className="bg-gray-100 rounded-full p-2 mr-3">
              <Ionicons name="calendar-outline" size={24} color={COLORS.textSecondary} />
            </View>
            <View className="flex-1">
              <Text
                className="text-xl font-semibold text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Schedule for Later
              </Text>
              <Text
                className="text-sm text-gray-500"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Choose a specific date and time
              </Text>
            </View>
          </View>

          {/* Date Picker */}
          <TouchableOpacity
            className="bg-gray-50 rounded-xl p-4 mb-3 flex-row items-center justify-between"
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
          >
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text
                className="text-base text-gray-900 ml-3"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {formatDate(selectedDate)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {/* Time Picker */}
          <TouchableOpacity
            className="bg-gray-50 rounded-xl p-4 mb-4 flex-row items-center justify-between"
            activeOpacity={0.7}
            onPress={() => setShowTimePicker(true)}
          >
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color={COLORS.primary} />
              <Text
                className="text-base text-gray-900 ml-3"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {formatTime(selectedTime)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-xl items-center"
            activeOpacity={0.8}
            onPress={handleScheduleBooking}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className="text-white text-base font-semibold"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Schedule Booking
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View className="bg-blue-50 rounded-xl p-4 mt-6 flex-row">
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text
            className="text-xs text-gray-700 ml-3 flex-1"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            We'll automatically find and assign the best available provider for your selected time
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default TimeSelectionScreen;
