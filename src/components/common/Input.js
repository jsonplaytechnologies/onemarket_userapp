import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const Input = ({
  placeholder,
  value,
  onChangeText,
  icon,
  error,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  style,
  inputStyle,
}) => {
  const getBorderColor = () => {
    if (error) return 'border-error';
    if (!editable) return 'border-gray-200';
    return 'border-gray-300 focus:border-primary';
  };

  return (
    <View className="w-full" style={style}>
      <View
        className={`flex-row items-center border rounded-lg px-3 ${
          multiline ? 'py-2' : 'py-3'
        } bg-white ${getBorderColor()}`}
      >
        {icon && (
          <View className="mr-2">
            {typeof icon === 'string' ? (
              <Ionicons name={icon} size={20} color="#6B7280" />
            ) : (
              icon
            )}
          </View>
        )}
        <TextInput
          className={`flex-1 text-base ${!editable ? 'text-gray-400' : 'text-gray-900'}`}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          style={[
            { fontFamily: 'Poppins-Regular' },
            multiline && { minHeight: 100, textAlignVertical: 'top' },
            inputStyle,
          ]}
        />
      </View>
      {error && (
        <View className="flex-row items-center mt-1">
          <Feather name="alert-circle" size={14} color="#EF4444" />
          <Text className="text-error text-sm ml-1">{error}</Text>
        </View>
      )}
    </View>
  );
};

export default Input;
