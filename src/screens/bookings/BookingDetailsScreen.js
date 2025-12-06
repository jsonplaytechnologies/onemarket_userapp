import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { StatusBadge, StatusTimeline } from '../../components/bookings';
import { useBookingSocket } from '../../hooks/useSocket';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;

  const [booking, setBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { isConnected, bookingStatus, notifications, on, off } = useBookingSocket(bookingId);

  // Listen for job start request
  useEffect(() => {
    if (isConnected) {
      const handleJobStartRequest = (data) => {
        if (data.bookingId === bookingId) {
          // Refresh booking to get new status
          fetchBookingDetails();
          // Show alert to user
          Alert.alert(
            'Job Start Request',
            'The service provider has arrived and is ready to start. Please confirm to begin the job.',
            [
              { text: 'Not Yet', style: 'cancel' },
              {
                text: 'Confirm Start',
                onPress: handleConfirmStart,
              },
            ]
          );
        }
      };

      const handleJobCompleteRequest = (data) => {
        if (data.bookingId === bookingId) {
          // Refresh booking to get new status
          fetchBookingDetails();
          // Show alert to user
          Alert.alert(
            'Job Completion Request',
            'The service provider has marked the job as complete. Are you satisfied with the work?',
            [
              { text: 'Not Yet', style: 'cancel' },
              {
                text: 'Confirm Complete',
                onPress: handleConfirmComplete,
              },
            ]
          );
        }
      };

      on('job-start-request', handleJobStartRequest);
      on('job-complete-request', handleJobCompleteRequest);

      return () => {
        off('job-start-request');
        off('job-complete-request');
      };
    }
  }, [isConnected, bookingId]);

  useFocusEffect(
    useCallback(() => {
      fetchBookingDetails();
      fetchBookingHistory();
    }, [bookingId])
  );

  // Update booking when socket sends status change
  useEffect(() => {
    if (bookingStatus && bookingStatus.bookingId === bookingId) {
      setBooking((prev) => ({
        ...prev,
        status: bookingStatus.status,
        ...bookingStatus,
      }));
      fetchBookingHistory();
    }
  }, [bookingStatus]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.BOOKING_DETAILS(bookingId));
      if (response.success && response.data) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.BOOKING_HISTORY(bookingId));
      if (response.success && response.data) {
        // API returns { data: { history: [] } }
        const historyData = response.data.history || response.data || [];
        setHistory(Array.isArray(historyData) ? historyData : []);
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      setHistory([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBookingDetails(), fetchBookingHistory()]);
    setRefreshing(false);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiService.post(API_ENDPOINTS.BOOKING_CANCEL(bookingId), {
                reason: 'Cancelled by user',
              });
              fetchBookingDetails();
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to cancel booking');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmStart = async () => {
    Alert.alert(
      'Confirm Job Start',
      'Has the service provider arrived and ready to start?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Start Job',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiService.patch(API_ENDPOINTS.BOOKING_CONFIRM_START(bookingId));
              fetchBookingDetails();
              Alert.alert('Success', 'Job started');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to confirm start');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmComplete = async () => {
    Alert.alert(
      'Confirm Job Completion',
      'Are you satisfied with the work and ready to mark it complete?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiService.patch(API_ENDPOINTS.BOOKING_CONFIRM_COMPLETE(bookingId));
              fetchBookingDetails();
              Alert.alert('Success', 'Job completed! Would you like to leave a review?', [
                { text: 'Later', style: 'cancel' },
                {
                  text: 'Leave Review',
                  onPress: () => navigation.navigate('Review', { bookingId, booking }),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to confirm completion');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCallPro = () => {
    const phone = booking?.pro?.phone || booking?.user_phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleOpenChat = () => {
    navigation.navigate('Chat', { bookingId, booking });
  };

  const handlePayment = () => {
    navigation.navigate('Payment', { bookingId, booking });
  };

  const handleLeaveReview = () => {
    navigation.navigate('Review', { bookingId, booking });
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString() + ' XAF' : '-';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancel = ['pending', 'accepted', 'quotation_sent'].includes(booking?.status);
  const canPay = booking?.status === 'quotation_sent';
  const canConfirmStart = booking?.status === 'job_start_requested';
  const canConfirmComplete = booking?.status === 'job_complete_requested';
  const hasReview = booking?.has_review || booking?.hasReview;
  const canReview = booking?.status === 'completed' && !hasReview;
  // Chat available after pro accepts and before completion
  const canChat = ['accepted', 'quotation_sent', 'paid', 'on_the_way', 'job_start_requested', 'job_started', 'job_complete_requested'].includes(booking?.status);
  // Call only available AFTER payment and BEFORE job completion
  const canCall = ['paid', 'on_the_way', 'job_start_requested', 'job_started', 'job_complete_requested'].includes(booking?.status);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
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
            Booking Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 bg-gray-50">
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
            Booking Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
          <Text
            className="text-gray-500 text-center mt-4"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Booking not found
          </Text>
        </View>
      </View>
    );
  }

  // Handle both nested (pro: {}) and flat (pro_first_name) API response formats
  const proFirstName = booking.pro?.firstName || booking.pro?.first_name || booking.pro_first_name || '';
  const proLastName = booking.pro?.lastName || booking.pro?.last_name || booking.pro_last_name || '';
  const proAvatar = booking.pro?.avatar || booking.pro?.avatarUrl || booking.pro?.avatar_url || booking.pro_avatar;
  const proRating = booking.pro?.rating || booking.pro?.averageRating || booking.pro_rating || 0;
  const proPhone = booking.pro?.phone || booking.user_phone;
  const serviceName = booking.serviceName || booking.service_name || 'Service';
  const categoryName = booking.categoryName || booking.category_name;
  const quotationAmount = booking.quotationAmount || booking.quotation_amount;
  const bookingNumber = booking.bookingNumber || booking.booking_number;

  // Handle both nested (address: {}) and flat (address_line) API response formats
  const address = booking.address || {
    addressLine: booking.address_line,
    zoneName: booking.zone_name,
    subZoneName: booking.sub_zone_name,
    latitude: booking.user_lat,
    longitude: booking.user_lng,
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
            Booking Details
          </Text>
          <Text
            className="text-xs text-gray-500"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {bookingNumber}
          </Text>
        </View>
        <StatusBadge status={booking.status} size="medium" />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Action Required Banner */}
        {(canPay || canConfirmStart || canConfirmComplete) && (
          <View className="bg-blue-50 px-6 py-3 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color={COLORS.primary} />
            <Text
              className="text-sm text-blue-700 ml-2 flex-1"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              {canPay && 'Payment required to proceed'}
              {canConfirmStart && 'Confirm job start'}
              {canConfirmComplete && 'Confirm job completion'}
            </Text>
          </View>
        )}

        {/* Rejection Reason Banner */}
        {booking?.status === 'rejected' && (
          <View className="bg-red-50 px-6 py-4 flex-row items-start">
            <Ionicons name="close-circle" size={20} color="#DC2626" style={{ marginTop: 2 }} />
            <View className="ml-3 flex-1">
              <Text
                className="text-sm font-medium text-red-700"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Booking Rejected
              </Text>
              {(booking.rejection_reason || booking.rejectionReason) && (
                <Text
                  className="text-sm text-red-600 mt-1"
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  Reason: {booking.rejection_reason || booking.rejectionReason}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Cancellation Reason Banner */}
        {booking?.status === 'cancelled' && (
          <View className="bg-gray-100 px-6 py-4 flex-row items-start">
            <Ionicons name="ban" size={20} color="#6B7280" style={{ marginTop: 2 }} />
            <View className="ml-3 flex-1">
              <Text
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Booking Cancelled
              </Text>
              {(booking.cancellation_reason || booking.cancellationReason) && (
                <Text
                  className="text-sm text-gray-600 mt-1"
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  Reason: {booking.cancellation_reason || booking.cancellationReason}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Service Info */}
        <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
          <Text
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            {serviceName}
          </Text>
          {categoryName && (
            <Text
              className="text-sm text-gray-500"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {categoryName}
            </Text>
          )}
        </View>

        {/* Provider Info */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-sm font-medium text-gray-500"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              SERVICE PROVIDER
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ProProfile', {
                proId: booking.pro_id || booking.proId || booking.pro?.id,
                serviceName: serviceName
              })}
            >
              <Text
                className="text-sm text-blue-600"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                View Profile
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="flex-row items-center"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ProProfile', {
              proId: booking.pro_id || booking.proId || booking.pro?.id,
              serviceName: serviceName
            })}
          >
            {proAvatar ? (
              <Image
                source={{ uri: proAvatar }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
              />
            ) : (
              <View
                className="bg-blue-50 items-center justify-center"
                style={{ width: 56, height: 56, borderRadius: 28 }}
              >
                <Ionicons name="person" size={28} color={COLORS.primary} />
              </View>
            )}

            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {proFirstName} {proLastName}
                </Text>
                {booking.pro_is_verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.primary}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>

              {proRating > 0 && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text
                    className="text-sm text-gray-600 ml-1"
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    {parseFloat(proRating).toFixed(1)}
                  </Text>
                  <Text
                    className="text-xs text-gray-400 ml-1"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    rating
                  </Text>
                </View>
              )}

              <View className="flex-row items-center mt-1">
                <Ionicons name="briefcase-outline" size={12} color={COLORS.textSecondary} />
                <Text
                  className="text-xs text-gray-500 ml-1"
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  {serviceName}
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Contact Buttons */}
          {(canChat || canCall) && (
            <View className="flex-row mt-4 pt-3 border-t border-gray-100">
              {canChat && (
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center bg-blue-50 rounded-xl py-3 ${canCall ? 'mr-2' : ''}`}
                  activeOpacity={0.7}
                  onPress={handleOpenChat}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
                  <Text
                    className="text-sm text-blue-600 ml-2"
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    Message
                  </Text>
                </TouchableOpacity>
              )}

              {canCall && proPhone && (
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center bg-green-50 rounded-xl py-3 ${canChat ? 'ml-2' : ''}`}
                  activeOpacity={0.7}
                  onPress={handleCallPro}
                >
                  <Ionicons name="call-outline" size={18} color="#15803D" />
                  <Text
                    className="text-sm text-green-700 ml-2"
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    Call
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Quotation/Price Section */}
        {quotationAmount && (
          <View className="bg-white px-6 py-4 border-b border-gray-200">
            <Text
              className="text-sm font-medium text-gray-500 mb-2"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              QUOTATION
            </Text>

            <View className="flex-row items-center justify-between">
              <Text
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                {formatPrice(quotationAmount)}
              </Text>

              {canPay && (
                <TouchableOpacity
                  className="bg-blue-600 px-6 py-3 rounded-xl"
                  activeOpacity={0.8}
                  onPress={handlePayment}
                >
                  <Text
                    className="text-white font-semibold"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    Pay Now
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {booking.commissionPercentage && (
              <Text
                className="text-xs text-gray-500 mt-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Includes {booking.commissionPercentage}% platform fee
              </Text>
            )}
          </View>
        )}

        {/* Address Section */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text
            className="text-sm font-medium text-gray-500 mb-2"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            SERVICE LOCATION
          </Text>

          <View className="flex-row items-start">
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <View className="ml-2 flex-1">
              <Text
                className="text-base text-gray-900"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {address.addressLine || address.address_line || 'Address not available'}
              </Text>
              {(address.zoneName || address.zone_name) && (
                <Text
                  className="text-sm text-gray-500"
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  {address.zoneName || address.zone_name}
                  {address.subZoneName || address.sub_zone_name
                    ? `, ${address.subZoneName || address.sub_zone_name}`
                    : ''}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* User Note */}
        {booking.userNote && (
          <View className="bg-white px-6 py-4 border-b border-gray-200">
            <Text
              className="text-sm font-medium text-gray-500 mb-2"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              YOUR NOTE
            </Text>
            <Text
              className="text-base text-gray-700"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {booking.userNote}
            </Text>
          </View>
        )}

        {/* Your Review Section */}
        {hasReview && (
          <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
            <Text
              className="text-sm font-medium text-gray-500 mb-3"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              YOUR REVIEW
            </Text>

            {/* Star Rating */}
            <View className="flex-row items-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= (booking.review_rating || 0) ? 'star' : 'star-outline'}
                  size={20}
                  color="#F59E0B"
                  style={{ marginRight: 2 }}
                />
              ))}
              <Text
                className="text-sm text-gray-600 ml-2"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {booking.review_rating}/5
              </Text>
            </View>

            {/* Review Comment */}
            {booking.review_comment && (
              <Text
                className="text-base text-gray-700"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                "{booking.review_comment}"
              </Text>
            )}

            {/* Review Date */}
            {booking.review_created_at && (
              <Text
                className="text-xs text-gray-400 mt-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Reviewed on {new Date(booking.review_created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            )}
          </View>
        )}

        {/* Timeline Section */}
        <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
          <Text
            className="text-sm font-medium text-gray-500 mb-3"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            STATUS TIMELINE
          </Text>
          <StatusTimeline currentStatus={booking.status} history={history} />
        </View>

        {/* Booking Info */}
        <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
          <Text
            className="text-sm font-medium text-gray-500 mb-3"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            BOOKING INFO
          </Text>

          <View className="flex-row justify-between py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins-Regular' }}>
              Booking Number
            </Text>
            <Text className="text-sm text-gray-900" style={{ fontFamily: 'Poppins-Medium' }}>
              {bookingNumber}
            </Text>
          </View>

          <View className="flex-row justify-between py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins-Regular' }}>
              Created
            </Text>
            <Text className="text-sm text-gray-900" style={{ fontFamily: 'Poppins-Medium' }}>
              {formatDate(booking.createdAt || booking.created_at)}
            </Text>
          </View>

          {booking.paidAt && (
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins-Regular' }}>
                Paid At
              </Text>
              <Text className="text-sm text-gray-900" style={{ fontFamily: 'Poppins-Medium' }}>
                {formatDate(booking.paidAt)}
              </Text>
            </View>
          )}

          {booking.completedAt && (
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins-Regular' }}>
                Completed At
              </Text>
              <Text className="text-sm text-gray-900" style={{ fontFamily: 'Poppins-Medium' }}>
                {formatDate(booking.completedAt)}
              </Text>
            </View>
          )}
        </View>

        {/* Spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        {actionLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <>
            {/* Confirm Start Button */}
            {canConfirmStart && (
              <TouchableOpacity
                className="bg-blue-600 py-4 rounded-xl items-center mb-2"
                activeOpacity={0.8}
                onPress={handleConfirmStart}
              >
                <Text
                  className="text-white text-base font-semibold"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Confirm Job Start
                </Text>
              </TouchableOpacity>
            )}

            {/* Confirm Complete Button */}
            {canConfirmComplete && (
              <TouchableOpacity
                className="bg-green-600 py-4 rounded-xl items-center mb-2"
                activeOpacity={0.8}
                onPress={handleConfirmComplete}
              >
                <Text
                  className="text-white text-base font-semibold"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Confirm Job Complete
                </Text>
              </TouchableOpacity>
            )}

            {/* Pay Button */}
            {canPay && (
              <TouchableOpacity
                className="bg-blue-600 py-4 rounded-xl items-center mb-2"
                activeOpacity={0.8}
                onPress={handlePayment}
              >
                <Text
                  className="text-white text-base font-semibold"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Pay {formatPrice(quotationAmount)}
                </Text>
              </TouchableOpacity>
            )}

            {/* Leave Review Button */}
            {canReview && (
              <TouchableOpacity
                className="bg-blue-600 py-4 rounded-xl items-center mb-2"
                activeOpacity={0.8}
                onPress={handleLeaveReview}
              >
                <Text
                  className="text-white text-base font-semibold"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Leave a Review
                </Text>
              </TouchableOpacity>
            )}

            {/* Cancel Button */}
            {canCancel && (
              <TouchableOpacity
                className="border border-red-500 py-4 rounded-xl items-center"
                activeOpacity={0.8}
                onPress={handleCancel}
              >
                <Text
                  className="text-red-500 text-base font-semibold"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Cancel Booking
                </Text>
              </TouchableOpacity>
            )}

            {/* No bottom action needed - show nothing when no primary actions */}
            {!canCancel && !canPay && !canConfirmStart && !canConfirmComplete && !canReview && (
              <View className="items-center py-2">
                {booking?.status === 'completed' && hasReview ? (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text
                      className="text-green-600 text-sm ml-2"
                      style={{ fontFamily: 'Poppins-Medium' }}
                    >
                      Completed & Reviewed
                    </Text>
                  </View>
                ) : (
                  <Text
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    {booking?.status === 'pending' && 'Waiting for provider response...'}
                    {booking?.status === 'completed' && 'Booking completed'}
                    {['paid', 'on_the_way', 'job_started'].includes(booking?.status) && 'Job in progress'}
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default BookingDetailsScreen;
