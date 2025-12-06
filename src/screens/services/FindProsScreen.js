import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { getRandomProAvatar, STOCK_IMAGES } from '../../constants/images';

const { width } = Dimensions.get('window');

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

  const renderHeader = () => (
    <View className="bg-white px-4 pt-14 pb-4">
      {/* Back & Title */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-xl text-gray-900"
            style={{ fontFamily: 'Poppins-Bold' }}
            numberOfLines={1}
          >
            {serviceName}
          </Text>
          <Text
            className="text-sm text-gray-400"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {filteredPros.length} professionals available
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 ml-3 text-gray-900"
          style={{ fontFamily: 'Poppins-Regular', fontSize: 14 }}
          placeholder="Search professionals..."
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        {filteredPros.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="people-outline" size={36} color="#9CA3AF" />
            </View>
            <Text
              className="text-lg text-gray-900"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              No Professionals Found
            </Text>
            <Text
              className="text-sm text-gray-400 text-center mt-2"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {searchQuery ? 'Try a different search' : 'Check back later'}
            </Text>
          </View>
        ) : (
          filteredPros.map((pro, index) => {
            const firstName = pro.first_name || pro.profile?.firstName || '';
            const lastName = pro.last_name || pro.profile?.lastName || '';
            const avatarUrl = pro.avatar_url || pro.profile?.avatarUrl || getRandomProAvatar(index);
            const isOnline = pro.is_online || pro.isOnline || pro.online || pro.profile?.is_online || pro.profile?.isOnline || false;
            const isVerified = pro.is_id_verified || pro.isVerified || false;
            const rating = parseFloat(pro.average_rating || pro.rating || 0);
            const reviewCount = pro.total_reviews || pro.reviewCount || 0;
            const completedJobs = pro.completed_jobs || pro.completedJobs || 0;

            const proService = pro.services?.find((s) =>
              s.service_id === serviceId || s.id === serviceId
            );
            const price = proService?.price || proService?.customPrice || proService?.basePrice || 0;

            return (
              <TouchableOpacity
                key={pro.id}
                className="mb-4 rounded-2xl overflow-hidden bg-white border border-gray-100"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate('ProProfile', {
                    proId: pro.id,
                    serviceName,
                  })
                }
              >
                <View className="p-4">
                  <View className="flex-row">
                    {/* Avatar */}
                    <View className="relative">
                      <Image
                        source={{ uri: avatarUrl }}
                        style={{ width: 72, height: 72, borderRadius: 20 }}
                      />
                      {/* Online Indicator */}
                      {isOnline && (
                        <View
                          className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"
                        />
                      )}
                    </View>

                    {/* Info */}
                    <View className="flex-1 ml-4">
                      {/* Name & Verified */}
                      <View className="flex-row items-center">
                        <Text
                          className="text-base text-gray-900"
                          style={{ fontFamily: 'Poppins-SemiBold' }}
                        >
                          {firstName} {lastName}
                        </Text>
                        {isVerified && (
                          <View className="ml-1.5 bg-primary rounded-full p-0.5">
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
                            New professional
                          </Text>
                        )}

                        {completedJobs > 0 && (
                          <>
                            <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                            <Text
                              className="text-xs text-gray-400"
                              style={{ fontFamily: 'Poppins-Regular' }}
                            >
                              {completedJobs} jobs done
                            </Text>
                          </>
                        )}
                      </View>

                      {/* Bio */}
                      {pro.bio && (
                        <Text
                          className="text-sm text-gray-500 mt-2"
                          style={{ fontFamily: 'Poppins-Regular' }}
                          numberOfLines={2}
                        >
                          {pro.bio}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Bottom Section */}
                  <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    {/* Price */}
                    {price > 0 ? (
                      <View>
                        <Text
                          className="text-xs text-gray-400"
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          Starting from
                        </Text>
                        <Text
                          className="text-lg text-gray-900"
                          style={{ fontFamily: 'Poppins-Bold' }}
                        >
                          {parseFloat(price).toLocaleString()} XAF
                        </Text>
                      </View>
                    ) : (
                      <View>
                        <Text
                          className="text-sm text-gray-400"
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          Price on request
                        </Text>
                      </View>
                    )}

                    {/* Book Button */}
                    <TouchableOpacity
                      className="bg-primary px-5 py-2.5 rounded-xl"
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('ProProfile', {
                          proId: pro.id,
                          serviceName,
                        })
                      }
                    >
                      <Text
                        className="text-white text-sm"
                        style={{ fontFamily: 'Poppins-SemiBold' }}
                      >
                        View Profile
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default FindProsScreen;
