import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { STOCK_IMAGES } from '../../constants/images';

const { width } = Dimensions.get('window');

const BusinessesTab = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory]);

  // Debounced backend search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        fetchBusinesses(searchQuery.trim());
      }, 300);
    } else if (searchQuery.trim().length === 0) {
      // Refetch without search when cleared
      fetchBusinesses();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriesResponse = await apiService.get(API_ENDPOINTS.BUSINESS_CATEGORIES);
      const categoriesData = categoriesResponse.data?.categories ||
        (Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
      setCategories(categoriesData);
      await fetchBusinesses();
    } catch (error) {
      console.error('Error fetching businesses data:', error);
      setCategories([]);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async (search = '') => {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory);
      }
      if (search) {
        params.append('search', search);
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.BUSINESSES}?${queryString}`
        : API_ENDPOINTS.BUSINESSES;

      const response = await apiService.get(endpoint);
      const businessesData = response.data?.businesses ||
        (Array.isArray(response.data) ? response.data : []);
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    } finally {
      setSearching(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    if (searchQuery.trim().length >= 2) {
      await fetchBusinesses(searchQuery.trim());
    }
    setRefreshing(false);
  };

  const isBusinessOpen = (business) => {
    const hours = business.operatingHours || business.openingHours;
    if (!hours) return false;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const dayMap = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday',
    };

    const todayHours = hours[dayMap[dayOfWeek]];
    if (!todayHours || todayHours === 'Closed') return false;

    try {
      if (typeof todayHours === 'object') {
        if (!todayHours.is_open) return false;
        const [openHour, openMin] = todayHours.open.split(':').map(Number);
        const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
        const openTime = openHour * 60 + openMin;
        const closeTime = closeHour * 60 + closeMin;
        return currentTime >= openTime && currentTime <= closeTime;
      }
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

  const isSearching = searchQuery.trim().length >= 2;

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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Search Bar */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            style={{ fontFamily: 'Poppins-Regular', fontSize: 15 }}
            placeholder="Search businesses..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      {!searchQuery && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <TouchableOpacity
            className={`px-4 py-2.5 rounded-full mr-2 ${
              selectedCategory === 'all' ? 'bg-primary' : 'bg-white border border-gray-200'
            }`}
            activeOpacity={0.7}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              className={`text-sm ${
                selectedCategory === 'all' ? 'text-white' : 'text-gray-600'
              }`}
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`px-4 py-2.5 rounded-full mr-2 ${
                selectedCategory === category.id ? 'bg-primary' : 'bg-white border border-gray-200'
              }`}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                className={`text-sm ${
                  selectedCategory === category.id ? 'text-white' : 'text-gray-600'
                }`}
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Promo Banner */}
      {!searchQuery && (
        <TouchableOpacity
          className="mx-4 mt-5 rounded-2xl overflow-hidden"
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: STOCK_IMAGES.hero.businesses }}
            style={{ width: '100%', height: 120 }}
            resizeMode="cover"
          />
          <View
            className="absolute inset-0 justify-end p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          >
            <Text
              className="text-white text-lg"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              Explore Local
            </Text>
            <Text
              className="text-white/80 text-xs"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Discover amazing places near you
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Businesses List */}
      <View className="px-4 pt-5 pb-8">
        <Text
          className="text-base text-gray-900 mb-4"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          {isSearching ? 'Search Results' : 'Popular Places'}
        </Text>

        {/* Searching indicator */}
        {searching && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text
              className="text-gray-500 mt-2"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Searching...
            </Text>
          </View>
        )}

        {!searching && businesses.length === 0 ? (
          <View className="items-center justify-center py-12">
            <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
              <Ionicons name="business-outline" size={28} color="#9CA3AF" />
            </View>
            <Text
              className="text-gray-500"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              {isSearching ? 'No businesses found' : 'No businesses available'}
            </Text>
          </View>
        ) : !searching && (
          businesses.map((business) => {
            const isOpen = isBusinessOpen(business);
            const name = business.businessName || business.business_name || business.name;
            const categoryName = business.category?.name || business.categoryName || 'Business';
            const zoneName = business.zone?.name || business.zoneName;
            const logoUrl = business.logoUrl || business.logo_url;
            // Prioritize business's own cover photo
            const coverUrl = business.coverImageUrl || business.cover_image_url ||
                            business.coverUrl || business.cover_url ||
                            business.coverImage || business.cover_image ||
                            business.images?.[0] || null;
            const rating = parseFloat(business.average_rating || business.rating || 0);
            const reviewCount = business.total_reviews || business.reviewCount || 0;

            return (
              <TouchableOpacity
                key={business.id}
                className="mb-4 rounded-2xl overflow-hidden bg-white"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate('BusinessDetails', {
                    businessId: business.id,
                  })
                }
              >
                {/* Cover Image */}
                <View className="relative">
                  {coverUrl ? (
                    <Image
                      source={{ uri: coverUrl }}
                      style={{ width: '100%', height: 130 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className="bg-gray-200 items-center justify-center"
                      style={{ width: '100%', height: 130 }}
                    >
                      <Ionicons name="business-outline" size={40} color="#9CA3AF" />
                      <Text
                        className="text-gray-400 text-xs mt-1"
                        style={{ fontFamily: 'Poppins-Regular' }}
                      >
                        No cover photo
                      </Text>
                    </View>
                  )}

                  {/* Status Badge */}
                  <View
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full ${
                      isOpen ? 'bg-green-500' : 'bg-gray-800/80'
                    }`}
                  >
                    <Text
                      className="text-white text-xs"
                      style={{ fontFamily: 'Poppins-Medium' }}
                    >
                      {isOpen ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>

                {/* Content */}
                <View className="p-4">
                  <View className="flex-row items-start">
                    {/* Logo */}
                    {logoUrl ? (
                      <Image
                        source={{ uri: logoUrl }}
                        style={{ width: 44, height: 44, borderRadius: 10 }}
                      />
                    ) : (
                      <View
                        className="bg-gray-100 items-center justify-center"
                        style={{ width: 44, height: 44, borderRadius: 10 }}
                      >
                        <Text
                          className="text-primary text-base"
                          style={{ fontFamily: 'Poppins-Bold' }}
                        >
                          {name?.charAt(0)?.toUpperCase()}
                        </Text>
                      </View>
                    )}

                    {/* Info */}
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-base text-gray-900"
                        style={{ fontFamily: 'Poppins-SemiBold' }}
                        numberOfLines={1}
                      >
                        {name}
                      </Text>

                      <Text
                        className="text-xs text-gray-400"
                        style={{ fontFamily: 'Poppins-Regular' }}
                      >
                        {categoryName}
                      </Text>

                      {/* Rating & Location */}
                      <View className="flex-row items-center mt-1.5">
                        {reviewCount > 0 && (
                          <View className="flex-row items-center mr-3">
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text
                              className="text-xs text-gray-600 ml-1"
                              style={{ fontFamily: 'Poppins-Medium' }}
                            >
                              {rating.toFixed(1)}
                            </Text>
                          </View>
                        )}

                        {zoneName && (
                          <View className="flex-row items-center flex-1">
                            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                            <Text
                              className="text-xs text-gray-400 ml-1"
                              style={{ fontFamily: 'Poppins-Regular' }}
                              numberOfLines={1}
                            >
                              {zoneName}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Arrow */}
                    <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default BusinessesTab;
