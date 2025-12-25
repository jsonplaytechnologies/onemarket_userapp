import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const CreateBookingScreen = ({ route, navigation }) => {
  const { service: passedService } = route.params;
  const insets = useSafeAreaInsets();

  const [service] = useState(passedService || null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.USER_ADDRESSES);
      const addressesData = response.data?.addresses || response.data || [];
      const addressList = Array.isArray(addressesData) ? addressesData : [];
      setAddresses(addressList);

      // Auto-select default address
      const defaultAddress = addressList.find(
        (addr) => addr.isDefault || addr.is_default
      );
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (addressList.length > 0) {
        setSelectedAddress(addressList[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select an address');
      return;
    }

    // Navigate to service questions screen
    navigation.navigate('ServiceQuestions', {
      service,
      address: selectedAddress,
    });
  };

  const getServiceName = () => {
    return service?.service_name || service?.serviceName || service?.name || 'Service';
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
            Book Service
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
        <View className="flex-1">
          <Text
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Book Service
          </Text>
          <Text
            className="text-sm text-gray-500"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {getServiceName()}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      >
        {/* Service Info */}
        <View className="bg-white rounded-xl p-6 mb-6">
          <Text
            className="text-sm font-medium text-gray-500 mb-2"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            SELECTED SERVICE
          </Text>
          <Text
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            {getServiceName()}
          </Text>
        </View>

        {/* Address Selection */}
        <View className="bg-white rounded-xl p-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-sm font-medium text-gray-500"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              SERVICE LOCATION *
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AddAddress')}
            >
              <Text
                className="text-sm text-blue-600"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                + Add New
              </Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <TouchableOpacity
              className="border border-dashed border-gray-300 rounded-xl p-6 items-center"
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AddAddress')}
            >
              <Ionicons
                name="location-outline"
                size={32}
                color={COLORS.textSecondary}
              />
              <Text
                className="text-gray-500 mt-2"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Add an address to continue
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              {/* Selected Address */}
              {selectedAddress && (
                <TouchableOpacity
                  className="flex-row items-center p-4 rounded-xl border border-blue-500 bg-blue-50"
                  activeOpacity={0.7}
                  onPress={() => setShowAddressPicker(!showAddressPicker)}
                >
                  <View className="bg-blue-100 rounded-full p-2 mr-3">
                    <Ionicons name="location" size={20} color={COLORS.primary} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-base font-medium text-gray-900"
                      style={{ fontFamily: 'Poppins-Medium' }}
                    >
                      {selectedAddress.label || 'Address'}
                    </Text>
                    <Text
                      className="text-sm text-gray-600"
                      style={{ fontFamily: 'Poppins-Regular' }}
                      numberOfLines={1}
                    >
                      {selectedAddress.addressLine || selectedAddress.address_line}
                    </Text>
                  </View>
                  <Ionicons
                    name={showAddressPicker ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              )}

              {/* Address Picker Dropdown */}
              {showAddressPicker && (
                <View className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                  {addresses.map((address) => {
                    const isSelected = selectedAddress?.id === address.id;
                    const addressLine =
                      address.addressLine || address.address_line || '';
                    const zoneName = address.zoneName || address.zone_name || '';

                    return (
                      <TouchableOpacity
                        key={address.id}
                        className={`flex-row items-center p-4 border-b border-gray-100 ${
                          isSelected ? 'bg-gray-50' : 'bg-white'
                        }`}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedAddress(address);
                          setShowAddressPicker(false);
                        }}
                      >
                        <View
                          className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={12} color="white" />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-sm font-medium text-gray-900"
                            style={{ fontFamily: 'Poppins-Medium' }}
                          >
                            {address.label || 'Address'}
                          </Text>
                          <Text
                            className="text-xs text-gray-500"
                            style={{ fontFamily: 'Poppins-Regular' }}
                            numberOfLines={1}
                          >
                            {addressLine}
                            {zoneName ? `, ${zoneName}` : ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </View>

        {/* Info */}
        <View className="bg-blue-50 rounded-xl p-4 mt-6 flex-row">
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text
            className="text-xs text-gray-700 ml-3 flex-1"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Next, you'll answer a few questions about the service and choose how you'd like to book
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${
            selectedAddress ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={!selectedAddress}
        >
          <Text
            className="text-white text-base font-semibold"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateBookingScreen;
