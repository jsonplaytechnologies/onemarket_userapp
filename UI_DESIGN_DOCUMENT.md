# OneMarket User App - UI/UX Design Document

**Version:** 1.1
**Date:** December 2025
**Platform:** React Native with NativeWind
**Target:** Android

---

## Table of Contents

1. [Design System](#design-system)
2. [Icon Package Setup](#icon-package-setup)
3. [Navigation Structure](#navigation-structure)
4. [Screen Specifications](#screen-specifications)
5. [User Flows](#user-flows)
6. [Component Library](#component-library)
7. [API Integration Points](#api-integration-points)

---

## Design System

### Color Palette

**Primary Colors:**
- Primary Blue: `#2563EB` (blue-600)
- Primary Blue Hover: `#1D4ED8` (blue-700)
- Light Blue: `#DBEAFE` (blue-100) - for backgrounds
- White: `#FFFFFF`

**Text Colors:**
- Primary Text: `#111827` (gray-900)
- Secondary Text: `#6B7280` (gray-500)
- Disabled Text: `#9CA3AF` (gray-400)

**Semantic Colors:**
- Success: `#10B981` (green-500)
- Error: `#EF4444` (red-500)
- Warning: `#F59E0B` (amber-500)
- Info: `#3B82F6` (blue-500)

**Background Colors:**
- App Background: `#F9FAFB` (gray-50)
- Card Background: `#FFFFFF`
- Border: `#E5E7EB` (gray-200)

### Typography

**Font Family:** Poppins

**Font Sizes:**
- Heading 1: 24px (font-bold)
- Heading 2: 20px (font-semibold)
- Heading 3: 18px (font-semibold)
- Body: 14px (font-normal)
- Small: 12px (font-normal)
- Tiny: 10px (font-normal)

### Spacing

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius

- Small: 8px
- Medium: 12px
- Large: 16px
- Full: 9999px (for pills/badges)

---

## Icon Package Setup

### Package: react-native-vector-icons

**Installation:**
```bash
npm install react-native-vector-icons
```

**Icon Families Used:**
- **Ionicons** - Primary icons (general UI)
- **Feather** - Secondary icons (simple, clean)
- **MaterialCommunityIcons** - Specific use cases

**Usage:**
```javascript
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

<Ionicons name="home" size={24} color="#2563EB" />
```

---

## Navigation Structure

### Bottom Tab Navigation (Always Visible)

```
┌─────────────────────────────────────┐
│                                     │
│         [SCREEN CONTENT]            │
│                                     │
├─────────────────────────────────────┤
│  Home    Bookings   Notif  Profile  │
│  (home)  (calendar) (bell) (person) │
└─────────────────────────────────────┘
```

**Tabs:**
1. **Home** - Icon: Ionicons "home", Label: "Home"
2. **Bookings** - Icon: Ionicons "calendar-outline", Label: "Bookings"
3. **Notifications** - Icon: Ionicons "notifications-outline", Label: "Notifications" (with badge for unread count)
4. **Profile** - Icon: Ionicons "person-outline", Label: "Profile"

### Top Tab Navigation (Inside Home Screen Only)

```
┌─────────────────────────────────────┐
│  Services  |  Businesses            │
├─────────────────────────────────────┤
│                                     │
│     [Tab Content]                   │
│                                     │
└─────────────────────────────────────┘
```

Active tab has blue underline + blue text
Inactive tab has gray text

---

## Screen Specifications

### 1. Authentication Screens

#### 1.1 Splash Screen

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│           [LOGO]                    │
│         OneMarket                   │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Centered logo (to be provided)
- App name "OneMarket" (Poppins 24px, bold)
- White background

**Auto-navigation:**
- If token exists in AsyncStorage → Navigate to Home
- If no token → Navigate to Welcome screen after 2 seconds

---

#### 1.2 Welcome Screen

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│           [LOGO]                    │
│                                     │
│      Welcome to OneMarket           │
│                                     │
│   Find services and businesses      │
│        in your area                 │
│                                     │
│                                     │
│   ┌─────────────────────────────┐  │
│   │     Get Started             │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Logo (centered, top 1/4 of screen)
- Heading: "Welcome to OneMarket" (H1)
- Subtitle: "Find services and businesses in your area" (Body, gray-500)
- Button: "Get Started" (Primary blue, full width with margin)

**Action:**
- Tap "Get Started" → Navigate to Phone Input Screen

---

#### 1.3 Phone Input Screen

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back]                       │
│                                     │
│  Enter your phone number            │
│                                     │
│  We'll send you a verification code │
│                                     │
│  ┌────────┬──────────────────────┐ │
│  │ +241 ▼ │  Phone number        │ │
│  └────────┴──────────────────────┘ │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Send OTP               │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back button (top-left): Ionicons "arrow-back"
- Heading: "Enter your phone number" (H2)
- Subtitle: "We'll send you a verification code" (Small, gray-500)
- Country Code Picker:
  - Dropdown showing country code (default: +241)
  - Shows flag icon + code
  - Chevron down: Ionicons "chevron-down"
  - Searchable list of all countries
- Phone Number Input:
  - Placeholder: "Phone number"
  - Numeric keyboard
  - No country code in input (only the number part)
- Button: "Send OTP" (Primary blue, full width)
  - Disabled if phone number is empty
  - Shows loading spinner when API call in progress

**Validation:**
- Phone number must be at least 6 digits
- Show error message below input if invalid format
- Error icon: Feather "alert-circle" (red)

**API Call:**
- `POST /api/auth/send-otp`
- Body: `{ phone: "074123456", countryCode: "+241" }`

**Success:**
- Show toast: "OTP sent successfully"
- Navigate to OTP Verification Screen
- Pass phone + countryCode as params

---

#### 1.4 OTP Verification Screen

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back]                       │
│                                     │
│  Verify your phone                  │
│                                     │
│  Enter the code sent to             │
│  +241 074123456                     │
│                                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                     │
│  Resend code in 0:45                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Verify                 │   │
│  └─────────────────────────────┘   │
│                                     │
│         Resend Code                 │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back button (top-left): Ionicons "arrow-back"
- Heading: "Verify your phone" (H2)
- Subtitle: "Enter the code sent to +241 074123456" (Small, gray-500)
- OTP Input: 6 individual boxes
  - Auto-focus first box
  - Auto-move to next box on input
  - Numeric keyboard
  - Blue border on active box
- Countdown Timer: "Resend code in 0:45"
  - Icon: Ionicons "time-outline"
  - Counts down from 10:00 (600 seconds)
  - When 0:00, show "Resend Code" link instead
- Button: "Verify" (Primary blue, full width)
  - Auto-enabled when all 6 digits entered
- Link: "Resend Code" (Blue text, below button)
  - Icon: Ionicons "refresh-outline"
  - Only enabled after timer reaches 0:00
  - Disabled (gray) during countdown

**API Call:**
- `POST /api/auth/verify-otp`
- Body: `{ phone: "074123456", code: "123456", countryCode: "+241" }`

**Response Handling:**

**Case 1: Existing User** (`isNewUser: false`)
- Store token in AsyncStorage
- Store user object in AsyncStorage
- Navigate to Home Screen
- Show toast with success icon: Ionicons "checkmark-circle" (green)

**Case 2: New User** (`isNewUser: true`)
- Navigate to Signup Screen
- Pass phone as param

**Error:**
- Show error message below OTP boxes: "Invalid or expired code"
- Error icon: Feather "alert-circle" (red)
- Clear all OTP boxes

---

#### 1.5 Signup Screen (New Users Only)

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back]                       │
│                                     │
│  Complete your profile              │
│                                     │
│  Tell us a bit about yourself       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  First Name                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Last Name                  │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Create Account         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back button (top-left): Ionicons "arrow-back"
- Heading: "Complete your profile" (H2)
- Subtitle: "Tell us a bit about yourself" (Small, gray-500)
- Input: First Name (required)
  - Icon: Ionicons "person-outline" (left)
- Input: Last Name (required)
  - Icon: Ionicons "person-outline" (left)
- Button: "Create Account" (Primary blue, full width)
  - Disabled if any field empty
  - Shows loading spinner during API call

**Validation:**
- First name: 2-50 characters
- Last name: 2-50 characters
- Show error messages below respective fields with Feather "alert-circle" icon

**API Call:**
- `POST /api/auth/signup`
- Body: `{ phone: "+241074123456", role: "user", profile: { firstName: "John", lastName: "Doe" } }`

**Success:**
- Store token in AsyncStorage
- Store user object in AsyncStorage
- Navigate to Home Screen
- Show toast: "Account created successfully!" with Ionicons "checkmark-circle"

---

### 2. Home Screen

#### 2.1 Home Screen - Services Tab (Default Active)

**Layout:**
```
┌─────────────────────────────────────┐
│  OneMarket         [bell](3)        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [search] Search services... │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────      │
│  Services  |  Businesses            │
│  ─────────────────────────────      │
│                                     │
│  Categories                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ →    │
│  │[I] │ │[I] │ │[I] │ │[I] │      │
│  │Home│ │Cln │ │Elec│ │Cons│      │
│  └────┘ └────┘ └────┘ └────┘       │
│                                     │
│  All Services                       │
│  ┌─────────────────────────────┐   │
│  │ [hammer]  Plumbing          │   │
│  │     Home Repair             │   │
│  │     From 15,000 XAF         │   │
│  │                 [chevron-right] │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [broom]  House Cleaning     │   │
│  │     Cleaning                │   │
│  │     From 20,000 XAF         │   │
│  │                 [chevron-right] │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [home]  [calendar]  [bell] [person]│
└─────────────────────────────────────┘
```

**Header:**
- App name: "OneMarket" (left, H2)
- Notification bell icon (right): Ionicons "notifications-outline" with badge showing unread count

**Search Bar:**
- Placeholder: "Search services..."
- Search icon on left: Ionicons "search-outline"
- On tap → Navigate to Search Screen (Services)

**Top Tabs:**
- Services (Active - blue underline)
- Businesses (Inactive - gray)

**Categories Section:**
- Title: "Categories" (H3)
- Horizontal scrollable list
- Each category card:
  - Icon/Image from category iconUrl (square, 60x60)
  - Name below (Small, centered)
  - White background, border, rounded corners
  - On tap → Navigate to Category Services Screen

**All Services Section:**
- Title: "All Services" (H3)
- Vertical scrollable list
- Each service card:
  - Service icon (left, 40x40) - Use MaterialCommunityIcons based on service
  - Service name (H3)
  - Category name (Small, gray-500)
  - Base price: "From XX,XXX XAF" (Body, gray-700)
  - Right arrow icon: Ionicons "chevron-forward"
  - White background, card style
  - On tap → Navigate to Find Pros Screen

**Bottom Tab Icons:**
- Home: Ionicons "home" (active) / "home-outline" (inactive)
- Bookings: Ionicons "calendar" (active) / "calendar-outline" (inactive)
- Notifications: Ionicons "notifications" (active) / "notifications-outline" (inactive)
- Profile: Ionicons "person" (active) / "person-outline" (inactive)

**API Calls:**
- `GET /api/services/categories` (on mount)
- `GET /api/services/categories/:categoryId/services` (to get all services across categories)

---

#### 2.2 Home Screen - Businesses Tab

**Layout:**
```
┌─────────────────────────────────────┐
│  OneMarket         [bell](3)        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [search] Search businesses..│   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────      │
│  Services  |  Businesses            │
│           ────────────              │
│                                     │
│  Categories                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ →│
│  │  All   │ │ Rest.. │ │ Shop.. │  │
│  └────────┘ └────────┘ └────────┘  │
│                                     │
│  Businesses                         │
│  ┌─────────────────────────────┐   │
│  │ [IMG]  Le Petit Bistro      │   │
│  │        Restaurant & Cafe    │   │
│  │   [location] Centre-ville   │   │
│  │        [circle] Open        │   │
│  │                [chevron-right]  │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [IMG]  Salon Beauté         │   │
│  │        Salon & Spa          │   │
│  │   [location] Akanda         │   │
│  │        [circle] Closed      │   │
│  │                [chevron-right]  │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [home]  [calendar]  [bell] [person]│
└─────────────────────────────────────┘
```

**Header:**
- Same as Services tab

**Search Bar:**
- Placeholder: "Search businesses..."
- Icon: Ionicons "search-outline"
- On tap → Navigate to Search Screen (Businesses)

**Top Tabs:**
- Services (Inactive - gray)
- Businesses (Active - blue underline)

**Category Pills:**
- Horizontal scrollable
- Pills: "All" + category names
- "All" selected by default (blue background)
- Other pills: white background, blue border
- On tap → Filter businesses by category

**Categories:**
1. All (shows all businesses)
2. Restaurant & Cafe
3. Shop & Retail
4. Salon & Spa
5. Pharmacy
6. Hotel & Lodging

**Businesses List:**
- Title: "Businesses" (H3)
- Vertical scrollable list
- Each business card:
  - Logo (left, 60x60, rounded)
  - Business name (H3)
  - Category name (Small, gray-500)
  - Zone name with location icon: Ionicons "location-outline"
  - Status badge:
    - "Open" with green circle: Ionicons "ellipse" (green)
    - "Closed" with red circle: Ionicons "ellipse" (red)
  - Right arrow icon: Ionicons "chevron-forward"
  - White background, card style
  - On tap → Navigate to Business Details Screen

**API Calls:**
- `GET /api/businesses/categories` (on mount)
- `GET /api/businesses` (default - all businesses)
- `GET /api/businesses?categoryId=xxx` (when category selected)

---

### 3. Service Provider Flow

#### 3.1 Category Services Screen

**Navigation:** Home (Services Tab) → Tap Category

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Home Repair           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [search] Search in Home...  │   │
│  └─────────────────────────────┘   │
│                                     │
│  6 Services Available               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [hammer]  Plumbing          │   │
│  │     Fix leaks, pipes, etc.  │   │
│  │     From 15,000 XAF         │   │
│  │                 [chevron-right] │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [flash]  Electrical Work    │   │
│  │     Wiring, outlets, etc.   │   │
│  │     From 20,000 XAF         │   │
│  │                 [chevron-right] │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Header: Category name with back button (Ionicons "arrow-back")
- Search bar with icon: Ionicons "search-outline"
- Service count: "X Services Available"
- Services list:
  - Icon (left, 40x40) - MaterialCommunityIcons based on service type
  - Service name (H3)
  - Description (Small, gray-500)
  - Base price (Body)
  - Right arrow: Ionicons "chevron-forward"
  - On tap → Navigate to Find Pros Screen

**API Call:**
- `GET /api/services/categories/:categoryId/services`

---

#### 3.2 Find Pros Screen

**Navigation:** Category Services → Tap Service

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Plumbing              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [search] Search pros...     │   │
│  └─────────────────────────────┘   │
│                                     │
│  15 Pros Found                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [avatar]  Jean Pierre       │   │
│  │  [checkmark] Verified       │   │
│  │  [star] 4.8 (45 reviews)    │   │
│  │  18,000 XAF                 │   │
│  │  [location] Centre-ville    │   │
│  │  [ellipse] Online           │   │
│  │                 [chevron-right] │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [avatar]  Marie Dubois      │   │
│  │  [checkmark] Verified       │   │
│  │  [star] 4.6 (32 reviews)    │   │
│  │  20,000 XAF                 │   │
│  │  [location] Akanda          │   │
│  │  [ellipse] Offline          │   │
│  │                 [chevron-right] │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Header:**
- Service name with back button: Ionicons "arrow-back"

**Search Bar:**
- Placeholder: "Search pros..."
- Icon: Ionicons "search-outline"
- Local filter (client-side)

**Pros List:**
- Count: "X Pros Found"
- Each pro card:
  - Avatar (left, 60x60, rounded-full)
  - Verification badge: Ionicons "checkmark-circle" (blue) if verified
  - Name (H3)
  - Rating icon: Ionicons "star" (amber) + review count
  - Custom price (Body, bold)
  - Location icon: Ionicons "location-outline" + Zone name
  - Online status:
    - Online: Ionicons "ellipse" (green) + "Online"
    - Offline: Ionicons "ellipse" (gray) + "Offline"
  - Right arrow: Ionicons "chevron-forward"
  - White background, card style
  - On tap → Navigate to Pro Profile Screen

**API Call:**
- `GET /api/pros/search?serviceId=xxx`

---

#### 3.3 Pro Profile Screen

**Navigation:** Find Pros → Tap Pro

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Pro Profile           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [large-avatar]         │   │
│  │   Jean Pierre [checkmark]   │   │
│  │   [star] 4.8 (45 reviews)   │   │
│  │   Member since Jan 2024     │   │
│  └─────────────────────────────┘   │
│                                     │
│  About                              │
│  Professional plumber with 10 years │
│  experience...                      │
│                                     │
│  Services Offered                   │
│  ┌─────────────────────────────┐   │
│  │ Plumbing        18,000 XAF  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Service Areas                      │
│  [location] Centre-ville, Quartier  │
│                                     │
│  Stats                              │
│  [checkmark] 120 Jobs Completed     │
│  [time] Response time: < 1 hour     │
│                                     │
│  Recent Reviews (3)                 │
│  ┌─────────────────────────────┐   │
│  │ [star-5x] Marie D.          │   │
│  │ "Excellent work!"           │   │
│  │ Nov 20, 2025                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Book Now               │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Profile Header:**
- Large avatar (centered, 100x100)
- Name + verification badge: Ionicons "checkmark-circle" (blue)
- Rating icon: Ionicons "star" (amber) + review count
- Member since date
- Background: light blue gradient

**About Section:**
- Bio text (gray-700)

**Services Offered:**
- List of services with custom prices
- Each service: name (left) + price (right)

**Service Areas:**
- Icon: Ionicons "location-outline"
- Zone + Sub-zone names

**Stats:**
- Completed jobs icon: Ionicons "checkmark-done-outline" (green)
- Response time icon: Ionicons "time-outline" (blue)

**Recent Reviews:**
- Show 3 most recent reviews
- Each review: 5x Ionicons "star" (amber), name, comment, date
- Link: "See all reviews" → Navigate to All Reviews Screen

**Book Now Button:**
- Fixed at bottom (sticky)
- Primary blue, full width
- On tap → Navigate to Create Booking Screen

**API Call:**
- `GET /api/pros/:proId`

---

#### 3.4 Create Booking Screen

**Navigation:** Pro Profile → Tap "Book Now"

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Book Service          │
│                                     │
│  Booking Details                    │
│                                     │
│  Pro: Jean Pierre                   │
│  Service: Plumbing                  │
│  Price: 18,000 XAF                  │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  Your Address                       │
│  ┌─────────────────────────────┐   │
│  │ [home] Home      [checkmark]│   │
│  │ 123 Main Street             │   │
│  │                [chevron-down]   │
│  └─────────────────────────────┘   │
│                                     │
│  [add] Add New Address              │
│                                     │
│  Note for Pro (Optional)            │
│  ┌─────────────────────────────┐   │
│  │ Any specific instructions   │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Confirm Booking           │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back button: Ionicons "arrow-back"
- Booking summary (pro, service, price)
- Address selector:
  - Address icon: Ionicons "home-outline" (or "business-outline" for work)
  - Default address marked with: Ionicons "checkmark-circle" (green)
  - Dropdown chevron: Ionicons "chevron-down"
  - On tap → Show address picker modal
- Link: "+ Add New Address"
  - Icon: Ionicons "add-circle-outline" (blue)
- Note input: multiline text area (optional)
- Button: "Confirm Booking" (Primary blue, full width)

**Validation:**
- Address is required
- Note is optional

**API Call:**
- `POST /api/bookings`
- Body: `{ proId: "xxx", serviceId: "xxx", userAddressId: "xxx", userNote: "..." }`

**Success:**
- Show success modal with icon: Ionicons "checkmark-circle" (green)
- Navigate to Booking Details Screen (the newly created booking)

---

### 4. Business Directory Flow

#### 4.1 Business Details Screen

**Navigation:** Home (Businesses Tab) → Tap Business

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Le Petit Bistro       │
│                                     │
│  [COVER IMAGE]                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [LOGO]  Le Petit Bistro     │   │
│  │         Restaurant & Cafe   │   │
│  │    [ellipse] Open           │   │
│  └─────────────────────────────┘   │
│                                     │
│  French cuisine in the heart of     │
│  Libreville. Perfect for romantic   │
│  dinners...                         │
│                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │[call]  │ │[map]   │ │[globe] │  │
│  │ Call   │ │  Map   │ │  Web   │  │
│  └────────┘ └────────┘ └────────┘  │
│                                     │
│  Location                           │
│  [location] 123 Main St, Centre-v   │
│             Quartier Louis          │
│                                     │
│  Contact                            │
│  [call] +241 077 123 456            │
│  [mail] contact@bistro.ga           │
│                                     │
│  Hours                              │
│  [time] 11:00 - 22:00 (Today)       │
│                                     │
│  Mon - Thu    11:00 - 22:00         │
│  Fri - Sat    11:00 - 23:00         │
│  Sunday       Closed                │
│                                     │
│  Photos                             │
│  ┌────┐ ┌────┐ ┌────┐ →            │
│  │[1] │ │[2] │ │[3] │              │
│  └────┘ └────┘ └────┘              │
│                                     │
└─────────────────────────────────────┘
```

**Header:**
- Back button: Ionicons "arrow-back"
- Cover image (full width, 200px height)

**Business Card:**
- Logo (left, 80x80)
- Name (H2)
- Category name (Body, gray-500)
- Status badge with circle:
  - Open: Ionicons "ellipse" (green)
  - Closed: Ionicons "ellipse" (red)

**Description:**
- Full description text

**Action Buttons (3 columns):**
- Call button: Ionicons "call-outline" → Open phone dialer
- Map button: Ionicons "map-outline" → Open Google Maps with coordinates
- Website button: Ionicons "globe-outline" → Open browser (if website exists)

**Location Section:**
- Icon: Ionicons "location-outline"
- Address, Zone and sub-zone

**Contact Section:**
- Phone icon: Ionicons "call-outline"
- Email icon: Ionicons "mail-outline" (if exists)

**Hours Section:**
- Icon: Ionicons "time-outline"
- Today's hours highlighted
- Full week schedule
- "Closed" shown for closed days

**Photos Section:**
- Horizontal scrollable gallery
- Each image: 120x120, rounded
- On tap → Full screen image viewer

**API Call:**
- `GET /api/businesses/:id`

---

### 5. Bookings Screen

**Navigation:** Bottom Tab → Bookings

**Layout:**
```
┌─────────────────────────────────────┐
│  My Bookings                        │
│                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │  All   │ │ Active │ │ Past   │  │
│  └────────┘ └────────┘ └────────┘  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [avatar] Jean Pierre        │   │
│  │    Plumbing                 │   │
│  │    BK-20251128-ABC123       │   │
│  │    [badge] Quotation Sent   │   │
│  │    25,000 XAF               │   │
│  │    Nov 28, 2025             │   │
│  │                [chevron-right]  │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [avatar] Marie Dubois       │   │
│  │    House Cleaning           │   │
│  │    BK-20251127-XYZ789       │   │
│  │    [badge] Completed        │   │
│  │    Nov 27, 2025             │   │
│  │                [chevron-right]  │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [home]  [calendar]  [bell] [person]│
└─────────────────────────────────────┘
```

**Header:**
- Title: "My Bookings" (H2)

**Filter Pills:**
- All (default - all bookings)
- Active (pending, accepted, quotation_sent, paid, on_the_way, job_started)
- Past (completed, cancelled, rejected)

**Bookings List:**
- Each booking card:
  - Pro avatar + name
  - Service name
  - Booking number (small, gray)
  - Status badge with colored dot:
    - Yellow dot: Ionicons "ellipse" (amber) - Pending, Quotation Sent
    - Blue dot: Ionicons "ellipse" (blue) - Accepted, Paid
    - Green dot: Ionicons "ellipse" (green) - On the way, Job Started, Completed
    - Red dot: Ionicons "ellipse" (red) - Cancelled, Rejected
  - Amount (if quotation sent)
  - Date (createdAt)
  - Right arrow: Ionicons "chevron-forward"
  - On tap → Navigate to Booking Details Screen

**Empty State:**
- Icon: Ionicons "calendar-outline" (large, gray)
- If no bookings: "No bookings yet" with icon

**API Call:**
- `GET /api/bookings` (default - all)
- `GET /api/bookings?status=pending,accepted,...` (for Active filter)
- `GET /api/bookings?status=completed,cancelled,rejected` (for Past filter)

---

### 6. Booking Details Screen

**Navigation:** Bookings → Tap Booking

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Booking Details       │
│                                     │
│  BK-20251128-ABC123                 │
│  [badge] Quotation Sent             │
│                                     │
│  Progress Stepper:                  │
│  [circle-filled] Created            │
│  [circle-filled] Accepted           │
│  [circle-filled] Quotation Sent     │
│  [circle-outline] Payment           │
│  [circle-outline] Service           │
│                                     │
│  Service Provider                   │
│  ┌─────────────────────────────┐   │
│  │ [avatar] Jean Pierre        │   │
│  │ [checkmark] Verified        │   │
│  │ [star] 4.8 (45 reviews)     │   │
│  │ [call] +241 077 123 456     │   │
│  │                [chevron-right]  │
│  └─────────────────────────────┘   │
│                                     │
│  Service Details                    │
│  Service: Plumbing                  │
│  Category: Home Repair              │
│  Quotation: 25,000 XAF              │
│                                     │
│  Your Address                       │
│  [home] Home                        │
│  123 Main Street                    │
│  Centre-ville, Quartier Louis       │
│                                     │
│  Your Note                          │
│  "Please come in the morning..."    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Pay Now                │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │      Cancel Booking         │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  [chatbubble] Chat with Pro │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Header:**
- Back button: Ionicons "arrow-back"
- Booking number
- Status badge with colored dot

**Progress Tracker:**
- Visual stepper showing current status
- Filled circles: Ionicons "checkmark-circle" (blue) for completed steps
- Outlined circles: Ionicons "ellipse-outline" (gray) for pending steps
- Steps: Created → Accepted → Quotation → Payment → Service

**Service Provider Card:**
- Avatar + name
- Verification: Ionicons "checkmark-circle" (blue)
- Rating: Ionicons "star" (amber) + reviews
- Phone icon: Ionicons "call-outline" (tap to call)
- Right arrow: Ionicons "chevron-forward"
- Clickable → Navigate to Pro Profile

**Service Details:**
- Service name, category
- Quotation amount (if sent)

**Address:**
- Icon: Ionicons "home-outline"
- Full address shown after payment
- Partial address before payment

**Note:**
- User's note to pro

**Action Buttons (Conditional based on status):**

**If status = quotation_sent:**
- "Pay Now" button (primary blue) with icon: Ionicons "card-outline"
- "Cancel Booking" button (outline red) with icon: Ionicons "close-circle-outline"
- "Chat with Pro" button (outline blue) with icon: Ionicons "chatbubble-outline"

**If status = paid:**
- "Track Order" button with icon: Ionicons "navigate-outline"
- "Chat with Pro" button with icon: Ionicons "chatbubble-outline"

**If status = job_started:**
- "Confirm Completion" button with icon: Ionicons "checkmark-circle-outline"

**If status = completed:**
- "Leave Review" button with icon: Ionicons "star-outline"
- "Book Again" button with icon: Ionicons "repeat-outline"

**API Call:**
- `GET /api/bookings/:id`

---

### 7. Payment Screen

**Navigation:** Booking Details → Tap "Pay Now"

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Payment               │
│                                     │
│  Payment Summary                    │
│                                     │
│  Service Amount      25,000 XAF     │
│  ─────────────────────────────      │
│  Total              25,000 XAF      │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  Payment Method                     │
│  [phone] Mobile Money               │
│                                     │
│  Phone Number                       │
│  ┌─────────────────────────────┐   │
│  │ [call] +241 074 123 456     │   │
│  └─────────────────────────────┘   │
│  This number will receive payment   │
│  prompt                             │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [card] Pay 25,000 XAF       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back button: Ionicons "arrow-back"
- Payment summary (amount breakdown)
- Payment method icon: Ionicons "phone-portrait-outline"
- Phone number input icon: Ionicons "call-outline"
- Info text: "You will receive a payment prompt on this number"
- Button: "Pay XX,XXX XAF" (primary blue) with icon: Ionicons "card-outline"

**Flow:**
1. User taps "Pay XX,XXX XAF"
2. API call: `POST /api/bookings/:id/pay`
3. Show loading modal with spinner
4. If success: Show modal "Payment request sent to your phone"
5. Navigate to Payment Status Screen

**API Call:**
- `POST /api/bookings/:id/pay`
- Body: `{ phone: "074123456" }` (optional, uses user's phone if not provided)

---

### 8. Payment Status Screen

**Navigation:** Auto-navigate after payment initiation

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Payment Status        │
│                                     │
│                                     │
│         [loading-spinner]           │
│                                     │
│    Waiting for payment              │
│                                     │
│  Please check your phone and approve│
│  the payment request from PawaPay   │
│                                     │
│                                     │
│  Payment Amount: 25,000 XAF         │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [checkmark] I've Completed  │   │
│  │             Payment         │   │
│  └─────────────────────────────┘   │
│                                     │
│    [close] Cancel Payment           │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back button: Ionicons "arrow-back"
- Loading spinner: ActivityIndicator or custom spinner
- Instructions text
- Amount display
- Button: "I've Completed Payment" with icon: Ionicons "checkmark-circle-outline"
- Link: "Cancel Payment" with icon: Ionicons "close-circle-outline"

**Behavior:**
- Poll payment status every 3 seconds
- API call: `GET /api/bookings/:id/payment-status`

**Success (status = COMPLETED):**
- Show success modal with icon: Ionicons "checkmark-circle" (green)
- Navigate back to Booking Details (booking status now = "paid")

**Failed (status = FAILED):**
- Show error modal with icon: Ionicons "close-circle" (red)
- Display reason
- Option to retry or go back

---

### 9. Chat Screen

**Navigation:** Booking Details → Tap "Chat with Pro"

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Jean Pierre  [more]   │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Hello, what time can you    │   │
│  │ come?                       │   │
│  │                   10:30 AM  │   │
│  └─────────────────────────────┘   │
│                                     │
│          ┌──────────────────────┐  │
│          │ I can come at 2 PM   │  │
│          │          10:35 AM    │  │
│          └──────────────────────┘  │
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [Type a message...]   [send-arrow] │
└─────────────────────────────────────┘
```

**Header:**
- Back button: Ionicons "arrow-back"
- Pro name
- More options menu icon: Ionicons "ellipsis-vertical" (future: block, report)

**Messages:**
- User messages: Left-aligned, white background
- Pro messages: Right-aligned, blue background
- Timestamp below each message
- Scroll to bottom on new message

**Input:**
- Text input field with placeholder: "Type a message..."
- Send button icon: Ionicons "send" (blue, disabled if empty)

**Real-time:**
- Use Socket.io for real-time messages
- Join booking room on mount
- Listen for "new-message" event
- Emit "send-message" event

**API Calls:**
- `GET /api/bookings/:id/messages` (on mount)
- Socket events: "join-booking", "send-message", "new-message"

---

### 10. Notifications Screen

**Navigation:** Bottom Tab → Notifications

**Layout:**
```
┌─────────────────────────────────────┐
│  Notifications         Mark all read│
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [ellipse-blue] Booking      │   │
│  │    Accepted                 │   │
│  │    Jean Pierre has accepted │   │
│  │    your booking             │   │
│  │    2 hours ago              │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Payment Successful          │   │
│  │ Your payment of 25,000 XAF  │   │
│  │ has been confirmed          │   │
│  │ 1 day ago                   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Job Completed               │   │
│  │ Jean Pierre has marked the  │   │
│  │ job as complete             │   │
│  │ 2 days ago                  │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [home]  [calendar]  [bell] [person]│
└─────────────────────────────────────┘
```

**Header:**
- Title: "Notifications"
- Link: "Mark all read" (right)

**Notifications List:**
- Each notification card:
  - Unread indicator: Ionicons "ellipse" (blue, left)
  - Read: No indicator
  - Icon based on type:
    - booking_accepted: Ionicons "checkmark-circle" (green)
    - quotation_sent: Ionicons "document-text-outline" (blue)
    - payment_confirmed: Ionicons "card-outline" (green)
    - job_completed: Ionicons "checkmark-done-circle" (green)
  - Title (bold if unread)
  - Message
  - Time ago icon: Ionicons "time-outline"
  - On tap:
    - Mark as read
    - Navigate to related screen (e.g., booking details if bookingId exists)

**Empty State:**
- Icon: Ionicons "notifications-outline" (large, gray)
- "No notifications yet"

**API Calls:**
- `GET /api/notifications` (on mount)
- `PATCH /api/notifications/:id/read` (on tap)
- `PATCH /api/notifications/read-all` (on "Mark all read")

---

### 11. Profile Screen

**Navigation:** Bottom Tab → Profile

**Layout:**
```
┌─────────────────────────────────────┐
│  Profile                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [large-avatar]         │   │
│  │      John Doe               │   │
│  │   +241 074 123 456          │   │
│  │   [Edit Profile]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Account                            │
│  ┌─────────────────────────────┐   │
│  │ [person] My Profile  [chevron] │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [location] My Addresses [chevron]│
│  └─────────────────────────────┘   │
│                                     │
│  Preferences                        │
│  ┌─────────────────────────────┐   │
│  │ [bell] Notifications [chevron]  │
│  └─────────────────────────────┘   │
│                                     │
│  Support                            │
│  ┌─────────────────────────────┐   │
│  │ [help-circle] Help & Support    │
│  │                      [chevron]  │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [information] About [chevron]   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [log-out] Logout           │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [home]  [calendar]  [bell] [person]│
└─────────────────────────────────────┘
```

**Profile Header:**
- Avatar (100x100, centered)
- Name
- Phone number
- "Edit Profile" button

**Menu Items (all with right chevron: Ionicons "chevron-forward"):**

**Account:**
- My Profile → Icon: Ionicons "person-outline"
- My Addresses → Icon: Ionicons "location-outline"

**Preferences:**
- Notifications → Icon: Ionicons "notifications-outline"

**Support:**
- Help & Support → Icon: Ionicons "help-circle-outline"
- About → Icon: Ionicons "information-circle-outline"

**Logout Button:**
- Red outline button
- Icon: Ionicons "log-out-outline" (red)
- On tap → Confirm dialog → Clear AsyncStorage → Navigate to Welcome

**API Call:**
- `GET /api/users/me` (on mount)

---

### 12. Edit Profile Screen

**Navigation:** Profile → My Profile

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Edit Profile          │
│                                     │
│         [large-avatar]              │
│    [camera] Change Photo            │
│                                     │
│  First Name                         │
│  ┌─────────────────────────────┐   │
│  │ [person] John               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Last Name                          │
│  ┌─────────────────────────────┐   │
│  │ [person] Doe                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Phone Number                       │
│  ┌─────────────────────────────┐   │
│  │ [call] +241 074 123 456     │   │
│  └─────────────────────────────┘   │
│  (Cannot be changed)                │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [checkmark] Save Changes    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back button: Ionicons "arrow-back"
- Avatar with "Change Photo" link
  - Camera icon: Ionicons "camera-outline"
  - On tap → Image picker (camera or gallery)
- First name input with icon: Ionicons "person-outline"
- Last name input with icon: Ionicons "person-outline"
- Phone number (read-only, grayed out) with icon: Ionicons "call-outline"
- Button: "Save Changes" with icon: Ionicons "checkmark-circle-outline"

**API Call:**
- `PATCH /api/users/me`
- FormData with firstName, lastName, avatar (if changed)

---

### 13. Address List Screen

**Navigation:** Profile → My Addresses

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] My Addresses          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [home] Home    [checkmark]  │   │
│  │     123 Main Street         │   │
│  │     Centre-ville            │   │
│  │     [create][trash]         │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [business] Work             │   │
│  │     456 Business Ave        │   │
│  │     Akanda                  │   │
│  │     [create][trash]         │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [add] Add New Address       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back button: Ionicons "arrow-back"
- Address cards:
  - Label icon:
    - Home: Ionicons "home-outline"
    - Work: Ionicons "business-outline"
    - Other: Ionicons "location-outline"
  - Default badge: Ionicons "checkmark-circle" (green)
  - Address line
  - Zone name
  - Edit button icon: Ionicons "create-outline" (blue)
  - Delete button icon: Ionicons "trash-outline" (red)
- Button: "+ Add New Address" with icon: Ionicons "add-circle-outline"

**API Call:**
- `GET /api/users/me/addresses`
- `DELETE /api/users/me/addresses/:id` (on delete)
- `PATCH /api/users/me/addresses/:id/default` (on set default)

---

### 14. Add/Edit Address Screen

**Navigation:** Address List → Add/Edit

**Layout:**
```
┌─────────────────────────────────────┐
│  [arrow-back] Add Address           │
│                                     │
│  Label                              │
│  ┌─────────────────────────────┐   │
│  │ [home] Home                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  Address                            │
│  ┌─────────────────────────────┐   │
│  │ [location] 123 Main Street  │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Zone                               │
│  ┌─────────────────────────────┐   │
│  │ Select Zone    [chevron-down]   │
│  └─────────────────────────────┘   │
│                                     │
│  Sub-Zone                           │
│  ┌─────────────────────────────┐   │
│  │ Select Sub-Zone [chevron-down]  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌───────────────────────────┐     │
│  │ [checkbox] Set as default │     │
│  │            address        │     │
│  └───────────────────────────┘     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [checkmark] Save Address    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back button: Ionicons "arrow-back"
- Label input with icon: Ionicons "home-outline"
- Address input (multiline) with icon: Ionicons "location-outline"
- Zone dropdown with chevron: Ionicons "chevron-down"
- Sub-zone dropdown with chevron: Ionicons "chevron-down"
- Checkbox: "Set as default address"
  - Unchecked: Ionicons "square-outline"
  - Checked: Ionicons "checkbox-outline" (blue)
- Button: "Save Address" with icon: Ionicons "checkmark-circle-outline"

**API Calls:**
- `GET /api/zones/all` (on mount - for dropdowns)
- `POST /api/users/me/addresses` (add)
- `PATCH /api/users/me/addresses/:id` (edit)

---

## User Flows

### Flow 1: Complete Registration & First Booking

1. Open app → Splash screen (auto-check token)
2. No token → Welcome screen
3. Tap "Get Started" → Phone Input screen
4. Enter phone → Tap "Send OTP"
5. Receive OTP → Enter code → Tap "Verify"
6. New user → Signup screen → Enter name → Tap "Create Account"
7. Store token → Navigate to Home
8. Browse Services tab → Tap category → Tap service
9. View pros list → Tap pro → View profile
10. Tap "Book Now" → Create Booking screen
11. Realize no address → Tap "Add New Address"
12. Fill address form → Save
13. Back to Create Booking → Select address → Enter note → Confirm
14. Success → Navigate to Booking Details

### Flow 2: Payment & Service Completion

1. Navigate to Bookings tab
2. See booking with "Quotation Sent" status
3. Tap booking → View details
4. Tap "Pay Now" → Payment screen
5. Confirm phone → Tap "Pay XX,XXX XAF"
6. Payment Status screen → Poll status
7. Complete payment on phone
8. Status updates → Success modal → Back to Booking Details
9. Status now "Paid" → Pro can see full address
10. Pro arrives → Changes status to "On the way"
11. Notification received → View booking
12. Pro requests start → Tap "Confirm Start"
13. Job in progress...
14. Pro requests complete → Tap "Confirm Complete"
15. Status "Completed" → Option to leave review

### Flow 3: Browse & View Business

1. Home screen → Tap "Businesses" tab
2. See category pills → Tap "Restaurant & Cafe"
3. View filtered businesses
4. Tap business card → Business Details screen
5. View info, hours, photos
6. Tap "Call" → Opens phone dialer
7. Tap "Map" → Opens Google Maps
8. Tap "Website" → Opens browser

---

## Component Library

### Buttons

#### Primary Button
- Background: blue-600
- Text: white, Poppins, 16px, semibold
- Padding: 16px vertical, full width
- Border radius: 12px
- Disabled: bg-gray-300, text-gray-500
- Optional left icon with 8px margin

#### Secondary Button (Outline)
- Background: white
- Border: 2px blue-600
- Text: blue-600, Poppins, 16px, semibold
- Other specs same as primary
- Optional left icon with 8px margin

#### Danger Button (Outline)
- Same as secondary but red-500 color
- Optional left icon with 8px margin

### Cards

#### Standard Card
- Background: white
- Border: 1px gray-200
- Border radius: 12px
- Padding: 16px
- Shadow: sm (subtle)

#### Pro Card
- Includes avatar, name, rating, price, location, status
- Tappable with subtle press feedback
- Icons: star, location, ellipse for status

#### Business Card
- Includes logo, name, category, zone, status
- Tappable
- Icons: location, ellipse for status

#### Booking Card
- Includes pro info, service, status badge, date
- Tappable
- Icons: ellipse for status indicator

### Input Fields

#### Text Input
- Border: 1px gray-300
- Border radius: 8px
- Padding: 12px
- Font: Poppins 14px
- Focus: blue-600 border
- Error: red-500 border
- Optional left icon with 8px margin

#### Multiline Input
- Same as text input
- Min height: 100px

#### Dropdown/Select
- Same as text input
- Chevron-down icon on right: Ionicons "chevron-down"

### Badges

#### Status Badge
- Padding: 6px 12px
- Border radius: full (pill shape)
- Font: 12px, semibold
- Left icon: Ionicons "ellipse" (colored dot)
- Colors based on status:
  - Pending: yellow-100 bg, yellow-800 text, amber dot
  - Accepted: blue-100 bg, blue-800 text, blue dot
  - Completed: green-100 bg, green-800 text, green dot
  - Cancelled: red-100 bg, red-800 text, red dot

### Icons

**Package:** react-native-vector-icons

**Icon Families:**
- Ionicons (primary)
- Feather (secondary)
- MaterialCommunityIcons (specific cases)

**Sizes:**
- Small: 20px
- Medium: 24px
- Large: 32px
- XL: 48px (for empty states)

**Common Icons:**
- Navigation: arrow-back, chevron-forward, chevron-down
- Actions: add-circle, checkmark-circle, close-circle, trash, create
- Status: ellipse (colored dots), checkmark-circle, time
- UI: home, person, notifications, calendar, search
- Contact: call, mail, location, chatbubble
- Services: hammer, flash, construct (MaterialCommunityIcons for specific services)

---

## API Integration Points

### Authentication Context
- Create `AuthContext` to manage user state and token
- Provide to entire app via Provider
- Methods: login (store token), logout (clear storage), checkAuth

### API Service
- Create `api.js` utility for all API calls
- Base URL: `https://onemarket-backend.onrender.com`
- Automatically add Authorization header if token exists
- Handle 401 errors (logout user)
- Handle network errors

### Socket Service
- Create `socket.js` for Socket.io connection
- Connect on login, disconnect on logout
- Provide hook `useSocket()` for components to use

### Data Fetching
- Use React Query or SWR for caching (optional, can start with useState + useEffect)
- Handle loading, error, and success states

### AsyncStorage
- Store: token, user object
- Clear on logout

---

## Additional Notes

### Loading States
- Show skeleton loaders for lists (pros, businesses, bookings)
- Show spinner for API calls (centered with overlay)

### Error Handling
- Show toast messages for errors
- Use react-native-toast-message or similar
- Error icon: Feather "alert-circle" or Ionicons "close-circle"

### Empty States
- Show friendly empty state UI with icon and message
- Large icon (48px, gray) from Ionicons
- Example: "No bookings yet. Start exploring services!"

### Refresh
- Implement pull-to-refresh on all list screens
- Use RefreshControl component

### Keyboard
- Dismiss keyboard on scroll
- KeyboardAvoidingView for forms

### Image Handling
- Use expo-image-picker for profile and address photos
- Placeholder images for missing avatars/logos
- Avatar placeholder: Ionicons "person-circle-outline"

---

## Implementation Priority

### Phase 1: Authentication (Week 1)
- Splash, Welcome, Phone Input, OTP, Signup screens
- Auth context and token management
- Install and configure react-native-vector-icons

### Phase 2: Home & Services (Week 2)
- Home screen with top tabs
- Services tab (categories, services, pros)
- Pro profile
- Business tab (categories, businesses, details)

### Phase 3: Booking Flow (Week 3)
- Create booking
- Address management (list, add, edit, delete)
- Booking list
- Booking details

### Phase 4: Payment & Chat (Week 4)
- Payment flow
- Payment status
- Chat screen with Socket.io

### Phase 5: Profile & Polish (Week 5)
- Profile screen
- Edit profile
- Notifications
- Final polish, testing, bug fixes

---

**END OF DOCUMENT**
