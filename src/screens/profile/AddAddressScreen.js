import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const AddAddressScreen = ({ route, navigation }) => {
  const { address, isEdit } = route.params || {};
  const insets = useSafeAreaInsets();

  const [label, setLabel] = useState(address?.label || '');
  const [addressLine, setAddressLine] = useState(address?.addressLine || address?.address_line || '');
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSubZone, setSelectedSubZone] = useState(null);
  const [isDefault, setIsDefault] = useState(address?.isDefault || address?.is_default || false);

  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showSubZoneModal, setShowSubZoneModal] = useState(false);

  const labelOptions = ['Home', 'Work', 'Office', 'Other'];

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoadingZones(true);
      const response = await apiService.get(API_ENDPOINTS.ZONES_ALL);
      const zonesData = Array.isArray(response.data) ? response.data : [];
      setZones(zonesData);

      // If editing, set the selected zone and subzone
      if (address) {
        const zoneId = address.zoneId || address.zone_id;
        const subZoneId = address.subZoneId || address.sub_zone_id;

        if (zoneId) {
          const zone = zonesData.find((z) => z.id === zoneId);
          if (zone) {
            setSelectedZone(zone);
            if (subZoneId) {
              const subZones = zone.sub_zones || zone.subZones || [];
              const subZone = subZones.find((sz) => sz.id === subZoneId);
              if (subZone) {
                setSelectedSubZone(subZone);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      Alert.alert('Error', 'Failed to load zones');
    } finally {
      setLoadingZones(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!label.trim()) {
      Alert.alert('Error', 'Please enter a label for the address');
      return;
    }
    if (!addressLine.trim()) {
      Alert.alert('Error', 'Please enter the address');
      return;
    }
    if (!selectedZone) {
      Alert.alert('Error', 'Please select a zone');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        label: label.trim(),
        addressLine: addressLine.trim(),
        zoneId: selectedZone.id,
        subZoneId: selectedSubZone?.id || null,
        isDefault,
      };

      if (isEdit && address?.id) {
        await apiService.patch(`${API_ENDPOINTS.USER_ADDRESSES}/${address.id}`, payload);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await apiService.post(API_ENDPOINTS.USER_ADDRESSES, payload);
        Alert.alert('Success', 'Address added successfully');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const getSubZones = () => {
    if (!selectedZone) return [];
    return selectedZone.sub_zones || selectedZone.subZones || [];
  };

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
          {isEdit ? 'Edit Address' : 'Add Address'}
        </Text>
      </View>

      {loadingZones ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="px-6 py-4">
            {/* Label Selection */}
            <View className="mb-4">
              <Text
                className="text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                Label
              </Text>
              <View className="flex-row flex-wrap">
                {labelOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                      label === option
                        ? 'bg-blue-600'
                        : 'bg-white border border-gray-200'
                    }`}
                    activeOpacity={0.7}
                    onPress={() => setLabel(option)}
                  >
                    <Text
                      className={`text-sm ${
                        label === option ? 'text-white' : 'text-gray-700'
                      }`}
                      style={{ fontFamily: 'Poppins-Medium' }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {label === 'Other' && (
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 mt-2 text-gray-900"
                  style={{ fontFamily: 'Poppins-Regular' }}
                  placeholder="Enter custom label"
                  placeholderTextColor={COLORS.textSecondary}
                  value={label === 'Other' ? '' : label}
                  onChangeText={setLabel}
                />
              )}
            </View>

            {/* Address Line */}
            <View className="mb-4">
              <Text
                className="text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                Address
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                style={{ fontFamily: 'Poppins-Regular', minHeight: 80, textAlignVertical: 'top' }}
                placeholder="Enter full address (street, building, landmark)"
                placeholderTextColor={COLORS.textSecondary}
                value={addressLine}
                onChangeText={setAddressLine}
                multiline
              />
            </View>

            {/* Zone Selection */}
            <View className="mb-4">
              <Text
                className="text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                Zone *
              </Text>
              <TouchableOpacity
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                activeOpacity={0.7}
                onPress={() => setShowZoneModal(true)}
              >
                <Text
                  className={`text-base ${selectedZone ? 'text-gray-900' : 'text-gray-400'}`}
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  {selectedZone?.name || 'Select zone'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Sub-Zone Selection */}
            {selectedZone && getSubZones().length > 0 && (
              <View className="mb-4">
                <Text
                  className="text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  Sub-Zone (Optional)
                </Text>
                <TouchableOpacity
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  activeOpacity={0.7}
                  onPress={() => setShowSubZoneModal(true)}
                >
                  <Text
                    className={`text-base ${selectedSubZone ? 'text-gray-900' : 'text-gray-400'}`}
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    {selectedSubZone?.name || 'Select sub-zone'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Default Toggle */}
            <TouchableOpacity
              className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-4 mb-6"
              activeOpacity={0.7}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View className="flex-row items-center">
                <Ionicons name="star-outline" size={20} color={COLORS.primary} />
                <Text
                  className="text-base text-gray-900 ml-3"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  Set as default address
                </Text>
              </View>
              <Ionicons
                name={isDefault ? 'checkbox' : 'square-outline'}
                size={24}
                color={isDefault ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${
                saving ? 'bg-blue-400' : 'bg-blue-600'
              }`}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  className="text-white text-base font-semibold"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {isEdit ? 'Update Address' : 'Save Address'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Zone Selection Modal */}
      <Modal
        visible={showZoneModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowZoneModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Select Zone
              </Text>
              <TouchableOpacity onPress={() => setShowZoneModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={zones}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-6 py-4 border-b border-gray-100 flex-row items-center justify-between ${
                    selectedZone?.id === item.id ? 'bg-blue-50' : ''
                  }`}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedZone(item);
                    setSelectedSubZone(null);
                    setShowZoneModal(false);
                  }}
                >
                  <View>
                    <Text
                      className={`text-base ${
                        selectedZone?.id === item.id ? 'text-blue-600' : 'text-gray-900'
                      }`}
                      style={{ fontFamily: 'Poppins-Medium' }}
                    >
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text
                        className="text-xs text-gray-500 mt-0.5"
                        style={{ fontFamily: 'Poppins-Regular' }}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {selectedZone?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Sub-Zone Selection Modal */}
      <Modal
        visible={showSubZoneModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSubZoneModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Select Sub-Zone
              </Text>
              <TouchableOpacity onPress={() => setShowSubZoneModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getSubZones()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-6 py-4 border-b border-gray-100 flex-row items-center justify-between ${
                    selectedSubZone?.id === item.id ? 'bg-blue-50' : ''
                  }`}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedSubZone(item);
                    setShowSubZoneModal(false);
                  }}
                >
                  <Text
                    className={`text-base ${
                      selectedSubZone?.id === item.id ? 'text-blue-600' : 'text-gray-900'
                    }`}
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    {item.name}
                  </Text>
                  {selectedSubZone?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListHeaderComponent={
                <TouchableOpacity
                  className={`px-6 py-4 border-b border-gray-100 flex-row items-center justify-between ${
                    !selectedSubZone ? 'bg-blue-50' : ''
                  }`}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedSubZone(null);
                    setShowSubZoneModal(false);
                  }}
                >
                  <Text
                    className={`text-base ${!selectedSubZone ? 'text-blue-600' : 'text-gray-500'}`}
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    None (Zone only)
                  </Text>
                  {!selectedSubZone && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddAddressScreen;
