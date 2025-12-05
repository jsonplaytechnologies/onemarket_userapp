# OneMarket API Documentation - Pro (Service Provider) Role

**Base URL:** `https://onemarket-backend.onrender.com`
**Role:** `pro`
**Platform:** React Native Mobile App

---

## Table of Contents

1. [Authentication & Signup](#1-authentication--signup)
2. [Profile Management](#2-profile-management)
3. [ID Document Verification](#3-id-document-verification)
4. [Service Management](#4-service-management)
5. [Zone Coverage](#5-zone-coverage)
6. [Availability Status](#6-availability-status)
7. [Booking Management](#7-booking-management)
8. [Earnings & Wallet](#8-earnings--wallet)
9. [Withdrawals](#9-withdrawals)
10. [Reviews & Responses](#10-reviews--responses)
11. [Chat & Messages](#11-chat--messages)
12. [Notifications](#12-notifications)
13. [Socket.io Real-time Events](#13-socketio-real-time-events)
14. [Approval Workflow](#14-approval-workflow)

---

## Important: Account Approval Process

**Pro accounts require admin approval before accessing most features.**

### Approval Status Values:

- `pending` - Newly registered, awaiting approval
- `approved` - Can access all features
- `rejected` - Account rejected (can reapply)

### What Requires Approval:

- Managing services and zones
- Accepting bookings
- Receiving payments
- Withdrawing earnings

### What Works Without Approval:

- Login/Authentication
- Viewing own profile
- Uploading ID documents
- Viewing notifications

---

## 1. Authentication & Signup

### 1.1 Send OTP

```
POST /api/auth/send-otp
```

**Request Body:**

```json
{
  "phone": "077123456",
  "countryCode": "+241"
}
```

**Important:** Pro accounts MUST use Gabon phone numbers (+241).

**Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expiresIn": 600,
    "phone": "+241077123456"
  }
}
```

---

### 1.2 Verify OTP

```
POST /api/auth/verify-otp
```

**Request Body:**

```json
{
  "phone": "077123456",
  "code": "123456",
  "countryCode": "+241"
}
```

---

### 1.3 Signup as Pro

```
POST /api/auth/signup
```

**Request Body:**

```json
{
  "phone": "+241077123456",
  "role": "pro",
  "profile": {
    "firstName": "Jean",
    "lastName": "Pierre",
    "bio": "Professional plumber with 10 years experience"
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
    "user": {
      "id": "user-uuid",
      "phone": "+241077123456",
      "role": "pro",
      "isActive": true,
      "isVerified": true,
      "approvalStatus": "pending",
      "createdAt": "2025-11-28T10:00:00.000Z",
      "profile": {
        "firstName": "Jean",
        "lastName": "Pierre",
        "bio": "Professional plumber with 10 years experience"
      }
    }
  }
}
```

**Note:** New pro accounts have `approvalStatus: "pending"`. They must:

1. Upload ID documents
2. Add services and zones
3. Wait for admin approval

---

### 1.4 Get Current User

```
GET /api/auth/me
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
    "id": "user-uuid",
    "phone": "+241077123456",
    "role": "pro",
    "isActive": true,
    "isVerified": true,
    "approvalStatus": "approved",
    "rejectionReason": null,
    "profile": {
      "id": "pro-profile-uuid",
      "firstName": "Jean",
      "lastName": "Pierre",
      "avatar": "https://cloudinary.com/...",
      "bio": "Professional plumber",
      "rating": 4.8,
      "totalReviews": 45,
      "isOnline": true,
      "isIdVerified": true
    }
  }
}
```

---

## 2. Profile Management

### 2.1 Get Pro Profile

```
GET /api/pros/me/profile
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
    "id": "pro-profile-uuid",
    "userId": "user-uuid",
    "firstName": "Jean",
    "lastName": "Pierre",
    "avatar": "https://cloudinary.com/avatar.jpg",
    "bio": "Professional plumber with 10 years experience in Libreville",
    "rating": 4.8,
    "totalReviews": 45,
    "totalCompletedJobs": 120,
    "responseTime": "< 1 hour",
    "isOnline": true,
    "isIdVerified": true,
    "idNumber": "GA****5678",
    "bankName": "BGFI Bank",
    "bankAccountNumber": "****4321",
    "mobileMoneyNumber": "+241077****56",
    "pendingBalance": 150000,
    "availableBalance": 500000,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "services": [
      {
        "id": "ps-uuid",
        "serviceId": "service-uuid",
        "serviceName": "Plumbing",
        "categoryName": "Home Repair",
        "customPrice": 18000,
        "isAvailable": true
      }
    ],
    "zones": [
      {
        "id": "pz-uuid",
        "zoneId": "zone-uuid",
        "zoneName": "Centre-ville",
        "subZoneId": "subzone-uuid",
        "subZoneName": "Quartier Louis"
      }
    ]
  }
}
```

---

### 2.2 Update Pro Profile

```
PATCH /api/pros/me/profile
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request (Form Data):**

```
firstName: "Jean"
lastName: "Pierre"
bio: "Professional plumber with 10+ years experience"
responseTime: "< 1 hour"
bankName: "BGFI Bank"
bankAccountNumber: "123456789"
mobileMoneyNumber: "+241074000000"
avatar: [File] (optional)
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "pro-profile-uuid",
    "firstName": "Jean",
    "lastName": "Pierre",
    "bio": "Professional plumber with 10+ years experience",
    "avatar": "https://cloudinary.com/new-avatar.jpg",
    "responseTime": "< 1 hour"
  }
}
```

**React Native Implementation:**

```javascript
import * as ImagePicker from 'expo-image-picker';

const updateProProfile = async (profileData) => {
  const formData = new FormData();

  Object.keys(profileData).forEach((key) => {
    if (key !== 'avatar') {
      formData.append(key, profileData[key]);
    }
  });

  if (profileData.avatar) {
    const uri = profileData.avatar;
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri,
      name: filename,
      type,
    });
  }

  const response = await fetch(`${BASE_URL}/api/pros/me/profile`, {
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

## 3. ID Document Verification

### 3.1 Upload ID Documents

Upload front and back images of ID document for verification.

```
POST /api/pros/me/documents
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request (Form Data):**

```
id_front: [File] - Front of ID card
id_back: [File] - Back of ID card
idNumber: "GA123456789"
```

**Response:**

```json
{
  "success": true,
  "message": "Documents uploaded successfully",
  "data": {
    "idFrontUrl": "https://cloudinary.com/id-front.jpg",
    "idBackUrl": "https://cloudinary.com/id-back.jpg",
    "idNumber": "GA****6789",
    "isIdVerified": false,
    "documentStatus": "pending_review"
  }
}
```

**React Native Implementation:**

```javascript
const uploadIdDocuments = async (frontUri, backUri, idNumber) => {
  const formData = new FormData();

  formData.append('idNumber', idNumber);

  formData.append('id_front', {
    uri: frontUri,
    name: 'id_front.jpg',
    type: 'image/jpeg',
  });

  formData.append('id_back', {
    uri: backUri,
    name: 'id_back.jpg',
    type: 'image/jpeg',
  });

  const response = await fetch(`${BASE_URL}/api/pros/me/documents`, {
    method: 'POST',
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

### 3.2 Get Uploaded Documents

```
GET /api/pros/me/documents
```

**Response:**

```json
{
  "success": true,
  "data": {
    "idFrontUrl": "https://cloudinary.com/id-front.jpg",
    "idBackUrl": "https://cloudinary.com/id-back.jpg",
    "idNumber": "GA****6789",
    "isIdVerified": true,
    "verifiedAt": "2025-11-28T12:00:00.000Z"
  }
}
```

---

## 4. Service Management

### 4.1 Get Available Services (All Services)

Get list of all services to choose from.

```
GET /api/services
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "service-uuid-1",
      "name": "Plumbing",
      "description": "Fix leaks, pipes, etc.",
      "basePrice": 15000,
      "categoryId": "cat-uuid",
      "categoryName": "Home Repair"
    },
    {
      "id": "service-uuid-2",
      "name": "Electrical Work",
      "description": "Wiring, outlets, switches",
      "basePrice": 20000,
      "categoryId": "cat-uuid",
      "categoryName": "Home Repair"
    }
  ]
}
```

---

### 4.2 Get My Services

Get services I offer.

```
GET /api/pros/me/services
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "pro-service-uuid",
      "serviceId": "service-uuid",
      "serviceName": "Plumbing",
      "categoryName": "Home Repair",
      "basePrice": 15000,
      "customPrice": 18000,
      "isAvailable": true,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 4.3 Add Service

```
POST /api/pros/me/services
```

**Request Body:**

```json
{
  "serviceId": "service-uuid",
  "customPrice": 18000
}
```

**Response:**

```json
{
  "success": true,
  "message": "Service added successfully",
  "data": {
    "id": "pro-service-uuid",
    "serviceId": "service-uuid",
    "serviceName": "Plumbing",
    "customPrice": 18000,
    "isAvailable": true
  }
}
```

---

### 4.4 Update Service

```
PATCH /api/pros/me/services/:id
```

**Request Body:**

```json
{
  "customPrice": 20000,
  "isAvailable": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "id": "pro-service-uuid",
    "customPrice": 20000,
    "isAvailable": true
  }
}
```

---

### 4.5 Remove Service

```
DELETE /api/pros/me/services/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Service removed successfully"
}
```

---

## 5. Zone Coverage

### 5.1 Get All Zones

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
      "description": "Downtown Libreville",
      "sub_zones": [
        { "id": "sz-uuid-1", "name": "Quartier Louis" },
        { "id": "sz-uuid-2", "name": "Mont-Bouët" }
      ]
    },
    {
      "id": "zone-uuid-2",
      "name": "Akanda",
      "description": "Northern district",
      "sub_zones": [{ "id": "sz-uuid-3", "name": "Angondjé" }]
    }
  ]
}
```

---

### 5.2 Get My Zones

```
GET /api/pros/me/zones
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "pro-zone-uuid",
      "zoneId": "zone-uuid",
      "zoneName": "Centre-ville",
      "subZoneId": "subzone-uuid",
      "subZoneName": "Quartier Louis"
    }
  ]
}
```

---

### 5.3 Add Zone Coverage

```
POST /api/pros/me/zones
```

**Request Body:**

```json
{
  "zoneId": "zone-uuid",
  "subZoneId": "subzone-uuid"
}
```

**Note:** `subZoneId` is optional. If not provided, covers entire zone.

**Response:**

```json
{
  "success": true,
  "message": "Zone added successfully",
  "data": {
    "id": "pro-zone-uuid",
    "zoneId": "zone-uuid",
    "zoneName": "Centre-ville",
    "subZoneId": "subzone-uuid",
    "subZoneName": "Quartier Louis"
  }
}
```

---

### 5.4 Remove Zone Coverage

```
DELETE /api/pros/me/zones/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Zone removed successfully"
}
```

---

## 6. Availability Status

### 6.1 Set Online/Offline Status

```
PATCH /api/pros/me/availability
```

**Request Body:**

```json
{
  "isOnline": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Availability updated",
  "data": {
    "isOnline": true
  }
}
```

**React Native Implementation:**

```javascript
// Toggle availability with a switch
const AvailabilityToggle = () => {
  const [isOnline, setIsOnline] = useState(false);

  const toggleAvailability = async (value) => {
    try {
      const response = await fetch(`${BASE_URL}/api/pros/me/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOnline: value }),
      });

      const data = await response.json();
      if (data.success) {
        setIsOnline(value);
      }
    } catch (error) {
      console.error('Toggle availability error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>{isOnline ? 'Online' : 'Offline'}</Text>
      <Switch value={isOnline} onValueChange={toggleAvailability} />
    </View>
  );
};
```

---

## 7. Booking Management

### 7.1 Get My Bookings

```
GET /api/bookings
```

**Query Parameters:**

- `status` (optional): Filter by status
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
      "status": "pending",
      "serviceName": "Plumbing",
      "userNote": "Kitchen sink is leaking",
      "createdAt": "2025-11-28T10:00:00.000Z",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://..."
      },
      "address": {
        "zoneName": "Centre-ville",
        "subZoneName": "Quartier Louis"
      }
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

### 7.2 Get Booking Details

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
    "status": "paid",
    "userId": "user-uuid",
    "proId": "pro-uuid",
    "serviceId": "service-uuid",
    "serviceName": "Plumbing",
    "categoryName": "Home Repair",
    "userNote": "Kitchen sink is leaking",
    "quotationAmount": 25000,
    "commissionPercentage": 10,
    "commissionAmount": 2500,
    "proEarnings": 22500,
    "paidAmount": 25000,
    "address": {
      "addressLine": "123 Main Street, Libreville",
      "zoneName": "Centre-ville",
      "subZoneName": "Quartier Louis",
      "latitude": 0.4162,
      "longitude": 9.4673
    },
    "user": {
      "id": "user-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://...",
      "phone": "+241074123456"
    },
    "createdAt": "2025-11-28T10:00:00.000Z",
    "acceptedAt": "2025-11-28T10:15:00.000Z",
    "paidAt": "2025-11-28T12:00:00.000Z"
  }
}
```

**Note:** Full address with coordinates shown only after payment.

---

### 7.3 Accept Booking

```
PATCH /api/bookings/:id/accept
```

**Response:**

```json
{
  "success": true,
  "message": "Booking accepted",
  "data": {
    "id": "booking-uuid",
    "status": "accepted",
    "acceptedAt": "2025-11-28T10:15:00.000Z"
  }
}
```

---

### 7.4 Reject Booking

```
PATCH /api/bookings/:id/reject
```

**Request Body:**

```json
{
  "reason": "Not available at that time"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Booking rejected",
  "data": {
    "id": "booking-uuid",
    "status": "rejected"
  }
}
```

---

### 7.5 Send Quotation

After accepting, send price quotation to user.

```
PATCH /api/bookings/:id/quotation
```

**Request Body:**

```json
{
  "amount": 25000
}
```

**Response:**

```json
{
  "success": true,
  "message": "Quotation sent",
  "data": {
    "id": "booking-uuid",
    "status": "quotation_sent",
    "quotationAmount": 25000,
    "commissionPercentage": 10,
    "commissionAmount": 2500,
    "proEarnings": 22500
  }
}
```

---

### 7.6 Mark On The Way

After user pays, mark that you're on the way.

```
PATCH /api/bookings/:id/on-the-way
```

**Response:**

```json
{
  "success": true,
  "message": "Status updated to on the way",
  "data": {
    "id": "booking-uuid",
    "status": "on_the_way"
  }
}
```

---

### 7.7 Request Job Start

When you arrive, request to start the job.

```
PATCH /api/bookings/:id/start
```

**Response:**

```json
{
  "success": true,
  "message": "Job start requested - waiting for user confirmation"
}
```

**Note:** User must confirm before status changes to `job_started`.

---

### 7.8 Request Job Completion

When job is done, request completion.

```
PATCH /api/bookings/:id/complete
```

**Response:**

```json
{
  "success": true,
  "message": "Job completion requested - waiting for user confirmation"
}
```

**Note:** User must confirm before status changes to `completed` and earnings are credited.

---

### 7.9 Cancel Booking

```
POST /api/bookings/:id/cancel
```

**Request Body:**

```json
{
  "reason": "Emergency situation"
}
```

---

## 8. Earnings & Wallet

### 8.1 Get Earnings Summary

```
GET /api/pros/me/earnings
```

**Query Parameters:**

- `period` (optional): `today`, `week`, `month`, `year`, `all`

**Response:**

```json
{
  "success": true,
  "data": {
    "wallet": {
      "availableBalance": 500000,
      "pendingBalance": 150000,
      "totalEarnings": 2500000,
      "totalWithdrawn": 1850000
    },
    "breakdown": {
      "period": "month",
      "totalJobs": 15,
      "totalEarnings": 375000,
      "totalCommission": 37500,
      "netEarnings": 337500,
      "byService": [
        {
          "serviceName": "Plumbing",
          "jobCount": 10,
          "earnings": 225000
        },
        {
          "serviceName": "Electrical",
          "jobCount": 5,
          "earnings": 112500
        }
      ]
    }
  }
}
```

---

### 8.2 Get Transaction History

```
GET /api/pros/me/transactions
```

**Query Parameters:**

- `type` (optional): `earning`, `withdrawal`, `commission`
- `page` (optional)
- `limit` (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "txn-uuid-1",
      "type": "earning",
      "amount": 22500,
      "description": "Booking BK-20251128-ABC123 completed",
      "bookingId": "booking-uuid",
      "status": "completed",
      "createdAt": "2025-11-28T16:00:00.000Z"
    },
    {
      "id": "txn-uuid-2",
      "type": "withdrawal",
      "amount": -100000,
      "description": "Withdrawal to Mobile Money",
      "status": "completed",
      "createdAt": "2025-11-27T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

---

### 8.3 Get Transaction Details

```
GET /api/pros/me/transactions/:id
```

---

## 9. Withdrawals

### 9.1 Request Withdrawal

```
POST /api/pros/me/withdrawals
```

**Request Body:**

```json
{
  "amount": 100000,
  "method": "mobile_money"
}
```

**Methods:** `bank_transfer`, `mobile_money`

**Response:**

```json
{
  "success": true,
  "message": "Withdrawal request submitted",
  "data": {
    "id": "withdrawal-uuid",
    "amount": 100000,
    "method": "mobile_money",
    "status": "pending",
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

**Note:** Withdrawal requests are processed by admin. Once approved, PawaPay sends the money to your mobile money account.

---

### 9.2 Get Withdrawal History

```
GET /api/pros/me/withdrawals
```

**Query Parameters:**

- `status` (optional): `pending`, `approved`, `completed`, `rejected`, `failed`
- `page` (optional)
- `limit` (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "withdrawal-uuid-1",
      "amount": 100000,
      "method": "mobile_money",
      "status": "completed",
      "processedAt": "2025-11-28T12:00:00.000Z",
      "createdAt": "2025-11-28T10:00:00.000Z"
    },
    {
      "id": "withdrawal-uuid-2",
      "amount": 50000,
      "method": "bank_transfer",
      "status": "pending",
      "createdAt": "2025-11-29T10:00:00.000Z"
    }
  ]
}
```

---

### 9.3 Get Withdrawal Details

```
GET /api/pros/me/withdrawals/:id
```

---

## 10. Reviews & Responses

### 10.1 Get My Reviews

```
GET /api/reviews/pro/:proId
```

Use your own pro profile ID to get your reviews.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "review-uuid",
      "bookingId": "booking-uuid",
      "rating": 5,
      "comment": "Excellent work! Very professional.",
      "userName": "John D.",
      "serviceName": "Plumbing",
      "proResponse": null,
      "createdAt": "2025-11-28T18:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  },
  "summary": {
    "averageRating": 4.8,
    "totalReviews": 45,
    "ratingDistribution": {
      "5": 35,
      "4": 8,
      "3": 2,
      "2": 0,
      "1": 0
    }
  }
}
```

---

### 10.2 Respond to Review

```
POST /api/reviews/:id/response
```

**Request Body:**

```json
{
  "response": "Thank you for your kind words! It was a pleasure working with you."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    "id": "review-uuid",
    "proResponse": "Thank you for your kind words!",
    "respondedAt": "2025-11-28T20:00:00.000Z"
  }
}
```

---

## 11. Chat & Messages

### 11.1 Get Booking Messages

```
GET /api/bookings/:id/messages
```

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
    }
  ]
}
```

---

### 11.2 Send Message

```
POST /api/bookings/:id/messages
```

**Request Body:**

```json
{
  "content": "I can come at 2 PM",
  "messageType": "text"
}
```

---

### 11.3 Mark Messages as Read

```
PATCH /api/bookings/:id/messages/read
```

---

## 12. Notifications

### 12.1 Get Notifications

```
GET /api/notifications
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid",
      "title": "New Booking Request",
      "message": "John Doe has requested your plumbing service",
      "type": "new_booking",
      "bookingId": "booking-uuid",
      "isRead": false,
      "createdAt": "2025-11-28T10:00:00.000Z"
    },
    {
      "id": "notif-uuid-2",
      "title": "Payment Received",
      "message": "Payment of 25,000 XAF received for booking BK-123",
      "type": "payment_received",
      "bookingId": "booking-uuid",
      "isRead": false,
      "createdAt": "2025-11-28T12:00:00.000Z"
    },
    {
      "id": "notif-uuid-3",
      "title": "Withdrawal Completed",
      "message": "Your withdrawal of 100,000 XAF has been sent",
      "type": "withdrawal_completed",
      "isRead": true,
      "createdAt": "2025-11-27T14:00:00.000Z"
    }
  ]
}
```

### Notification Types for Pro:

- `new_booking` - New booking request
- `booking_cancelled` - User cancelled booking
- `payment_received` - User paid for booking
- `job_start_confirmed` - User confirmed job start
- `job_complete_confirmed` - User confirmed job completion
- `new_review` - User left a review
- `withdrawal_approved` - Withdrawal approved
- `withdrawal_completed` - Withdrawal completed
- `withdrawal_failed` - Withdrawal failed
- `account_approved` - Account approved by admin
- `account_rejected` - Account rejected by admin
- `id_verified` - ID documents verified

---

### 12.2 Get Unread Count

```
GET /api/notifications/unread-count
```

---

### 12.3 Mark as Read

```
PATCH /api/notifications/:id/read
```

---

### 12.4 Mark All as Read

```
PATCH /api/notifications/read-all
```

---

## 13. Socket.io Real-time Events

### Connection Setup

```javascript
import { io } from 'socket.io-client';

const socket = io('https://onemarket-backend.onrender.com', {
  auth: {
    token: 'your-jwt-token',
  },
  transports: ['websocket'],
});
```

### Events to Listen (Pro Client)

| Event                    | Description           | Payload                                |
| ------------------------ | --------------------- | -------------------------------------- |
| `notification`           | New notification      | `{ title, message, type, bookingId? }` |
| `booking-status-changed` | Booking status update | `{ bookingId, status }`                |
| `new-message`            | New chat message      | `{ id, senderId, content, createdAt }` |
| `message-notification`   | Message preview       | `{ bookingId, senderId, preview }`     |
| `user-typing`            | User typing indicator | `{ userId, isTyping }`                 |
| `message-read`           | Message read receipt  | `{ messageId }`                        |

### Events to Emit

| Event           | Description           | Payload                               |
| --------------- | --------------------- | ------------------------------------- |
| `join-booking`  | Join booking chat     | `bookingId`                           |
| `leave-booking` | Leave booking chat    | `bookingId`                           |
| `send-message`  | Send message          | `{ bookingId, content, messageType }` |
| `typing`        | Send typing indicator | `{ bookingId, isTyping }`             |
| `mark-read`     | Mark message read     | `{ bookingId, messageId }`            |

### React Native - New Booking Alert

```javascript
useEffect(() => {
  socket.on('notification', (notification) => {
    if (notification.type === 'new_booking') {
      // Show alert or push notification
      Alert.alert(notification.title, notification.message, [
        { text: 'Later', style: 'cancel' },
        {
          text: 'View',
          onPress: () =>
            navigation.navigate('BookingDetails', {
              bookingId: notification.bookingId,
            }),
        },
      ]);
    }
  });

  return () => socket.off('notification');
}, []);
```

---

## 14. Approval Workflow

### Account States

```
[New Registration]
       ↓
    PENDING
       ↓
[Upload ID + Add Services + Add Zones]
       ↓
[Admin Reviews]
       ↓
   APPROVED ←──or──→ REJECTED
       ↓                  ↓
[Full Access]    [Can Reapply/Appeal]
```

### Checking Approval Status

```javascript
const checkApprovalStatus = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();

  switch (data.data.approvalStatus) {
    case 'pending':
      // Show "Pending Approval" screen
      navigation.navigate('PendingApproval');
      break;
    case 'approved':
      // Full access
      navigation.navigate('ProHome');
      break;
    case 'rejected':
      // Show rejection reason and option to reapply
      navigation.navigate('AccountRejected', {
        reason: data.data.rejectionReason,
      });
      break;
  }
};
```

### Error When Not Approved

If trying to access protected features while not approved:

```json
{
  "success": false,
  "message": "Account pending approval",
  "code": "ACCOUNT_NOT_APPROVED"
}
```

---

## Quick Reference - All Pro Endpoints

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| POST   | `/api/auth/send-otp`           | Send OTP            |
| POST   | `/api/auth/verify-otp`         | Verify OTP          |
| POST   | `/api/auth/signup`             | Create pro account  |
| GET    | `/api/auth/me`                 | Get current user    |
| GET    | `/api/pros/me/profile`         | Get pro profile     |
| PATCH  | `/api/pros/me/profile`         | Update profile      |
| POST   | `/api/pros/me/documents`       | Upload ID documents |
| GET    | `/api/pros/me/documents`       | Get documents       |
| PATCH  | `/api/pros/me/availability`    | Set online/offline  |
| GET    | `/api/pros/me/services`        | Get my services     |
| POST   | `/api/pros/me/services`        | Add service         |
| PATCH  | `/api/pros/me/services/:id`    | Update service      |
| DELETE | `/api/pros/me/services/:id`    | Remove service      |
| GET    | `/api/pros/me/zones`           | Get my zones        |
| POST   | `/api/pros/me/zones`           | Add zone            |
| DELETE | `/api/pros/me/zones/:id`       | Remove zone         |
| GET    | `/api/bookings`                | Get my bookings     |
| GET    | `/api/bookings/:id`            | Get booking details |
| PATCH  | `/api/bookings/:id/accept`     | Accept booking      |
| PATCH  | `/api/bookings/:id/reject`     | Reject booking      |
| PATCH  | `/api/bookings/:id/quotation`  | Send quotation      |
| PATCH  | `/api/bookings/:id/on-the-way` | Mark on the way     |
| PATCH  | `/api/bookings/:id/start`      | Request job start   |
| PATCH  | `/api/bookings/:id/complete`   | Request completion  |
| POST   | `/api/bookings/:id/cancel`     | Cancel booking      |
| GET    | `/api/bookings/:id/messages`   | Get messages        |
| POST   | `/api/bookings/:id/messages`   | Send message        |
| GET    | `/api/pros/me/earnings`        | Get earnings        |
| GET    | `/api/pros/me/transactions`    | Get transactions    |
| POST   | `/api/pros/me/withdrawals`     | Request withdrawal  |
| GET    | `/api/pros/me/withdrawals`     | Get withdrawals     |
| POST   | `/api/reviews/:id/response`    | Respond to review   |
| GET    | `/api/notifications`           | Get notifications   |
| GET    | `/api/services`                | Get all services    |
| GET    | `/api/zones/all`               | Get all zones       |

---

## Booking Status Flow (Pro Perspective)

```
[User creates booking]
        ↓
    PENDING ←── You see new booking notification
        ↓
[You accept or reject]
        ↓
    ACCEPTED
        ↓
[You send quotation]
        ↓
  QUOTATION_SENT
        ↓
[User pays] ←── You get payment notification
        ↓
      PAID ←── Full address now visible
        ↓
[You mark on the way]
        ↓
   ON_THE_WAY
        ↓
[You request job start]
        ↓
JOB_START_REQUESTED ←── Waiting for user
        ↓
[User confirms]
        ↓
   JOB_STARTED
        ↓
[You complete job]
        ↓
JOB_COMPLETE_REQUESTED ←── Waiting for user
        ↓
[User confirms]
        ↓
    COMPLETED ←── Earnings credited to wallet
```

---

**Document Version:** 1.0
**Last Updated:** November 28, 2025
**API Version:** 2.0.0
