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
  } = booking;

  const displayBookingNumber = bookingNumber || booking_number;
  const displayServiceName = serviceName || service_name || 'Service';
  const displayQuotation = quotationAmount || quotation_amount;
  const displayDate = createdAt || created_at;

  // Handle both nested (pro: {}) and flat (pro_first_name) API response formats
  const proFirstName = pro?.firstName || pro?.first_name || pro_first_name || '';
  const proLastName = pro?.lastName || pro?.last_name || pro_last_name || '';
  const proAvatar = pro?.avatar || pro?.avatarUrl || pro?.avatar_url || pro_avatar;
  const proName = `${proFirstName} ${proLastName}`.trim() || 'Service Provider';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return price.toLocaleString() + ' XAF';
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Waiting for provider response';
      case 'accepted':
        return 'Waiting for quotation';
      case 'quotation_sent':
        return 'Review and pay quotation';
      case 'paid':
        return 'Payment confirmed';
      case 'on_the_way':
        return 'Provider is on the way';
      case 'job_start_requested':
        return 'Confirm job start';
      case 'job_started':
        return 'Job in progress';
      case 'job_complete_requested':
        return 'Confirm job completion';
      case 'completed':
        return 'Job completed';
      case 'cancelled':
        return 'Booking cancelled';
      case 'rejected':
        return 'Booking rejected';
      default:
        return '';
    }
  };

  const needsAction = [
    'quotation_sent',
    'job_start_requested',
    'job_complete_requested',
  ].includes(status);

  return (
    <TouchableOpacity
      className={`bg-white border rounded-xl p-4 mb-3 ${
        needsAction ? 'border-blue-300' : 'border-gray-200'
      }`}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className="text-xs text-gray-500"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          {displayBookingNumber}
        </Text>
        <StatusBadge status={status} size="small" />
      </View>

      {/* Service Name */}
      <Text
        className="text-base font-semibold text-gray-900 mb-2"
        style={{ fontFamily: 'Poppins-SemiBold' }}
      >
        {displayServiceName}
      </Text>

      {/* Provider Info */}
      <View className="flex-row items-center mb-3">
        {proAvatar ? (
          <Image
            source={{ uri: proAvatar }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
        ) : (
          <View
            className="bg-gray-100 items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: 18 }}
          >
            <Ionicons name="person" size={18} color={COLORS.textSecondary} />
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text
            className="text-sm font-medium text-gray-800"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            {proName}
          </Text>
          <Text
            className="text-xs text-gray-500"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {formatDate(displayDate)}
          </Text>
        </View>

        {/* Price if quotation sent */}
        {displayQuotation && (
          <View className="items-end">
            <Text
              className="text-base font-semibold text-gray-900"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {formatPrice(displayQuotation)}
            </Text>
          </View>
        )}
      </View>

      {/* Status Message */}
      <View
        className={`flex-row items-center pt-3 border-t border-gray-100 ${
          needsAction ? 'justify-between' : ''
        }`}
      >
        <Text
          className={`text-xs ${needsAction ? 'text-blue-600' : 'text-gray-500'}`}
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          {getStatusMessage()}
        </Text>

        {needsAction && (
          <View className="flex-row items-center">
            <Text
              className="text-xs text-blue-600 mr-1"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Action Required
            </Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </View>
        )}

        {!needsAction && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.textSecondary}
            style={{ marginLeft: 'auto' }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default BookingCard;
