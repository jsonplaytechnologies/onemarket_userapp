import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { COLORS } from '../../constants/colors';

const BookingCard = ({ booking, onPress }) => {
  const {
    id,
    bookingNumber,
    booking_number,
    status,
    serviceName,
    service_name,
    quotationAmount,
    quotation_amount,
    createdAt,
    created_at,
    pro,
    // Flat API response fields
    pro_first_name,
    pro_last_name,
    pro_avatar,
    // Review status
    has_review,
    hasReview,
  } = booking;

  const displayBookingNumber = bookingNumber || booking_number;
  const displayServiceName = serviceName || service_name || 'Service';
  const displayQuotation = quotationAmount || quotation_amount;
  const displayDate = createdAt || created_at;

  // Handle both nested (pro: {}) and flat (pro_first_name) API response formats
  const proFirstName = pro?.firstName || pro?.first_name || pro_first_name || '';
  const proLastName = pro?.lastName || pro?.last_name || pro_last_name || '';
  const proAvatar = pro?.avatar || pro?.avatarUrl || pro?.avatar_url || pro_avatar;
  const proName = `${proFirstName} ${proLastName}`.trim() || 'Provider';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return price.toLocaleString() + ' XAF';
  };

  const needsAction = [
    'quotation_sent',
    'job_start_requested',
    'job_complete_requested',
  ].includes(status);

  // Check if completed but not reviewed
  const isReviewed = has_review || hasReview;
  const needsReview = status === 'completed' && !isReviewed;

  return (
    <TouchableOpacity
      className={`bg-white rounded-2xl p-4 mb-3 ${
        needsAction ? 'border-2 border-primary' : 'border border-gray-100'
      }`}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Top Row */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text
            className="text-base text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
            numberOfLines={1}
          >
            {displayServiceName}
          </Text>
          <Text
            className="text-xs text-gray-400 mt-0.5"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {displayBookingNumber}
          </Text>
        </View>
        <StatusBadge status={status} size="small" />
      </View>

      {/* Provider Row */}
      <View className="flex-row items-center">
        {proAvatar ? (
          <Image
            source={{ uri: proAvatar }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <View
            className="bg-gray-100 items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: 20 }}
          >
            <Text
              className="text-primary text-sm"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              {proFirstName.charAt(0).toUpperCase()}{proLastName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text
            className="text-sm text-gray-800"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            {proName}
          </Text>
          <Text
            className="text-xs text-gray-400"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {formatDate(displayDate)}
          </Text>
        </View>

        {/* Price */}
        {displayQuotation ? (
          <Text
            className="text-base text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            {formatPrice(displayQuotation)}
          </Text>
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        )}
      </View>

      {/* Action Indicator */}
      {needsAction && (
        <View className="flex-row items-center justify-center mt-3 pt-3 border-t border-gray-100">
          <View className="w-2 h-2 bg-primary rounded-full mr-2" />
          <Text
            className="text-xs text-primary"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            Action Required
          </Text>
        </View>
      )}

      {/* Review Reminder */}
      {needsReview && (
        <View className="flex-row items-center justify-center mt-3 pt-3 border-t border-gray-100 bg-amber-50 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
          <Ionicons name="star-outline" size={14} color="#F59E0B" />
          <Text
            className="text-xs text-amber-600 ml-1.5"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            Rate your experience with {proFirstName || 'the provider'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default BookingCard;
