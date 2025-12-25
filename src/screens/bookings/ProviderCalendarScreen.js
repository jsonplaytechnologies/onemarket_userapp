import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { getRandomProAvatar } from '../../constants/images';

// Generate 1-hour time slots from 6 AM to 10 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push({
      hour,
      minute: 0,
      label: `${hour.toString().padStart(2, '0')}:00`,
      endLabel: `${(hour + 1).toString().padStart(2, '0')}:00`,
    });
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const ProviderCalendarScreen = ({ route, navigation }) => {
  const {
    service,
    address,
    answers,
    provider,
  } = route.params;
  const insets = useSafeAreaInsets();

  // Calculate max date (1 year from now)
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [isAvailableNow, setIsAvailableNow] = useState(false);

  // Provider info with fallbacks
  const proId = provider.id || provider.pro_id || provider.proId;
  const firstName = provider.first_name || provider.firstName || '';
  const lastName = provider.last_name || provider.lastName || '';
  const avatarUrl = provider.avatar_url || provider.avatarUrl || getRandomProAvatar(proId);
  const rating = parseFloat(provider.average_rating || provider.rating || 0);
  const reviewCount = provider.total_reviews || provider.reviewCount || 0;
  const completedJobs = provider.completed_bookings || provider.completedJobs || 0;
  const isVerified = provider.is_id_verified || provider.isVerified || false;

  useEffect(() => {
    checkBookNowAvailability();
    fetchAvailableSlots();
  }, []);

  useEffect(() => {
    fetchAvailableSlots();
    setSelectedSlot(null);
  }, [selectedDate]);

  const checkBookNowAvailability = async () => {
    try {
      setCheckingAvailability(true);
      const response = await apiService.get(API_ENDPOINTS.PRO_IS_AVAILABLE_NOW(proId));
      if (response.success && response.data) {
        const canBook = response.data.canAcceptBookNow || response.data.can_accept_book_now || false;
        setIsAvailableNow(canBook);
      }
    } catch (error) {
      console.error('Error checking Book Now availability:', error);
      setIsAvailableNow(false);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      // Use local date components to avoid timezone shift when converting to ISO
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const response = await apiService.get(`${API_ENDPOINTS.PRO_AVAILABLE_SLOTS(proId)}?date=${dateStr}`);

      if (response.success && response.data) {
        // API returns slots with blocked_ranges
        const slotsData = response.data.slots || response.data || [];
        setAvailableSlots(Array.isArray(slotsData) ? slotsData : []);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      // Ensure date is within valid range
      if (date > maxDate) {
        Alert.alert('Invalid Date', 'Please select a date within one year from today');
        return;
      }
      if (date < today) {
        Alert.alert('Invalid Date', 'Please select a future date');
        return;
      }
      setSelectedDate(date);
    }
  };

  // Check if a time slot is within available range
  const isSlotWithinAvailability = (slot) => {
    const slotTime = `${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}:00`;
    const slotEndTime = `${(slot.hour + 1).toString().padStart(2, '0')}:00:00`;

    for (const available of availableSlots) {
      const startTime = available.start_time || '';
      const endTime = available.end_time || '';

      // Slot is within availability if it starts after/at availability start
      // and ends before/at availability end
      if (slotTime >= startTime && slotEndTime <= endTime) {
        return { isAvailable: true, blockedRanges: available.blocked_ranges || [] };
      }
    }
    return { isAvailable: false, blockedRanges: [] };
  };

  // Check if a time slot is blocked (booked + buffer)
  const isSlotBlocked = (slot, blockedRanges) => {
    // Create Date objects for the slot's start and end times using the selected date
    const slotStart = new Date(selectedDate);
    slotStart.setHours(slot.hour, slot.minute, 0, 0);

    const slotEnd = new Date(selectedDate);
    slotEnd.setHours(slot.hour + 1, 0, 0, 0);

    for (const range of blockedRanges) {
      // Use ISO datetime strings for accurate comparison (includes timezone)
      if (range.start_datetime && range.end_datetime) {
        const blockStart = new Date(range.start_datetime);
        const blockEnd = new Date(range.end_datetime);

        // Check if slot overlaps with blocked range using proper Date comparison
        if (slotStart < blockEnd && slotEnd > blockStart) {
          return true;
        }
      } else {
        // Fallback to time string comparison for backward compatibility
        const slotTime = `${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}:00`;
        const slotEndTime = `${(slot.hour + 1).toString().padStart(2, '0')}:00:00`;
        const blockStart = range.start || '';
        const blockEnd = range.end || '';

        if (slotTime < blockEnd && slotEndTime > blockStart) {
          return true;
        }
      }
    }
    return false;
  };

  // Check if slot is in the past (for today)
  const isSlotPast = (slot) => {
    const now = new Date();
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);

    if (selectedDay.getTime() > todayDate.getTime()) {
      return false;
    }

    // Same day - check if time has passed
    const slotDate = new Date(selectedDate);
    slotDate.setHours(slot.hour, slot.minute, 0, 0);
    return slotDate <= now;
  };

  const getSlotStatus = (slot) => {
    if (isSlotPast(slot)) {
      return 'past';
    }

    const availabilityInfo = isSlotWithinAvailability(slot);

    if (!availabilityInfo.isAvailable) {
      return 'unavailable';
    }

    if (isSlotBlocked(slot, availabilityInfo.blockedRanges)) {
      return 'booked';
    }

    return 'available';
  };

  const handleSlotSelect = (slot) => {
    const status = getSlotStatus(slot);
    if (status === 'available') {
      setSelectedSlot(slot);
    }
  };

  const handleBookNow = async () => {
    if (!isAvailableNow) {
      Alert.alert(
        'Provider Unavailable',
        'This provider is not available right now. Please schedule for a later time.',
        [{ text: 'OK' }]
      );
      return;
    }

    await submitBooking(new Date(), true);
  };

  const handleScheduleBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Select Time', 'Please select an available time slot');
      return;
    }

    const requestedDateTime = new Date(selectedDate);
    requestedDateTime.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0);

    if (requestedDateTime <= new Date()) {
      Alert.alert('Invalid Time', 'Please select a future time slot');
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
        proId,
        bookingPath: 'manual',
        requestedDatetime: requestedDateTime.toISOString(),
        isBookNow,
        answers: answers || [],
      };

      const response = await apiService.post(API_ENDPOINTS.BOOKINGS_V2, bookingData);

      if (response.success) {
        const createdBooking = response.data.booking || response.data;
        const newBookingId = createdBooking.id;

        Alert.alert(
          'Booking Sent',
          'Your booking request has been sent to the provider. They will respond shortly.',
          [
            {
              text: 'View Booking',
              onPress: () => {
                navigation.replace('BookingDetails', {
                  bookingId: newBookingId,
                });
              },
            },
          ]
        );
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
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSlotStyle = (status, isSelected) => {
    const base = {
      width: '23%',
      height: 48,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: '2%',
      marginBottom: 10,
    };

    if (isSelected) {
      return { ...base, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: '#1E40AF' };
    }

    switch (status) {
      case 'available':
        return { ...base, backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC' };
      case 'booked':
        return { ...base, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' };
      case 'past':
      case 'unavailable':
      default:
        return { ...base, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' };
    }
  };

  const getSlotTextStyle = (status, isSelected) => {
    if (isSelected) {
      return { color: '#FFFFFF', fontFamily: 'Poppins-SemiBold', fontSize: 13 };
    }

    switch (status) {
      case 'available':
        return { color: '#166534', fontFamily: 'Poppins-Medium', fontSize: 13 };
      case 'booked':
        return { color: '#991B1B', fontFamily: 'Poppins-Medium', fontSize: 13 };
      default:
        return { color: '#9CA3AF', fontFamily: 'Poppins-Regular', fontSize: 13 };
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-3"
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text
            className="text-lg font-semibold text-gray-900 flex-1"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Book Appointment
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Provider Profile Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
          <View className="flex-row">
            {/* Avatar */}
            <View className="relative">
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 72, height: 72, borderRadius: 16 }}
              />
              {isAvailableNow && !checkingAvailability && (
                <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white items-center justify-center">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
              )}
            </View>

            {/* Info */}
            <View className="flex-1 ml-4">
              <View className="flex-row items-center">
                <Text
                  className="text-lg text-gray-900"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {firstName} {lastName}
                </Text>
                {isVerified && (
                  <View className="ml-2 bg-blue-600 rounded-full p-0.5">
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                  </View>
                )}
              </View>

              {/* Rating */}
              <View className="flex-row items-center mt-1">
                {reviewCount > 0 ? (
                  <>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text
                      className="text-gray-800 ml-1"
                      style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}
                    >
                      {rating.toFixed(1)}
                    </Text>
                    <Text
                      className="text-gray-500 ml-1"
                      style={{ fontFamily: 'Poppins-Regular', fontSize: 13 }}
                    >
                      ({reviewCount} reviews)
                    </Text>
                  </>
                ) : (
                  <Text
                    className="text-gray-500"
                    style={{ fontFamily: 'Poppins-Regular', fontSize: 13 }}
                  >
                    New provider
                  </Text>
                )}
              </View>

              {/* Stats */}
              <View className="flex-row items-center mt-2">
                {completedJobs > 0 && (
                  <View className="flex-row items-center mr-4">
                    <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
                    <Text
                      className="text-gray-600 ml-1"
                      style={{ fontFamily: 'Poppins-Medium', fontSize: 12 }}
                    >
                      {completedJobs} jobs
                    </Text>
                  </View>
                )}
                {checkingAvailability ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : isAvailableNow ? (
                  <View className="bg-green-100 px-2 py-0.5 rounded-full">
                    <Text
                      className="text-green-700"
                      style={{ fontFamily: 'Poppins-Medium', fontSize: 11 }}
                    >
                      Available Now
                    </Text>
                  </View>
                ) : (
                  <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                    <Text
                      className="text-gray-600"
                      style={{ fontFamily: 'Poppins-Medium', fontSize: 11 }}
                    >
                      Schedule Only
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Book Now Section */}
        {isAvailableNow && !checkingAvailability && (
          <View className="mx-4 mt-4">
            <TouchableOpacity
              className="bg-green-600 rounded-2xl p-4 flex-row items-center justify-between"
              activeOpacity={0.8}
              onPress={handleBookNow}
              disabled={submitting}
            >
              <View className="flex-row items-center">
                <View className="bg-white/20 rounded-full p-2 mr-3">
                  <Ionicons name="flash" size={24} color="white" />
                </View>
                <View>
                  <Text
                    className="text-white text-lg"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    Book Now
                  </Text>
                  <Text
                    className="text-white/80 text-xs"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    Start immediately at {getCurrentTime()}
                  </Text>
                </View>
              </View>
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons name="arrow-forward-circle" size={32} color="white" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Schedule Section */}
        <View className="mt-6">
          <View className="px-4 mb-3">
            <Text
              className="text-base text-gray-900"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Schedule for Later
            </Text>
            <Text
              className="text-sm text-gray-500"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Select a date and available time slot
            </Text>
          </View>

          {/* Date Picker Button */}
          <TouchableOpacity
            className="bg-white mx-4 rounded-xl p-4 flex-row items-center justify-between mb-4"
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text
                  className="text-gray-500"
                  style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                >
                  Selected Date
                </Text>
                <Text
                  className="text-gray-900"
                  style={{ fontFamily: 'Poppins-SemiBold', fontSize: 15 }}
                >
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={today}
              maximumDate={maxDate}
              onChange={handleDateChange}
            />
          )}

          {/* Time Slots Legend */}
          <View className="flex-row items-center justify-center px-4 mb-3">
            <View className="flex-row items-center mr-6">
              <View className="w-3 h-3 rounded bg-green-200 mr-2" />
              <Text className="text-xs text-gray-600" style={{ fontFamily: 'Poppins-Regular' }}>
                Available
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded bg-red-200 mr-2" />
              <Text className="text-xs text-gray-600" style={{ fontFamily: 'Poppins-Regular' }}>
                Booked
              </Text>
            </View>
          </View>

          {/* Time Slots Grid */}
          <View className="bg-white mx-4 rounded-2xl p-4">
            {loading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text
                  className="text-gray-500 mt-2"
                  style={{ fontFamily: 'Poppins-Regular', fontSize: 13 }}
                >
                  Loading availability...
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap">
                {TIME_SLOTS.map((slot, index) => {
                  const status = getSlotStatus(slot);
                  const isSelected = selectedSlot?.label === slot.label;
                  const isSelectable = status === 'available';

                  return (
                    <TouchableOpacity
                      key={index}
                      style={getSlotStyle(status, isSelected)}
                      activeOpacity={isSelectable ? 0.7 : 1}
                      onPress={() => handleSlotSelect(slot)}
                      disabled={!isSelectable}
                    >
                      <Text style={getSlotTextStyle(status, isSelected)}>
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* No availability message */}
            {!loading && availableSlots.length === 0 && (
              <View className="py-4 items-center">
                <Ionicons name="calendar-outline" size={32} color="#9CA3AF" />
                <Text
                  className="text-gray-500 mt-2 text-center"
                  style={{ fontFamily: 'Poppins-Regular', fontSize: 13 }}
                >
                  No availability set for this date.{'\n'}
                  Your request will be sent for confirmation.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Selected Time Summary */}
        {selectedSlot && (
          <View className="bg-blue-50 mx-4 mt-4 rounded-xl p-4 flex-row items-center">
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <View className="ml-3 flex-1">
              <Text
                className="text-blue-800"
                style={{ fontFamily: 'Poppins-Medium', fontSize: 14 }}
              >
                Selected Time
              </Text>
              <Text
                className="text-blue-900"
                style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}
              >
                {formatDate(selectedDate)} at {selectedSlot.label}
              </Text>
            </View>
          </View>
        )}

        {/* Info */}
        <View className="bg-gray-100 mx-4 mt-4 rounded-xl p-4 flex-row">
          <Ionicons name="information-circle" size={20} color="#6B7280" />
          <Text
            className="text-xs text-gray-600 ml-3 flex-1"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            The provider will review your request and send a quote. You can discuss scope via chat before accepting.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${
            selectedSlot ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
          onPress={handleScheduleBooking}
          disabled={!selectedSlot || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              className="text-white text-base"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {selectedSlot
                ? `Schedule for ${selectedSlot.label}`
                : 'Select a Time Slot'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProviderCalendarScreen;
