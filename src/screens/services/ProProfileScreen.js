import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const ProProfileScreen = ({ route, navigation }) => {
  const { proId, serviceName } = route.params;
  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProProfile();
  }, [proId]);

  const fetchProProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.PRO_PROFILE(proId));
      if (response.success && response.data) {
        setPro(response.data);
      }
    } catch (error) {
      console.error('Error fetching pro profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProProfile();
    setRefreshing(false);
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString() + ' XAF' : 'Contact for price';
  };

  if (loading) {
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
            Provider Profile
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (!pro) {
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
            Provider Profile
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="person-outline" size={64} color={COLORS.textSecondary} />
          <Text
            className="text-gray-500 text-center mt-4"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Provider not found
          </Text>
        </View>
      </View>
    );
  }

  const firstName = pro.first_name || pro.firstName || '';
  const lastName = pro.last_name || pro.lastName || '';
  const avatarUrl = pro.avatar_url || pro.avatarUrl;
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
          Provider Profile
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-200">
          <View className="flex-row">
            {/* Avatar */}
            <View className="mr-4">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
              ) : (
                <View
                  className="bg-blue-50 items-center justify-center"
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                >
                  <Ionicons name="person" size={40} color={COLORS.primary} />
                </View>
              )}
            </View>

            {/* Info */}
            <View className="flex-1">
              {/* Name and Verification */}
              <View className="flex-row items-center">
                <Text
                  className="text-xl font-semibold text-gray-900"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {firstName} {lastName}
                </Text>
                {isVerified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.primary}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>

              {/* Rating */}
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text
                  className="text-sm text-gray-700 ml-1"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  {rating.toFixed(1)} ({totalReviews} reviews)
                </Text>
              </View>

              {/* Experience */}
              {experienceYears > 0 && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="briefcase-outline" size={14} color={COLORS.textSecondary} />
                  <Text
                    className="text-xs text-gray-600 ml-1"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    {experienceYears} years experience
                  </Text>
                </View>
              )}

              {/* Completed Jobs */}
              {completedBookings > 0 && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="checkmark-done-outline" size={14} color={COLORS.success} />
                  <Text
                    className="text-xs text-gray-600 ml-1"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    {completedBookings} jobs completed
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Bio */}
          {bio && (
            <Text
              className="text-sm text-gray-600 mt-4"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {bio}
            </Text>
          )}
        </View>

        {/* Services Section */}
        <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
          <Text
            className="text-lg font-semibold text-gray-900 mb-3"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Services Offered
          </Text>

          {services.length === 0 ? (
            <Text
              className="text-gray-500"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              No services listed
            </Text>
          ) : (
            services.map((service, index) => {
              const serviceId = service.service_id || service.serviceId || service.id;
              const serviceName = service.service_name || service.serviceName || service.name;
              const categoryName = service.category_name || service.categoryName;
              const price = service.price || service.customPrice || service.basePrice;
              const isAvailable = service.is_available !== false;

              return (
                <View
                  key={serviceId || index}
                  className={`flex-row items-center justify-between py-3 ${
                    index < services.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text
                      className="text-base font-medium text-gray-900"
                      style={{ fontFamily: 'Poppins-Medium' }}
                    >
                      {serviceName}
                    </Text>
                    {categoryName && (
                      <Text
                        className="text-xs text-gray-500"
                        style={{ fontFamily: 'Poppins-Regular' }}
                      >
                        {categoryName}
                      </Text>
                    )}
                  </View>
                  <View className="items-end">
                    <Text
                      className="text-base font-semibold text-gray-900"
                      style={{ fontFamily: 'Poppins-SemiBold' }}
                    >
                      {formatPrice(price)}
                    </Text>
                    {!isAvailable && (
                      <Text
                        className="text-xs text-red-500"
                        style={{ fontFamily: 'Poppins-Regular' }}
                      >
                        Unavailable
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Service Areas Section */}
        {zones.length > 0 && (
          <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
            <Text
              className="text-lg font-semibold text-gray-900 mb-3"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Service Areas
            </Text>

            {zones.map((zone, index) => {
              const zoneName = zone.zone_name || zone.zoneName;
              const subZoneName = zone.sub_zone_name || zone.subZoneName;

              return (
                <View
                  key={index}
                  className={`flex-row items-center py-2 ${
                    index < zones.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                  <Text
                    className="text-sm text-gray-700 ml-2"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    {zoneName}
                    {subZoneName ? `, ${subZoneName}` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-xl items-center"
          activeOpacity={0.8}
          onPress={() => {
            // Navigate to booking screen
            navigation.navigate('CreateBooking', {
              proId: pro.id,
              proName: `${firstName} ${lastName}`,
              serviceName,
              services,
            });
          }}
        >
          <Text
            className="text-white text-base font-semibold"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProProfileScreen;
