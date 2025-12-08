import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { getRandomProAvatar } from '../../constants/images';

const { width } = Dimensions.get('window');

const ProProfileScreen = ({ route, navigation }) => {
  const { proId, serviceName } = route.params;
  const insets = useSafeAreaInsets();
  const [pro, setPro] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [proId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, reviewsRes] = await Promise.all([
        apiService.get(API_ENDPOINTS.PRO_PROFILE(proId)),
        apiService.get(API_ENDPOINTS.PRO_REVIEWS(proId)).catch(() => ({ data: [] })),
      ]);

      if (profileRes.success && profileRes.data) {
        setPro(profileRes.data);
      }

      if (reviewsRes.data) {
        const reviewsList = Array.isArray(reviewsRes.data) ? reviewsRes.data : reviewsRes.data.reviews || [];
        setReviews(reviewsList.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching pro profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const formatPrice = (price) => {
    return price ? parseFloat(price).toLocaleString() + ' XAF' : 'Contact for price';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!pro) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-4 pt-14 pb-4 flex-row items-center">
          <TouchableOpacity
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person-outline" size={36} color="#9CA3AF" />
          </View>
          <Text
            className="text-lg text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Provider Not Found
          </Text>
        </View>
      </View>
    );
  }

  const firstName = pro.first_name || pro.firstName || '';
  const lastName = pro.last_name || pro.lastName || '';
  const avatarUrl = pro.avatar_url || pro.avatarUrl || getRandomProAvatar(proId?.charCodeAt(0) || 0);
  const bio = pro.bio || '';
  const experienceYears = pro.experience_years || pro.experienceYears || 0;
  const rating = parseFloat(pro.average_rating || pro.averageRating || 0);
  const totalReviews = pro.total_reviews || pro.totalReviews || 0;
  const completedBookings = pro.completed_bookings || pro.completedBookings || 0;
  const isVerified = pro.is_id_verified || pro.isIdVerified || pro.isVerified || false;
  const services = pro.services || [];
  const zones = pro.zones || [];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Hero Section */}
        <View className="bg-white pb-6">
          {/* Header with back button */}
          <View className="px-4 pt-14 pb-4 flex-row items-center justify-between">
            <TouchableOpacity
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View className="items-center px-6">
            {/* Avatar */}
            <View className="relative">
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 100, height: 100, borderRadius: 32 }}
              />
              {isVerified && (
                <View className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                </View>
              )}
            </View>

            {/* Name */}
            <Text
              className="text-2xl text-gray-900 mt-4"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              {firstName} {lastName}
            </Text>


            {/* Bio */}
            {bio && (
              <Text
                className="text-sm text-gray-500 text-center mt-3 px-4"
                style={{ fontFamily: 'Poppins-Regular' }}
                numberOfLines={3}
              >
                {bio}
              </Text>
            )}
          </View>

          {/* Stats */}
          <View className="flex-row justify-center mt-6 px-6">
            <View className="items-center flex-1">
              <View className="flex-row items-center">
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text
                  className="text-xl text-gray-900 ml-1"
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  {rating.toFixed(1)}
                </Text>
              </View>
              <Text
                className="text-xs text-gray-400 mt-1"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {totalReviews} reviews
              </Text>
            </View>

            <View className="w-px bg-gray-200 mx-4" />

            <View className="items-center flex-1">
              <Text
                className="text-xl text-gray-900"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                {completedBookings}
              </Text>
              <Text
                className="text-xs text-gray-400 mt-1"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Jobs Done
              </Text>
            </View>

            <View className="w-px bg-gray-200 mx-4" />

            <View className="items-center flex-1">
              <Text
                className="text-xl text-gray-900"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                {experienceYears}+
              </Text>
              <Text
                className="text-xs text-gray-400 mt-1"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Years Exp.
              </Text>
            </View>
          </View>
        </View>

        {/* Services Section */}
        <View className="bg-white mt-3 px-4 py-5">
          <Text
            className="text-base text-gray-900 mb-4"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Services & Pricing
          </Text>

          {services.length === 0 ? (
            <Text
              className="text-gray-400"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              No services listed
            </Text>
          ) : (
            services.map((service, index) => {
              const serviceId = service.service_id || service.serviceId || service.id;
              const svcName = service.service_name || service.serviceName || service.name;
              const price = service.price || service.customPrice || service.basePrice;
              const isAvailable = service.is_available !== false;

              return (
                <View
                  key={serviceId || index}
                  className={`flex-row items-center justify-between py-4 ${
                    index < services.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="construct-outline" size={18} color={COLORS.primary} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm text-gray-900"
                        style={{ fontFamily: 'Poppins-Medium' }}
                      >
                        {svcName}
                      </Text>
                      {!isAvailable && (
                        <Text
                          className="text-xs text-red-500"
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          Currently unavailable
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text
                    className="text-sm text-primary"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    {formatPrice(price)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Service Areas */}
        {zones.length > 0 && (
          <View className="bg-white mt-3 px-4 py-5">
            <Text
              className="text-base text-gray-900 mb-3"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Service Areas
            </Text>

            <View className="flex-row flex-wrap">
              {zones.map((zone, index) => {
                const zoneName = zone.zone_name || zone.zoneName || zone.name;
                return (
                  <View
                    key={index}
                    className="flex-row items-center bg-gray-100 rounded-full px-3 py-2 mr-2 mb-2"
                  >
                    <Ionicons name="location" size={14} color={COLORS.primary} />
                    <Text
                      className="text-xs text-gray-700 ml-1"
                      style={{ fontFamily: 'Poppins-Medium' }}
                    >
                      {zoneName}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View className="bg-white mt-3 px-4 py-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-base text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Reviews
              </Text>
              {totalReviews > 5 && (
                <TouchableOpacity activeOpacity={0.7}>
                  <Text
                    className="text-sm text-primary"
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    See All ({totalReviews})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {reviews.map((review, index) => {
              const reviewerName = review.user_name || review.userName ||
                `${review.user?.first_name || ''} ${review.user?.last_name || ''}`.trim() || 'Customer';
              const reviewRating = review.rating || 5;
              const reviewText = review.comment || review.review || '';
              const reviewDate = review.created_at || review.createdAt;

              return (
                <View
                  key={review.id || index}
                  className={`py-4 ${index < reviews.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="flex-row items-start">
                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                      <Text
                        className="text-primary text-sm"
                        style={{ fontFamily: 'Poppins-Bold' }}
                      >
                        {reviewerName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-sm text-gray-900"
                          style={{ fontFamily: 'Poppins-Medium' }}
                        >
                          {reviewerName}
                        </Text>
                        <Text
                          className="text-xs text-gray-400"
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          {formatDate(reviewDate)}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= reviewRating ? 'star' : 'star-outline'}
                            size={12}
                            color="#F59E0B"
                          />
                        ))}
                      </View>
                      {reviewText && (
                        <Text
                          className="text-sm text-gray-500 mt-2"
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          {reviewText}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-4"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center">
          {/* Book Now Button */}
          <TouchableOpacity
            className="flex-1 bg-primary h-14 rounded-2xl items-center justify-center"
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('CreateBooking', {
                proId: pro.id,
                proName: `${firstName} ${lastName}`,
                serviceName,
                services,
              });
            }}
          >
            <Text
              className="text-white text-base"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProProfileScreen;
