import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService, { ApiError } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const CreateBookingScreen = ({ route, navigation }) => {
  const { proId, proName, serviceName, services = [] } = route.params;
  const insets = useSafeAreaInsets();

  const [selectedService, setSelectedService] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userNote, setUserNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  useEffect(() => {
    fetchAddresses();
    // Pre-select service if serviceName matches
    if (serviceName && services.length > 0) {
      const matchingService = services.find(
        (s) =>
          (s.service_name || s.serviceName || s.name)?.toLowerCase() ===
          serviceName?.toLowerCase()
      );
      if (matchingService) {
        setSelectedService(matchingService);
      }
    }
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

  const handleSubmit = async () => {
    if (!selectedService) {
      Alert.alert('Error', 'Please select a service');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Error', 'Please select an address');
      return;
    }

    try {
      setSubmitting(true);

      const serviceId =
        selectedService.service_id ||
        selectedService.serviceId ||
        selectedService.id;

      const bookingData = {
        proId,
        serviceId,
        userAddressId: selectedAddress.id,
        userNote: userNote.trim() || undefined,
      };

      const response = await apiService.post(API_ENDPOINTS.BOOKINGS, bookingData);

      if (response.success) {
        // API returns { data: { booking: {...} } }
        const createdBooking = response.data.booking || response.data;
        const newBookingId = createdBooking.id;

        Alert.alert(
          'Booking Created',
          'Your booking has been submitted. The service provider will respond shortly.',
          [
            {
              text: 'View Booking',
              onPress: () => {
                navigation.replace('BookingDetails', {
                  bookingId: newBookingId,
                });
              },
            },
            {
              text: 'Go to Bookings',
              onPress: () => {
                navigation.navigate('MainTabs', { screen: 'Bookings' });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating booking:', error);

      if (error.code === 'RATE_LIMITED') {
        Alert.alert(
          'Please Wait',
          `Too many booking requests. Try again in ${error.retryAfter} seconds.`
        );
      } else if (error.code === 'VALIDATION_ERROR') {
        // Display validation errors
        const errorMsg = error.errors && error.errors.length > 0
          ? error.errors.map(e => `${e.path || 'Field'}: ${e.msg}`).join('\n')
          : error.message;
        Alert.alert('Validation Error', errorMsg);
      } else {
        Alert.alert('Error', error.message || 'Failed to create booking');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString() + ' XAF' : 'Contact for price';
  };

  const getServiceId = (service) => {
    return service.service_id || service.serviceId || service.id;
  };

  const getServiceName = (service) => {
    return service.service_name || service.serviceName || service.name;
  };

  const getServicePrice = (service) => {
    return service.price || service.customPrice || service.basePrice;
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
            with {proName}
          </Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={100}
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}
      >
        {/* Service Selection */}
        <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
          <Text
            className="text-base font-semibold text-gray-900 mb-3"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Select Service *
          </Text>

          {services.length === 0 ? (
            <Text
              className="text-gray-500"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              No services available
            </Text>
          ) : (
            services.map((service) => {
              const serviceId = getServiceId(service);
              const serviceNameText = getServiceName(service);
              const price = getServicePrice(service);
              const isSelected =
                selectedService && getServiceId(selectedService) === serviceId;
              const isAvailable = service.is_available !== false;

              return (
                <TouchableOpacity
                  key={serviceId}
                  className={`flex-row items-center justify-between p-4 rounded-xl mb-2 border ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  } ${!isAvailable ? 'opacity-50' : ''}`}
                  activeOpacity={isAvailable ? 0.7 : 1}
                  onPress={() => isAvailable && setSelectedService(service)}
                  disabled={!isAvailable}
                >
                  <View className="flex-row items-center flex-1">
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
                        className="text-base font-medium text-gray-900"
                        style={{ fontFamily: 'Poppins-Medium' }}
                      >
                        {serviceNameText}
                      </Text>
                      {!isAvailable && (
                        <Text
                          className="text-xs text-red-500"
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          Currently unavailable
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text
                    className="text-base font-semibold text-gray-900"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    {formatPrice(price)}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Address Selection */}
        <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-base font-semibold text-gray-900"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Service Location *
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

        {/* Notes */}
        <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
          <Text
            className="text-base font-semibold text-gray-900 mb-3"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Additional Notes (Optional)
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl p-4 text-gray-900 min-h-[100px]"
            style={{ fontFamily: 'Poppins-Regular', textAlignVertical: 'top' }}
            placeholder="Any specific requirements or details for the service provider..."
            placeholderTextColor="#9CA3AF"
            value={userNote}
            onChangeText={setUserNote}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Summary */}
        {selectedService && selectedAddress && (
          <View className="bg-white px-6 py-4 mt-3 border-b border-gray-200">
            <Text
              className="text-base font-semibold text-gray-900 mb-3"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Booking Summary
            </Text>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text
                className="text-sm text-gray-600"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Service
              </Text>
              <Text
                className="text-sm text-gray-900"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {getServiceName(selectedService)}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text
                className="text-sm text-gray-600"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Provider
              </Text>
              <Text
                className="text-sm text-gray-900"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {proName}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text
                className="text-sm text-gray-600"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Location
              </Text>
              <Text
                className="text-sm text-gray-900 flex-1 text-right ml-4"
                style={{ fontFamily: 'Poppins-Medium' }}
                numberOfLines={1}
              >
                {selectedAddress.label}
              </Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text
                className="text-sm text-gray-600"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Starting Price
              </Text>
              <Text
                className="text-base font-semibold text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                {formatPrice(getServicePrice(selectedService))}
              </Text>
            </View>

            <Text
              className="text-xs text-gray-500 mt-2"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              * Final price will be confirmed in the quotation from the provider
            </Text>
          </View>
        )}

      </KeyboardAwareScrollView>

      {/* Submit Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${
            selectedService && selectedAddress && !submitting
              ? 'bg-blue-600'
              : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={!selectedService || !selectedAddress || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              className="text-white text-base font-semibold"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Submit Booking Request
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateBookingScreen;
