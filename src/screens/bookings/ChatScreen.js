import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/api';
import { API_ENDPOINTS, API_BASE_URL } from '../../constants/api';
import { COLORS } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { useBookingSocket } from '../../hooks/useSocket';

const { width: screenWidth } = Dimensions.get('window');

const ChatScreen = ({ route, navigation }) => {
  const { bookingId, booking } = route.params;
  const { user, token } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    isConnected,
    messages,
    setMessages,
    isProTyping,
    send,
    typing,
    markRead,
  } = useBookingSocket(bookingId);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
  }, [bookingId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const messageCount = Array.isArray(messages) ? messages.length : 0;
    if (messageCount > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.BOOKING_MESSAGES(bookingId));
      if (response.success && response.data) {
        const messagesData = response.data.messages || response.data || [];
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await apiService.patch(API_ENDPOINTS.BOOKING_MESSAGES_READ(bookingId));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSend = async () => {
    const trimmedText = messageText.trim();
    if (!trimmedText) return;

    try {
      setSending(true);
      setMessageText('');

      const response = await apiService.post(API_ENDPOINTS.BOOKING_MESSAGES(bookingId), {
        content: trimmedText,
        messageType: 'text',
      });

      if (response.success && response.data) {
        const newMessage = response.data.message || response.data;
        setMessages((prev) => {
          const prevMessages = Array.isArray(prev) ? prev : [];
          const exists = prevMessages.some((m) => m.id === newMessage.id);
          if (!exists) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }

      if (isConnected) {
        send(trimmedText, 'text');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(trimmedText);
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to send images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      sendImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      sendImage(result.assets[0]);
    }
  };

  const sendImage = async (imageAsset) => {
    setUploadingImage(true);

    try {
      const formData = new FormData();
      const filename = imageAsset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageAsset.uri,
        name: filename,
        type,
      });

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BOOKING_MESSAGES_IMAGE(bookingId)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        // If socket is not connected, add message manually (otherwise socket will handle it)
        if (!isConnected && data.data?.message) {
          setMessages(prev => {
            const prevMessages = Array.isArray(prev) ? prev : [];
            return [...prevMessages, data.data.message];
          });
        }
        flatListRef.current?.scrollToEnd({ animated: true });
      } else {
        alert(data.message || 'Failed to send image');
      }
    } catch (error) {
      console.error('Error sending image:', error);
      alert('Failed to send image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTyping = (text) => {
    setMessageText(text);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isConnected && text.length > 0) {
      typing(true);

      typingTimeoutRef.current = setTimeout(() => {
        typing(false);
      }, 2000);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateHeader = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const shouldShowDateHeader = (message, index) => {
    if (index === 0) return true;

    const prevMessage = messages[index - 1];
    const currentDate = new Date(message.createdAt || message.created_at).toDateString();
    const prevDate = new Date(prevMessage.createdAt || prevMessage.created_at).toDateString();

    return currentDate !== prevDate;
  };

  const isOwnMessage = (message) => {
    return message.senderId === user?.id || message.sender_id === user?.id;
  };

  const proFirstName = booking?.pro?.firstName || booking?.pro?.first_name || '';
  const proLastName = booking?.pro?.lastName || booking?.pro?.last_name || '';
  const proAvatar = booking?.pro?.avatar || booking?.pro?.avatarUrl || booking?.pro?.avatar_url;
  const proName = `${proFirstName} ${proLastName}`.trim() || 'Service Provider';

  const renderMessage = ({ item, index }) => {
    const isOwn = isOwnMessage(item);
    const showDateHeader = shouldShowDateHeader(item, index);
    const messageType = item.message_type || item.type || 'text';
    const isImage = messageType === 'image';

    return (
      <View>
        {/* Date Header */}
        {showDateHeader && (
          <View className="items-center my-4">
            <View className="bg-gray-200 px-3 py-1 rounded-full">
              <Text
                className="text-xs text-gray-600"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {formatDateHeader(item.createdAt || item.created_at)}
              </Text>
            </View>
          </View>
        )}

        {/* Message Bubble */}
        <View
          className={`flex-row mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
        >
          {/* Pro Avatar (for received messages) */}
          {!isOwn && (
            <View className="mr-2">
              {proAvatar ? (
                <Image
                  source={{ uri: proAvatar }}
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                />
              ) : (
                <View
                  className="bg-gray-200 items-center justify-center"
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                >
                  <Ionicons name="person" size={16} color={COLORS.textSecondary} />
                </View>
              )}
            </View>
          )}

          {isImage ? (
            <TouchableOpacity
              onPress={() => setSelectedImage(item.content)}
              activeOpacity={0.9}
            >
              <View
                className={`rounded-2xl overflow-hidden ${
                  isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                }`}
                style={{ maxWidth: screenWidth * 0.65 }}
              >
                <Image
                  source={{ uri: item.content }}
                  style={{
                    width: screenWidth * 0.65,
                    height: screenWidth * 0.65,
                    borderRadius: 16,
                  }}
                  resizeMode="cover"
                />
                <View
                  className={`absolute bottom-2 ${isOwn ? 'right-2' : 'left-2'} px-2 py-0.5 rounded-full flex-row items-center`}
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  <Text
                    className="text-white text-xs"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    {formatTime(item.createdAt || item.created_at)}
                  </Text>
                  {isOwn && (
                    <Ionicons
                      name={item.isRead || item.is_read ? 'checkmark-done' : 'checkmark'}
                      size={12}
                      color="#FFFFFF"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                isOwn
                  ? 'bg-blue-600 rounded-br-md'
                  : 'bg-white border border-gray-200 rounded-bl-md'
              }`}
            >
              <Text
                className={`text-base ${isOwn ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {item.content}
              </Text>

              <View className={`flex-row items-center mt-1 ${isOwn ? 'justify-end' : ''}`}>
                <Text
                  className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  {formatTime(item.createdAt || item.created_at)}
                </Text>

                {isOwn && (
                  <Ionicons
                    name={item.isRead || item.is_read ? 'checkmark-done' : 'checkmark'}
                    size={14}
                    color={item.isRead || item.is_read ? '#93C5FD' : '#BFDBFE'}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
            </View>
          )}
        </View>
      </View>
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
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Chat
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity
          className="mr-4"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {proAvatar ? (
          <Image
            source={{ uri: proAvatar }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <View
            className="bg-gray-200 items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: 20 }}
          >
            <Ionicons name="person" size={20} color={COLORS.textSecondary} />
          </View>
        )}

        <View className="ml-3 flex-1">
          <Text
            className="text-base font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            {proName}
          </Text>
          {isProTyping ? (
            <Text
              className="text-xs text-blue-600"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              typing...
            </Text>
          ) : (
            <Text
              className="text-xs text-gray-500"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {isConnected ? 'Online' : 'Offline'}
            </Text>
          )}
        </View>

        <View
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={Array.isArray(messages) ? messages : []}
        keyExtractor={(item, index) => `${item.id || 'msg'}-${index}`}
        renderItem={renderMessage}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
            <Text
              className="text-gray-500 text-center mt-4"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              No messages yet.{'\n'}Start the conversation!
            </Text>
          </View>
        }
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      {/* Typing Indicator */}
      {isProTyping && (
        <View className="px-4 py-2">
          <View className="flex-row items-center">
            {proAvatar ? (
              <Image
                source={{ uri: proAvatar }}
                style={{ width: 24, height: 24, borderRadius: 12 }}
              />
            ) : (
              <View
                className="bg-gray-200 items-center justify-center"
                style={{ width: 24, height: 24, borderRadius: 12 }}
              >
                <Ionicons name="person" size={12} color={COLORS.textSecondary} />
              </View>
            )}
            <View className="bg-gray-200 rounded-full px-4 py-2 ml-2">
              <Text className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins-Regular' }}>
                typing...
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Uploading Indicator */}
      {uploadingImage && (
        <View className="px-4 pb-2 flex-row items-center">
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text
            className="text-sm text-gray-500 ml-2"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Sending image...
          </Text>
        </View>
      )}

      {/* Input Area */}
      <View
        className="bg-white border-t border-gray-200 px-4 pt-3 flex-row items-end"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        {/* Image Picker Buttons */}
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={pickImage}
          disabled={uploadingImage}
        >
          <Ionicons name="image-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-10 h-10 items-center justify-center mr-2"
          onPress={takePhoto}
          disabled={uploadingImage}
        >
          <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <TextInput
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-gray-900 max-h-[100px]"
          style={{ fontFamily: 'Poppins-Regular' }}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={messageText}
          onChangeText={handleTyping}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          className={`ml-3 rounded-full p-3 ${
            messageText.trim() ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          activeOpacity={0.7}
          onPress={handleSend}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={messageText.trim() ? 'white' : COLORS.textSecondary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View className="flex-1 bg-black">
          <View className="flex-1 pt-12">
            <TouchableOpacity
              className="absolute top-12 right-4 z-10 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                className="flex-1"
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
