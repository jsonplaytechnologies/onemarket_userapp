import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { getRandomProAvatar } from '../../constants/images';

const ProviderSelectionScreen = ({ route, navigation }) => {
  const { service, answers, address } = route.params;
  const insets = useSafeAreaInsets();

  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const serviceId = service?.id || service?.service_id || service?.serviceId;
  const serviceName = service?.name || service?.service_name || service?.serviceName || 'Service';
  const zoneId = address?.zone_id || address?.zoneId;
  const subZoneId = address?.sub_zone_id || address?.subZoneId;

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter((pro) => {
        const firstName = pro.first_name || pro.firstName || '';
        const lastName = pro.last_name || pro.lastName || '';
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      setFilteredProviders(filtered);
    }
  }, [searchQuery, providers]);

  const fetchProviders = async () => {
    try {
      setLoading(true);

      // Build query params with zone filtering
      const params = new URLSearchParams();
      params.append('serviceId', serviceId);

      if (zoneId) {
        params.append('zoneId', zoneId);
      }
      if (subZoneId) {
        params.append('subZoneId', subZoneId);
      }

      // Add location for distance calculation
      if (address?.latitude && address?.longitude) {
        params.append('lat', address.latitude);
        params.append('lng', address.longitude);
      }

      const response = await apiService.get(`${API_ENDPOINTS.SEARCH_PROS}?${params.toString()}`);
      const prosData = Array.isArray(response.data) ? response.data : [];

      // Sort by best_provider_score (trust × confidence) by default
      const sortedPros = prosData.sort((a, b) => {
        const scoreA = a.best_provider_score || (a.trust_score || 4) * (a.job_confidence || 0.1);
        const scoreB = b.best_provider_score || (b.trust_score || 4) * (b.job_confidence || 0.1);
        return scoreB - scoreA;
      });

      setProviders(sortedPros);
      setFilteredProviders(sortedPros);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setProviders([]);
      setFilteredProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider) => {
    // Manual path: go to provider's calendar
    navigation.navigate('ProviderCalendar', {
      service,
      answers,
      address,
      provider,
      bookingPath: 'manual',
    });
  };

  const handleFindOneForMe = () => {
    // Auto path: go to time selection
    navigation.navigate('TimeSelection', {
      service,
      answers,
      address,
      bookingPath: 'auto',
    });
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
            Select Provider
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            className="mr-4"
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              className="text-xl font-semibold text-gray-900"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Select Provider
            </Text>
            <Text
              className="text-sm text-gray-500"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {serviceName} • {filteredProviders.length} available
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            style={{ fontFamily: 'Poppins-Regular', fontSize: 14 }}
            placeholder="Search by name..."
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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredProviders.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="people-outline" size={36} color="#9CA3AF" />
            </View>
            <Text
              className="text-lg text-gray-900"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              No Providers Found
            </Text>
            <Text
              className="text-sm text-gray-400 text-center mt-2 px-8"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {searchQuery
                ? 'Try a different search'
                : 'No providers are currently available in your area for this service'}
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-xl mt-6"
              activeOpacity={0.8}
              onPress={handleFindOneForMe}
            >
              <Text
                className="text-white text-sm font-semibold"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Let Us Find One For You
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredProviders.map((pro, index) => {
            const firstName = pro.first_name || pro.firstName || '';
            const lastName = pro.last_name || pro.lastName || '';
            const avatarUrl = pro.avatar_url || pro.avatarUrl || getRandomProAvatar(index);
            const isOnline = pro.is_online || pro.isOnline || false;
            const isVerified = pro.is_id_verified || pro.isVerified || false;
            const rating = parseFloat(pro.average_rating || pro.rating || 0);
            const reviewCount = pro.total_reviews || pro.reviewCount || 0;
            const completedJobs = pro.completed_bookings || pro.completedJobs || 0;

            // Get price for this service
            const proService = pro.services?.find((s) =>
              s.service_id === serviceId || s.id === serviceId
            );
            const price = proService?.price || proService?.customPrice || 0;

            return (
              <TouchableOpacity
                key={pro.id}
                className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                activeOpacity={0.9}
                onPress={() => handleProviderSelect(pro)}
              >
                <View className="p-4">
                  <View className="flex-row">
                    {/* Avatar */}
                    <View className="relative">
                      <Image
                        source={{ uri: avatarUrl }}
                        style={{ width: 64, height: 64, borderRadius: 16 }}
                      />
                      {isOnline && (
                        <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </View>

                    {/* Info */}
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center">
                        <Text
                          className="text-base text-gray-900"
                          style={{ fontFamily: 'Poppins-SemiBold' }}
                        >
                          {firstName} {lastName}
                        </Text>
                        {isVerified && (
                          <View className="ml-1.5 bg-blue-600 rounded-full p-0.5">
                            <Ionicons name="checkmark" size={10} color="#FFF" />
                          </View>
                        )}
                      </View>

                      {/* Rating */}
                      <View className="flex-row items-center mt-1">
                        {reviewCount > 0 ? (
                          <>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text
                              className="text-sm text-gray-700 ml-1"
                              style={{ fontFamily: 'Poppins-Medium' }}
                            >
                              {rating.toFixed(1)}
                            </Text>
                            <Text
                              className="text-xs text-gray-400 ml-1"
                              style={{ fontFamily: 'Poppins-Regular' }}
                            >
                              ({reviewCount})
                            </Text>
                          </>
                        ) : (
                          <Text
                            className="text-xs text-gray-400"
                            style={{ fontFamily: 'Poppins-Regular' }}
                          >
                            New provider
                          </Text>
                        )}
                        {completedJobs > 0 && (
                          <>
                            <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                            <Text
                              className="text-xs text-gray-400"
                              style={{ fontFamily: 'Poppins-Regular' }}
                            >
                              {completedJobs} jobs
                            </Text>
                          </>
                        )}
                      </View>

                      {/* Distance */}
                      {pro.distance !== undefined && pro.distance !== null && (
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="location-outline" size={12} color={COLORS.primary} />
                          <Text
                            className="text-xs text-blue-600 ml-1"
                            style={{ fontFamily: 'Poppins-Medium' }}
                          >
                            {parseFloat(pro.distance).toFixed(1)} km away
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Price & Arrow */}
                    <View className="items-end justify-center">
                      {price > 0 && (
                        <Text
                          className="text-sm text-gray-900"
                          style={{ fontFamily: 'Poppins-Bold' }}
                        >
                          {parseFloat(price).toLocaleString()} XAF
                        </Text>
                      )}
                      <View className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center mt-2">
                        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Find One For Me Button - Always Visible */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-xl items-center flex-row justify-center"
          activeOpacity={0.8}
          onPress={handleFindOneForMe}
        >
          <Ionicons name="flash" size={20} color="white" />
          <Text
            className="text-white text-base font-semibold ml-2"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Find One For Me
          </Text>
        </TouchableOpacity>
        <Text
          className="text-xs text-gray-400 text-center mt-2"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          We'll automatically find the best available provider for you
        </Text>
      </View>
    </View>
  );
};

export default ProviderSelectionScreen;
