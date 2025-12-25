import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const AddressSelectionScreen = ({ route, navigation }) => {
  const { service, answers } = route.params;
  const insets = useSafeAreaInsets();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Temporary address form state
  const [showTempForm, setShowTempForm] = useState(false);
  const [tempAddressLine, setTempAddressLine] = useState('');
  const [tempSubAddress, setTempSubAddress] = useState('');
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSubZone, setSelectedSubZone] = useState(null);
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [showSubZonePicker, setShowSubZonePicker] = useState(false);
  const [savingTemp, setSavingTemp] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [addressesRes, recentRes, zonesRes] = await Promise.all([
        apiService.get(API_ENDPOINTS.USER_ADDRESSES),
        apiService.get(API_ENDPOINTS.USER_ADDRESSES_RECENT).catch(() => ({ data: { addresses: [] } })),
        apiService.get(API_ENDPOINTS.ZONES_ALL),
      ]);

      const savedList = addressesRes.data?.addresses || addressesRes.data || [];
      const recentList = recentRes.data?.addresses || recentRes.data || [];
      const zonesList = zonesRes.data?.zones || zonesRes.data || [];

      setSavedAddresses(Array.isArray(savedList) ? savedList : []);
      setRecentAddresses(Array.isArray(recentList) ? recentList : []);
      setZones(Array.isArray(zonesList) ? zonesList : []);

      // Auto-select default address from saved
      const defaultAddress = savedList.find(
        (addr) => addr.isDefault || addr.is_default
      );
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (savedList.length > 0) {
        setSelectedAddress(savedList[0]);
      } else if (recentList.length > 0) {
        setSelectedAddress(recentList[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter recent addresses to exclude ones already in saved
  const filteredRecentAddresses = recentAddresses.filter(
    (recent) => !savedAddresses.some((saved) => saved.id === recent.id)
  );

  // Check if selected address is a newly created temporary one (not in saved or recent)
  const isSelectedTempNew = selectedAddress &&
    (selectedAddress.isTemporary || selectedAddress.is_temporary) &&
    !savedAddresses.some((addr) => addr.id === selectedAddress.id) &&
    !recentAddresses.some((addr) => addr.id === selectedAddress.id);

  const handleContinue = () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select an address');
      return;
    }

    navigation.navigate('ProviderSelection', {
      service,
      answers,
      address: selectedAddress,
    });
  };

  const handleAddTempAddress = async () => {
    if (!tempAddressLine.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }
    if (!selectedZone) {
      Alert.alert('Error', 'Please select a zone');
      return;
    }

    try {
      setSavingTemp(true);

      // Combine address line and sub-address
      const fullAddress = tempSubAddress.trim()
        ? `${tempAddressLine.trim()}, ${tempSubAddress.trim()}`
        : tempAddressLine.trim();

      const response = await apiService.post(API_ENDPOINTS.USER_ADDRESSES, {
        label: 'Temporary',
        addressLine: fullAddress,
        zoneId: selectedZone.id,
        subZoneId: selectedSubZone?.id || null,
        isTemporary: true,
      });

      const newAddress = response.data?.address || response.data;

      // Add zone/subzone names to the address object
      const addressWithDetails = {
        ...newAddress,
        zoneName: selectedZone.name,
        zone_name: selectedZone.name,
        subZoneName: selectedSubZone?.name,
        sub_zone_name: selectedSubZone?.name,
      };

      setSelectedAddress(addressWithDetails);
      setShowTempForm(false);
      setTempAddressLine('');
      setTempSubAddress('');
      setSelectedZone(null);
      setSelectedSubZone(null);

      Alert.alert('Success', 'Temporary address added');
    } catch (error) {
      console.error('Error adding temp address:', error);
      Alert.alert('Error', error.message || 'Failed to add address');
    } finally {
      setSavingTemp(false);
    }
  };

  const getServiceName = () => {
    return service?.service_name || service?.serviceName || service?.name || 'Service';
  };

  const renderAddressItem = (address, isSelected) => {
    const addressLine = address.addressLine || address.address_line || '';
    const zoneName = address.zoneName || address.zone_name || address.zone?.name || '';
    const subZoneName = address.subZoneName || address.sub_zone_name || address.subZone?.name || '';
    const isTemporary = address.isTemporary || address.is_temporary;

    return (
      <TouchableOpacity
        key={address.id}
        className={`flex-row items-center p-4 rounded-xl mb-2 ${
          isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200 bg-white'
        }`}
        activeOpacity={0.7}
        onPress={() => setSelectedAddress(address)}
      >
        <View
          className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
          }`}
        >
          {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className="text-sm font-medium text-gray-900"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              {address.label || 'Address'}
            </Text>
            {isTemporary && (
              <View className="bg-orange-100 px-2 py-0.5 rounded ml-2">
                <Text className="text-xs text-orange-600" style={{ fontFamily: 'Poppins-Medium' }}>
                  Temporary
                </Text>
              </View>
            )}
          </View>
          <Text
            className="text-xs text-gray-500 mt-0.5"
            style={{ fontFamily: 'Poppins-Regular' }}
            numberOfLines={1}
          >
            {addressLine}
          </Text>
          {zoneName && (
            <Text
              className="text-xs text-gray-400"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {zoneName}{subZoneName ? ` - ${subZoneName}` : ''}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
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
            Select Location
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
            Select Location
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
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Selected Temporary Address (newly created) */}
        {isSelectedTempNew && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text
                className="text-sm font-medium text-blue-600 ml-2"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                SELECTED ADDRESS
              </Text>
            </View>
            {renderAddressItem(selectedAddress, true)}
          </View>
        )}

        {/* Recently Used Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
            <Text
              className="text-sm font-medium text-gray-500 ml-2"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              RECENTLY USED
            </Text>
          </View>
          {filteredRecentAddresses.length > 0 ? (
            filteredRecentAddresses.map((address) =>
              renderAddressItem(address, selectedAddress?.id === address.id)
            )
          ) : (
            <View className="bg-gray-50 rounded-xl p-4 items-center">
              <Text
                className="text-sm text-gray-400"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                No recent addresses from past bookings
              </Text>
            </View>
          )}
        </View>

        {/* Saved Addresses Section */}
        {savedAddresses.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="bookmark-outline" size={18} color={COLORS.textSecondary} />
                <Text
                  className="text-sm font-medium text-gray-500 ml-2"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  SAVED ADDRESSES
                </Text>
              </View>
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
            {savedAddresses.map((address) =>
              renderAddressItem(address, selectedAddress?.id === address.id)
            )}
          </View>
        )}

        {/* Empty State */}
        {savedAddresses.length === 0 && filteredRecentAddresses.length === 0 && !showTempForm && (
          <View className="bg-white rounded-xl p-6 items-center mb-6">
            <Ionicons name="location-outline" size={48} color={COLORS.textSecondary} />
            <Text
              className="text-gray-600 mt-3 text-center"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              No addresses yet
            </Text>
            <Text
              className="text-gray-400 text-sm text-center mt-1"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Add a saved address or use a temporary one
            </Text>
          </View>
        )}

        {/* Add Temporary Address Button/Form */}
        {!showTempForm ? (
          <TouchableOpacity
            className="flex-row items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white"
            activeOpacity={0.7}
            onPress={() => setShowTempForm(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
            <Text
              className="text-blue-600 ml-2 font-medium"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Add Temporary Address
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-base font-medium text-gray-900"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                Temporary Address
              </Text>
              <TouchableOpacity onPress={() => setShowTempForm(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Address Line Input */}
            <Text
              className="text-sm text-gray-600 mb-1"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Address *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 mb-3"
              style={{ fontFamily: 'Poppins-Regular' }}
              placeholder="Street address, area, landmark"
              placeholderTextColor="#9CA3AF"
              value={tempAddressLine}
              onChangeText={setTempAddressLine}
              multiline
            />

            {/* Sub Address Input */}
            <Text
              className="text-sm text-gray-600 mb-1"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Apt / Floor / Building (Optional)
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 mb-4"
              style={{ fontFamily: 'Poppins-Regular' }}
              placeholder="Apartment, suite, floor, building name"
              placeholderTextColor="#9CA3AF"
              value={tempSubAddress}
              onChangeText={setTempSubAddress}
            />

            {/* Zone Selector */}
            <Text
              className="text-sm text-gray-600 mb-1"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Zone *
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between"
              onPress={() => setShowZonePicker(true)}
            >
              <Text
                className={selectedZone ? 'text-gray-900' : 'text-gray-400'}
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {selectedZone?.name || 'Select zone'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Sub-Zone Selector */}
            {selectedZone?.subZones?.length > 0 && (
              <>
                <Text
                  className="text-sm text-gray-600 mb-1"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  Sub-Zone (Optional)
                </Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between"
                  onPress={() => setShowSubZonePicker(true)}
                >
                  <Text
                    className={selectedSubZone ? 'text-gray-900' : 'text-gray-400'}
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    {selectedSubZone?.name || 'Select sub-zone'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </>
            )}

            {/* Use This Address Button */}
            <TouchableOpacity
              className={`py-3 rounded-xl items-center ${
                tempAddressLine && selectedZone ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              activeOpacity={0.8}
              onPress={handleAddTempAddress}
              disabled={!tempAddressLine || !selectedZone || savingTemp}
            >
              {savingTemp ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className="text-white font-medium"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  Use This Address
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Info */}
        <View className="bg-blue-50 rounded-xl p-4 mt-6 flex-row">
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text
            className="text-xs text-gray-700 ml-3 flex-1"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Temporary addresses are used for this booking only. They'll appear in your recent addresses for future bookings.
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
            View Available Providers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Zone Picker Modal */}
      <Modal
        visible={showZonePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowZonePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-96">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Select Zone
              </Text>
              <TouchableOpacity onPress={() => setShowZonePicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              {zones.map((zone) => (
                <TouchableOpacity
                  key={zone.id}
                  className={`p-4 rounded-xl mb-2 ${
                    selectedZone?.id === zone.id ? 'bg-blue-50 border border-blue-500' : 'bg-gray-50'
                  }`}
                  onPress={() => {
                    setSelectedZone(zone);
                    setSelectedSubZone(null);
                    setShowZonePicker(false);
                  }}
                >
                  <Text
                    className="text-gray-900"
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    {zone.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sub-Zone Picker Modal */}
      <Modal
        visible={showSubZonePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSubZonePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-96">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Select Sub-Zone
              </Text>
              <TouchableOpacity onPress={() => setShowSubZonePicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              {selectedZone?.subZones?.map((subZone) => (
                <TouchableOpacity
                  key={subZone.id}
                  className={`p-4 rounded-xl mb-2 ${
                    selectedSubZone?.id === subZone.id ? 'bg-blue-50 border border-blue-500' : 'bg-gray-50'
                  }`}
                  onPress={() => {
                    setSelectedSubZone(subZone);
                    setShowSubZonePicker(false);
                  }}
                >
                  <Text
                    className="text-gray-900"
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    {subZone.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddressSelectionScreen;
