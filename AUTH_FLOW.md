# Authentication Flow Documentation

## Overview

The LocalPro app implements a phone-based authentication flow with OTP verification and onboarding.

## Flow Structure

```
1. Phone Entry
   └─> Enter phone number
   
2. OTP Verification
   └─> Enter 6-digit code
   
3. Onboarding (if new user)
   └─> Complete profile
   
4. Main App
   └─> Tabs navigation (Home, Marketplace, Jobs, Profile)
```

## Implementation Details

### 1. Phone Entry Screen (`app/(auth)/phone.tsx`)

- User enters their phone number
- Validates phone number format
- Sends OTP via `AuthService.sendOTP()`
- Navigates to OTP screen with phone and sessionId

**Features:**
- Phone number validation
- Loading states
- Error handling

### 2. OTP Verification Screen (`app/(auth)/otp.tsx`)

- Displays 6-digit OTP input component
- Auto-focuses next input on digit entry
- Supports paste functionality
- Verifies OTP via `AuthService.verifyOTP()`
- Resend code functionality with 60-second timer
- Navigates to onboarding (if new user) or main app

**Features:**
- OTP input component with auto-focus
- Resend timer countdown
- Error handling
- Loading states

### 3. Onboarding Screen (`app/(auth)/onboarding.tsx`)

- Collects user profile information:
  - Full name (required)
  - Email (optional)
  - Profile photo (optional)
- Uses `expo-image-picker` for photo selection
- Completes onboarding via `AuthService.completeOnboarding()`
- Navigates to main app upon completion

**Features:**
- Image picker integration
- Form validation
- Avatar preview

### 4. Main App Navigation (`app/(app)/(tabs)/`)

- Tab-based navigation with 4 tabs:
  - **Home**: Dashboard
  - **Marketplace**: Services & Bookings
  - **Jobs**: Job Board
  - **Profile**: User profile and settings

**Features:**
- Tab navigation with icons
- Protected routes
- User context available throughout

## Authentication Context

The `AuthProvider` wraps the entire app and provides:

- `user`: Current user object
- `isAuthenticated`: Authentication status
- `isLoading`: Loading state
- `isOnboarding`: Whether user needs to complete onboarding
- `sendOTP(phone)`: Send OTP to phone number
- `verifyOTP(phone, code, sessionId)`: Verify OTP code
- `completeOnboarding(data)`: Complete user profile
- `logout()`: Sign out user

## Route Protection

The root layout (`app/_layout.tsx`) handles automatic routing:

1. **Loading State**: Shows loading screen while checking auth
2. **Unauthenticated**: Redirects to `/(auth)/phone`
3. **Authenticated + Onboarding**: Redirects to `/(auth)/onboarding`
4. **Authenticated + Onboarded**: Redirects to `/(app)/(tabs)`

## Mock Implementation

Currently, the authentication services use mock implementations for development:

- **OTP Verification**: Accepts any 6-digit code
- **New User Detection**: Code `123456` creates a new user
- **Token Storage**: Uses `localStorage` on web (should use `expo-secure-store` for native)

## Next Steps

1. **Backend Integration**: Replace mock services with actual API calls
2. **Secure Storage**: Use `expo-secure-store` for token storage on native
3. **Session Management**: Implement proper session handling
4. **Error Handling**: Add more comprehensive error messages
5. **Biometric Auth**: Add biometric authentication option
6. **Social Login**: Add social login options (Google, Apple, etc.)

## File Structure

```
apps/localpro/app/
├── _layout.tsx              # Root layout with AuthProvider
├── index.tsx                # Initial redirect screen
├── (auth)/
│   ├── _layout.tsx          # Auth stack layout
│   ├── phone.tsx            # Phone entry screen
│   ├── otp.tsx              # OTP verification screen
│   └── onboarding.tsx      # Onboarding screen
└── (app)/
    ├── _layout.tsx          # App stack layout
    └── (tabs)/
        ├── _layout.tsx       # Tabs layout
        ├── index.tsx        # Home tab
        ├── marketplace.tsx  # Marketplace tab
        ├── jobs.tsx         # Jobs tab
        └── profile.tsx      # Profile tab
```

## Testing the Flow

1. **New User Flow**:
   - Enter phone number
   - Enter OTP code `123456` (creates new user)
   - Complete onboarding
   - Access main app

2. **Existing User Flow**:
   - Enter phone number
   - Enter any other 6-digit OTP code
   - Direct access to main app

## Dependencies

- `@localpro/auth`: Authentication package
- `@localpro/ui`: UI components (Button, Input, OTPInput, Card, Loading)
- `@localpro/utils`: Utility functions (isValidPhone)
- `expo-image-picker`: For profile photo selection
- `expo-router`: Navigation

