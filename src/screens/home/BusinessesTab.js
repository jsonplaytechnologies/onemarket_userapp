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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const BusinessesTab = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories - API returns { data: { categories: [...] } }
      const categoriesResponse = await apiService.get(API_ENDPOINTS.BUSINESS_CATEGORIES);
      const categoriesData = categoriesResponse.data?.categories ||
        (Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
      setCategories(categoriesData);

      // Fetch all businesses
      await fetchBusinesses();
    } catch (error) {
      console.error('Error fetching businesses data:', error);
      setCategories([]);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const endpoint =
        selectedCategory === 'all'
          ? API_ENDPOINTS.BUSINESSES
          : `${API_ENDPOINTS.BUSINESSES}?categoryId=${selectedCategory}`;

      const response = await apiService.get(endpoint);
      // API returns { data: { businesses: [...], pagination: {...} } }
      const businessesData = response.data?.businesses ||
        (Array.isArray(response.data) ? response.data : []);
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const isBusinessOpen = (business) => {
    const hours = business.operatingHours || business.openingHours;
    if (!hours) return false;

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
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

    if (!todayHours || todayHours === 'Closed') return false;

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

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Search Bar */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-4 py-3">
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <Text
            className="ml-3 text-gray-500"
            style={{ fontFamily: 'Poppins-Regular', fontSize: 14 }}
          >
            Search businesses...
          </Text>
        </View>
      </View>

      {/* Category Pills */}
      <View className="mt-4">
        <Text
          className="px-6 text-lg font-semibold text-gray-900 mb-3"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          Categories
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {/* All pill */}
          <TouchableOpacity
            className={`px-5 py-2 rounded-full mr-3 ${
              selectedCategory === 'all'
                ? 'bg-blue-600'
                : 'bg-white border border-blue-600'
            }`}
            activeOpacity={0.7}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory === 'all' ? 'text-white' : 'text-blue-600'
              }`}
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              All
            </Text>
          </TouchableOpacity>

          {/* Category pills */}
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`px-5 py-2 rounded-full mr-3 ${
                selectedCategory === category.id
                  ? 'bg-blue-600'
                  : 'bg-white border border-blue-600'
              }`}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === category.id ? 'text-white' : 'text-blue-600'
                }`}
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Businesses List */}
      <View className="mt-6 px-6 pb-6">
        <Text
          className="text-lg font-semibold text-gray-900 mb-3"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          Businesses
        </Text>

        {businesses.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="business-outline" size={64} color={COLORS.textSecondary} />
            <Text
              className="text-gray-500 text-center mt-4"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              No businesses found
            </Text>
          </View>
        ) : (
          businesses.map((business) => {
            const isOpen = isBusinessOpen(business);
            const name = business.businessName || business.name;
            const categoryName = business.category?.name || business.categoryName || 'Business';
            const zoneName = business.zone?.name || business.zoneName;
            const logoUrl = business.logoUrl || business.logo_url;

            return (
              <TouchableOpacity
                key={business.id}
                className="flex-row items-center bg-white border border-gray-200 rounded-xl p-4 mb-3"
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('BusinessDetails', {
                    businessId: business.id,
                  })
                }
              >
                {/* Business Logo */}
                <View className="mr-3">
                  {logoUrl ? (
                    <Image
                      source={{ uri: logoUrl }}
                      style={{ width: 60, height: 60, borderRadius: 8 }}
                    />
                  ) : (
                    <View className="w-15 h-15 bg-blue-50 rounded-lg items-center justify-center">
                      <Ionicons name="business" size={32} color={COLORS.primary} />
                    </View>
                  )}
                </View>

                {/* Business Info */}
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold text-gray-900"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    {name}
                  </Text>
                  <Text
                    className="text-xs text-gray-500 mt-0.5"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    {categoryName}
                  </Text>

                  {/* Location */}
                  {zoneName && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={COLORS.textSecondary}
                      />
                      <Text
                        className="text-xs text-gray-600 ml-1"
                        style={{ fontFamily: 'Poppins-Regular' }}
                      >
                        {zoneName}
                      </Text>
                    </View>
                  )}

                  {/* Status */}
                  <View className="flex-row items-center mt-1">
                    <Ionicons
                      name="ellipse"
                      size={8}
                      color={isOpen ? COLORS.success : COLORS.error}
                    />
                    <Text
                      className={`text-xs ml-1 ${
                        isOpen ? 'text-green-600' : 'text-red-600'
                      }`}
                      style={{ fontFamily: 'Poppins-Medium' }}
                    >
                      {isOpen ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>

                {/* Arrow Icon */}
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default BusinessesTab;
