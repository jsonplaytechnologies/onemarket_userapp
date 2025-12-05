import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { BookingCard } from '../../components/bookings';
import { useSocket } from '../../hooks/useSocket';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const ACTIVE_STATUSES = [
  'accepted',
  'quotation_sent',
  'paid',
  'on_the_way',
  'job_start_requested',
  'job_started',
  'job_complete_requested',
];

const BookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { isConnected, on, off } = useSocket();

  useFocusEffect(
    useCallback(() => {
      fetchBookings(1, true);
    }, [])
  );

  // Listen for real-time booking updates
  useEffect(() => {
    if (isConnected) {
      on('booking-status-changed', (data) => {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === data.bookingId
              ? { ...booking, status: data.status, ...data }
              : booking
          )
        );
      });

      on('notification', (notification) => {
        if (notification.type?.includes('booking')) {
          // Refresh bookings on booking-related notifications
          fetchBookings(1, true);
        }
      });

      return () => {
        off('booking-status-changed');
        off('notification');
      };
    }
  }, [isConnected]);

  // Apply filter when bookings or filter changes
  useEffect(() => {
    applyFilter();
  }, [bookings, selectedFilter]);

  const fetchBookings = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await apiService.get(
        `${API_ENDPOINTS.BOOKINGS}?page=${pageNum}&limit=20`
      );

      if (response.success) {
        const newBookings = response.data || [];

        if (reset) {
          setBookings(newBookings);
        } else {
          setBookings((prev) => [...prev, ...newBookings]);
        }

        setPage(pageNum);
        setHasMore(
          response.pagination?.page < response.pagination?.totalPages
        );
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...bookings];

    switch (selectedFilter) {
      case 'active':
        filtered = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
        break;
      case 'pending':
        filtered = bookings.filter((b) => b.status === 'pending');
        break;
      case 'completed':
        filtered = bookings.filter((b) => b.status === 'completed');
        break;
      case 'cancelled':
        filtered = bookings.filter(
          (b) => b.status === 'cancelled' || b.status === 'rejected'
        );
        break;
      default:
        filtered = bookings;
    }

    setFilteredBookings(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings(1, true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchBookings(page + 1);
    }
  };

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  const getFilterCount = (filterKey) => {
    switch (filterKey) {
      case 'active':
        return bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length;
      case 'pending':
        return bookings.filter((b) => b.status === 'pending').length;
      case 'completed':
        return bookings.filter((b) => b.status === 'completed').length;
      case 'cancelled':
        return bookings.filter(
          (b) => b.status === 'cancelled' || b.status === 'rejected'
        ).length;
      default:
        return bookings.length;
    }
  };

  const renderHeader = () => (
    <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4">
      <Text
        className="text-2xl font-bold text-gray-900"
        style={{ fontFamily: 'Poppins-Bold' }}
      >
        My Bookings
      </Text>

      {/* Filter Pills */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        className="mt-4 -mx-6 px-6"
        renderItem={({ item }) => {
          const isSelected = selectedFilter === item.key;
          const count = getFilterCount(item.key);

          return (
            <TouchableOpacity
              className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
                isSelected ? 'bg-blue-600' : 'bg-gray-100'
              }`}
              activeOpacity={0.7}
              onPress={() => setSelectedFilter(item.key)}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected ? 'text-white' : 'text-gray-700'
                }`}
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {item.label}
              </Text>
              {count > 0 && (
                <View
                  className={`ml-2 px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    }`}
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
      <Text
        className="text-xl font-semibold text-gray-900 mt-4 text-center"
        style={{ fontFamily: 'Poppins-SemiBold' }}
      >
        {selectedFilter === 'all'
          ? 'No Bookings Yet'
          : `No ${STATUS_FILTERS.find((f) => f.key === selectedFilter)?.label} Bookings`}
      </Text>
      <Text
        className="text-base text-gray-500 text-center mt-2"
        style={{ fontFamily: 'Poppins-Regular' }}
      >
        {selectedFilter === 'all'
          ? 'Book a service provider to get started'
          : 'No bookings match this filter'}
      </Text>

      {selectedFilter === 'all' && (
        <TouchableOpacity
          className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text
            className="text-white font-medium"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            Browse Services
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {renderHeader()}

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard booking={item} onPress={() => handleBookingPress(item)} />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 100,
          flexGrow: filteredBookings.length === 0 ? 1 : undefined,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default BookingsScreen;
