import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { getServiceImage, STOCK_IMAGES } from '../../constants/images';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 2;

const ServicesTab = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounced backend search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        searchServices(searchQuery.trim());
      }, 300);
    } else {
      setSearchResults([]);
      setSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const searchServices = async (query) => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.SEARCH_SERVICES}?q=${encodeURIComponent(query)}`);
      const servicesData = Array.isArray(response.data) ? response.data : [];
      setSearchResults(servicesData);
    } catch (error) {
      console.error('Error searching services:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.SERVICE_CATEGORIES);
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    if (searchQuery.trim().length >= 2) {
      await searchServices(searchQuery.trim());
    }
    setRefreshing(false);
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
            placeholder="What service do you need?"
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

      {/* Featured Banner */}
      {!isSearching && (
        <TouchableOpacity
          className="mx-4 mt-4 rounded-2xl overflow-hidden"
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: STOCK_IMAGES.hero.services }}
            style={{ width: '100%', height: 120 }}
            resizeMode="cover"
          />
          <View
            className="absolute inset-0 justify-end p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          >
            <Text
              className="text-white text-lg"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              Get 20% Off
            </Text>
            <Text
              className="text-white/80 text-xs"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              On your first booking
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Search Results or Categories */}
      <View className="mt-6 px-4 pb-8">
        <Text
          className="text-base text-gray-900 mb-4"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          {isSearching ? 'Search Results' : 'All Services'}
        </Text>

        {/* Loading indicator for search */}
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

        {/* Search Results - Services */}
        {isSearching && !searching && (
          searchResults.length === 0 ? (
            <View className="items-center justify-center py-12">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Ionicons name="search-outline" size={28} color="#9CA3AF" />
              </View>
              <Text
                className="text-gray-500"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                No services found
              </Text>
              <Text
                className="text-gray-400 text-sm mt-1"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Try a different search term
              </Text>
            </View>
          ) : (
            searchResults.map((service) => {
              const basePrice = service.base_price || service.basePrice;
              return (
                <TouchableOpacity
                  key={service.id}
                  className="mb-3 rounded-2xl overflow-hidden bg-white border border-gray-100"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('FindPros', {
                      serviceId: service.id,
                      serviceName: service.name,
                    })
                  }
                >
                  <View className="flex-row items-center p-4">
                    <View className="w-14 h-14 bg-blue-50 rounded-xl items-center justify-center mr-4">
                      <Ionicons name="construct-outline" size={26} color={COLORS.primary} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-base text-gray-900"
                        style={{ fontFamily: 'Poppins-SemiBold' }}
                      >
                        {service.name}
                      </Text>
                      {service.category_name && (
                        <Text
                          className="text-xs text-gray-400 mt-0.5"
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          {service.category_name}
                        </Text>
                      )}
                      {basePrice && (
                        <Text
                          className="text-sm text-primary mt-1"
                          style={{ fontFamily: 'Poppins-SemiBold' }}
                        >
                          From {parseFloat(basePrice).toLocaleString()} XAF
                        </Text>
                      )}
                    </View>
                    <View className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center">
                      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )
        )}

        {/* Categories Grid - shown when not searching */}
        {!isSearching && (
          categories.length === 0 ? (
            <View className="items-center justify-center py-12">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Ionicons name="search-outline" size={28} color="#9CA3AF" />
              </View>
              <Text
                className="text-gray-500"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                No services available
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {categories.map((category, index) => {
                const serviceCount = parseInt(category.service_count || category.serviceCount || 0);
                const imageUrl = category.iconUrl || category.icon_url || getServiceImage(category.name);

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={{ width: CARD_WIDTH, marginBottom: 16 }}
                    activeOpacity={0.9}
                    onPress={() =>
                      navigation.navigate('CategoryServices', {
                        categoryId: category.id,
                        categoryName: category.name,
                      })
                    }
                  >
                    <View
                      className="rounded-2xl overflow-hidden bg-white"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      {/* Image */}
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: 110 }}
                        resizeMode="cover"
                      />

                      {/* Content */}
                      <View className="p-3">
                        <Text
                          className="text-sm text-gray-900"
                          style={{ fontFamily: 'Poppins-SemiBold' }}
                          numberOfLines={1}
                        >
                          {category.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text
                            className="text-xs text-gray-400"
                            style={{ fontFamily: 'Poppins-Regular' }}
                          >
                            {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
                          </Text>
                          <View className="flex-1" />
                          <View className="w-6 h-6 bg-primary/10 rounded-full items-center justify-center">
                            <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )
        )}
      </View>
    </ScrollView>
  );
};

export default ServicesTab;
