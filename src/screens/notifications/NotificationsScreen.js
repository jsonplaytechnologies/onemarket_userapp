import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const NOTIFICATION_ICONS = {
  booking_request: 'calendar-outline',
  booking_accepted: 'checkmark-circle-outline',
  booking_rejected: 'close-circle-outline',
  quotation_sent: 'document-text-outline',
  payment_confirmed: 'card-outline',
  pro_on_the_way: 'navigate-outline',
  job_start_request: 'play-circle-outline',
  job_started: 'construct-outline',
  job_complete_request: 'flag-outline',
  job_completed: 'checkmark-done-circle-outline',
  review_received: 'star-outline',
  message: 'chatbubble-outline',
  default: 'notifications-outline',
};

const NOTIFICATION_COLORS = {
  booking_request: '#3B82F6',
  booking_accepted: '#10B981',
  booking_rejected: '#EF4444',
  quotation_sent: '#8B5CF6',
  payment_confirmed: '#10B981',
  pro_on_the_way: '#0EA5E9',
  job_start_request: '#F59E0B',
  job_started: '#6366F1',
  job_complete_request: '#F59E0B',
  job_completed: '#10B981',
  review_received: '#F59E0B',
  message: '#3B82F6',
  default: '#6B7280',
};

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.NOTIFICATIONS);
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await apiService.patch(API_ENDPOINTS.NOTIFICATION_READ(notification.id));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to relevant screen
    if (notification.booking_id) {
      navigation.navigate('BookingDetails', { bookingId: notification.booking_id });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiService.patch(API_ENDPOINTS.NOTIFICATIONS_READ_ALL);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getIcon = (type) => NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
  const getColor = (type) => NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.default;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      className={`flex-row items-start px-4 py-4 border-b border-gray-100 ${
        !item.is_read ? 'bg-blue-50' : 'bg-white'
      }`}
      activeOpacity={0.7}
      onPress={() => handleNotificationPress(item)}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${getColor(item.type)}20` }}
      >
        <Ionicons
          name={getIcon(item.type)}
          size={20}
          color={getColor(item.type)}
        />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm flex-1 ${
              !item.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
            }`}
            style={{ fontFamily: !item.is_read ? 'Poppins-SemiBold' : 'Poppins-Medium' }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            className="text-xs text-gray-400 ml-2"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {formatTime(item.created_at)}
          </Text>
        </View>

        <Text
          className="text-sm text-gray-500 mt-1"
          style={{ fontFamily: 'Poppins-Regular' }}
          numberOfLines={2}
        >
          {item.message}
        </Text>

        {!item.is_read && (
          <View className="w-2 h-2 rounded-full bg-blue-500 absolute right-0 top-0" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
      <Text
        className="text-lg font-semibold text-gray-700 mt-4"
        style={{ fontFamily: 'Poppins-SemiBold' }}
      >
        No Notifications
      </Text>
      <Text
        className="text-sm text-gray-500 text-center mt-2"
        style={{ fontFamily: 'Poppins-Regular' }}
      >
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4">
          <Text
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            Notifications
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
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View className="bg-red-500 rounded-full px-2 py-0.5 ml-2">
                <Text
                  className="text-xs text-white font-medium"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity activeOpacity={0.7} onPress={handleMarkAllRead}>
              <Text
                className="text-sm text-blue-600"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : {}}
      />
    </View>
  );
};

export default NotificationsScreen;
