# Referrals Features Analysis for Mobile App

## Executive Summary

This document provides a comprehensive analysis of the Referrals features as documented in `REFERRALS_FEATURES.md` and their implementation requirements for the mobile app. The Referrals feature enables users to refer others to the LocalPro Super App platform and earn rewards for successful referrals.

---

## 1. Feature Overview

### Core Capabilities
The Referrals feature enables:
- **Referral Code Management** - Generate, validate, and share unique referral codes
- **Referral Tracking** - Track clicks, conversions, and performance analytics
- **Multiple Referral Types** - Support for signup, booking, purchase, enrollment, loan, rental, and subscription referrals
- **Reward Management** - Multiple reward types (credit, discount, cash, points, subscription days)
- **Invitation System** - Send invitations via email, SMS, and social media
- **Leaderboard** - Public leaderboard for top referrers
- **Analytics & Reporting** - Comprehensive statistics and performance metrics
- **User Preferences** - Configurable sharing and notification preferences

---

## 2. Current Implementation Status

### ✅ Implemented
- **Package Structure**: Referrals package exists at `packages/referrals/`
- **Type Definitions**: Basic `Referral` and `ReferralProgram` interfaces defined
- **Service Stubs**: ReferralsService class with method stubs:
  - `getReferralCode()` - Returns empty string
  - `getReferrals()` - Returns empty array
  - `getPrograms()` - Returns empty array
- **Tab Navigation**: Referrals tabs configured in `_layout.tsx`:
  - Refer (`refer.tsx`) - Main referral screen with code display and sharing
  - Stats (`stats.tsx`) - Statistics screen (package-aware, shows referrals stats when active)
  - Rewards (`rewards.tsx`) - Rewards management screen
  - Leaderboard (`leaderboard.tsx`) - Leaderboard display
- **UI Screens**: Basic UI implemented for all tabs with mock data

### ❌ Not Implemented
- **API Integration**: All service methods are stubs returning empty data
- **Referral Code Generation**: No actual code generation or retrieval
- **Referral Tracking**: No click tracking or conversion tracking
- **Referral List**: No real referral data display
- **Statistics**: Stats screen shows mock data, needs real API integration
- **Rewards Integration**: Rewards screen not connected to referral rewards
- **Leaderboard Data**: Leaderboard shows empty state, needs API integration
- **Sharing Functionality**: Share buttons exist but don't track referrals
- **QR Code Generation**: No QR code generation for referral links
- **Invitation System**: No email/SMS invitation sending
- **Referral Preferences**: No settings/preferences management
- **Referral Detail View**: No detailed referral information screen
- **Reward History**: No detailed reward tracking per referral
- **Analytics Charts**: Stats screen has placeholder for charts

---

## 3. Required Mobile App Screens

### 3.1 Primary Screens

#### A. Refer & Earn Screen (`refer.tsx` - Enhanced)
**Current State**: Good UI foundation, needs API integration  
**Required Features**:
- Display user's unique referral code
- Copy referral code to clipboard
- Generate and display referral link
- Share options:
  - Native share (Share API)
  - WhatsApp
  - SMS
  - Email
  - Social media (Facebook, Twitter, etc.)
- QR code generation and display
- Quick stats overview (total referrals, completed, pending, rewards)
- Recent referrals list
- "How It Works" section
- Referral link with UTM parameters
- Custom message support for sharing

**Key Components Needed**:
- ReferralCodeCard component
- ShareButtonGroup component
- QRCodeDisplay component
- QuickStatsCard component
- ReferralListItem component
- HowItWorksSection component

**API Integration Required**:
- `GET /api/referrals/me` - Get user's referrals
- `GET /api/referrals/links` - Get referral links and QR code
- `GET /api/referrals/stats` - Get referral statistics

#### B. Referral Statistics Screen (`stats.tsx` - Enhanced)
**Current State**: Package-aware stats screen, needs referral-specific data  
**Required Features**:
- Time period filters (today, week, month, year, all time)
- Overview statistics:
  - Total referrals
  - Completed referrals
  - Pending referrals
  - Expired referrals
  - Total rewards earned
  - Pending rewards
  - Conversion rate
  - Average reward per referral
- Detailed statistics by referral type:
  - Signup referrals
  - Service booking referrals
  - Supplies purchase referrals
  - Course enrollment referrals
  - Loan application referrals
  - Rental booking referrals
  - Subscription upgrade referrals
- Trend charts:
  - Referrals over time (line chart)
  - Conversion rate trend
  - Rewards over time
  - Referral type distribution (pie chart)
- Source performance:
  - Performance by source (email, SMS, social media, direct link, QR code, app share)
  - Click-through rates by source
- Export statistics option

**Key Components Needed**:
- TimePeriodFilter component
- StatCard component
- StatRow component
- LineChart component (for trends)
- PieChart component (for distribution)
- SourcePerformanceList component
- ExportButton component

**API Integration Required**:
- `GET /api/referrals/stats?timeRange={period}` - Get statistics

#### C. Rewards Screen (`rewards.tsx` - Enhanced)
**Current State**: Generic rewards screen, needs referral-specific integration  
**Required Features**:
- Filter by status (all, available, claimed, pending, expired)
- Total rewards summary:
  - Total rewards earned
  - Available rewards
  - Claimed rewards
  - Pending rewards
- Reward list with details:
  - Reward type (credit, discount, cash, points, subscription days)
  - Reward amount
  - Source referral
  - Status
  - Created date
  - Claimed date (if applicable)
  - Expiration date (if applicable)
- Reward detail view:
  - Full reward information
  - Associated referral details
  - Reward distribution (referrer and referee rewards)
  - Transaction ID (if processed)
- Claim reward functionality
- Reward history with pagination
- Filter by reward type
- Search rewards

**Key Components Needed**:
- RewardCard component (enhanced)
- RewardDetailModal component
- RewardFilterSheet component
- RewardTypeBadge component
- ClaimRewardButton component
- RewardHistoryList component

**API Integration Required**:
- `GET /api/referrals/rewards?page={page}&limit={limit}&status={status}` - Get rewards
- `POST /api/referrals/rewards/{id}/claim` - Claim reward (if needed)

#### D. Leaderboard Screen (`leaderboard.tsx` - Enhanced)
**Current State**: Good UI, needs API integration  
**Required Features**:
- Time period filters (all time, month, week)
- User's current rank display
- Top 3 podium display with special styling
- Full leaderboard list:
  - Rank number
  - User avatar and name
  - Total referrals count
  - Completed referrals count
  - Total rewards earned
  - Score/points
- Pagination for leaderboard
- Highlight current user's entry
- Rank badges for top positions (trophy, medals)
- Pull-to-refresh
- Share rank functionality

**Key Components Needed**:
- UserRankCard component
- PodiumDisplay component
- LeaderboardItem component
- RankBadge component
- TimePeriodFilter component

**API Integration Required**:
- `GET /api/referrals/leaderboard?limit={limit}&timeRange={period}` - Get leaderboard

### 3.2 Secondary Screens

#### E. Referral Detail Screen (New)
**Route**: `/(app)/referrals/[id]`  
**Required Features**:
- Referral information:
  - Referral code
  - Status (pending, completed, expired, cancelled)
  - Referral type
  - Created date
  - Completion date (if applicable)
  - Expiration date
- Referee information:
  - Name and avatar
  - Signup date
  - First action date
  - Completion date
- Reward information:
  - Referrer reward details
  - Referee reward details
  - Reward status
  - Transaction ID (if processed)
- Timeline:
  - Referred at
  - Signup at
  - First action at
  - Completed at
  - Rewarded at
- Tracking information:
  - Source (email, SMS, social media, etc.)
  - Campaign information
  - UTM parameters
  - Click count
- Actions:
  - View referee profile (if applicable)
  - Share referral
  - Contact support

**Key Components Needed**:
- ReferralDetailHeader component
- ReferralTimeline component
- RewardBreakdown component
- TrackingInfoCard component
- ActionButtons component

**API Integration Required**:
- `GET /api/referrals/[id]` - Get referral details

#### F. Referral Preferences Screen (New)
**Route**: `/(app)/referrals/preferences`  
**Required Features**:
- Auto-share settings toggle
- Social media sharing preferences:
  - Enable/disable Facebook sharing
  - Enable/disable Twitter sharing
  - Enable/disable WhatsApp sharing
- Notification preferences:
  - Email notifications toggle
  - SMS notifications toggle
  - Push notifications toggle
- Privacy settings:
  - Referral visibility settings
  - Leaderboard visibility toggle
- Default sharing message customization
- Save preferences

**Key Components Needed**:
- PreferenceToggle component
- NotificationSettingsSection component
- PrivacySettingsSection component
- CustomMessageInput component

**API Integration Required**:
- `GET /api/referrals/preferences` - Get preferences
- `PUT /api/referrals/preferences` - Update preferences

#### G. Invite Friends Screen (New)
**Route**: `/(app)/referrals/invite`  
**Required Features**:
- Invitation method selection:
  - Email
  - SMS
  - Bulk invitation
- Contact selection:
  - Email input (single or multiple)
  - Phone number input (single or multiple)
  - Contact picker integration
- Custom message input
- Preview invitation
- Send invitation
- Invitation history:
  - Sent invitations list
  - Delivery status
  - Response status
- Resend invitation option

**Key Components Needed**:
- InvitationMethodSelector component
- ContactInput component
- ContactPickerButton component
- MessageEditor component
- InvitationPreview component
- InvitationHistoryList component

**API Integration Required**:
- `POST /api/referrals/invite` - Send invitation
- `GET /api/referrals/invitations` - Get invitation history

---

## 4. Feature Breakdown

### 4.1 High Priority Features

#### Referral Code Management
- **Status**: UI exists, needs API integration
- **Screens**: `refer.tsx`
- **API Endpoints**:
  - `GET /api/referrals/links` - Get referral code and links
- **Implementation Notes**:
  - Generate unique 8-character alphanumeric code
  - Support code expiration (default 90 days)
  - Display QR code for easy sharing
  - Copy to clipboard functionality

#### Referral Sharing
- **Status**: Basic sharing exists, needs tracking
- **Screens**: `refer.tsx`
- **API Endpoints**:
  - `POST /api/referrals/track` - Track referral click
- **Implementation Notes**:
  - Track sharing source (email, SMS, social media, direct link, QR code, app share)
  - Include UTM parameters in links
  - Support custom messages
  - Native share API integration

#### Referral Statistics
- **Status**: UI exists, needs API integration
- **Screens**: `stats.tsx`
- **API Endpoints**:
  - `GET /api/referrals/stats?timeRange={period}`
- **Implementation Notes**:
  - Time range filtering
  - Multiple chart types (line, pie, bar)
  - Export functionality
  - Real-time updates

#### Referral List
- **Status**: UI exists, needs API integration
- **Screens**: `refer.tsx`
- **API Endpoints**:
  - `GET /api/referrals/me?timeRange={range}&page={page}&limit={limit}`
- **Implementation Notes**:
  - Pagination support
  - Status filtering
  - Search functionality
  - Pull-to-refresh

### 4.2 Medium Priority Features

#### Reward Management
- **Status**: Generic rewards screen exists, needs referral integration
- **Screens**: `rewards.tsx`
- **API Endpoints**:
  - `GET /api/referrals/rewards?page={page}&limit={limit}&status={status}`
- **Implementation Notes**:
  - Filter by reward type and status
  - Reward detail view
  - Claim functionality (if needed)
  - Transaction history

#### Leaderboard
- **Status**: UI exists, needs API integration
- **Screens**: `leaderboard.tsx`
- **API Endpoints**:
  - `GET /api/referrals/leaderboard?limit={limit}&timeRange={period}`
- **Implementation Notes**:
  - Time period filtering
  - Top 3 podium display
  - User rank highlighting
  - Pagination

#### Referral Detail View
- **Status**: Not implemented
- **Screens**: New screen needed
- **API Endpoints**:
  - `GET /api/referrals/[id]`
- **Implementation Notes**:
  - Comprehensive referral information
  - Timeline visualization
  - Reward breakdown
  - Tracking information

### 4.3 Lower Priority Features

#### Invitation System
- **Status**: Not implemented
- **Screens**: New screen needed
- **API Endpoints**:
  - `POST /api/referrals/invite`
  - `GET /api/referrals/invitations`
- **Implementation Notes**:
  - Email/SMS integration
  - Contact picker
  - Bulk invitations
  - Delivery tracking

#### Referral Preferences
- **Status**: Not implemented
- **Screens**: New screen needed
- **API Endpoints**:
  - `GET /api/referrals/preferences`
  - `PUT /api/referrals/preferences`
- **Implementation Notes**:
  - Auto-share settings
  - Notification preferences
  - Privacy settings
  - Custom message templates

#### QR Code Generation
- **Status**: Not implemented
- **Screens**: `refer.tsx` (enhancement)
- **API Endpoints**:
  - `GET /api/referrals/links` (includes QR code URL)
- **Implementation Notes**:
  - Generate QR code for referral link
  - Display QR code in refer screen
  - Download/share QR code

---

## 5. API Integration Requirements

### 5.1 Service Methods to Implement

```typescript
// packages/referrals/services.ts

export class ReferralsService {
  // Get user's referral code and links
  static async getReferralCode(userId: string): Promise<string> {
    // GET /api/referrals/links
    // Return referral code
  }

  // Get referral links with QR code
  static async getReferralLinks(userId: string): Promise<{
    referralCode: string;
    referralLink: string;
    qrCode: string;
    shareOptions: Record<string, string>;
  }> {
    // GET /api/referrals/links
  }

  // Get user's referrals
  static async getReferrals(
    userId: string,
    filters?: {
      timeRange?: number;
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<{
    stats: ReferralStats;
    referrals: Referral[];
    pagination: PaginationInfo;
  }> {
    // GET /api/referrals/me?timeRange={range}&page={page}&limit={limit}
  }

  // Get referral statistics
  static async getStats(
    userId: string,
    timeRange?: number
  ): Promise<ReferralStats> {
    // GET /api/referrals/stats?timeRange={period}
  }

  // Get referral rewards
  static async getRewards(
    userId: string,
    filters?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<{
    rewards: Reward[];
    pagination: PaginationInfo;
  }> {
    // GET /api/referrals/rewards?page={page}&limit={limit}&status={status}
  }

  // Get leaderboard
  static async getLeaderboard(
    filters?: {
      limit?: number;
      timeRange?: number;
    }
  ): Promise<LeaderboardEntry[]> {
    // GET /api/referrals/leaderboard?limit={limit}&timeRange={period}
  }

  // Get referral detail
  static async getReferral(id: string): Promise<Referral> {
    // GET /api/referrals/[id]
  }

  // Track referral click
  static async trackClick(
    code: string,
    source: string,
    trackingData?: {
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    // POST /api/referrals/track
  }

  // Validate referral code
  static async validateCode(code: string): Promise<{
    isValid: boolean;
    code: string;
    referrer?: UserInfo;
    expiresAt?: Date;
  }> {
    // POST /api/referrals/validate
  }

  // Send referral invitation
  static async sendInvitation(
    invitation: {
      emails?: string[];
      phoneNumbers?: string[];
      message?: string;
      method: 'email' | 'sms' | 'both';
    }
  ): Promise<{
    emailsSent: number;
    smsSent: number;
    referralCode: string;
    referralLink: string;
  }> {
    // POST /api/referrals/invite
  }

  // Get referral preferences
  static async getPreferences(userId: string): Promise<ReferralPreferences> {
    // GET /api/referrals/preferences
  }

  // Update referral preferences
  static async updatePreferences(
    userId: string,
    preferences: Partial<ReferralPreferences>
  ): Promise<ReferralPreferences> {
    // PUT /api/referrals/preferences
  }

  // Get invitation history
  static async getInvitations(
    userId: string,
    filters?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    invitations: Invitation[];
    pagination: PaginationInfo;
  }> {
    // GET /api/referrals/invitations?page={page}&limit={limit}
  }
}
```

### 5.2 Required Type Definitions

```typescript
// packages/types/referrals.ts (needs expansion)

export interface Referral {
  id: string;
  referrerId: string;
  refereeId?: string;
  code: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  referralType: 'signup' | 'service_booking' | 'supplies_purchase' | 
                'course_enrollment' | 'loan_application' | 'rental_booking' | 
                'subscription_upgrade';
  reward?: RewardInfo;
  rewardDistribution?: {
    referrerReward: RewardDetail;
    refereeReward?: RewardDetail;
  };
  timeline: {
    referredAt: Date;
    signupAt?: Date;
    firstActionAt?: Date;
    completedAt?: Date;
    rewardedAt?: Date;
    expiresAt: Date;
  };
  tracking: {
    source: string;
    campaign?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    clickCount: number;
  };
  referee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  expiredReferrals: number;
  totalRewards: number;
  pendingRewards: number;
  currency: string;
  conversionRate: number;
  averageReward: number;
  byType?: {
    type: string;
    count: number;
    completed: number;
    rewards: number;
  }[];
  bySource?: {
    source: string;
    count: number;
    completed: number;
    conversionRate: number;
  }[];
  trends?: {
    date: string;
    referrals: number;
    completed: number;
    rewards: number;
  }[];
}

export interface RewardInfo {
  type: 'credit' | 'discount' | 'cash' | 'points' | 'subscription_days';
  amount: number;
  currency: string;
  description?: string;
}

export interface RewardDetail {
  amount: number;
  currency: string;
  type: string;
  status: 'pending' | 'processed' | 'paid' | 'failed';
  processedAt?: Date;
  transactionId?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  totalReferrals: number;
  completedReferrals: number;
  totalRewards: number;
  currency: string;
  score?: number;
}

export interface ReferralPreferences {
  autoShare: boolean;
  shareOnSocial: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  leaderboardVisible: boolean;
  defaultMessage?: string;
}

export interface Invitation {
  id: string;
  method: 'email' | 'sms';
  recipient: string;
  message?: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
}

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  rewardAmount: number;
  rewardType: 'credit' | 'cash' | 'discount' | 'points' | 'subscription_days';
  isActive: boolean;
  referralTypes: string[];
}
```

---

## 6. Mobile UI/UX Recommendations

### 6.1 Design Patterns

#### Referral Code Display
- **Large, prominent code** - Easy to read and copy
- **Copy button** - One-tap copy with visual feedback
- **QR code** - Visual sharing option
- **Share buttons** - Quick access to sharing options

#### Statistics Display
- **Card-based layout** - Clear separation of metrics
- **Color coding** - Green for completed, yellow for pending, red for expired
- **Chart visualizations** - Line charts for trends, pie charts for distribution
- **Time period filters** - Easy switching between periods

#### Leaderboard
- **Podium for top 3** - Visual hierarchy
- **User highlighting** - Clear indication of user's position
- **Rank badges** - Trophy/medal icons for top positions
- **Smooth scrolling** - Pagination with infinite scroll

### 6.2 Navigation Flow

```
Refer Tab (Main)
  ├── Share Referral Code
  │   ├── Copy Code
  │   ├── Share via...
  │   └── View QR Code
  ├── View Statistics → Stats Tab
  ├── View Rewards → Rewards Tab
  ├── View Leaderboard → Leaderboard Tab
  └── Referral Detail → [id] Screen
      ├── View Referee Profile
      └── Share Referral

Stats Tab
  ├── Time Period Filter
  ├── Overview Stats
  ├── Detailed Stats by Type
  ├── Trend Charts
  └── Export Stats

Rewards Tab
  ├── Filter by Status
  ├── Reward List
  └── Reward Detail
      └── View Transaction

Leaderboard Tab
  ├── Time Period Filter
  ├── User Rank Card
  ├── Top 3 Podium
  └── Full Leaderboard
```

### 6.3 User Experience Enhancements

#### Onboarding
- **First-time user flow** - Explain referral program benefits
- **Tutorial overlay** - Show how to share referral code
- **Incentive messaging** - Highlight reward amounts

#### Engagement
- **Push notifications** - Notify when referral completes
- **Achievement badges** - Celebrate milestones
- **Progress indicators** - Show progress toward next reward tier
- **Social proof** - Display success stories

#### Sharing
- **Pre-filled messages** - Customizable default messages
- **One-tap sharing** - Quick share to popular platforms
- **Deep linking** - Direct links to app download
- **Referral tracking** - Track which sharing method works best

---

## 7. Implementation Priority

### Phase 1: Core Functionality (High Priority)
1. **API Integration for Referral Code**
   - Get referral code and links
   - Display in refer screen
   - Copy functionality

2. **Basic Referral Tracking**
   - Track referral clicks
   - Display referral list
   - Basic statistics

3. **Sharing Integration**
   - Native share API
   - Track sharing sources
   - UTM parameter support

### Phase 2: Statistics & Rewards (Medium Priority)
4. **Statistics Screen**
   - API integration
   - Time period filtering
   - Basic charts

5. **Rewards Integration**
   - Connect to referral rewards
   - Filter and display rewards
   - Reward detail view

6. **Leaderboard**
   - API integration
   - Top 3 podium
   - Full leaderboard list

### Phase 3: Enhanced Features (Lower Priority)
7. **Referral Detail View**
   - Comprehensive referral information
   - Timeline visualization
   - Reward breakdown

8. **QR Code Generation**
   - Generate and display QR codes
   - Share QR codes

9. **Invitation System**
   - Email/SMS invitations
   - Contact picker
   - Invitation history

10. **Preferences Management**
    - Settings screen
    - Notification preferences
    - Privacy settings

### Phase 4: Advanced Features (Future)
11. **Advanced Analytics**
    - Detailed charts
    - Export functionality
    - Trend analysis

12. **Gamification**
    - Achievement badges
    - Progress indicators
    - Milestone celebrations

---

## 8. Technical Considerations

### 8.1 State Management
- **React Query** - For API data fetching and caching
- **Context API** - For referral preferences and settings
- **Local Storage** - Cache referral code and stats

### 8.2 Performance Optimization
- **Pagination** - For referral list and leaderboard
- **Lazy Loading** - For charts and heavy components
- **Debouncing** - For search and filter inputs
- **Caching** - Cache referral stats and leaderboard data

### 8.3 Third-Party Integrations
- **QR Code Library** - `react-native-qrcode-svg` or similar
- **Chart Library** - `react-native-chart-kit` or `victory-native`
- **Share API** - React Native `Share` API
- **Contact Picker** - `react-native-contacts` (if needed)
- **Clipboard** - `@react-native-clipboard/clipboard`

### 8.4 Deep Linking
- **Referral Links** - Handle deep links with referral codes
- **UTM Tracking** - Parse and store UTM parameters
- **App Installation Tracking** - Track when users install via referral

### 8.5 Notifications
- **Push Notifications** - Notify on referral completion
- **Email Notifications** - Server-side email sending
- **SMS Notifications** - Server-side SMS sending (Twilio)

### 8.6 Security
- **Code Validation** - Validate referral codes before use
- **Fraud Prevention** - Detect and prevent fraudulent referrals
- **Rate Limiting** - Limit invitation sending
- **Privacy** - Respect user privacy preferences

---

## 9. Testing Requirements

### 9.1 Unit Tests
- Referral code generation and validation
- Statistics calculations
- Reward calculations
- Filtering and sorting logic

### 9.2 Integration Tests
- API integration for all endpoints
- Sharing functionality
- QR code generation
- Deep linking

### 9.3 E2E Tests
- Complete referral flow:
  - Generate code → Share → Track → Complete → Reward
- Statistics display
- Leaderboard functionality
- Rewards management

### 9.4 Performance Tests
- Large referral list rendering
- Chart rendering performance
- Leaderboard pagination
- Share functionality speed

---

## 10. Data Model Alignment

### Current Types vs. Required Types

**Current** (`packages/types/referrals.ts`):
```typescript
export interface Referral {
  id: string;
  referrerId: string;
  referredId?: string;
  code: string;
  status: 'pending' | 'completed' | 'expired';
  reward?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  rewardAmount: number;
  rewardType: 'credit' | 'cash' | 'discount';
  isActive: boolean;
}
```

**Required** (based on API documentation):
- Expanded `Referral` interface with:
  - `referralType` field
  - `rewardDistribution` object
  - `timeline` object
  - `tracking` object
  - `referee` object
- New interfaces:
  - `ReferralStats`
  - `RewardInfo` / `RewardDetail`
  - `LeaderboardEntry`
  - `ReferralPreferences`
  - `Invitation`

**Action Required**: Expand type definitions to match API response structure.

---

## 11. Integration Points

### 11.1 Related Features
- **Finance** - Reward payments and wallet credits
- **Auth** - User registration with referral codes
- **Marketplace** - Service booking referrals
- **Supplies** - Purchase referrals
- **Academy** - Course enrollment referrals
- **Rentals** - Rental booking referrals
- **Subscriptions** - Subscription upgrade referrals

### 11.2 External Services
- **Email Service** - For invitation emails
- **SMS Service (Twilio)** - For invitation SMS
- **Analytics** - For referral performance tracking
- **Payment Gateway** - For cash rewards (if applicable)

---

## 12. Next Steps

### Immediate Actions
1. ✅ Review and expand type definitions in `packages/types/referrals.ts`
2. ✅ Implement API service methods in `packages/referrals/services.ts`
3. ✅ Create React hooks for referrals data (`useReferrals`, `useReferralStats`, etc.)
4. ✅ Integrate API calls in existing screens (`refer.tsx`, `stats.tsx`, `rewards.tsx`, `leaderboard.tsx`)
5. ✅ Add referral detail screen
6. ✅ Implement QR code generation
7. ✅ Add sharing tracking
8. ✅ Create preferences screen
9. ✅ Implement invitation system
10. ✅ Add chart visualizations to stats screen

### Future Enhancements
- Advanced analytics dashboard
- Gamification features
- Social sharing enhancements
- Referral campaign management
- A/B testing for referral messaging

---

*This analysis document should be updated as implementation progresses and new requirements are identified.*

