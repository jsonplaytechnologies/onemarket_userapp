import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationToast from '../components/common/NotificationToast';
import { LogoIcon } from '../components/common/Logo';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import PhoneInputScreen from '../screens/auth/PhoneInputScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ChatsScreen from '../screens/chats/ChatsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CategoryServicesScreen from '../screens/services/CategoryServicesScreen';
import FindProsScreen from '../screens/services/FindProsScreen';
import ProProfileScreen from '../screens/services/ProProfileScreen';
import BusinessDetailsScreen from '../screens/businesses/BusinessDetailsScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import AddAddressScreen from '../screens/profile/AddAddressScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// Booking Flow Screens
import CreateBookingScreen from '../screens/bookings/CreateBookingScreen';
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';
import ChatScreen from '../screens/bookings/ChatScreen';
import PaymentScreen from '../screens/bookings/PaymentScreen';
import ReviewScreen from '../screens/bookings/ReviewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Badge component for notification count
const NotificationBadge = ({ count }) => {
  if (!count || count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

// Main Bottom Tab Navigator
const MainTabs = () => {
  const { unreadCount, unreadChatsCount } = useNotifications();
  const insets = useSafeAreaInsets();

  // Calculate bottom padding based on safe area insets
  const bottomPadding = Platform.OS === 'ios' ? 28 : Math.max(insets.bottom, 8);
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 56 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          const size = 22;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            return (
              <View>
                <Ionicons name={iconName} size={size} color={color} />
                <NotificationBadge count={unreadChatsCount} />
              </View>
            );
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
            return (
              <View>
                <Ionicons name={iconName} size={size} color={color} />
                <NotificationBadge count={unreadCount} />
              </View>
            );
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 11,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main Stack Navigator (wraps tabs + detail screens)
const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Service & Pro Screens */}
      <Stack.Screen name="CategoryServices" component={CategoryServicesScreen} />
      <Stack.Screen name="FindPros" component={FindProsScreen} />
      <Stack.Screen name="ProProfile" component={ProProfileScreen} />

      {/* Business Screens */}
      <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />

      {/* Profile Screens */}
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />

      {/* Booking Flow Screens */}
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LogoIcon size={64} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={MainStack} />
        )}
      </Stack.Navigator>
      {/* Global notification toast */}
      {isAuthenticated && <NotificationToast />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
  },
});

export default AppNavigator;
