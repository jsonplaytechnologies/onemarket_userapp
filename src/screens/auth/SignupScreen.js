import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import apiService, { ApiError } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

const SignupScreen = ({ navigation, route }) => {
  const { phone } = route.params;
  const { login } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!firstName || firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!lastName || lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiService.post(API_ENDPOINTS.SIGNUP, {
        phone,
        role: 'user',
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      });

      if (response.success) {
        Alert.alert('Success', 'Account created successfully!');
        // Pass both token and refreshToken to login
        await login(response.data.token, response.data.refreshToken, response.data.user);
        // Navigation is handled automatically by AuthContext - no manual navigation needed
      }
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        Alert.alert(
          'Please Wait',
          `Too many requests. Try again in ${error.retryAfter} seconds.`
        );
      } else if (error.code === 'VALIDATION_ERROR') {
        // Handle field-level validation errors
        if (error.errors && error.errors.length > 0) {
          const fieldErrors = {};
          error.errors.forEach(err => {
            // Map backend field names to frontend field names
            const field = err.path || err.param;
            if (field === 'profile.firstName' || field === 'firstName') {
              fieldErrors.firstName = err.msg;
            } else if (field === 'profile.lastName' || field === 'lastName') {
              fieldErrors.lastName = err.msg;
            }
          });
          setErrors(fieldErrors);

          // Also show a general alert
          const errorMsg = error.errors.map(e => e.msg).join('\n');
          Alert.alert('Validation Error', errorMsg);
        } else {
          Alert.alert('Validation Error', error.message);
        }
      } else {
        Alert.alert('Error', error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text
          className="text-2xl font-semibold text-gray-900 mb-2"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          Complete your profile
        </Text>

        <Text
          className="text-sm text-gray-500"
          style={{ fontFamily: 'Poppins-Regular' }}
        >
          Tell us a bit about yourself
        </Text>
      </View>

      {/* Form */}
      <View className="px-6">
        <View className="mb-4">
          <Input
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (errors.firstName) {
                setErrors({ ...errors, firstName: '' });
              }
            }}
            icon="person-outline"
            error={errors.firstName}
          />
        </View>

        <View className="mb-6">
          <Input
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (errors.lastName) {
                setErrors({ ...errors, lastName: '' });
              }
            }}
            icon="person-outline"
            error={errors.lastName}
          />
        </View>

        {/* Create Account Button */}
        <Button
          title="Create Account"
          onPress={handleCreateAccount}
          disabled={!firstName || !lastName}
          loading={loading}
          icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

export default SignupScreen;
