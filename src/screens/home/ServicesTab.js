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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

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
    setRefreshing(false);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {!searchQuery && (
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

      {/* All Categories */}
      <View className="mt-6 px-4 pb-8">
        <Text
          className="text-base text-gray-900 mb-4"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          {searchQuery ? 'Search Results' : 'All Services'}
        </Text>

        {filteredCategories.length === 0 ? (
          <View className="items-center justify-center py-12">
            <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
              <Ionicons name="search-outline" size={28} color="#9CA3AF" />
            </View>
            <Text
              className="text-gray-500"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              {searchQuery ? 'No services found' : 'No services available'}
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filteredCategories.map((category, index) => {
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
        )}
      </View>
    </ScrollView>
  );
};

export default ServicesTab;
