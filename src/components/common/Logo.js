import React from 'react';
import { View, Text } from 'react-native';
import OneMarketSymbol from '../../../assets/Onemarketsymbol.svg';

const Logo = ({
  size = 'medium',
  showText = true,
  textColor = '#111827',
  variant = 'default'
}) => {
  const sizes = {
    small: { icon: 32, fontSize: 16, gap: 6 },
    medium: { icon: 48, fontSize: 22, gap: 8 },
    large: { icon: 72, fontSize: 32, gap: 12 },
  };

  // Support both numeric size and string size
  const isNumericSize = typeof size === 'number';
  const { icon, fontSize, gap } = isNumericSize
    ? { icon: size, fontSize: size * 0.45, gap: 0 }
    : (sizes[size] || sizes.medium);

  const textColorValue = variant === 'light' ? '#FFFFFF' : textColor;

  return (
    <View className="items-center">
      <LogoIcon size={icon} />
      {showText && (
        <Text
          style={{
            fontFamily: 'Poppins-Bold',
            fontSize,
            color: textColorValue,
            marginTop: 8,
            letterSpacing: -0.5,
          }}
        >
          one<Text style={{ color: '#2563EB' }}>market</Text>
        </Text>
      )}
    </View>
  );
};

const LogoIcon = ({ size = 48 }) => {
  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <OneMarketSymbol width={size} height={size} preserveAspectRatio="xMidYMid meet" />
    </View>
  );
};

export { Logo, LogoIcon };
export default Logo;
