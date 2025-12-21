import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const ReviewScreen = ({ route, navigation }) => {
  const { bookingId, booking } = route.params;
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiService.post(API_ENDPOINTS.REVIEWS, {
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (response.success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const proFirstName = booking?.pro?.firstName || booking?.pro?.first_name || '';
  const proLastName = booking?.pro?.lastName || booking?.pro?.last_name || '';
  const proAvatar = booking?.pro?.avatar || booking?.pro?.avatarUrl || booking?.pro?.avatar_url;
  const proName = `${proFirstName} ${proLastName}`.trim() || 'Service Provider';
  const serviceName = booking?.serviceName || booking?.service_name || 'Service';

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4 flex-row items-center">
          <TouchableOpacity
            className="mr-4"
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Review
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-green-100 rounded-full p-6 mb-6">
            <Ionicons name="checkmark-circle" size={64} color="#15803D" />
          </View>

          <Text
            className="text-2xl font-bold text-gray-900 text-center"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            Thank You!
          </Text>

          <Text
            className="text-base text-gray-500 text-center mt-3"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Your review has been submitted successfully. It helps {proName} and other users.
          </Text>

          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-xl items-center w-full mt-8"
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BookingDetails', { bookingId })}
          >
            <Text
              className="text-white text-base font-semibold"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Back to Booking
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity
          className="mr-4"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text
          className="text-xl font-semibold text-gray-900"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          Leave a Review
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Provider Info */}
        <View className="bg-white px-6 py-6 items-center border-b border-gray-200">
          {proAvatar ? (
            <Image
              source={{ uri: proAvatar }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          ) : (
            <View
              className="bg-gray-100 items-center justify-center"
              style={{ width: 80, height: 80, borderRadius: 40 }}
            >
              <Ionicons name="person" size={40} color={COLORS.textSecondary} />
            </View>
          )}

          <Text
            className="text-xl font-semibold text-gray-900 mt-4"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            {proName}
          </Text>

          <Text
            className="text-sm text-gray-500"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {serviceName}
          </Text>
        </View>

        {/* Rating Section */}
        <View className="bg-white px-6 py-6 mt-3 border-b border-gray-200">
          <Text
            className="text-base font-semibold text-gray-900 text-center mb-4"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            How was your experience?
          </Text>

          {/* Star Rating */}
          <View className="flex-row justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                activeOpacity={0.7}
                onPress={() => setRating(star)}
                className="mx-2"
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating Label */}
          {rating > 0 && (
            <Text
              className="text-lg font-medium text-center"
              style={{
                fontFamily: 'Poppins-Medium',
                color: rating >= 4 ? '#15803D' : rating >= 3 ? '#B45309' : '#B91C1C',
              }}
            >
              {ratingLabels[rating]}
            </Text>
          )}
        </View>

        {/* Comment Section */}
        <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
          <Text
            className="text-base font-semibold text-gray-900 mb-3"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Share your feedback (optional)
          </Text>

          <TextInput
            className="border border-gray-200 rounded-xl p-4 text-gray-900 min-h-[120px]"
            style={{ fontFamily: 'Poppins-Regular', textAlignVertical: 'top' }}
            placeholder="Tell others about your experience..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={5}
          />

          <Text
            className="text-xs text-gray-500 mt-2"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Your review will be public and help others make decisions
          </Text>
        </View>

        {/* Tips */}
        <View className="px-6 py-4">
          <Text
            className="text-sm font-medium text-gray-700 mb-2"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            Tips for a helpful review:
          </Text>
          <View className="flex-row items-start mb-1">
            <Ionicons name="checkmark" size={16} color={COLORS.success} style={{ marginTop: 2 }} />
            <Text
              className="text-sm text-gray-600 ml-2 flex-1"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Describe the quality of work performed
            </Text>
          </View>
          <View className="flex-row items-start mb-1">
            <Ionicons name="checkmark" size={16} color={COLORS.success} style={{ marginTop: 2 }} />
            <Text
              className="text-sm text-gray-600 ml-2 flex-1"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Mention punctuality and professionalism
            </Text>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="checkmark" size={16} color={COLORS.success} style={{ marginTop: 2 }} />
            <Text
              className="text-sm text-gray-600 ml-2 flex-1"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Be specific about what you liked or disliked
            </Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${
            rating > 0 && !submitting ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              className="text-white text-base font-semibold"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Submit Review
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ReviewScreen;
