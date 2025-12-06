import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

/**
 * OneMarket Logo Component
 * Inspired by the circular dot pattern - simplified for performance
 */
const Logo = ({
  size = 'medium', // 'small' | 'medium' | 'large'
  showText = true,
  textColor = '#111827',
  variant = 'default' // 'default' | 'light' (for dark backgrounds)
}) => {
  const sizes = {
    small: { icon: 32, fontSize: 16, gap: 6 },
    medium: { icon: 48, fontSize: 22, gap: 8 },
    large: { icon: 72, fontSize: 32, gap: 12 },
  };

  const { icon, fontSize, gap } = sizes[size] || sizes.medium;
  const textColorValue = variant === 'light' ? '#FFFFFF' : textColor;

  return (
    <View className="flex-row items-center">
      <LogoIcon size={icon} />
      {showText && (
        <Text
          style={{
            fontFamily: 'Poppins-Bold',
            fontSize,
            color: textColorValue,
            marginLeft: gap,
            letterSpacing: -0.5,
          }}
        >
          onemarket
        </Text>
      )}
    </View>
  );
};

/**
 * Logo Icon - Circular dot pattern
 */
const LogoIcon = ({ size = 48 }) => {
  const center = size / 2;

  // Create concentric circles of dots
  const rings = [
    { radius: size * 0.38, count: 12, dotSize: size * 0.055, color: '#2563EB' },
    { radius: size * 0.28, count: 8, dotSize: size * 0.045, color: '#3B82F6' },
    { radius: size * 0.16, count: 6, dotSize: size * 0.035, color: '#60A5FA' },
  ];

  const dots = [];

  rings.forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.count; i++) {
      const angle = (2 * Math.PI * i) / ring.count - Math.PI / 2;
      const x = center + ring.radius * Math.cos(angle);
      const y = center + ring.radius * Math.sin(angle);

      dots.push(
        <Circle
          key={`${ringIndex}-${i}`}
          cx={x}
          cy={y}
          r={ring.dotSize}
          fill={ring.color}
        />
      );
    }
  });

  // Center dot
  dots.push(
    <Circle
      key="center"
      cx={center}
      cy={center}
      r={size * 0.06}
      fill="#1D4ED8"
    />
  );

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: '#F0F7FF',
        borderRadius: size * 0.22,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {dots}
      </Svg>
    </View>
  );
};

// Export both components
export { Logo, LogoIcon };
export default Logo;
