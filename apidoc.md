# OneMarket API Documentation - User (Customer) Role

**Base URL:** `https://onemarket-backend.onrender.com`
**Role:** `user`
**Platform:** React Native Mobile App

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Profile Management](#2-profile-management)
3. [Address Management](#3-address-management)
4. [Browse Services & Pros](#4-browse-services--pros)
5. [Booking Management](#5-booking-management)
6. [Payments](#6-payments)
7. [Chat & Messages](#7-chat--messages)
8. [Reviews](#8-reviews)
9. [Notifications](#9-notifications)
10. [Zones & Locations](#10-zones--locations)
11. [Business Directory](#11-business-directory)
12. [Socket.io Real-time Events](#12-socketio-real-time-events)
13. [Error Handling](#13-error-handling)

---

## 1. Authentication

### 1.1 Send OTP

Send OTP code to user's phone number.

```
POST /api/auth/send-otp
```

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "phone": "074123456",
  "countryCode": "+241"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expiresIn": 600,
    "phone": "+241074123456"
  }
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Invalid phone number format"
}
```

**React Native Integration:**

```javascript
const sendOTP = async (phone) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, countryCode: '+241' }),
    });
    const data = await response.json();
    if (data.success) {
      // Navigate to OTP verification screen
      // Start countdown timer (600 seconds)
    }
    return data;
  } catch (error) {
    console.error('Send OTP error:', error);
  }
};
```

---

### 1.2 Verify OTP

Verify the OTP code entered by user.

```
POST /api/auth/verify-otp
```

**Request Body:**

```json
{
  "phone": "074123456",
  "code": "123456",
  "countryCode": "+241"
}
```

**Response (Existing User - 200):**

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "isNewUser": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "phone": "+241074123456",
      "role": "user",
      "isActive": true,
      "isVerified": true,
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://cloudinary.com/..."
      }
    }
  }
}
```

**Response (New User - 200):**

```json
{
  "success": true,
  "message": "OTP verified - new user",
  "data": {
    "isNewUser": true,
    "phone": "+241074123456"
  }
}
```

**React Native Integration:**

```javascript
const verifyOTP = async (phone, code) => {
  const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, countryCode: '+241' }),
  });
  const data = await response.json();

  if (data.success) {
    if (data.data.isNewUser) {
      // Navigate to signup screen
      navigation.navigate('Signup', { phone: data.data.phone });
    } else {
      // Store token and navigate to home
      await AsyncStorage.setItem('token', data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      navigation.replace('Home');
    }
  }
  return data;
};
```

---

### 1.3 Signup (New User)

Create a new user account after OTP verification.

```
POST /api/auth/signup
```

**Request Body:**

```json
{
  "phone": "+241074123456",
  "role": "user",
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "phone": "+241074123456",
      "role": "user",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2025-11-28T10:00:00.000Z",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": null
      }
    }
  }
}
```

---

### 1.4 Get Current User

Get authenticated user's profile.

```
GET /api/auth/me
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "phone": "+241074123456",
    "role": "user",
    "isActive": true,
    "isVerified": true,
    "approvalStatus": null,
    "createdAt": "2025-11-28T10:00:00.000Z",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cloudinary.com/..."
    }
  }
}
```

**React Native - Auth Context:**

```javascript
// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        await fetchUser(storedToken);
      }
    } catch (error) {
      console.error('Load auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (authToken) => {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.data);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, logout, setUser, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 2. Profile Management

### 2.1 Get Profile with Addresses

```
GET /api/users/me
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "+241074123456",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://cloudinary.com/...",
    "createdAt": "2025-11-28T10:00:00.000Z",
    "addresses": [
      {
        "id": "addr-uuid",
        "label": "Home",
        "addressLine": "123 Main Street, Libreville",
        "zoneId": "zone-uuid",
        "zoneName": "Centre-ville",
        "subZoneId": "subzone-uuid",
        "subZoneName": "Quartier Louis",
        "latitude": 0.4162,
        "longitude": 9.4673,
        "isDefault": true
      }
    ]
  }
}
```

---

### 2.2 Update Profile

```
PATCH /api/users/me
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request (Form Data):**

```
firstName: "John"
lastName: "Doe"
avatar: [File] (optional)
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://cloudinary.com/new-avatar.jpg"
  }
}
```

**React Native - Image Upload:**

```javascript
import * as ImagePicker from 'expo-image-picker';

const updateProfile = async (firstName, lastName, avatarUri) => {
  const formData = new FormData();
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);

  if (avatarUri) {
    const filename = avatarUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri: avatarUri,
      name: filename,
      type: type,
    });
  }

  const response = await fetch(`${BASE_URL}/api/users/me`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  return response.json();
};
```

---

## 3. Address Management

### 3.1 Add Address

```
POST /api/users/me/addresses
```

**Request Body:**

```json
{
  "label": "Home",
  "addressLine": "123 Main Street, Libreville",
  "zoneId": "zone-uuid",
  "subZoneId": "subzone-uuid",
  "latitude": 0.4162,
  "longitude": 9.4673,
  "isDefault": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "id": "addr-uuid",
    "label": "Home",
    "addressLine": "123 Main Street, Libreville",
    "zoneId": "zone-uuid",
    "subZoneId": "subzone-uuid",
    "latitude": 0.4162,
    "longitude": 9.4673,
    "isDefault": true,
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### 3.2 Get All Addresses

```
GET /api/users/me/addresses
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "addr-uuid-1",
      "label": "Home",
      "addressLine": "123 Main Street",
      "zoneName": "Centre-ville",
      "subZoneName": "Quartier Louis",
      "isDefault": true
    },
    {
      "id": "addr-uuid-2",
      "label": "Work",
      "addressLine": "456 Business Ave",
      "zoneName": "Akanda",
      "subZoneName": "Angondjé",
      "isDefault": false
    }
  ]
}
```

---

### 3.3 Update Address

```
PATCH /api/users/me/addresses/:id
```

**Request Body:**

```json
{
  "label": "Office",
  "addressLine": "New Address Line"
}
```

---

### 3.4 Delete Address

```
DELETE /api/users/me/addresses/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

**Note:** Cannot delete address if it's being used in an active booking.

---

### 3.5 Set Default Address

```
PATCH /api/users/me/addresses/:id/default
```

**Response:**

```json
{
  "success": true,
  "message": "Default address updated",
  "data": {
    "id": "addr-uuid",
    "isDefault": true
  }
}
```

---

## 4. Browse Services & Pros

### 4.1 Get Service Categories

```
GET /api/services/categories
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-uuid-1",
      "name": "Home Repair",
      "description": "Plumbing, electrical, carpentry",
      "iconUrl": "https://...",
      "displayOrder": 1,
      "serviceCount": "6"
    },
    {
      "id": "cat-uuid-2",
      "name": "Cleaning",
      "description": "House cleaning services",
      "iconUrl": "https://...",
      "displayOrder": 2,
      "serviceCount": "4"
    }
  ]
}
```

---

### 4.2 Get Services by Category

```
GET /api/services/categories/:categoryId/services
```

**Response:**

```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cat-uuid",
      "name": "Home Repair"
    },
    "services": [
      {
        "id": "svc-uuid-1",
        "name": "Plumbing",
        "description": "Fix leaks, pipes, etc.",
        "basePrice": 15000,
        "tags": ["plumbing", "water", "pipes"]
      },
      {
        "id": "svc-uuid-2",
        "name": "Electrical Work",
        "description": "Wiring, outlets, switches",
        "basePrice": 20000,
        "tags": ["electrical", "wiring"]
      }
    ]
  }
}
```

---

### 4.3 Search Services

```
GET /api/services/search?q=plumbing
```

**Query Parameters:**

- `q` (required): Search term (min 2 characters)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "svc-uuid",
      "name": "Plumbing",
      "categoryName": "Home Repair",
      "basePrice": 15000
    }
  ]
}
```

---

### 4.4 Search Pros

```
GET /api/pros/search
```

**Query Parameters:**

- `serviceId` (optional): Filter by service
- `zoneId` (optional): Filter by zone
- `subZoneId` (optional): Filter by sub-zone
- `lat` (optional): User latitude for distance calculation
- `lng` (optional): User longitude for distance calculation
- `maxDistance` (optional): Max distance in km
- `minRating` (optional): Minimum rating (1-5)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example:**

```
GET /api/pros/search?serviceId=svc-uuid&zoneId=zone-uuid&lat=0.4162&lng=9.4673&minRating=4
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "pro-uuid",
      "userId": "user-uuid",
      "firstName": "Jean",
      "lastName": "Pierre",
      "avatar": "https://...",
      "bio": "10 years experience in plumbing",
      "rating": 4.8,
      "totalReviews": 45,
      "responseTime": "< 1 hour",
      "isOnline": true,
      "isVerified": true,
      "distance": 2.5,
      "services": [
        {
          "serviceId": "svc-uuid",
          "serviceName": "Plumbing",
          "customPrice": 18000
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### 4.5 Get Pro Profile

```
GET /api/pros/:proId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "pro-uuid",
    "firstName": "Jean",
    "lastName": "Pierre",
    "avatar": "https://...",
    "bio": "Professional plumber with 10 years experience",
    "rating": 4.8,
    "totalReviews": 45,
    "totalCompletedJobs": 120,
    "responseTime": "< 1 hour",
    "memberSince": "2024-01-15",
    "isOnline": true,
    "isVerified": true,
    "services": [
      {
        "id": "ps-uuid",
        "serviceId": "svc-uuid",
        "serviceName": "Plumbing",
        "categoryName": "Home Repair",
        "customPrice": 18000,
        "basePrice": 15000
      }
    ],
    "zones": [
      {
        "zoneId": "zone-uuid",
        "zoneName": "Centre-ville",
        "subZoneId": "subzone-uuid",
        "subZoneName": "Quartier Louis"
      }
    ],
    "recentReviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Excellent work!",
        "userName": "Marie D.",
        "createdAt": "2025-11-20"
      }
    ]
  }
}
```

---

## 5. Booking Management

### 5.1 Create Booking

```
POST /api/bookings
```

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "proId": "pro-profile-uuid",
  "serviceId": "service-uuid",
  "userAddressId": "address-uuid",
  "userNote": "Please come in the morning if possible"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking-uuid",
    "bookingNumber": "BK-20251128-ABC123",
    "status": "pending",
    "userId": "user-uuid",
    "proId": "pro-uuid",
    "serviceId": "service-uuid",
    "serviceName": "Plumbing",
    "userNote": "Please come in the morning if possible",
    "createdAt": "2025-11-28T10:00:00.000Z",
    "pro": {
      "firstName": "Jean",
      "lastName": "Pierre",
      "avatar": "https://...",
      "phone": "+241077123456"
    }
  }
}
```

---

### 5.2 Get User's Bookings

```
GET /api/bookings
```

**Query Parameters:**

- `status` (optional): Filter by status (`pending`, `accepted`, `quotation_sent`, `paid`, `on_the_way`, `job_started`, `completed`, `cancelled`, `rejected`)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "bookingNumber": "BK-20251128-ABC123",
      "status": "quotation_sent",
      "serviceName": "Plumbing",
      "quotationAmount": 25000,
      "createdAt": "2025-11-28T10:00:00.000Z",
      "pro": {
        "firstName": "Jean",
        "lastName": "Pierre",
        "avatar": "https://..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 5.3 Get Booking Details

```
GET /api/bookings/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "bookingNumber": "BK-20251128-ABC123",
    "status": "quotation_sent",
    "userId": "user-uuid",
    "proId": "pro-uuid",
    "serviceId": "service-uuid",
    "serviceName": "Plumbing",
    "categoryName": "Home Repair",
    "userNote": "Morning preferred",
    "quotationAmount": 25000,
    "commissionPercentage": 10,
    "address": {
      "addressLine": "123 Main Street",
      "zoneName": "Centre-ville",
      "subZoneName": "Quartier Louis",
      "latitude": 0.4162,
      "longitude": 9.4673
    },
    "pro": {
      "id": "pro-uuid",
      "firstName": "Jean",
      "lastName": "Pierre",
      "avatar": "https://...",
      "phone": "+241077123456",
      "rating": 4.8
    },
    "createdAt": "2025-11-28T10:00:00.000Z",
    "acceptedAt": "2025-11-28T10:15:00.000Z",
    "quotationSentAt": "2025-11-28T10:20:00.000Z"
  }
}
```

**Note:** Full address with coordinates is only shown after payment (status = `paid` or later).

---

### 5.4 Get Booking Status History

```
GET /api/bookings/:id/history
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "history-uuid",
      "oldStatus": null,
      "newStatus": "pending",
      "reason": "Booking created",
      "createdAt": "2025-11-28T10:00:00.000Z"
    },
    {
      "id": "history-uuid-2",
      "oldStatus": "pending",
      "newStatus": "accepted",
      "reason": "Pro accepted the booking",
      "createdAt": "2025-11-28T10:15:00.000Z"
    }
  ]
}
```

---

### 5.5 Cancel Booking

```
POST /api/bookings/:id/cancel
```

**Request Body:**

```json
{
  "reason": "Changed my mind"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "booking-uuid",
    "status": "cancelled"
  }
}
```

**Note:** Can only cancel bookings that are `pending`, `accepted`, or `quotation_sent`.

---

### 5.6 Confirm Job Start

When pro requests to start the job, user must confirm.

```
PATCH /api/bookings/:id/confirm-start
```

**Response:**

```json
{
  "success": true,
  "message": "Job start confirmed",
  "data": {
    "id": "booking-uuid",
    "status": "job_started",
    "startedAt": "2025-11-28T14:00:00.000Z"
  }
}
```

---

### 5.7 Confirm Job Completion

When pro marks job complete, user must confirm.

```
PATCH /api/bookings/:id/confirm-complete
```

**Response:**

```json
{
  "success": true,
  "message": "Job completed successfully",
  "data": {
    "id": "booking-uuid",
    "status": "completed",
    "completedAt": "2025-11-28T16:00:00.000Z"
  }
}
```

---

## 6. Payments

### 6.1 Initiate Payment

Pay for the quotation amount via PawaPay mobile money.

```
POST /api/bookings/:id/pay
```

**Request Body:**

```json
{
  "phone": "074123456"
}
```

If phone is not provided, uses user's registered phone.

**Response:**

```json
{
  "success": true,
  "message": "Payment initiated - check your phone to approve",
  "data": {
    "depositId": "pawapay-deposit-uuid",
    "status": "ACCEPTED",
    "amount": 25000,
    "currency": "XAF"
  }
}
```

**User Flow:**

1. Call this endpoint
2. User receives mobile money prompt on their phone
3. User approves payment on their phone
4. PawaPay sends webhook to backend
5. Booking status updates to `paid`
6. User receives socket notification

---

### 6.2 Check Payment Status

Poll this endpoint to check payment status.

```
GET /api/bookings/:id/payment-status
```

**Response (Pending):**

```json
{
  "success": true,
  "data": {
    "status": "PENDING",
    "bookingStatus": "quotation_sent"
  }
}
```

**Response (Completed):**

```json
{
  "success": true,
  "data": {
    "status": "COMPLETED",
    "bookingStatus": "paid",
    "paidAmount": 25000,
    "paidAt": "2025-11-28T12:00:00.000Z"
  }
}
```

**Response (Failed):**

```json
{
  "success": true,
  "data": {
    "status": "FAILED",
    "bookingStatus": "quotation_sent",
    "failureReason": "Insufficient balance"
  }
}
```

---

## 7. Chat & Messages

### 7.1 Get Booking Messages

```
GET /api/bookings/:id/messages
```

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Messages per page (default: 50)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "msg-uuid",
      "senderId": "user-uuid",
      "senderName": "John Doe",
      "senderRole": "user",
      "messageType": "text",
      "content": "Hello, what time can you come?",
      "isRead": true,
      "createdAt": "2025-11-28T10:30:00.000Z"
    },
    {
      "id": "msg-uuid-2",
      "senderId": "pro-user-uuid",
      "senderName": "Jean Pierre",
      "senderRole": "pro",
      "messageType": "text",
      "content": "I can come at 2 PM",
      "isRead": false,
      "createdAt": "2025-11-28T10:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2
  }
}
```

---

### 7.2 Send Message (REST API)

```
POST /api/bookings/:id/messages
```

**Request Body:**

```json
{
  "content": "What time works for you?",
  "messageType": "text"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "msg-uuid",
    "bookingId": "booking-uuid",
    "senderId": "user-uuid",
    "messageType": "text",
    "content": "What time works for you?",
    "isRead": false,
    "createdAt": "2025-11-28T10:30:00.000Z"
  }
}
```

---

### 7.3 Mark Messages as Read

```
PATCH /api/bookings/:id/messages/read
```

**Response:**

```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## 8. Reviews

### 8.1 Create Review

After booking is completed, user can leave a review.

```
POST /api/reviews
```

**Request Body:**

```json
{
  "bookingId": "booking-uuid",
  "rating": 5,
  "comment": "Excellent service! Very professional."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "review-uuid",
    "bookingId": "booking-uuid",
    "proId": "pro-uuid",
    "rating": 5,
    "comment": "Excellent service! Very professional.",
    "createdAt": "2025-11-28T18:00:00.000Z"
  }
}
```

---

### 8.2 Update Review

```
PATCH /api/reviews/:id
```

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

---

### 8.3 Delete Review

```
DELETE /api/reviews/:id
```

---

### 8.4 Get Review for Booking

```
GET /api/reviews/booking/:bookingId
```

---

### 8.5 Get Pro's Reviews (Public)

```
GET /api/reviews/pro/:proId
```

**Query Parameters:**

- `page` (optional)
- `limit` (optional)
- `minRating` (optional): Filter by minimum rating

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "review-uuid",
      "rating": 5,
      "comment": "Great work!",
      "userName": "John D.",
      "serviceName": "Plumbing",
      "proResponse": "Thank you for your feedback!",
      "createdAt": "2025-11-28T18:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

## 9. Notifications

### 9.1 Get Notifications

```
GET /api/notifications
```

**Query Parameters:**

- `page` (optional)
- `limit` (optional)
- `unreadOnly` (optional): `true` to get only unread

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid",
      "title": "Booking Accepted",
      "message": "Jean Pierre has accepted your booking",
      "type": "booking_accepted",
      "bookingId": "booking-uuid",
      "isRead": false,
      "createdAt": "2025-11-28T10:15:00.000Z"
    },
    {
      "id": "notif-uuid-2",
      "title": "Payment Successful",
      "message": "Your payment of 25,000 XAF has been confirmed",
      "type": "payment_confirmed",
      "bookingId": "booking-uuid",
      "isRead": true,
      "createdAt": "2025-11-28T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10
  }
}
```

---

### 9.2 Get Unread Count

```
GET /api/notifications/unread-count
```

**Response:**

```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

---

### 9.3 Mark as Read

```
PATCH /api/notifications/:id/read
```

---

### 9.4 Mark All as Read

```
PATCH /api/notifications/read-all
```

**Response:**

```json
{
  "success": true,
  "data": {
    "updatedCount": 5
  }
}
```

---

### 9.5 Delete Notification

```
DELETE /api/notifications/:id
```

---

## 10. Zones & Locations

### 10.1 Get All Zones

```
GET /api/zones
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "zone-uuid-1",
      "name": "Centre-ville",
      "description": "Downtown Libreville",
      "subZoneCount": "5"
    },
    {
      "id": "zone-uuid-2",
      "name": "Akanda",
      "description": "Northern district",
      "subZoneCount": "4"
    }
  ]
}
```

---

### 10.2 Get Zones with Sub-zones

```
GET /api/zones/all
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "zone-uuid-1",
      "name": "Centre-ville",
      "sub_zones": [
        {
          "id": "subzone-uuid-1",
          "name": "Quartier Louis"
        },
        {
          "id": "subzone-uuid-2",
          "name": "Mont-Bouët"
        }
      ]
    }
  ]
}
```

---

### 10.3 Get Sub-zones for Zone

```
GET /api/zones/:zoneId/sub-zones
```

**Response:**

```json
{
  "success": true,
  "data": {
    "zone": {
      "id": "zone-uuid",
      "name": "Centre-ville"
    },
    "subZones": [
      {
        "id": "subzone-uuid-1",
        "name": "Quartier Louis"
      }
    ]
  }
}
```

---

## 11. Business Directory

Users can browse local businesses in a separate tab (restaurants, salons, auto repair, etc.).

### 11.1 Get Business Categories

```
GET /api/businesses/categories
```

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat-uuid-1",
        "name": "Restaurant & Cafe",
        "iconUrl": "https://...",
        "displayOrder": 1,
        "businessCount": 12
      },
      {
        "id": "cat-uuid-2",
        "name": "Shop & Retail",
        "iconUrl": "https://...",
        "displayOrder": 2,
        "businessCount": 8
      },
      {
        "id": "cat-uuid-3",
        "name": "Salon & Spa",
        "iconUrl": "https://...",
        "displayOrder": 3,
        "businessCount": 5
      },
      {
        "id": "cat-uuid-4",
        "name": "Pharmacy",
        "iconUrl": "https://...",
        "displayOrder": 4,
        "businessCount": 3
      },
      {
        "id": "cat-uuid-5",
        "name": "Hotel & Lodging",
        "iconUrl": "https://...",
        "displayOrder": 5,
        "businessCount": 2
      }
    ]
  }
}
```

**Note:** Business subcategories are not currently implemented. Businesses are categorized by a single category only.

---

### 11.2 Search Businesses

```
GET /api/businesses
```

**Query Parameters:**

- `categoryId` (optional): Filter by category
- `zoneId` (optional): Filter by zone
- `subZoneId` (optional): Filter by sub-zone
- `search` (optional): Search by name or description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)

**Examples:**

```
GET /api/businesses?categoryId=cat-uuid-1
GET /api/businesses?zoneId=zone-uuid&search=restaurant
GET /api/businesses?categoryId=cat-uuid-1&zoneId=zone-uuid
```

**Response:**

```json
{
  "success": true,
  "data": {
    "businesses": [
      {
        "id": "business-uuid-1",
        "businessName": "Le Petit Bistro",
        "description": "French cuisine in the heart of Libreville",
        "logoUrl": "https://cloudinary.com/logo.jpg",
        "coverImageUrl": "https://cloudinary.com/cover.jpg",
        "category": {
          "id": "cat-uuid-1",
          "name": "Restaurant & Cafe",
          "iconUrl": "https://..."
        },
        "zone": {
          "id": "zone-uuid-1",
          "name": "Centre-ville"
        },
        "subZone": {
          "id": "subzone-uuid-1",
          "name": "Quartier Louis"
        },
        "address": "123 Main Street, Libreville",
        "phone": "+241077123456",
        "isVerified": true,
        "imageCount": 5
      },
      {
        "id": "business-uuid-2",
        "businessName": "Salon Beauté",
        "description": "Premium hair and beauty services",
        "logoUrl": "https://cloudinary.com/logo2.jpg",
        "coverImageUrl": null,
        "category": {
          "id": "cat-uuid-3",
          "name": "Salon & Spa",
          "iconUrl": "https://..."
        },
        "zone": {
          "id": "zone-uuid-2",
          "name": "Akanda"
        },
        "subZone": {
          "id": "subzone-uuid-2",
          "name": "Angondjé"
        },
        "address": "456 Beach Road",
        "phone": "+241077654321",
        "isVerified": false,
        "imageCount": 3
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### 11.3 Get Business Details

```
GET /api/businesses/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "business": {
      "id": "business-uuid",
      "businessName": "Le Petit Bistro",
      "description": "French cuisine in the heart of Libreville. We offer authentic French dishes prepared by our experienced chef. Perfect for romantic dinners and family gatherings.",
      "logoUrl": "https://cloudinary.com/logo.jpg",
      "coverImageUrl": "https://cloudinary.com/cover.jpg",
      "phone": "+241077123456",
      "email": "contact@lepetitbistro.ga",
      "website": "https://lepetitbistro.ga",
      "address": "123 Main Street, Centre-ville, Libreville",
      "latitude": 0.4162,
      "longitude": 9.4673,
      "operatingHours": {
        "monday": { "open": "09:00", "close": "18:00", "is_open": true },
        "tuesday": { "open": "09:00", "close": "18:00", "is_open": true },
        "wednesday": { "open": "09:00", "close": "18:00", "is_open": true },
        "thursday": { "open": "09:00", "close": "18:00", "is_open": true },
        "friday": { "open": "09:00", "close": "18:00", "is_open": true },
        "saturday": { "open": "10:00", "close": "14:00", "is_open": true },
        "sunday": { "open": null, "close": null, "is_open": false }
      },
      "isVerified": true,
      "category": {
        "id": "cat-uuid-1",
        "name": "Restaurant & Cafe",
        "iconUrl": "https://..."
      },
      "zone": {
        "id": "zone-uuid-1",
        "name": "Centre-ville"
      },
      "subZone": {
        "id": "subzone-uuid-1",
        "name": "Quartier Louis"
      },
      "images": [
        {
          "id": "img-uuid-1",
          "imageUrl": "https://cloudinary.com/gallery1.jpg",
          "caption": "Restaurant interior",
          "displayOrder": 1
        },
        {
          "id": "img-uuid-2",
          "imageUrl": "https://cloudinary.com/gallery2.jpg",
          "caption": "Our signature dish",
          "displayOrder": 2
        }
      ],
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  }
}
```

---

### React Native - Business Directory Tab

```javascript
// screens/BusinessDirectoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';

const BusinessDirectoryScreen = () => {
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBusinesses();
  }, []);

  const fetchCategories = async () => {
    const response = await fetch(`${BASE_URL}/api/businesses/categories`);
    const data = await response.json();
    if (data.success) {
      setCategories(data.data.categories);
    }
  };

  const fetchBusinesses = async (params = {}) => {
    setLoading(true);
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}/api/businesses?${query}`);
    const data = await response.json();
    if (data.success) {
      setBusinesses(data.data.businesses);
    }
    setLoading(false);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchBusinesses({ categoryId });
  };

  const handleSearch = () => {
    fetchBusinesses({
      search: searchQuery,
      ...(selectedCategory && { categoryId: selectedCategory }),
    });
  };

  const renderBusinessCard = ({ item }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() =>
        navigation.navigate('BusinessDetails', { businessId: item.id })
      }
    >
      <Image source={{ uri: item.logoUrl }} style={styles.logo} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.businessName}</Text>
        <Text style={styles.category}>{item.category.name}</Text>
        <Text style={styles.location}>{item.zone.name}</Text>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text>Verified</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder='Search businesses...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Category Pills */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === item.id && styles.selectedPill,
            ]}
            onPress={() => handleCategorySelect(item.id)}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        style={styles.categoryList}
      />

      {/* Business List */}
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={renderBusinessCard}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={() => fetchBusinesses()}
      />
    </View>
  );
};
```

---

### Business Details Screen

```javascript
// screens/BusinessDetailsScreen.js
const BusinessDetailsScreen = ({ route }) => {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    fetchBusinessDetails();
  }, [businessId]);

  const fetchBusinessDetails = async () => {
    const response = await fetch(`${BASE_URL}/api/businesses/${businessId}`);
    const data = await response.json();
    if (data.success) {
      setBusiness(data.data.business);
    }
  };

  const openMaps = () => {
    const url = `https://maps.google.com/?q=${business.latitude},${business.longitude}`;
    Linking.openURL(url);
  };

  const callBusiness = () => {
    Linking.openURL(`tel:${business.phone}`);
  };

  const getTodayHours = () => {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const today = days[new Date().getDay()];
    const hours = business.operatingHours[today];

    if (!hours.is_open) return 'Closed today';
    return `${hours.open} - ${hours.close}`;
  };

  if (!business) return <ActivityIndicator />;

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <Image
        source={{ uri: business.coverImageUrl }}
        style={styles.coverImage}
      />

      {/* Business Info */}
      <View style={styles.infoSection}>
        <Image source={{ uri: business.logoUrl }} style={styles.logo} />
        <Text style={styles.name}>{business.businessName}</Text>
        <Text style={styles.category}>{business.category.name}</Text>
        <Text style={styles.description}>{business.description}</Text>
      </View>

      {/* Contact & Location */}
      <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactButton} onPress={callBusiness}>
          <Icon name='phone' />
          <Text>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactButton} onPress={openMaps}>
          <Icon name='map' />
          <Text>Directions</Text>
        </TouchableOpacity>

        {business.website && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL(business.website)}
          >
            <Icon name='globe' />
            <Text>Website</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text>{business.address}</Text>
        <Text>
          {business.zone.name}
          {business.subZone ? `, ${business.subZone.name}` : ''}
        </Text>
      </View>

      {/* Operating Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hours</Text>
        <Text style={styles.todayHours}>{getTodayHours()}</Text>
        {Object.entries(business.operatingHours).map(([day, hours]) => (
          <View key={day} style={styles.hoursRow}>
            <Text style={styles.dayName}>{day}</Text>
            <Text>
              {!hours.is_open ? 'Closed' : `${hours.open} - ${hours.close}`}
            </Text>
          </View>
        ))}
      </View>

      {/* Gallery */}
      {business.images && business.images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <FlatList
            horizontal
            data={business.images}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.galleryImage}
              />
            )}
          />
        </View>
      )}
    </ScrollView>
  );
};
```

---

## 12. Socket.io Real-time Events

### Connection Setup

```javascript
import { io } from 'socket.io-client';

const socket = io('https://onemarket-backend.onrender.com', {
  auth: {
    token: 'your-jwt-token',
  },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to socket');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### Events to Listen (Client)

| Event                    | Description           | Payload                                             |
| ------------------------ | --------------------- | --------------------------------------------------- |
| `notification`           | New notification      | `{ title, message, type, bookingId? }`              |
| `booking-status-changed` | Booking status update | `{ bookingId, status, ...data }`                    |
| `new-message`            | New chat message      | `{ id, senderId, content, messageType, createdAt }` |
| `message-notification`   | Message preview       | `{ bookingId, senderId, preview }`                  |
| `user-typing`            | Typing indicator      | `{ userId, isTyping }`                              |
| `message-read`           | Message read receipt  | `{ messageId }`                                     |
| `payment-failed`         | Payment failure       | `{ bookingId, reason }`                             |

### Events to Emit (Client)

| Event           | Description             | Payload                               |
| --------------- | ----------------------- | ------------------------------------- |
| `join-booking`  | Join booking chat room  | `bookingId`                           |
| `leave-booking` | Leave booking chat room | `bookingId`                           |
| `send-message`  | Send chat message       | `{ bookingId, content, messageType }` |
| `typing`        | Send typing indicator   | `{ bookingId, isTyping }`             |
| `mark-read`     | Mark message as read    | `{ bookingId, messageId }`            |

### React Native Socket Implementation

```javascript
// hooks/useSocket.js
import { useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

export const useSocket = () => {
  const { token } = useContext(AuthContext);
  const socketRef = useRef(null);

  useEffect(() => {
    if (token) {
      socketRef.current = io('https://onemarket-backend.onrender.com', {
        auth: { token },
        transports: ['websocket']
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [token]);

  const joinBooking = (bookingId) => {
    socketRef.current?.emit('join-booking', bookingId);
  };

  const leaveBooking = (bookingId) => {
    socketRef.current?.emit('leave-booking', bookingId);
  };

  const sendMessage = (bookingId, content) => {
    socketRef.current?.emit('send-message', {
      bookingId,
      content,
      messageType: 'text'
    });
  };

  const setTyping = (bookingId, isTyping) => {
    socketRef.current?.emit('typing', { bookingId, isTyping });
  };

  return {
    socket: socketRef.current,
    joinBooking,
    leaveBooking,
    sendMessage,
    setTyping
  };
};

// Usage in Chat Screen
const ChatScreen = ({ bookingId }) => {
  const { socket, joinBooking, leaveBooking, sendMessage } = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    joinBooking(bookingId);

    socket?.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      leaveBooking(bookingId);
    };
  }, [bookingId]);

  const handleSend = (text) => {
    sendMessage(bookingId, text);
  };

  return (/* Chat UI */);
};
```

---

## 12. Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid phone number format"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning          | When                                    |
| ---- | ---------------- | --------------------------------------- |
| 200  | Success          | Request completed successfully          |
| 201  | Created          | Resource created successfully           |
| 400  | Bad Request      | Invalid parameters or validation failed |
| 401  | Unauthorized     | Missing or invalid token                |
| 403  | Forbidden        | User doesn't have permission            |
| 404  | Not Found        | Resource not found                      |
| 422  | Validation Error | Input validation failed                 |
| 500  | Server Error     | Internal server error                   |

### React Native Error Handler

```javascript
// utils/api.js
const BASE_URL = 'https://onemarket-backend.onrender.com';

export const apiRequest = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle specific errors
      if (response.status === 401) {
        // Token expired - logout user
        await AsyncStorage.removeItem('token');
        // Navigate to login
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Usage
const getBookings = async () => {
  return apiRequest('/api/bookings');
};

const createBooking = async (data) => {
  return apiRequest('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
```

---

## Booking Status Flow Diagram

```
[User creates booking]
        ↓
    PENDING
        ↓
[Pro accepts] ────→ REJECTED (if pro rejects)
        ↓
    ACCEPTED
        ↓
[Pro sends quotation]
        ↓
  QUOTATION_SENT
        ↓
[User pays] ────→ CANCELLED (if user cancels)
        ↓
      PAID
        ↓
[Pro marks on the way]
        ↓
   ON_THE_WAY
        ↓
[Pro requests start]
        ↓
JOB_START_REQUESTED
        ↓
[User confirms start]
        ↓
   JOB_STARTED
        ↓
[Pro requests complete]
        ↓
JOB_COMPLETE_REQUESTED
        ↓
[User confirms complete]
        ↓
    COMPLETED
        ↓
[User can leave review]
```

---

## Quick Reference - All User Endpoints

| Method | Endpoint                                | Description                |
| ------ | --------------------------------------- | -------------------------- |
| POST   | `/api/auth/send-otp`                    | Send OTP                   |
| POST   | `/api/auth/verify-otp`                  | Verify OTP                 |
| POST   | `/api/auth/signup`                      | Create account             |
| GET    | `/api/auth/me`                          | Get current user           |
| GET    | `/api/users/me`                         | Get profile with addresses |
| PATCH  | `/api/users/me`                         | Update profile             |
| POST   | `/api/users/me/addresses`               | Add address                |
| GET    | `/api/users/me/addresses`               | Get addresses              |
| PATCH  | `/api/users/me/addresses/:id`           | Update address             |
| DELETE | `/api/users/me/addresses/:id`           | Delete address             |
| PATCH  | `/api/users/me/addresses/:id/default`   | Set default address        |
| GET    | `/api/services/categories`              | Get categories             |
| GET    | `/api/services/categories/:id/services` | Get services by category   |
| GET    | `/api/services/search`                  | Search services            |
| GET    | `/api/pros/search`                      | Search pros                |
| GET    | `/api/pros/:id`                         | Get pro profile            |
| POST   | `/api/bookings`                         | Create booking             |
| GET    | `/api/bookings`                         | Get my bookings            |
| GET    | `/api/bookings/:id`                     | Get booking details        |
| POST   | `/api/bookings/:id/cancel`              | Cancel booking             |
| POST   | `/api/bookings/:id/pay`                 | Initiate payment           |
| GET    | `/api/bookings/:id/payment-status`      | Check payment status       |
| PATCH  | `/api/bookings/:id/confirm-start`       | Confirm job start          |
| PATCH  | `/api/bookings/:id/confirm-complete`    | Confirm job complete       |
| GET    | `/api/bookings/:id/messages`            | Get messages               |
| POST   | `/api/bookings/:id/messages`            | Send message               |
| PATCH  | `/api/bookings/:id/messages/read`       | Mark messages read         |
| POST   | `/api/reviews`                          | Create review              |
| GET    | `/api/reviews/pro/:proId`               | Get pro's reviews          |
| GET    | `/api/notifications`                    | Get notifications          |
| GET    | `/api/notifications/unread-count`       | Get unread count           |
| PATCH  | `/api/notifications/:id/read`           | Mark as read               |
| PATCH  | `/api/notifications/read-all`           | Mark all read              |
| GET    | `/api/zones`                            | Get zones                  |
| GET    | `/api/zones/all`                        | Get zones with sub-zones   |
| GET    | `/api/businesses/categories`            | Get business categories    |
| GET    | `/api/businesses`                       | Search businesses          |
| GET    | `/api/businesses/:id`                   | Get business details       |

---

**Document Version:** 1.0
**Last Updated:** November 28, 2025
**API Version:** 2.0.0
