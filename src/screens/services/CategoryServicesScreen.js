import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const CategoryServicesScreen = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [categoryId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.CATEGORY_SERVICES(categoryId));
      // API returns { data: { category: {...}, services: [...] } }
      const servicesData = response.data?.services ||
        (Array.isArray(response.data) ? response.data : []);
      // Map snake_case to camelCase
      const mappedServices = servicesData.map(service => ({
        ...service,
        basePrice: service.base_price || service.basePrice,
        iconUrl: service.icon_url || service.iconUrl,
        estimatedDuration: service.estimated_duration || service.estimatedDuration,
      }));
      setServices(mappedServices);
      setFilteredServices(mappedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('plumb')) return 'pipe';
    if (name.includes('electr')) return 'lightning-bolt';
    if (name.includes('clean')) return 'broom';
    if (name.includes('paint')) return 'format-paint';
    if (name.includes('garden')) return 'flower';
    if (name.includes('car')) return 'car';
    if (name.includes('repair')) return 'hammer-wrench';
    return 'tools';
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
            {categoryName}
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
          {categoryName}
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
              placeholder={`Search in ${categoryName}...`}
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

        {/* Services Count */}
        <View className="px-6 pt-4 pb-2">
          <Text
            className="text-base font-medium text-gray-700"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}{' '}
            Available
          </Text>
        </View>

        {/* Services List */}
        <View className="px-6 pb-6">
          {filteredServices.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="search-outline" size={64} color={COLORS.textSecondary} />
              <Text
                className="text-gray-500 text-center mt-4"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {searchQuery ? 'No services found' : 'No services available'}
              </Text>
            </View>
          ) : (
            filteredServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                className="flex-row items-center bg-white border border-gray-200 rounded-xl p-4 mb-3"
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('FindPros', {
                    serviceId: service.id,
                    serviceName: service.name,
                  })
                }
              >
                {/* Service Icon */}
                <View className="bg-blue-50 rounded-lg p-2 mr-3">
                  <MaterialCommunityIcons
                    name={getServiceIcon(service.name)}
                    size={32}
                    color={COLORS.primary}
                  />
                </View>

                {/* Service Info */}
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold text-gray-900"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    {service.name}
                  </Text>
                  {service.description && (
                    <Text
                      className="text-xs text-gray-500 mt-0.5"
                      style={{ fontFamily: 'Poppins-Regular' }}
                      numberOfLines={2}
                    >
                      {service.description}
                    </Text>
                  )}
                  {service.basePrice && (
                    <Text
                      className="text-sm text-gray-700 mt-1"
                      style={{ fontFamily: 'Poppins-Medium' }}
                    >
                      From {parseFloat(service.basePrice).toLocaleString()} XAF
                    </Text>
                  )}
                </View>

                {/* Arrow Icon */}
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CategoryServicesScreen;
