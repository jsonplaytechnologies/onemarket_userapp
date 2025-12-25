# One Market User App - API Documentation

Complete API reference for the User Frontend Application. This document covers all endpoints available to users with `role='user'`.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [User Profile](#user-profile)
4. [Address Management](#address-management)
5. [Service & Category Browsing](#service--category-browsing)
6. [Zone & Location](#zone--location)
7. [Pro (Service Provider) Browsing](#pro-service-provider-browsing)
8. [Business Directory](#business-directory)
9. [Bookings](#bookings)
10. [Messaging](#messaging)
11. [Payments](#payments)
12. [Reviews](#reviews)
13. [Notifications](#notifications)
14. [Conversations](#conversations)
15. [Error Handling](#error-handling)
16. [Rate Limiting](#rate-limiting)

---

## Getting Started

### Base URL

```
Production: https://api.onemarket.ga
Development: http://localhost:5000
```

### Standard Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Description of result",
  "data": { ... },
  "pagination": { ... }
}
```

### Required Headers

```javascript
// For public endpoints
const headers = {
  'Content-Type': 'application/json'
};

// For authenticated endpoints
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`
};

// For file uploads
const headers = {
  'Content-Type': 'multipart/form-data',
  'Authorization': `Bearer ${accessToken}`
};
```

---

## Authentication

### Send OTP

Initiates phone verification by sending an OTP code.

```http
POST /api/auth/send-otp
```

**Request Body:**
```json
{
  "phone": "074123456",
  "countryCode": "+241"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expiresIn": 5
  }
}
```

**Integration Example:**
```javascript
const sendOTP = async (phone) => {
  const response = await fetch(`${API_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      countryCode: '+241'
    })
  });
  return response.json();
};
```

---

### Verify OTP

Verifies the OTP code. Returns user data if existing user, or signals signup required for new users.

```http
POST /api/auth/verify-otp
```

**Request Body:**
```json
{
  "phone": "+241074123456",
  "code": "1234",
  "countryCode": "+241"
}
```

**Response (New User):**
```json
{
  "success": true,
  "message": "OTP verified. Please complete signup.",
  "data": {
    "isNewUser": true,
    "phone": "+241074123456"
  }
}
```

**Response (Existing User):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "isNewUser": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "uuid",
      "phone": "+241074123456",
      "role": "user",
      "isVerified": true,
      "isActive": true
    }
  }
}
```

**Integration Example:**
```javascript
const verifyOTP = async (phone, code) => {
  const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, countryCode: '+241' })
  });

  const result = await response.json();

  if (result.data.isNewUser) {
    // Navigate to signup screen
    return { needsSignup: true, phone: result.data.phone };
  } else {
    // Store tokens and navigate to home
    await storeTokens(result.data.token, result.data.refreshToken);
    return { user: result.data.user };
  }
};
```

---

### Signup (Create Account)

Creates a new user account after OTP verification.

```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "phone": "+241074123456",
  "countryCode": "+241",
  "role": "user",
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phone": "+241074123456",
      "role": "user",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Integration Example:**
```javascript
const signup = async (phone, firstName, lastName) => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      countryCode: '+241',
      role: 'user',
      profile: { firstName, lastName }
    })
  });

  const result = await response.json();
  await storeTokens(result.data.token, result.data.refreshToken);
  return result.data.user;
};
```

---

### Refresh Token

Refreshes expired access token using refresh token.

```http
POST /api/auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

**Integration Example (Axios Interceptor):**
```javascript
// Token refresh interceptor
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await getStoredRefreshToken();
      const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const result = await response.json();
      await storeTokens(result.data.token, result.data.refreshToken);

      originalRequest.headers.Authorization = `Bearer ${result.data.token}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);
```

---

### Auth Health Check

Check if authentication service is operational.

```http
GET /api/auth/health
```

**Response:**
```json
{
  "success": true,
  "message": "Auth service is healthy"
}
```

---

## User Profile

### Get My Profile

Retrieves the current user's profile information.

```http
GET /api/users/me
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "avatarUrl": "https://storage.onemarket.ga/avatars/user123.jpg",
      "phone": "+241074123456",
      "countryCode": "+241",
      "role": "user",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z",
      "addresses": [
        {
          "id": "addr-uuid",
          "label": "Home",
          "addressLine": "123 Main Street",
          "isDefault": true
        }
      ]
    }
  }
}
```

**Integration Example:**
```javascript
const getProfile = async () => {
  const token = await getStoredToken();
  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

---

### Update My Profile

Updates user profile information. Supports avatar upload.

```http
PATCH /api/users/me
```

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request Body (multipart/form-data):**
- `firstName` (string, optional)
- `lastName` (string, optional)
- `avatar` (file, optional) - Image file

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "id": "profile-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "avatarUrl": "https://storage.onemarket.ga/avatars/new-avatar.jpg",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-25T08:00:00Z"
    }
  }
}
```

**Integration Example:**
```javascript
const updateProfile = async (firstName, lastName, avatarFile) => {
  const token = await getStoredToken();
  const formData = new FormData();

  if (firstName) formData.append('firstName', firstName);
  if (lastName) formData.append('lastName', lastName);
  if (avatarFile) formData.append('avatar', avatarFile);

  const response = await fetch(`${API_URL}/api/users/me`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};
```

---

## Address Management

### Get All Addresses

Retrieves all saved addresses for the current user.

```http
GET /api/users/me/addresses
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Addresses retrieved successfully",
  "data": {
    "addresses": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "label": "Home",
        "addressLine": "123 Main Street, Apartment 4B",
        "zone": {
          "id": "zone-uuid",
          "name": "Libreville Centre"
        },
        "subZone": {
          "id": "subzone-uuid",
          "name": "Quartier Louis"
        },
        "latitude": 0.4162,
        "longitude": 9.4673,
        "isDefault": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### Add New Address

Creates a new address for the user.

```http
POST /api/users/me/addresses
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "label": "Home",
  "addressLine": "123 Main Street, Apartment 4B",
  "zoneId": "zone-uuid",
  "subZoneId": "subzone-uuid",
  "latitude": 0.4162,
  "longitude": 9.4673,
  "isDefault": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | No | Address label (default: "Home") |
| addressLine | string | Yes | Full address text |
| zoneId | UUID | Yes | Zone/city identifier |
| subZoneId | UUID | No | Sub-zone/district identifier |
| latitude | number | No | GPS latitude |
| longitude | number | No | GPS longitude |
| isDefault | boolean | No | Set as default address |

**Response:**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "address": {
      "id": "new-address-uuid",
      "label": "Home",
      "addressLine": "123 Main Street, Apartment 4B",
      "zone": { "id": "zone-uuid", "name": "Libreville Centre" },
      "subZone": { "id": "subzone-uuid", "name": "Quartier Louis" },
      "latitude": 0.4162,
      "longitude": 9.4673,
      "isDefault": true,
      "createdAt": "2024-01-25T10:30:00Z",
      "updatedAt": "2024-01-25T10:30:00Z"
    }
  }
}
```

**Integration Example:**
```javascript
const addAddress = async (addressData) => {
  const token = await getStoredToken();
  const response = await fetch(`${API_URL}/api/users/me/addresses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(addressData)
  });
  return response.json();
};
```

---

### Update Address

Updates an existing address.

```http
PATCH /api/users/me/addresses/:id
```

**URL Parameters:** `id` - Address UUID

**Headers:** `Authorization: Bearer {token}`

**Request Body:** (All fields optional)
```json
{
  "label": "Work",
  "addressLine": "456 Business Ave",
  "zoneId": "new-zone-uuid",
  "subZoneId": "new-subzone-uuid",
  "latitude": 0.4200,
  "longitude": 9.4700,
  "isDefault": false
}
```

---

### Delete Address

Deletes an address. Cannot delete if used in active bookings.

```http
DELETE /api/users/me/addresses/:id
```

**URL Parameters:** `id` - Address UUID

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### Set Default Address

Sets an address as the default.

```http
PATCH /api/users/me/addresses/:id/default
```

**URL Parameters:** `id` - Address UUID

**Headers:** `Authorization: Bearer {token}`

---

## Service & Category Browsing

### Get All Service Categories

Retrieves all available service categories.

```http
GET /api/services/categories
```

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": [
    {
      "id": "cat-uuid-1",
      "name": "Home Cleaning",
      "description": "Professional cleaning services",
      "icon_url": "https://storage.onemarket.ga/icons/cleaning.png",
      "display_order": 1,
      "is_active": true,
      "service_count": 5
    },
    {
      "id": "cat-uuid-2",
      "name": "Plumbing",
      "description": "Plumbing repair and installation",
      "icon_url": "https://storage.onemarket.ga/icons/plumbing.png",
      "display_order": 2,
      "is_active": true,
      "service_count": 8
    }
  ]
}
```

**Integration Example:**
```javascript
const getCategories = async () => {
  const response = await fetch(`${API_URL}/api/services/categories`);
  return response.json();
};
```

---

### Get Services by Category

Retrieves all services within a specific category.

```http
GET /api/services/categories/:id/services
```

**URL Parameters:** `id` - Category UUID

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Services retrieved",
  "data": {
    "category": {
      "id": "cat-uuid-1",
      "name": "Home Cleaning",
      "description": "Professional cleaning services",
      "icon_url": "https://storage.onemarket.ga/icons/cleaning.png",
      "display_order": 1,
      "is_active": true
    },
    "services": [
      {
        "id": "service-uuid-1",
        "category_id": "cat-uuid-1",
        "name": "Deep House Cleaning",
        "description": "Thorough cleaning of your entire home",
        "base_price": 15000,
        "estimated_duration": 180,
        "icon_url": "https://storage.onemarket.ga/icons/deep-clean.png",
        "tags": ["deep clean", "whole house", "premium"],
        "is_active": true
      }
    ]
  }
}
```

---

### Get All Services

Retrieves all available services with optional filtering.

```http
GET /api/services
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| categoryId | UUID | Filter by category |
| search | string | Search by name |

**Response:**
```json
{
  "success": true,
  "message": "Services retrieved",
  "data": [
    {
      "id": "service-uuid",
      "category_id": "cat-uuid",
      "name": "AC Repair",
      "description": "Air conditioning repair and maintenance",
      "base_price": 25000,
      "estimated_duration": 120,
      "icon_url": "https://storage.onemarket.ga/icons/ac.png",
      "tags": ["ac", "repair", "cooling"],
      "is_active": true,
      "category_name": "HVAC Services"
    }
  ]
}
```

---

### Get Service Details

Retrieves detailed information about a specific service.

```http
GET /api/services/:id
```

**URL Parameters:** `id` - Service UUID

---

### Get Service Questions

Retrieves questions that users must answer when booking a service.

```http
GET /api/services/:id/questions
```

**URL Parameters:** `id` - Service UUID

**Response:**
```json
{
  "success": true,
  "message": "Questions retrieved",
  "data": [
    {
      "id": "question-uuid-1",
      "question_text": "How many rooms need cleaning?",
      "question_type": "number",
      "is_required": true,
      "display_order": 1,
      "options": null
    },
    {
      "id": "question-uuid-2",
      "question_text": "Do you have pets?",
      "question_type": "select",
      "is_required": true,
      "display_order": 2,
      "options": ["Yes", "No"]
    }
  ]
}
```

---

## Zone & Location

### Get All Zones

Retrieves all available zones/cities.

```http
GET /api/zones
```

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Zones retrieved",
  "data": [
    {
      "id": "zone-uuid-1",
      "name": "Libreville",
      "description": "Capital city",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "sub_zone_count": 15
    }
  ]
}
```

---

### Get Sub-Zones for Zone

Retrieves all sub-zones/districts within a zone.

```http
GET /api/zones/:id/sub-zones
```

**URL Parameters:** `id` - Zone UUID

**Response:**
```json
{
  "success": true,
  "message": "Sub-zones retrieved",
  "data": {
    "zone": {
      "id": "zone-uuid",
      "name": "Libreville",
      "description": "Capital city",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    },
    "subZones": [
      {
        "id": "subzone-uuid-1",
        "zone_id": "zone-uuid",
        "name": "Quartier Louis",
        "description": "Central district",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### Get All Zones with Sub-Zones (Nested)

Retrieves all zones with their sub-zones in a nested structure.

```http
GET /api/zones/all
```

**Response:**
```json
{
  "success": true,
  "message": "Zones retrieved",
  "data": [
    {
      "id": "zone-uuid",
      "name": "Libreville",
      "description": "Capital city",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "sub_zones": [
        { "id": "subzone-uuid-1", "name": "Quartier Louis" },
        { "id": "subzone-uuid-2", "name": "Centre Ville" }
      ]
    }
  ]
}
```

---

## Pro (Service Provider) Browsing

### Search Pros

Search for available service providers with filters.

```http
GET /api/pros/search
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| serviceId | UUID | Filter by service offered |
| zoneId | UUID | Filter by coverage zone |
| subZoneId | UUID | Filter by sub-zone |
| lat | number | User latitude (for distance calculation) |
| lng | number | User longitude |
| maxDistance | number | Max distance in km (default: 50) |
| minRating | number | Minimum rating filter |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 10) |

**Response:**
```json
{
  "success": true,
  "message": "Search results",
  "data": [
    {
      "id": "pro-uuid",
      "user_id": "user-uuid",
      "first_name": "Jean",
      "last_name": "Baptiste",
      "avatar_url": "https://storage.onemarket.ga/avatars/pro123.jpg",
      "bio": "Professional plumber with 10 years experience",
      "rating": 4.8,
      "total_reviews": 127,
      "is_verified": true,
      "approval_status": "approved",
      "coverage_areas": ["Libreville Centre", "Quartier Louis"],
      "distance": 2.5
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Integration Example:**
```javascript
const searchPros = async (filters) => {
  const params = new URLSearchParams();
  if (filters.serviceId) params.append('serviceId', filters.serviceId);
  if (filters.zoneId) params.append('zoneId', filters.zoneId);
  if (filters.lat && filters.lng) {
    params.append('lat', filters.lat);
    params.append('lng', filters.lng);
  }

  const response = await fetch(`${API_URL}/api/pros/search?${params}`);
  return response.json();
};
```

---

### Get Pro Public Profile

Retrieves detailed public profile of a service provider.

```http
GET /api/pros/:id
```

**URL Parameters:** `id` - Pro profile UUID

---

### Get Pro Services

Retrieves services offered by a specific pro.

```http
GET /api/pros/:id/services
```

---

### Get Pro Coverage Zones

Retrieves zones covered by a specific pro.

```http
GET /api/pros/:id/zones
```

---

### Get Pro Availability

Retrieves the availability schedule of a pro.

```http
GET /api/pros/:id/availability
```

---

### Get Pro Available Slots

Retrieves available time slots for booking.

```http
GET /api/pros/:id/available-slots
```

---

### Check If Pro is Available Now

Quick check if pro is currently available.

```http
GET /api/pros/:id/is-available-now
```

**Response:**
```json
{
  "success": true,
  "message": "Availability status",
  "data": {
    "isAvailable": true,
    "proId": "pro-uuid"
  }
}
```

---

## Business Directory

### Search Businesses

Search and browse local businesses.

```http
GET /api/businesses
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| categoryId | UUID | Filter by business category |
| zoneId | UUID | Filter by zone |
| subZoneId | UUID | Filter by sub-zone |
| search | string | Search term |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20, max: 50) |

---

### Get Business Categories

Retrieves all business categories.

```http
GET /api/businesses/categories
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": {
    "categories": ["Restaurant", "Retail", "Healthcare", "Automotive"]
  }
}
```

---

### Get Business Details

Retrieves detailed information about a specific business.

```http
GET /api/businesses/:id
```

---

## Bookings

### Get Duration Options

Retrieves available job duration options for booking.

```http
GET /api/bookings/duration-options
```

**Authentication:** Not required

---

### Create Booking

Creates a new service booking request.

```http
POST /api/bookings/v2
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "serviceId": "service-uuid",
  "userAddressId": "address-uuid",
  "bookingPath": "auto",
  "proId": "pro-uuid",
  "isBookNow": false,
  "requestedDatetime": "2024-02-01T10:00:00Z",
  "jobDurationMinutes": 120,
  "userNote": "Please bring cleaning supplies",
  "answers": [
    {
      "questionId": "question-uuid-1",
      "answer": "3"
    },
    {
      "questionId": "question-uuid-2",
      "answer": "No"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| serviceId | UUID | Yes | Service to book |
| userAddressId | UUID | Yes | Address for service |
| bookingPath | string | Yes | "auto" (system assigns pro) or "manual" (user selects pro) |
| proId | UUID | If manual | Pro to request (required if bookingPath is "manual") |
| isBookNow | boolean | No | Immediate booking (default: false) |
| requestedDatetime | ISO string | No | Scheduled date/time |
| jobDurationMinutes | number | No | Estimated duration |
| userNote | string | No | Additional notes for the pro |
| answers | array | No | Answers to service questions |

**Response:**
```json
{
  "success": true,
  "message": "Booking request created",
  "data": {
    "booking": {
      "id": "booking-uuid",
      "booking_number": "BK-2024-001234",
      "user_id": "user-uuid",
      "pro_id": "pro-uuid",
      "service_id": "service-uuid",
      "status": "pending",
      "service_name": "Deep House Cleaning",
      "quotation_amount": null,
      "created_at": "2024-01-25T10:30:00Z"
    }
  }
}
```

**Integration Example:**
```javascript
const createBooking = async (bookingData) => {
  const token = await getStoredToken();
  const response = await fetch(`${API_URL}/api/bookings/v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });
  return response.json();
};

// Usage
const booking = await createBooking({
  serviceId: 'service-uuid',
  userAddressId: 'address-uuid',
  bookingPath: 'manual',
  proId: 'selected-pro-uuid',
  requestedDatetime: '2024-02-01T10:00:00Z',
  userNote: 'Gate code is 1234'
});
```

---

### Get My Bookings

Retrieves list of user's bookings.

```http
GET /api/bookings
```

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (pending, accepted, etc.) |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 10) |

**Response:**
```json
{
  "success": true,
  "message": "Bookings retrieved",
  "data": [
    {
      "id": "booking-uuid",
      "booking_number": "BK-2024-001234",
      "status": "accepted",
      "service_name": "Deep House Cleaning",
      "pro_name": "Jean Baptiste",
      "quotation_amount": 25000,
      "created_at": "2024-01-25T10:30:00Z",
      "updated_at": "2024-01-25T11:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

**Booking Status Flow:**
```
pending → accepted → quoted → scope_accepted → paid → pro_started →
user_confirmed_start → pro_completed → completed

Alternative paths:
pending → cancelled
pending → declined
scope_accepted → scope_declined
```

---

### Get Booking Details

Retrieves detailed information about a specific booking.

```http
GET /api/bookings/:id
```

**Headers:** `Authorization: Bearer {token}`

---

### Get Booking Answers

Retrieves user's answers to service questions for a booking.

```http
GET /api/bookings/:id/answers
```

**Headers:** `Authorization: Bearer {token}`

---

### Get Booking Status History

Retrieves the status change history for a booking.

```http
GET /api/bookings/:id/history
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Status history retrieved",
  "data": {
    "history": [
      {
        "id": "history-uuid",
        "booking_id": "booking-uuid",
        "old_status": "pending",
        "new_status": "accepted",
        "changed_by": "pro",
        "reason": null,
        "created_at": "2024-01-25T11:00:00Z"
      }
    ]
  }
}
```

---

### Accept Scope/Quotation

Accepts the pro's scope and quotation for a booking.

```http
POST /api/bookings/:id/accept-scope
```

**Headers:** `Authorization: Bearer {token}`

---

### Decline Scope/Quotation

Declines the pro's scope and quotation.

```http
POST /api/bookings/:id/decline-scope
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Price is too high"
}
```

---

### Confirm Job Start

Confirms that the pro has arrived and started work.

```http
PATCH /api/bookings/:id/confirm-start
```

**Headers:** `Authorization: Bearer {token}`

---

### Confirm Job Completion

Confirms that the job has been completed satisfactorily.

```http
PATCH /api/bookings/:id/confirm-complete
```

**Headers:** `Authorization: Bearer {token}`

---

### Cancel Booking

Cancels a booking.

```http
POST /api/bookings/:id/cancel
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Schedule conflict"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled",
  "data": {
    "booking": {
      "id": "booking-uuid",
      "status": "cancelled",
      "updatedAt": "2024-01-25T12:00:00Z"
    }
  }
}
```

---

## Messaging

### Send Text Message

Sends a text message in a booking conversation.

```http
POST /api/bookings/:id/messages
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "content": "Hello, I have a question about the service.",
  "messageType": "text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "message": {
      "id": "message-uuid",
      "booking_id": "booking-uuid",
      "sender_id": "user-uuid",
      "content": "Hello, I have a question about the service.",
      "message_type": "text",
      "is_read": false,
      "created_at": "2024-01-25T12:30:00Z"
    }
  }
}
```

---

### Send Image Message

Sends an image message in a booking conversation.

```http
POST /api/bookings/:id/messages/image
```

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request Body (multipart):**
- `image` (file, required) - Image file

---

### Get Messages

Retrieves messages in a booking conversation.

```http
GET /api/bookings/:id/messages
```

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Messages per page (default: 50, max: 100) |

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved",
  "data": {
    "messages": [
      {
        "id": "message-uuid",
        "booking_id": "booking-uuid",
        "sender_id": "user-uuid",
        "sender_name": "John Doe",
        "content": "Hello!",
        "message_type": "text",
        "is_read": true,
        "created_at": "2024-01-25T12:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

### Mark Messages as Read

Marks all unread messages in a booking as read.

```http
PATCH /api/bookings/:id/messages/read
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "markedCount": 5
  }
}
```

---

## Payments

### Process Payment

Initiates mobile money payment for a booking.

```http
POST /api/bookings/:id/pay
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "phone": "074123456"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone | string | No | Phone for payment (uses user's phone if not provided) |

**Response:**
```json
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "message": "Please approve the payment on your phone",
    "depositId": "dep-uuid",
    "status": "PENDING",
    "amount": 25000,
    "currency": "XAF"
  }
}
```

**Integration Example:**
```javascript
const initiatePayment = async (bookingId, phone) => {
  const token = await getStoredToken();
  const response = await fetch(`${API_URL}/api/bookings/${bookingId}/pay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone })
  });
  return response.json();
};

// After initiating, poll for status
const pollPaymentStatus = async (bookingId, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkPaymentStatus(bookingId);
    if (status.data.status === 'COMPLETED') {
      return { success: true };
    }
    if (status.data.status === 'FAILED') {
      return { success: false, reason: status.data.failureReason };
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return { success: false, reason: 'Timeout' };
};
```

---

### Check Payment Status

Checks the status of a payment for a booking.

```http
GET /api/bookings/:id/payment-status
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved",
  "data": {
    "status": "COMPLETED",
    "bookingStatus": "paid",
    "depositId": "dep-uuid",
    "failureReason": null
  }
}
```

**Payment Status Values:**
- `NOT_STARTED` - Payment not yet initiated
- `PENDING` - Waiting for user approval on phone
- `COMPLETED` - Payment successful
- `FAILED` - Payment failed (check failureReason)

---

## Reviews

### Create Review

Creates a review for a completed booking.

```http
POST /api/reviews
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "bookingId": "booking-uuid",
  "rating": 5,
  "comment": "Excellent service! Very professional and thorough."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bookingId | UUID | Yes | Completed booking ID |
| rating | number | Yes | Rating from 1-5 |
| comment | string | No | Optional review text |

---

### Update Review

Updates an existing review.

```http
PATCH /api/reviews/:id
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review text"
}
```

---

### Delete Review

Deletes a review.

```http
DELETE /api/reviews/:id
```

**Headers:** `Authorization: Bearer {token}`

---

### Get Pro Reviews

Retrieves all reviews for a specific pro (public endpoint).

```http
GET /api/reviews/pro/:proId
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Results per page |
| minRating | number | Filter by minimum rating |

---

### Get Review by Booking

Retrieves the review for a specific booking.

```http
GET /api/reviews/booking/:bookingId
```

**Headers:** `Authorization: Bearer {token}`

---

## Notifications

### Get Notifications

Retrieves user's notifications.

```http
GET /api/notifications
```

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20, max: 50) |
| unreadOnly | boolean | Only return unread (default: false) |

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "id": "notif-uuid",
        "title": "Booking Accepted",
        "message": "Your booking BK-2024-001234 has been accepted by Jean Baptiste",
        "type": "booking_accepted",
        "bookingId": "booking-uuid",
        "isRead": false,
        "readAt": null,
        "createdAt": "2024-01-25T11:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

**Notification Types:**
- `booking_accepted` - Pro accepted booking
- `booking_declined` - Pro declined booking
- `quotation_received` - Pro submitted quote
- `pro_started` - Pro started the job
- `pro_completed` - Pro marked job complete
- `payment_success` - Payment successful
- `payment_failed` - Payment failed
- `new_message` - New chat message

---

### Get Unread Count

Retrieves count of unread notifications.

```http
GET /api/notifications/unread-count
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "unreadCount": 3
  }
}
```

---

### Mark Notification as Read

Marks a specific notification as read.

```http
PATCH /api/notifications/:id/read
```

**Headers:** `Authorization: Bearer {token}`

---

### Mark All as Read

Marks all notifications as read.

```http
PATCH /api/notifications/read-all
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 5
  }
}
```

---

### Delete Notification

Deletes a notification.

```http
DELETE /api/notifications/:id
```

**Headers:** `Authorization: Bearer {token}`

---

## Conversations

### Get My Conversations

Retrieves all booking conversations for the user.

```http
GET /api/users/me/conversations
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Conversations retrieved successfully",
  "data": {
    "conversations": [
      {
        "booking_id": "booking-uuid",
        "booking_number": "BK-2024-001234",
        "status": "in_progress",
        "created_at": "2024-01-25T10:30:00Z",
        "service_name": "Deep House Cleaning",
        "pro_first_name": "Jean",
        "pro_last_name": "Baptiste",
        "pro_avatar": "https://storage.onemarket.ga/avatars/pro123.jpg",
        "pro_user_id": "pro-user-uuid",
        "unread_count": 2,
        "last_message": "I'll be there at 10am",
        "last_message_at": "2024-01-25T15:30:00Z"
      }
    ],
    "totalUnread": 5
  }
}
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

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

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

### Error Handling Example

```javascript
const handleApiError = (error, response) => {
  switch (response.status) {
    case 401:
      // Token expired - refresh or redirect to login
      return refreshTokenAndRetry();
    case 403:
      // Permission denied
      showError('You do not have permission for this action');
      break;
    case 404:
      showError('Resource not found');
      break;
    case 422:
      // Validation errors
      const errors = error.errors || [];
      errors.forEach(e => showFieldError(e.field, e.message));
      break;
    case 429:
      showError('Too many requests. Please wait.');
      break;
    default:
      showError('Something went wrong. Please try again.');
  }
};
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Endpoint Type | Limit |
|---------------|-------|
| OTP Send | Limited per phone number |
| OTP Verify | Limited attempts per session |
| Signup | Limited per IP address |
| General API | Standard limits apply |

When rate limited, you'll receive a `429 Too Many Requests` response. Wait before retrying.

---

## Quick Reference

### Authentication Flow

```
1. POST /api/auth/send-otp (send verification code)
2. POST /api/auth/verify-otp (verify code)
   - If new user: POST /api/auth/signup
   - If existing: Receive tokens, done
3. Store tokens securely
4. Use access token in Authorization header
5. Refresh tokens when expired
```

### Booking Flow

```
1. GET /api/services (browse services)
2. GET /api/services/:id/questions (get service questions)
3. GET /api/pros/search (find available pros)
4. POST /api/bookings/v2 (create booking)
5. Wait for pro acceptance
6. POST /api/bookings/:id/accept-scope (accept quote)
7. POST /api/bookings/:id/pay (make payment)
8. Poll GET /api/bookings/:id/payment-status
9. PATCH /api/bookings/:id/confirm-start (confirm pro arrival)
10. PATCH /api/bookings/:id/confirm-complete (confirm completion)
11. POST /api/reviews (leave review)
```

### Required Token Storage

```javascript
// Secure storage example (React Native)
import * as SecureStore from 'expo-secure-store';

const storeTokens = async (accessToken, refreshToken) => {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
};

const getStoredToken = async () => {
  return await SecureStore.getItemAsync('accessToken');
};

const getStoredRefreshToken = async () => {
  return await SecureStore.getItemAsync('refreshToken');
};

const clearTokens = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
};
```

---

## API Summary

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| Authentication | 5 | No |
| User Profile | 2 | Yes |
| Addresses | 5 | Yes |
| Services/Categories | 5 | No |
| Zones/Locations | 3 | No |
| Pro Browsing | 7 | No |
| Business Directory | 3 | No |
| Bookings | 16 | Yes |
| Reviews | 5 | Mixed |
| Notifications | 5 | Yes |
| Conversations | 1 | Yes |
| **Total** | **57** | - |

---

*Last updated: January 2025*
*API Version: v2*
