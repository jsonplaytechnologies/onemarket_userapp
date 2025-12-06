import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser, fetchUserProfile } = useAuth();

  const currentFirstName = user?.profile?.first_name || user?.profile?.firstName || '';
  const currentLastName = user?.profile?.last_name || user?.profile?.lastName || '';
  const currentAvatar = user?.profile?.avatar_url || user?.profile?.avatarUrl || null;

  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [newAvatarUri, setNewAvatarUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewAvatarUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewAvatarUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());

      if (newAvatarUri) {
        const filename = newAvatarUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('avatar', {
          uri: newAvatarUri,
          name: filename,
          type,
        });
      }

      const response = await apiService.patch(API_ENDPOINTS.USER_PROFILE, formData);

      if (response.success) {
        // Refresh user profile
        await fetchUserProfile();
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = newAvatarUri || avatar;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className="p-2 -mr-2"
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text
                className="text-base font-medium text-blue-600"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center py-8 bg-white mb-4">
          <TouchableOpacity onPress={showImageOptions} activeOpacity={0.8}>
            <View className="relative">
              {displayAvatar ? (
                <Image
                  source={{ uri: displayAvatar }}
                  className="w-28 h-28 rounded-full"
                />
              ) : (
                <View className="w-28 h-28 bg-blue-50 rounded-full items-center justify-center">
                  <Ionicons name="person" size={48} color={COLORS.primary} />
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-blue-600 w-9 h-9 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="camera" size={18} color="white" />
              </View>
            </View>
          </TouchableOpacity>
          <Text
            className="text-sm text-gray-500 mt-3"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Tap to change photo
          </Text>
        </View>

        {/* Form Section */}
        <View className="bg-white px-6 py-4">
          <View className="mb-5">
            <Text
              className="text-sm font-medium text-gray-700 mb-2"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              First Name
            </Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
              style={{ fontFamily: 'Poppins-Regular' }}
            />
          </View>

          <View className="mb-5">
            <Text
              className="text-sm font-medium text-gray-700 mb-2"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Last Name
            </Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
              style={{ fontFamily: 'Poppins-Regular' }}
            />
          </View>

          <View className="mb-5">
            <Text
              className="text-sm font-medium text-gray-700 mb-2"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Phone Number
            </Text>
            <View className="border border-gray-200 bg-gray-100 rounded-xl px-4 py-3">
              <Text
                className="text-base text-gray-500"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                {user?.phone || 'Not set'}
              </Text>
            </View>
            <Text
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Phone number cannot be changed
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;
