import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.USER_ADDRESSES);
      const addressesData = response.data?.addresses || response.data || [];
      setAddresses(Array.isArray(addressesData) ? addressesData : []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  const handleSetDefault = async (addressId) => {
    try {
      await apiService.patch(`${API_ENDPOINTS.USER_ADDRESSES}/${addressId}/default`);
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const handleDelete = (addressId, label) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.delete(`${API_ENDPOINTS.USER_ADDRESSES}/${addressId}`);
              fetchAddresses();
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
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
            My Addresses
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
          My Addresses
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AddAddress')}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 py-4">
          {addresses.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Ionicons name="location-outline" size={64} color={COLORS.textSecondary} />
              <Text
                className="text-gray-500 text-center mt-4"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                No addresses saved yet
              </Text>
              <TouchableOpacity
                className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddAddress')}
              >
                <Text
                  className="text-white font-medium"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  Add Your First Address
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map((address) => {
              const isDefault = address.isDefault || address.is_default;
              const label = address.label || 'Address';
              const addressLine = address.addressLine || address.address_line || '';
              const zoneName = address.zoneName || address.zone_name || '';
              const subZoneName = address.subZoneName || address.sub_zone_name || '';

              return (
                <View
                  key={address.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row items-start">
                    {/* Icon */}
                    <View
                      className={`rounded-full p-2 mr-3 ${
                        isDefault ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <Ionicons
                        name={
                          label.toLowerCase().includes('home')
                            ? 'home'
                            : label.toLowerCase().includes('work')
                            ? 'briefcase'
                            : 'location'
                        }
                        size={20}
                        color={isDefault ? COLORS.primary : COLORS.textSecondary}
                      />
                    </View>

                    {/* Address Info */}
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text
                          className="text-base font-semibold text-gray-900"
                          style={{ fontFamily: 'Poppins-SemiBold' }}
                        >
                          {label}
                        </Text>
                        {isDefault && (
                          <View className="bg-blue-100 px-2 py-0.5 rounded ml-2">
                            <Text
                              className="text-xs text-blue-600"
                              style={{ fontFamily: 'Poppins-Medium' }}
                            >
                              Default
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        className="text-sm text-gray-600 mt-1"
                        style={{ fontFamily: 'Poppins-Regular' }}
                      >
                        {addressLine}
                      </Text>

                      {(zoneName || subZoneName) && (
                        <Text
                          className="text-xs text-gray-500 mt-1"
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          {zoneName}{subZoneName ? `, ${subZoneName}` : ''}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View className="flex-row mt-4 pt-3 border-t border-gray-100">
                    {!isDefault && (
                      <TouchableOpacity
                        className="flex-row items-center mr-6"
                        activeOpacity={0.7}
                        onPress={() => handleSetDefault(address.id)}
                      >
                        <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
                        <Text
                          className="text-sm text-blue-600 ml-1"
                          style={{ fontFamily: 'Poppins-Medium' }}
                        >
                          Set Default
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      className="flex-row items-center mr-6"
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation.navigate('AddAddress', { address, isEdit: true })
                      }
                    >
                      <Ionicons name="create-outline" size={18} color={COLORS.textSecondary} />
                      <Text
                        className="text-sm text-gray-600 ml-1"
                        style={{ fontFamily: 'Poppins-Medium' }}
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center"
                      activeOpacity={0.7}
                      onPress={() => handleDelete(address.id, label)}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                      <Text
                        className="text-sm text-red-500 ml-1"
                        style={{ fontFamily: 'Poppins-Medium' }}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AddressesScreen;
