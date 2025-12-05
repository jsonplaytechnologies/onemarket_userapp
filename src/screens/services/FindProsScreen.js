import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const FindProsScreen = ({ route, navigation }) => {
  const { serviceId, serviceName } = route.params;
  const [pros, setPros] = useState([]);
  const [filteredPros, setFilteredPros] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPros();
  }, [serviceId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPros(pros);
    } else {
      const filtered = pros.filter((pro) => {
        // Handle both snake_case and camelCase field names
        const firstName = pro.first_name || pro.profile?.firstName || '';
        const lastName = pro.last_name || pro.profile?.lastName || '';
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      setFilteredPros(filtered);
    }
  }, [searchQuery, pros]);

  const fetchPros = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`${API_ENDPOINTS.SEARCH_PROS}?serviceId=${serviceId}`);
      const prosData = Array.isArray(response.data) ? response.data : [];
      setPros(prosData);
      setFilteredPros(prosData);
    } catch (error) {
      console.error('Error fetching pros:', error);
      setPros([]);
      setFilteredPros([]);
    } finally {
      setLoading(false);
    }
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
            {serviceName}
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
          {serviceName}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Search Bar */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-4 py-3">
            <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              style={{ fontFamily: 'Poppins-Regular', fontSize: 14 }}
              placeholder="Search pros..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pros Count */}
        <View className="px-6 pt-4 pb-2">
          <Text
            className="text-base font-medium text-gray-700"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            {filteredPros.length} {filteredPros.length === 1 ? 'Pro' : 'Pros'} Found
          </Text>
        </View>

        {/* Pros List */}
        <View className="px-6 pb-6">
          {filteredPros.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
              <Text
                className="text-gray-500 text-center mt-4"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {searchQuery ? 'No pros found' : 'No professionals available for this service'}
              </Text>
            </View>
          ) : (
            filteredPros.map((pro) => {
              // Handle both snake_case and camelCase field names
              const firstName = pro.first_name || pro.profile?.firstName || '';
              const lastName = pro.last_name || pro.profile?.lastName || '';
              const avatarUrl = pro.avatar_url || pro.profile?.avatarUrl;
              const isOnline = pro.is_online || pro.isOnline || false;
              const isVerified = pro.is_id_verified || pro.isVerified || false;
              const rating = parseFloat(pro.average_rating || pro.rating || 0);
              const reviewCount = pro.total_reviews || pro.reviewCount || 0;

              // Find the service price for this specific service
              const proService = pro.services?.find((s) =>
                s.service_id === serviceId || s.id === serviceId
              );
              const price = proService?.price || proService?.customPrice || proService?.basePrice || 0;

              return (
                <TouchableOpacity
                  key={pro.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('ProProfile', {
                      proId: pro.id,
                      serviceName,
                    })
                  }
                >
                  <View className="flex-row">
                    {/* Avatar */}
                    <View className="mr-3">
                      {avatarUrl ? (
                        <Image
                          source={{ uri: avatarUrl }}
                          style={{ width: 60, height: 60, borderRadius: 30 }}
                        />
                      ) : (
                        <View className="w-15 h-15 bg-blue-50 rounded-full items-center justify-center">
                          <Ionicons name="person" size={32} color={COLORS.primary} />
                        </View>
                      )}
                    </View>

                    {/* Pro Info */}
                    <View className="flex-1">
                      {/* Name and Verification */}
                      <View className="flex-row items-center">
                        <Text
                          className="text-base font-semibold text-gray-900"
                          style={{ fontFamily: 'Poppins-SemiBold' }}
                        >
                          {firstName} {lastName}
                        </Text>
                        {isVerified && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={COLORS.primary}
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </View>

                      {/* Rating */}
                      {reviewCount > 0 && (
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="star" size={14} color="#F59E0B" />
                          <Text
                            className="text-xs text-gray-700 ml-1"
                            style={{ fontFamily: 'Poppins-Medium' }}
                          >
                            {rating.toFixed(1)} ({reviewCount}{' '}
                            {reviewCount === 1 ? 'review' : 'reviews'})
                          </Text>
                        </View>
                      )}

                      {/* Price */}
                      {price > 0 && (
                        <Text
                          className="text-sm font-medium text-gray-900 mt-1"
                          style={{ fontFamily: 'Poppins-SemiBold' }}
                        >
                          {parseFloat(price).toLocaleString()} XAF
                        </Text>
                      )}

                      {/* Bio */}
                      {pro.bio && (
                        <Text
                          className="text-xs text-gray-600 mt-1"
                          style={{ fontFamily: 'Poppins-Regular' }}
                          numberOfLines={1}
                        >
                          {pro.bio}
                        </Text>
                      )}

                      {/* Online Status */}
                      <View className="flex-row items-center mt-1">
                        <Ionicons
                          name="ellipse"
                          size={8}
                          color={isOnline ? COLORS.success : COLORS.textSecondary}
                        />
                        <Text
                          className={`text-xs ml-1 ${
                            isOnline ? 'text-green-600' : 'text-gray-500'
                          }`}
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          {isOnline ? 'Online' : 'Offline'}
                        </Text>
                      </View>
                    </View>

                    {/* Arrow Icon */}
                    <View className="justify-center">
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FindProsScreen;
