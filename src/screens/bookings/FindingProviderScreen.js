import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { useBookingSocket } from '../../hooks/useSocket';

// Statuses that indicate we're still finding a provider
const FINDING_STATUSES = ['pending_assignment', 'waiting_approval'];

// Statuses that indicate we found a provider and should move to details
const FOUND_STATUSES = ['waiting_quote', 'waiting_acceptance', 'accepted', 'paid', 'on_the_way', 'job_started', 'job_start_requested', 'job_complete_requested', 'completed'];

const FindingProviderScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const insets = useSafeAreaInsets();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guard against multiple navigations from socket and polling race condition
  const hasNavigatedRef = useRef(false);

  const { isConnected, bookingStatus, on, off } = useBookingSocket(bookingId);

  useFocusEffect(
    useCallback(() => {
      fetchBookingDetails();

      // Set up polling as fallback
      const pollInterval = setInterval(() => {
        fetchBookingDetails();
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(pollInterval);
    }, [bookingId])
  );

  // Listen for socket updates
  useEffect(() => {
    if (isConnected) {
      const handleReassignment = (data) => {
        if (data.bookingId === bookingId) {
          fetchBookingDetails();
        }
      };

      const handleStatusChange = (data) => {
        if (data.bookingId === bookingId) {
          // If status is no longer finding, navigate to booking details
          if (FOUND_STATUSES.includes(data.status) && !hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            navigation.replace('BookingDetails', { bookingId });
          } else if (data.status === 'failed' || data.status === 'cancelled') {
            fetchBookingDetails(); // Refresh to show failed state
          }
        }
      };

      const handleProviderAssigned = (data) => {
        if (data.bookingId === bookingId && !hasNavigatedRef.current) {
          // Provider was assigned, navigate to details
          hasNavigatedRef.current = true;
          navigation.replace('BookingDetails', { bookingId });
        }
      };

      on('reassignment', handleReassignment);
      on('booking-status-changed', handleStatusChange);
      on('provider-assigned', handleProviderAssigned);

      return () => {
        off('reassignment');
        off('booking-status-changed');
        off('provider-assigned');
      };
    }
  }, [isConnected, bookingId]);

  // Update booking when socket sends status change
  useEffect(() => {
    if (bookingStatus && bookingStatus.bookingId === bookingId) {
      if (FOUND_STATUSES.includes(bookingStatus.status) && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigation.replace('BookingDetails', { bookingId });
      } else if (!hasNavigatedRef.current) {
        setBooking((prev) => ({
          ...prev,
          ...bookingStatus,
        }));
      }
    }
  }, [bookingStatus]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.BOOKING_DETAILS(bookingId));
      if (response.success && response.data) {
        setBooking(response.data);

        // If booking status indicates provider was found, navigate to details
        if (FOUND_STATUSES.includes(response.data.status) && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigation.replace('BookingDetails', { bookingId });
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.post(API_ENDPOINTS.BOOKING_CANCEL(bookingId), {
                reason: 'Cancelled by user while finding provider',
              });
              navigation.replace('MainTabs', { screen: 'Bookings' });
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  // Use assignment_count from booking (no separate API call needed)
  const assignmentCount = booking?.assignment_count || 1;
  const maxAttempts = 5;
  const isFailed = booking?.status === 'failed';
  const isCancelled = booking?.status === 'cancelled';

  if (loading && !booking) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4">
        <Text
          className="text-xl font-semibold text-gray-900 text-center"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          {isFailed || isCancelled ? 'Booking Failed' : 'Finding Provider'}
        </Text>
        <Text
          className="text-sm text-gray-500 text-center mt-1"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          {isFailed || isCancelled
            ? 'Unable to find an available provider'
            : 'We\'re searching for the best provider for you'}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {isFailed || isCancelled ? (
          <>
            {/* Failed State */}
            <View className="bg-red-50 rounded-full p-6 mb-6">
              <Ionicons name="close-circle" size={64} color="#DC2626" />
            </View>

            <Text
              className="text-xl font-semibold text-gray-900 text-center mb-2"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              No Providers Available
            </Text>

            <Text
              className="text-sm text-gray-600 text-center mb-8 px-4"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {booking?.failure_reason || booking?.auto_cancelled_reason ||
                `We tried ${maxAttempts} providers but none were available at this time. Please try again or select a provider manually.`}
            </Text>

            <TouchableOpacity
              className="bg-blue-600 py-4 px-8 rounded-xl mb-3 w-full"
              activeOpacity={0.8}
              onPress={() => {
                // Navigate back to home to start fresh
                navigation.replace('MainTabs', { screen: 'Home' });
              }}
            >
              <Text
                className="text-white text-base font-semibold text-center"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 px-6"
              activeOpacity={0.7}
              onPress={() => navigation.replace('MainTabs', { screen: 'Bookings' })}
            >
              <Text
                className="text-gray-500 text-sm"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                View My Bookings
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Finding State */}
            <View className="bg-blue-50 rounded-full p-6 mb-6">
              <ActivityIndicator size={64} color={COLORS.primary} />
            </View>

            <Text
              className="text-xl font-semibold text-gray-900 text-center mb-2"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Finding the Best Provider
            </Text>

            <Text
              className="text-sm text-gray-600 text-center mb-8"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Please wait while we match you with the best available provider
            </Text>

            {/* Progress */}
            <View className="bg-white rounded-xl p-6 w-full mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-sm text-gray-600"
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  Attempt {assignmentCount} of {maxAttempts}
                </Text>
                <Text
                  className="text-sm font-semibold text-blue-600"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {Math.round((assignmentCount / maxAttempts) * 100)}%
                </Text>
              </View>

              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(assignmentCount / maxAttempts) * 100}%` }}
                />
              </View>
            </View>

            {/* Status Info */}
            <View className="bg-blue-50 rounded-xl p-4 w-full mb-6 flex-row">
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text
                className="text-xs text-gray-700 ml-3 flex-1"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Each provider has 15 minutes to respond. We'll automatically try the next best provider if there's no response.
              </Text>
            </View>

            {/* Cancel Action */}
            <TouchableOpacity
              className="py-3 px-6"
              activeOpacity={0.7}
              onPress={handleCancel}
            >
              <Text
                className="text-gray-500 text-sm"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Cancel Request
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default FindingProviderScreen;
