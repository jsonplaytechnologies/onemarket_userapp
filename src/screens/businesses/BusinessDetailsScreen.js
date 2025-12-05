import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const BusinessDetailsScreen = ({ route, navigation }) => {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessDetails();
  }, [businessId]);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.BUSINESS_DETAILS(businessId));
      // API returns { data: { business: {...} } }
      const businessData = response.data?.business || response.data;
      setBusiness(businessData);
    } catch (error) {
      console.error('Error fetching business details:', error);
      Alert.alert('Error', 'Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    const phone = business?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = () => {
    const email = business?.email;
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleMap = () => {
    const lat = business?.latitude;
    const lng = business?.longitude;
    if (lat && lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  const handleWebsite = () => {
    let url = business?.website;
    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      Linking.openURL(url);
    }
  };

  const isBusinessOpen = () => {
    const hours = business?.operatingHours || business?.openingHours;
    if (!hours) return false;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const dayMap = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };

    const todayHours = hours[dayMap[dayOfWeek]];

    if (!todayHours) return false;

    try {
      // Handle new format: { open: "09:00", close: "18:00", is_open: true }
      if (typeof todayHours === 'object') {
        if (!todayHours.is_open) return false;
        const [openHour, openMin] = todayHours.open.split(':').map(Number);
        const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
        const openTime = openHour * 60 + openMin;
        const closeTime = closeHour * 60 + closeMin;
        return currentTime >= openTime && currentTime <= closeTime;
      }
      // Handle old format: "09:00 - 18:00"
      if (todayHours === 'Closed') return false;
      const [open, close] = todayHours.split(' - ');
      const [openHour, openMin] = open.split(':').map(Number);
      const [closeHour, closeMin] = close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;
      return currentTime >= openTime && currentTime <= closeTime;
    } catch (error) {
      return false;
    }
  };

  const getTodayHours = () => {
    const hours = business?.operatingHours || business?.openingHours;
    if (!hours) return 'Hours not available';

    const now = new Date();
    const dayOfWeek = now.getDay();

    const dayMap = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };

    const todayHours = hours[dayMap[dayOfWeek]];
    if (!todayHours) return 'Closed';

    // Handle new format
    if (typeof todayHours === 'object') {
      if (!todayHours.is_open) return 'Closed';
      return `${todayHours.open} - ${todayHours.close}`;
    }

    return todayHours;
  };

  const formatHours = (dayHours) => {
    if (!dayHours) return 'Closed';
    if (typeof dayHours === 'object') {
      if (!dayHours.is_open) return 'Closed';
      return `${dayHours.open} - ${dayHours.close}`;
    }
    return dayHours;
  };

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
            Business Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (!business) {
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
        </View>
        <View className="flex-1 items-center justify-center">
          <Ionicons name="business-outline" size={64} color={COLORS.textSecondary} />
          <Text
            className="text-gray-500 text-center mt-4"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Business not found
          </Text>
        </View>
      </View>
    );
  }

  const isOpen = isBusinessOpen();
  const name = business.businessName || business.name;
  const categoryName = business.category?.name || business.categoryName || 'Business';
  const zoneName = business.zone?.name || business.zoneName;
  const subZoneName = business.subZone?.name || business.subZoneName;
  const logoUrl = business.logoUrl || business.logo_url;
  const coverImageUrl = business.coverImageUrl || business.cover_image_url;
  const isVerified = business.isVerified || business.is_verified;
  const hours = business.operatingHours || business.openingHours;
  const images = business.images || business.photos || [];

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
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Cover Image */}
        {coverImageUrl ? (
          <Image
            source={{ uri: coverImageUrl }}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-full bg-blue-100 items-center justify-center"
            style={{ height: 160 }}
          >
            <Ionicons name="business" size={64} color={COLORS.primary} />
          </View>
        )}

        {/* Business Card */}
        <View className="bg-white mx-6 -mt-8 rounded-xl p-4 border border-gray-200">
          <View className="flex-row">
            {/* Logo */}
            <View className="mr-3">
              {logoUrl ? (
                <Image
                  source={{ uri: logoUrl }}
                  style={{ width: 80, height: 80, borderRadius: 8 }}
                />
              ) : (
                <View className="w-20 h-20 bg-blue-50 rounded-lg items-center justify-center">
                  <Ionicons name="business" size={40} color={COLORS.primary} />
                </View>
              )}
            </View>

            {/* Business Info */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text
                  className="text-xl font-bold text-gray-900 flex-1"
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  {name}
                </Text>
                {isVerified && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </View>
              <Text
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {categoryName}
              </Text>

              {/* Status */}
              <View className="flex-row items-center mt-2">
                <Ionicons
                  name="ellipse"
                  size={8}
                  color={isOpen ? COLORS.success : COLORS.error}
                />
                <Text
                  className={`text-sm ml-1 ${isOpen ? 'text-green-600' : 'text-red-600'}`}
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  {isOpen ? 'Open' : 'Closed'} · {getTodayHours()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        {business.description && (
          <View className="bg-white mx-6 mt-4 rounded-xl p-4 border border-gray-200">
            <Text
              className="text-base font-semibold text-gray-900 mb-2"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              About
            </Text>
            <Text
              className="text-sm text-gray-700"
              style={{ fontFamily: 'Poppins-Regular', lineHeight: 22 }}
            >
              {business.description}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row mx-6 mt-4">
          <TouchableOpacity
            className={`flex-1 border rounded-xl p-4 items-center mr-2 ${
              business.phone ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'
            }`}
            activeOpacity={0.7}
            onPress={handleCall}
            disabled={!business.phone}
          >
            <Ionicons
              name="call"
              size={24}
              color={business.phone ? '#fff' : COLORS.textSecondary}
            />
            <Text
              className={`text-xs mt-1 ${business.phone ? 'text-white' : 'text-gray-500'}`}
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Call
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 border rounded-xl p-4 items-center mx-1 ${
              business.latitude ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200'
            }`}
            activeOpacity={0.7}
            onPress={handleMap}
            disabled={!business.latitude}
          >
            <Ionicons
              name="navigate"
              size={24}
              color={business.latitude ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              className={`text-xs mt-1 ${business.latitude ? 'text-gray-700' : 'text-gray-500'}`}
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Directions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 border rounded-xl p-4 items-center ml-2 ${
              business.website ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200'
            }`}
            activeOpacity={0.7}
            onPress={handleWebsite}
            disabled={!business.website}
          >
            <Ionicons
              name="globe"
              size={24}
              color={business.website ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              className={`text-xs mt-1 ${business.website ? 'text-gray-700' : 'text-gray-500'}`}
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Website
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View className="bg-white mx-6 mt-4 rounded-xl p-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text
              className="text-base font-semibold text-gray-900 ml-2"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Location
            </Text>
          </View>
          <Text
            className="text-sm text-gray-700"
            style={{ fontFamily: 'Poppins-Regular', lineHeight: 22 }}
          >
            {business.address}
          </Text>
          {(zoneName || subZoneName) && (
            <Text
              className="text-sm text-gray-500 mt-1"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {zoneName}{subZoneName ? `, ${subZoneName}` : ''}
            </Text>
          )}
          {business.latitude && (
            <TouchableOpacity
              className="flex-row items-center mt-3"
              onPress={handleMap}
              activeOpacity={0.7}
            >
              <Ionicons name="map-outline" size={16} color={COLORS.primary} />
              <Text
                className="text-sm text-blue-600 ml-1"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                View on map
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact */}
        <View className="bg-white mx-6 mt-4 rounded-xl p-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="call" size={20} color={COLORS.primary} />
            <Text
              className="text-base font-semibold text-gray-900 ml-2"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Contact
            </Text>
          </View>

          {business.phone && (
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={18} color={COLORS.textSecondary} />
              <Text
                className="text-sm text-gray-700 ml-3 flex-1"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {business.phone}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}

          {business.email && (
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
              <Text
                className="text-sm text-gray-700 ml-3 flex-1"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {business.email}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}

          {business.website && (
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={handleWebsite}
              activeOpacity={0.7}
            >
              <Ionicons name="globe-outline" size={18} color={COLORS.textSecondary} />
              <Text
                className="text-sm text-gray-700 ml-3 flex-1"
                style={{ fontFamily: 'Poppins-Regular' }}
                numberOfLines={1}
              >
                {business.website}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Opening Hours */}
        {hours && (
          <View className="bg-white mx-6 mt-4 rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center mb-3">
              <Ionicons name="time" size={20} color={COLORS.primary} />
              <Text
                className="text-base font-semibold text-gray-900 ml-2"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Opening Hours
              </Text>
            </View>

            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
              (day) => {
                const dayHours = hours[day];
                const isToday =
                  new Date().getDay() ===
                  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);

                return (
                  <View
                    key={day}
                    className={`flex-row justify-between py-2 ${
                      isToday ? 'bg-blue-50 -mx-2 px-2 rounded-lg' : ''
                    }`}
                  >
                    <Text
                      className={`text-sm capitalize ${isToday ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                      style={{ fontFamily: isToday ? 'Poppins-Medium' : 'Poppins-Regular' }}
                    >
                      {day}
                      {isToday && ' (Today)'}
                    </Text>
                    <Text
                      className={`text-sm ${
                        formatHours(dayHours) === 'Closed'
                          ? 'text-red-500'
                          : isToday
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-700'
                      }`}
                      style={{ fontFamily: isToday ? 'Poppins-Medium' : 'Poppins-Regular' }}
                    >
                      {formatHours(dayHours)}
                    </Text>
                  </View>
                );
              }
            )}
          </View>
        )}

        {/* Photos */}
        {images && images.length > 0 && (
          <View className="bg-white mx-6 mt-4 mb-6 rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center mb-3">
              <Ionicons name="images" size={20} color={COLORS.primary} />
              <Text
                className="text-base font-semibold text-gray-900 ml-2"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Photos
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((image, index) => {
                const imageUrl = typeof image === 'string' ? image : image.url || image.imageUrl;
                return (
                  <Image
                    key={index}
                    source={{ uri: imageUrl }}
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                    resizeMode="cover"
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

export default BusinessDetailsScreen;
