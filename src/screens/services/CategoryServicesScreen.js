import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { getServiceImage } from '../../constants/images';

const CategoryServicesScreen = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [services, setServices] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchServices();
  }, [categoryId]);

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
      const allResults = Array.isArray(response.data) ? response.data : [];
      // Filter to only show services from this category
      const categoryResults = allResults.filter(
        service => service.category_id === categoryId ||
                   service.category_name?.toLowerCase() === categoryName.toLowerCase()
      );
      setSearchResults(categoryResults.map(service => ({
        ...service,
        basePrice: service.base_price || service.basePrice,
        iconUrl: service.icon_url || service.iconUrl,
        estimatedDuration: service.estimated_duration || service.estimatedDuration,
      })));
    } catch (error) {
      console.error('Error searching services:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.CATEGORY_SERVICES(categoryId));
      const servicesData = response.data?.services ||
        (Array.isArray(response.data) ? response.data : []);
      const mappedServices = servicesData.map(service => ({
        ...service,
        basePrice: service.base_price || service.basePrice,
        iconUrl: service.icon_url || service.iconUrl,
        estimatedDuration: service.estimated_duration || service.estimatedDuration,
      }));
      setServices(mappedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const isSearching = searchQuery.trim().length >= 2;
  const displayedServices = isSearching ? searchResults : services;

  const categoryImage = getServiceImage(categoryName);

  const renderHeader = () => (
    <View className="bg-white">
      {/* Hero with back button */}
      <View className="mx-4 mt-14 rounded-2xl overflow-hidden">
        <ImageBackground
          source={{ uri: categoryImage }}
          style={{ height: 140 }}
          imageStyle={{ borderRadius: 16 }}
        >
          <View
            className="flex-1 p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16 }}
          >
            {/* Back Button */}
            <TouchableOpacity
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>

            {/* Title */}
            <View className="flex-1 justify-end">
              <Text
                className="text-white text-xl"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                {categoryName}
              </Text>
              <Text
                className="text-white/70 text-sm"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {displayedServices.length} services available
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Search Bar */}
      <View className="mx-4 mt-4">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            style={{ fontFamily: 'Poppins-Regular', fontSize: 14 }}
            placeholder="Search services..."
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
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {renderHeader()}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
      >
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

        {!searching && displayedServices.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="search-outline" size={36} color="#9CA3AF" />
            </View>
            <Text
              className="text-lg text-gray-900"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              No Services Found
            </Text>
            <Text
              className="text-sm text-gray-400 text-center mt-2"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {isSearching ? 'Try a different search' : 'Check back later'}
            </Text>
          </View>
        ) : !searching && (
          displayedServices.map((service) => (
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
                navigation.navigate('ServiceQuestions', {
                  service: service,
                })
              }
            >
              <View className="flex-row items-center p-4">
                {/* Service Icon */}
                <View className="w-14 h-14 bg-blue-50 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="construct-outline" size={26} color={COLORS.primary} />
                </View>

                {/* Service Info */}
                <View className="flex-1">
                  <Text
                    className="text-base text-gray-900"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    {service.name}
                  </Text>

                  {service.description && (
                    <Text
                      className="text-xs text-gray-400 mt-1"
                      style={{ fontFamily: 'Poppins-Regular' }}
                      numberOfLines={1}
                    >
                      {service.description}
                    </Text>
                  )}

                  {service.basePrice && (
                    <View className="flex-row items-center mt-2">
                      <Text
                        className="text-sm text-primary"
                        style={{ fontFamily: 'Poppins-SemiBold' }}
                      >
                        From {parseFloat(service.basePrice).toLocaleString()} XAF
                      </Text>
                    </View>
                  )}
                </View>

                {/* Arrow */}
                <View className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center">
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default CategoryServicesScreen;
