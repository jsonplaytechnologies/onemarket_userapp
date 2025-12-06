import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, danger, ghost
  size = 'large', // small, medium, large
  disabled = false,
  loading = false,
  icon = null,
  style,
  textStyle,
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return 'py-2.5 px-4 rounded-lg';
      case 'medium':
        return 'py-3 px-5 rounded-xl';
      case 'large':
      default:
        return 'py-4 px-6 rounded-2xl';
    }
  };

  const getButtonStyle = () => {
    const sizeStyle = getSizeStyle();
    const baseStyle = `w-full flex-row items-center justify-center ${sizeStyle}`;

    if (disabled) {
      return `${baseStyle} bg-gray-200`;
    }

    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-primary`;
      case 'secondary':
        return `${baseStyle} bg-gray-100`;
      case 'danger':
        return `${baseStyle} bg-red-50 border border-red-200`;
      case 'ghost':
        return `${baseStyle} bg-transparent`;
      default:
        return `${baseStyle} bg-primary`;
    }
  };

  const getTextStyle = () => {
    const baseSize = size === 'small' ? 'text-sm' : 'text-base';

    if (disabled) {
      return `${baseSize} text-gray-400`;
    }

    switch (variant) {
      case 'primary':
        return `${baseSize} text-white`;
      case 'secondary':
        return `${baseSize} text-gray-900`;
      case 'danger':
        return `${baseSize} text-red-500`;
      case 'ghost':
        return `${baseSize} text-primary`;
      default:
        return `${baseSize} text-white`;
    }
  };

  return (
    <TouchableOpacity
      className={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : '#2563EB'}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={getTextStyle()}
            style={[{ fontFamily: 'Poppins-SemiBold' }, textStyle]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
