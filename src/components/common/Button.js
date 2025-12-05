import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, danger
  disabled = false,
  loading = false,
  icon = null,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle = 'w-full py-4 rounded-xl flex-row items-center justify-center';

    if (disabled) {
      return `${baseStyle} bg-gray-300`;
    }

    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-primary`;
      case 'secondary':
        return `${baseStyle} bg-white border-2 border-primary`;
      case 'danger':
        return `${baseStyle} bg-white border-2 border-error`;
      default:
        return `${baseStyle} bg-primary`;
    }
  };

  const getTextStyle = () => {
    const baseStyle = 'text-base font-semibold';

    if (disabled) {
      return `${baseStyle} text-gray-500`;
    }

    switch (variant) {
      case 'primary':
        return `${baseStyle} text-white`;
      case 'secondary':
        return `${baseStyle} text-primary`;
      case 'danger':
        return `${baseStyle} text-error`;
      default:
        return `${baseStyle} text-white`;
    }
  };

  return (
    <TouchableOpacity
      className={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : '#2563EB'}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={getTextStyle()} style={textStyle}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
