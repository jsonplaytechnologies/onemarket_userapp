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

const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('home') || name.includes('repair')) return 'construct-outline';
  if (name.includes('clean')) return 'sparkles-outline';
  if (name.includes('beauty') || name.includes('wellness')) return 'flower-outline';
  if (name.includes('moving') || name.includes('transport')) return 'car-outline';
  if (name.includes('electronic')) return 'phone-portrait-outline';
  if (name.includes('garden') || name.includes('landscape')) return 'leaf-outline';
  return 'grid-outline';
};

const ServicesTab = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          Services
        </Text>
        <Text
          className="text-sm text-gray-500 mt-1"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          Find professionals for your needs
        </Text>
      </View>

      {/* Categories Grid */}
      <View className="px-6 pt-4 pb-6">
        {categories.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="grid-outline" size={64} color={COLORS.textSecondary} />
            <Text
              className="text-gray-500 text-center mt-4"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              No categories available
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => {
              const serviceCount = parseInt(category.service_count || category.serviceCount || 0);
              return (
                <TouchableOpacity
                  key={category.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 mb-4 items-center"
                  style={{ width: '48%' }}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('CategoryServices', {
                      categoryId: category.id,
                      categoryName: category.name,
                    })
                  }
                >
                  {/* Icon */}
                  <View className="bg-blue-50 rounded-full p-4 mb-3">
                    {(category.iconUrl || category.icon_url) ? (
                      <Image
                        source={{ uri: category.iconUrl || category.icon_url }}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons
                        name={getCategoryIcon(category.name)}
                        size={40}
                        color={COLORS.primary}
                      />
                    )}
                  </View>

                  {/* Category Name */}
                  <Text
                    className="text-base font-semibold text-gray-900 text-center"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                    numberOfLines={2}
                  >
                    {category.name}
                  </Text>

                  {/* Service Count */}
                  <Text
                    className="text-xs text-gray-500 mt-1"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
                  </Text>
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
