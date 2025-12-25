import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';

const BookingDescriptionScreen = ({ route, navigation }) => {
  const { service, address, answers } = route.params;
  const insets = useSafeAreaInsets();

  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to add photos.'
        );
        return false;
      }
    }
    return true;
  };

  const handleAddPhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos((prev) => [...prev, result.assets[0]]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    navigation.navigate('BookingPath', {
      service,
      address,
      answers,
      description: description.trim(),
      photos,
    });
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
        <View className="flex-1">
          <Text
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Add Details
          </Text>
          <Text
            className="text-xs text-gray-500"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Optional but recommended
          </Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View className="mb-6">
          <Text
            className="text-sm font-medium text-gray-700 mb-2"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            Job Description
          </Text>
          <Text
            className="text-xs text-gray-500 mb-3"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Provide any additional details about the job
          </Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900 min-h-[120px]"
            style={{ fontFamily: 'Poppins-Regular', textAlignVertical: 'top' }}
            placeholder="Example: I need help cleaning a 3-bedroom apartment. Kitchen and bathrooms need deep cleaning..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
          />
        </View>

        {/* Photos */}
        <View className="mb-6">
          <Text
            className="text-sm font-medium text-gray-700 mb-2"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            Photos (Optional)
          </Text>
          <Text
            className="text-xs text-gray-500 mb-3"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Add photos to help the provider understand the job better
          </Text>

          {/* Photo Grid */}
          <View className="flex-row flex-wrap">
            {photos.map((photo, index) => (
              <View key={index} className="w-1/3 p-1">
                <View className="relative">
                  <Image
                    source={{ uri: photo.uri }}
                    className="w-full rounded-lg"
                    style={{ aspectRatio: 1 }}
                  />
                  <TouchableOpacity
                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                    activeOpacity={0.7}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Add Photo Button */}
            {photos.length < 6 && (
              <View className="w-1/3 p-1">
                <TouchableOpacity
                  className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
                  style={{ aspectRatio: 1 }}
                  activeOpacity={0.7}
                  onPress={handleAddPhoto}
                >
                  <Ionicons name="camera-outline" size={32} color={COLORS.textSecondary} />
                  <Text
                    className="text-xs text-gray-500 mt-1"
                    style={{ fontFamily: 'Poppins-Regular' }}
                  >
                    Add Photo
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {photos.length >= 6 && (
            <Text
              className="text-xs text-gray-500 mt-2"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Maximum 6 photos allowed
            </Text>
          )}
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 rounded-xl p-4 flex-row">
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text
            className="text-xs text-gray-700 ml-3 flex-1"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Adding a detailed description and photos helps providers give you more accurate quotes
          </Text>
        </View>
      </KeyboardAwareScrollView>

      {/* Continue Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-xl items-center"
          activeOpacity={0.8}
          onPress={handleContinue}
        >
          <Text
            className="text-white text-base font-semibold"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Continue
          </Text>
        </TouchableOpacity>

        {!description && photos.length === 0 && (
          <TouchableOpacity
            className="py-3 items-center"
            activeOpacity={0.7}
            onPress={handleContinue}
          >
            <Text
              className="text-gray-500 text-sm"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default BookingDescriptionScreen;
