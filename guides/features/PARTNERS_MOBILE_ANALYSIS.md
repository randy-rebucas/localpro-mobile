# Partners Features Analysis for Mobile App

## Executive Summary

This document provides a comprehensive analysis of the Partners features as documented in `PARTNERS_FEATURES.md` and their implementation requirements for the mobile app. The Partners feature enables third-party companies and applications to integrate with the LocalPro Super App platform through a structured onboarding process, API credentials management, and partner lifecycle management.

---

## 1. Feature Overview

### Core Capabilities
The Partners feature enables:
- **Partner Onboarding** - Multi-step onboarding process (5 steps: basic_info, business_info, api_setup, verification, activation)
- **Partner Management** - Create, update, and manage partner accounts with lifecycle status management
- **API Integration** - Generate and manage API credentials (clientId, clientSecret, apiKey) for programmatic access
- **Slug-Based Access** - Unique slug generation for third-party login and partner identification
- **Business Information** - Store comprehensive company details, industry, address, and contact information
- **Verification & Compliance** - Document upload and verification workflow (business registration, tax ID, contracts)
- **Usage Tracking & Analytics** - Monitor API usage statistics, limits, and generate usage reports
- **Webhook Support** - Configure webhook URLs and receive real-time notifications
- **Admin Management** - Complete partner lifecycle management with notes and audit trails

---

## 2. Current Implementation Status

### ✅ Implemented
- **Package Structure**: Partners package exists at `packages/partners/`
- **Type Definitions**: Basic Partner and Partnership types defined in `packages/types/partners.ts` (needs expansion)
- **Service Stubs**: PartnersService class with basic method stubs (`getPartners`, `getPartner`, `getPartnerships`)
- **Tab Navigation**: Partners tabs configured in `_layout.tsx`
  - Browse Partners (`browse-partners.tsx`) - Partner browsing with category and type filters
  - My Partners (`my-partners.tsx`) - User partnerships list with status filters
  - Onboarding (`onboarding.tsx`) - Multi-step onboarding form (3 steps, needs expansion to 5)
  - Usage (`usage.tsx`) - Usage statistics dashboard with time period filters
- **Basic UI Components**: Card-based layouts, search bars, filter chips, status badges, progress indicators

### ❌ Not Implemented
- **API Integration**: All service methods return empty arrays or null
- **Onboarding Flow**: Current onboarding only has 3 steps, needs 5 steps (basic_info, business_info, api_setup, verification, activation)
- **Partner Detail Screen**: No partner detail view
- **API Credentials Management**: No screen to view/manage API credentials
- **Document Upload**: No document upload functionality for verification
- **Business Information Form**: No dedicated business info form (address, coordinates, industry)
- **API Setup Form**: No webhook/callback URL configuration screen
- **Verification Status**: No verification status display
- **Usage Analytics**: Usage screen exists but no real data integration
- **Admin Features**: No admin-specific screens for partner management
- **Slug Lookup**: No slug-based partner lookup functionality
- **Webhook Configuration**: No webhook management UI
- **Partner Status Management**: No status change workflow
- **Admin Notes**: No admin notes functionality
- **Onboarding Progress Tracking**: No progress persistence/resume capability

---

## 3. Required Mobile App Screens

### 3.1 Primary Screens

#### A. Browse Partners Screen (`browse-partners.tsx` - Enhanced)
**Current State**: Basic UI with category and type filters  
**Required Features**:
- Partner listing with pagination
- Search functionality (name, company, industry)
- Category filters (Technology, Marketing, Finance, Services, Other)
- Partnership type filters (sponsor, integration, affiliate, strategic)
- Status filters (active, inactive, pending)
- Partner card display:
  - Logo/placeholder
  - Company name
  - Industry/category
  - Partnership type badge
  - Status indicator
  - Description preview
  - Benefits list
- Pull-to-refresh
- Infinite scroll pagination
- Empty state with CTA
- Navigation to partner detail

**Key Components Needed**:
- PartnerCard component (enhanced)
- PartnershipTypeBadge component
- StatusBadge component
- BenefitsList component
- EmptyState component

#### B. My Partners Screen (`my-partners.tsx` - Enhanced)
**Current State**: Basic UI with status filters  
**Required Features**:
- User partnerships list
- Status filters (all, active, inactive, pending)
- Search functionality
- Partnership details:
  - Partner information
  - Partnership type
  - Status badge
  - Joined date
  - Usage count
- Quick actions:
  - View partner details
  - View API credentials (if applicable)
  - View usage statistics
- Pull-to-refresh
- Empty state with onboarding CTA
- Navigation to partner detail

**Key Components Needed**:
- PartnershipCard component (enhanced)
- UsageCountBadge component
- QuickActionsMenu component

#### C. Partner Onboarding Screen (`onboarding.tsx` - Enhanced)
**Current State**: 3-step form (Contact, Details, Review)  
**Required Features**: Expand to 5 steps matching API:
- **Step 1: Basic Information** (`basic_info`)
  - Partner name
  - Email address
  - Phone number
  - Progress: 20%
- **Step 2: Business Information** (`business_info`)
  - Company name
  - Website
  - Industry selection
  - Description
  - Business address:
    - Street address
    - City, State, ZIP
    - Country
    - Location picker for coordinates
  - Progress: 40%
- **Step 3: API Setup** (`api_setup`)
  - Webhook URL input
  - Callback URL input
  - URL validation
  - Progress: 60%
- **Step 4: Verification** (`verification`)
  - Document upload:
    - Business registration
    - Tax ID
    - Contract
    - Other documents
  - Document preview
  - Document removal
  - Upload progress
  - Progress: 80%
- **Step 5: Activation** (`activation`)
  - Review summary
  - Terms and conditions acceptance
  - Activation button
  - Progress: 100%
- Progress tracking (0-100%)
- Step navigation (next/back)
- Resume capability (save progress)
- Form validation
- Error handling
- Success screen with API credentials display

**Key Components Needed**:
- MultiStepForm component
- ProgressIndicator component
- AddressInput component
- LocationPicker component
- DocumentUpload component
- DocumentPreview component
- ReviewSummary component
- CredentialsDisplay component

#### D. Partner Detail Screen (New)
**Route**: `/(app)/partner/[id]` or `/(app)/partner/[slug]`  
**Required Features**:
- Partner header:
  - Logo
  - Company name
  - Status badge
  - Partnership type badge
- Business information:
  - Company details
  - Industry
  - Description
  - Website link
  - Address with map view
- Contact information:
  - Email
  - Phone number
- Onboarding status (if applicable):
  - Progress percentage
  - Current step
  - Completion status
- Verification status:
  - Email verified
  - Phone verified
  - Business verified
  - Document verification status
- API credentials (if active):
  - Client ID (masked)
  - API Key (masked)
  - Show/Hide credentials
  - Copy credentials
  - Regenerate credentials (admin only)
- Usage statistics:
  - Total requests
  - Monthly requests
  - Last request timestamp
  - API limits
- Webhook configuration:
  - Webhook URL
  - Callback URL
  - Test webhook button
- Admin section (admin only):
  - Status management
  - Add admin notes
  - View audit trail
- Actions:
  - Edit partner (admin)
  - View usage analytics
  - Manage credentials
  - Configure webhooks

**Key Components Needed**:
- PartnerHeader component
- BusinessInfoCard component
- VerificationStatusCard component
- CredentialsCard component (with security)
- UsageStatsCard component
- WebhookConfigCard component
- AdminActionsPanel component
- MapView component

#### E. API Credentials Screen (New)
**Route**: `/(app)/partner/[id]/credentials`  
**Required Features**:
- Credentials display:
  - Client ID (with copy button)
  - Client Secret (hidden by default, show on demand)
  - API Key (with copy button)
  - Security warnings
- Credential generation date
- Last used timestamp
- Regenerate credentials:
  - Warning dialog
  - Confirmation
  - New credentials display
- Security best practices:
  - Never expose clientSecret
  - Store securely
  - Rotate regularly
- Usage limits display:
  - Monthly limit
  - Burst limit
  - Current usage
- Test API connection button
- Documentation link

**Key Components Needed**:
- CredentialsDisplay component (secure)
- CopyButton component
- RegenerateDialog component
- SecurityTips component
- UsageLimitsCard component

#### F. Usage Statistics Screen (`usage.tsx` - Enhanced)
**Current State**: Basic UI with mock data  
**Required Features**:
- Time period filters (today, week, month, year, all time)
- Overview metrics:
  - Total usage (requests)
  - Active partners
  - API calls
  - Data transferred
  - Percentage changes
- Usage trends chart:
  - Line/bar chart
  - Time series data
  - Period comparison
- Partner usage list:
  - Partner name
  - Usage count
  - Last used timestamp
  - Usage percentage of limit
- Usage by endpoint (if available)
- Usage alerts:
  - Approaching limit warnings
  - Limit exceeded notifications
- Export usage report
- Filter by partner
- Filter by date range

**Key Components Needed**:
- UsageMetricsCard component
- UsageChart component (react-native-chart-kit or similar)
- PartnerUsageList component
- UsageAlerts component
- ExportButton component

### 3.2 Secondary Screens

#### G. Business Information Form (New)
**Route**: `/(app)/partner/onboarding/business-info`  
**Required Features**:
- Company name input
- Website URL input with validation
- Industry selection (dropdown or chips)
- Description textarea
- Address form:
  - Street address
  - City
  - State/Province
  - ZIP/Postal code
  - Country
  - Location picker for coordinates
- Map preview
- Form validation
- Save draft
- Continue to next step

#### H. API Setup Form (New)
**Route**: `/(app)/partner/onboarding/api-setup`  
**Required Features**:
- Webhook URL input:
  - URL validation
  - HTTPS requirement
  - Test webhook button
- Callback URL input:
  - URL validation
  - OAuth callback format
- URL format examples
- Help text
- Save draft
- Continue to next step

#### I. Verification Documents Screen (New)
**Route**: `/(app)/partner/onboarding/verification`  
**Required Features**:
- Document type selection:
  - Business registration
  - Tax ID
  - Contract
  - Other
- Document upload:
  - File picker (PDF, images)
  - Multiple files per type
  - Upload progress
  - File size validation
- Document preview:
  - Thumbnail
  - File name
  - File size
  - Upload date
  - Remove button
- Document status:
  - Pending verification
  - Verified
  - Rejected (with reason)
- Upload guidelines
- Save draft
- Continue to next step

#### J. Admin Partner Management Screen (New - Admin Only)
**Route**: `/(app)/admin/partners`  
**Required Features**:
- Partner list with filters:
  - Status filter
  - Onboarding completion filter
  - Industry filter
  - Search
- Partner actions:
  - View details
  - Edit partner
  - Change status
  - Add notes
  - Delete partner (soft delete)
- Bulk actions
- Partner creation (admin)
- Export partners list
- Statistics dashboard

#### K. Admin Partner Detail Screen (New - Admin Only)
**Route**: `/(app)/admin/partner/[id]`  
**Required Features**:
- All features from Partner Detail Screen
- Additional admin features:
  - Status management dropdown
  - Admin notes section:
    - Add note
    - Notes list
    - Notes history
  - Audit trail:
    - Action history
    - User who performed action
    - Timestamp
  - Partner assignment (assign to admin user)
  - Soft delete option
  - Restore deleted partner

---

## 4. Feature Breakdown by Category

### 4.1 Partner Onboarding
**Priority**: High  
**Status**: Partially Implemented  
**Required Work**:
- Expand onboarding from 3 to 5 steps
- Implement step 2: Business Information with address and coordinates
- Implement step 3: API Setup with webhook/callback URLs
- Implement step 4: Verification with document upload
- Implement step 5: Activation with credentials generation
- Add progress tracking (0-100%)
- Add resume capability
- Add onboarding history tracking
- API Integration:
  - `POST /api/partners/onboarding/start`
  - `PUT /api/partners/:id/business-info`
  - `PUT /api/partners/:id/api-setup`
  - `PUT /api/partners/:id/verification`
  - `PUT /api/partners/:id/activate`

### 4.2 Partner Management
**Priority**: High  
**Status**: Not Implemented  
**Required Work**:
- Partner detail screen
- Partner list with pagination
- Partner search and filters
- Partner status management
- Partner updates
- Soft delete functionality
- API Integration:
  - `GET /api/partners`
  - `GET /api/partners/:id`
  - `PUT /api/partners/:id`
  - `DELETE /api/partners/:id`
  - `GET /api/partners/slug/:slug`

### 4.3 API Credentials Management
**Priority**: High  
**Status**: Not Implemented  
**Required Work**:
- Credentials display screen
- Secure credential storage
- Credential masking/unmasking
- Copy to clipboard
- Regenerate credentials
- Credential security warnings
- API Integration:
  - Credentials are returned in activation response
  - Regenerate endpoint (if available)

### 4.4 Verification & Compliance
**Priority**: Medium  
**Status**: Not Implemented  
**Required Work**:
- Document upload UI
- Document preview
- Verification status display
- Document management (view, remove)
- Verification workflow
- API Integration:
  - Document upload in verification step
  - Verification status in partner response

### 4.5 Usage Tracking & Analytics
**Priority**: Medium  
**Status**: Partially Implemented  
**Required Work**:
- Real usage data integration
- Usage charts and visualizations
- Usage alerts
- Usage reports
- Filter by partner
- Filter by time period
- API Integration:
  - Usage data in partner response
  - Usage reports endpoint (if available)

### 4.6 Webhook Configuration
**Priority**: Low  
**Status**: Not Implemented  
**Required Work**:
- Webhook URL configuration
- Callback URL configuration
- Webhook test functionality
- Webhook event history
- Webhook security information
- API Integration:
  - Webhook config in API setup step
  - Webhook test endpoint (if available)

### 4.7 Admin Features
**Priority**: Low (Admin Only)  
**Status**: Not Implemented  
**Required Work**:
- Admin partner list
- Admin partner detail
- Status management
- Admin notes
- Audit trail
- Partner assignment
- Bulk actions
- API Integration:
  - `POST /api/partners/:id/notes`
  - Admin endpoints require admin role

---

## 5. API Integration Requirements

### 5.1 Onboarding Endpoints

#### Start Onboarding
```typescript
POST /api/partners/onboarding/start
Body: {
  name: string;
  email: string;
  phoneNumber: string;
}
Response: {
  partner: Partner;
  onboarding: {
    currentStep: 'business_info';
    progress: 20;
  };
}
```

#### Update Business Information
```typescript
PUT /api/partners/:id/business-info
Body: {
  businessInfo: {
    companyName: string;
    website: string;
    industry: string;
    description: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
  };
}
Response: {
  partner: Partner;
  onboarding: {
    currentStep: 'api_setup';
    progress: 40;
  };
}
```

#### Configure API Settings
```typescript
PUT /api/partners/:id/api-setup
Body: {
  webhookUrl: string;
  callbackUrl: string;
}
Response: {
  partner: Partner;
  onboarding: {
    currentStep: 'verification';
    progress: 60;
  };
}
```

#### Submit Verification Documents
```typescript
PUT /api/partners/:id/verification
Body: {
  documents: Array<{
    type: 'business_registration' | 'tax_id' | 'contract' | 'other';
    name: string;
    url: string;
    publicId: string;
  }>;
}
Response: {
  partner: Partner;
  onboarding: {
    currentStep: 'activation';
    progress: 80;
  };
}
```

#### Activate Partner
```typescript
PUT /api/partners/:id/activate
Response: {
  partner: Partner;
  apiCredentials: {
    clientId: string;
    apiKey: string;
    // clientSecret never exposed
  };
  onboarding: {
    completed: true;
    progress: 100;
  };
}
```

### 5.2 Partner Management Endpoints

#### Get Partners List
```typescript
GET /api/partners?status=active&page=1&limit=20&search=tech
Response: {
  partners: Partner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

#### Get Partner by ID
```typescript
GET /api/partners/:id
Response: {
  partner: Partner;
}
```

#### Get Partner by Slug
```typescript
GET /api/partners/slug/:slug
Response: {
  partner: Partner;
}
```

#### Update Partner
```typescript
PUT /api/partners/:id
Body: Partial<Partner>
Response: {
  partner: Partner;
}
```

#### Delete Partner
```typescript
DELETE /api/partners/:id
Response: {
  success: boolean;
}
```

### 5.3 Admin Endpoints

#### Add Admin Note
```typescript
POST /api/partners/:id/notes
Body: {
  content: string;
}
Response: {
  partner: Partner;
}
```

### 5.4 Service Methods to Implement

```typescript
// packages/partners/services.ts

export class PartnersService {
  // Onboarding
  static async startOnboarding(data: StartOnboardingData): Promise<Partner>;
  static async updateBusinessInfo(id: string, data: BusinessInfoData): Promise<Partner>;
  static async configureApiSetup(id: string, data: ApiSetupData): Promise<Partner>;
  static async submitVerification(id: string, documents: Document[]): Promise<Partner>;
  static async activatePartner(id: string): Promise<Partner & { apiCredentials: ApiCredentials }>;
  
  // Partner Management
  static async getPartners(filters?: PartnerFilters): Promise<PaginatedResponse<Partner>>;
  static async getPartner(id: string): Promise<Partner | null>;
  static async getPartnerBySlug(slug: string): Promise<Partner | null>;
  static async updatePartner(id: string, data: Partial<Partner>): Promise<Partner>;
  static async deletePartner(id: string): Promise<void>;
  
  // Admin
  static async addAdminNote(id: string, content: string): Promise<Partner>;
  
  // Usage
  static async getPartnerUsage(id: string, period?: TimePeriod): Promise<UsageStats>;
}
```

---

## 6. Mobile UI/UX Recommendations

### 6.1 Design Patterns

#### Multi-Step Form Pattern
- **Progress Indicator**: Visual progress bar showing current step (1/5, 2/5, etc.)
- **Step Navigation**: Clear next/back buttons
- **Form Validation**: Real-time validation with error messages
- **Draft Saving**: Auto-save or manual save draft
- **Step Summary**: Review screen before final submission

#### Card-Based Layout
- **Partner Cards**: Consistent card design with logo, name, type, status
- **Information Hierarchy**: Important info (name, status) prominent
- **Action Buttons**: Clear CTAs (View, Manage, etc.)

#### Status Indicators
- **Color Coding**: 
  - Active: Green
  - Pending: Yellow/Orange
  - Inactive: Gray
  - Suspended: Red
  - Rejected: Red
- **Badge Design**: Rounded badges with icons

#### Credential Security
- **Masking**: Show masked credentials by default (****-****-****)
- **Show/Hide Toggle**: Eye icon to reveal/hide
- **Copy Button**: One-tap copy with confirmation
- **Security Warnings**: Prominent warnings about credential security

### 6.2 Navigation Flow

```
Browse Partners
  └─> Partner Detail
       ├─> API Credentials
       ├─> Usage Statistics
       └─> Edit Partner (admin)

My Partners
  └─> Partner Detail
       ├─> API Credentials
       └─> Usage Statistics

Onboarding
  ├─> Step 1: Basic Info
  ├─> Step 2: Business Info
  │    └─> Location Picker
  ├─> Step 3: API Setup
  ├─> Step 4: Verification
  │    └─> Document Upload
  └─> Step 5: Activation
       └─> Credentials Display

Usage Statistics
  └─> Partner Usage Detail
```

### 6.3 Empty States

- **No Partners**: "No partners found. Start onboarding to add a partner."
- **No Usage Data**: "Usage statistics will appear here once partners start using your services."
- **No Documents**: "Upload verification documents to complete onboarding."

### 6.4 Loading States

- **Skeleton Loading**: For partner lists
- **Progress Indicators**: For multi-step forms
- **Upload Progress**: For document uploads
- **Loading Overlays**: For API calls

### 6.5 Error Handling

- **Validation Errors**: Inline error messages
- **Network Errors**: Retry buttons
- **API Errors**: User-friendly error messages
- **Upload Errors**: Clear error messages with retry

---

## 7. Implementation Priority

### Phase 1: Core Onboarding (High Priority)
1. Expand onboarding to 5 steps
2. Implement business information form with address
3. Implement API setup form
4. Implement document upload
5. Implement activation with credentials display
6. API integration for all onboarding steps

### Phase 2: Partner Management (High Priority)
1. Partner detail screen
2. Enhanced browse partners with API integration
3. Enhanced my partners with API integration
4. Partner search and filters
5. API integration for partner CRUD

### Phase 3: Credentials & Usage (Medium Priority)
1. API credentials screen
2. Secure credential display
3. Usage statistics with real data
4. Usage charts and visualizations
5. API integration for usage data

### Phase 4: Verification & Documents (Medium Priority)
1. Document upload component
2. Document preview
3. Verification status display
4. Document management

### Phase 5: Admin Features (Low Priority)
1. Admin partner management screen
2. Admin partner detail screen
3. Status management
4. Admin notes
5. Audit trail

---

## 8. Technical Considerations

### 8.1 State Management
- **React Query**: For API data fetching and caching
- **Context API**: For onboarding form state (multi-step)
- **Local Storage**: For draft saving
- **Form State**: React Hook Form for form management

### 8.2 Document Upload
- **File Picker**: `expo-document-picker` for document selection
- **Image Picker**: `expo-image-picker` for image documents
- **File Upload**: Upload to Cloudinary or backend
- **Progress Tracking**: Track upload progress
- **File Validation**: Size, type validation

### 8.3 Location Services
- **Location Picker**: `expo-location` for coordinates
- **Map Integration**: React Native Maps for address selection
- **Geocoding**: Convert address to coordinates
- **Reverse Geocoding**: Convert coordinates to address

### 8.4 Security
- **Credential Masking**: Never display full credentials
- **Secure Storage**: Use secure storage for credentials (if storing locally)
- **HTTPS Only**: Enforce HTTPS for webhook URLs
- **Input Validation**: Validate all inputs
- **XSS Prevention**: Sanitize user inputs

### 8.5 API Authentication
- **JWT Tokens**: For admin endpoints
- **API Keys**: For partner API access (not in mobile app)
- **Role-Based Access**: Admin vs regular user

### 8.6 Data Models

#### Partner Type (Enhanced)
```typescript
interface Partner {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phoneNumber: string;
  businessInfo?: {
    companyName: string;
    website: string;
    industry: string;
    description: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
  };
  apiCredentials?: {
    clientId: string;
    apiKey: string;
    webhookUrl?: string;
    callbackUrl?: string;
  };
  status: 'pending' | 'active' | 'suspended' | 'inactive' | 'rejected';
  onboarding: {
    completed: boolean;
    currentStep: 'basic_info' | 'business_info' | 'api_setup' | 'verification' | 'activation';
    progress: number; // 0-100
    startedAt: Date;
    completedAt?: Date;
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    businessVerified: boolean;
    documents: Array<{
      _id: string;
      type: 'business_registration' | 'tax_id' | 'contract' | 'other';
      name: string;
      url: string;
      publicId: string;
      uploadedAt: Date;
      verified: boolean;
      verifiedAt?: Date;
      verifiedBy?: string;
    }>;
  };
  usage: {
    totalRequests: number;
    monthlyRequests: number;
    lastRequestAt?: Date;
    apiLimits: {
      monthlyLimit: number;
      burstLimit: number;
    };
  };
  notes?: Array<{
    _id: string;
    content: string;
    addedBy: string;
    addedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### 8.7 Performance Optimization
- **Pagination**: Implement pagination for partner lists
- **Lazy Loading**: Load partner details on demand
- **Image Optimization**: Optimize partner logos
- **Caching**: Cache partner data with React Query
- **Debouncing**: Debounce search inputs

---

## 9. Testing Requirements

### 9.1 Unit Tests
- Form validation logic
- Status badge color logic
- Progress calculation
- Credential masking logic
- Date formatting utilities

### 9.2 Integration Tests
- Onboarding flow (all 5 steps)
- Partner list with filters
- Partner detail navigation
- API credential display
- Document upload flow

### 9.3 E2E Tests
- Complete onboarding process
- Partner search and filter
- View partner details
- View API credentials
- Usage statistics display

---

## 10. Accessibility Considerations

### 10.1 Screen Reader Support
- **Labels**: All form inputs have proper labels
- **Status Announcements**: Announce status changes
- **Progress Announcements**: Announce progress updates
- **Error Messages**: Clear error announcements

### 10.2 Keyboard Navigation
- **Tab Order**: Logical tab order in forms
- **Focus Management**: Proper focus management in multi-step forms
- **Shortcuts**: Keyboard shortcuts where applicable

### 10.3 Visual Accessibility
- **Color Contrast**: Sufficient contrast for status badges
- **Text Size**: Scalable text sizes
- **Icons**: Icons with text labels
- **Touch Targets**: Minimum 44x44pt touch targets

### 10.4 Content Accessibility
- **Alt Text**: Partner logos have alt text
- **ARIA Labels**: Proper ARIA labels for interactive elements
- **Semantic HTML**: Use semantic components

---

## 11. Data Models Alignment

### 11.1 Type Definitions Update Needed

The current `packages/types/partners.ts` needs to be expanded to match the full Partner model from the API:

```typescript
// Current (simplified)
export interface Partner {
  id: string;
  name: string;
  // ... basic fields
}

// Needed (full model)
export interface Partner {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phoneNumber: string;
  businessInfo?: BusinessInfo;
  apiCredentials?: ApiCredentials;
  status: PartnerStatus;
  onboarding: OnboardingInfo;
  verification: VerificationInfo;
  usage: UsageInfo;
  notes?: AdminNote[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 11.2 New Types Needed

```typescript
interface BusinessInfo {
  companyName: string;
  website: string;
  industry: string;
  description: string;
  address: Address;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface ApiCredentials {
  clientId: string;
  apiKey: string;
  webhookUrl?: string;
  callbackUrl?: string;
}

interface OnboardingInfo {
  completed: boolean;
  currentStep: OnboardingStep;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
}

type OnboardingStep = 'basic_info' | 'business_info' | 'api_setup' | 'verification' | 'activation';

interface VerificationInfo {
  emailVerified: boolean;
  phoneVerified: boolean;
  businessVerified: boolean;
  documents: VerificationDocument[];
}

interface VerificationDocument {
  _id: string;
  type: DocumentType;
  name: string;
  url: string;
  publicId: string;
  uploadedAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}

type DocumentType = 'business_registration' | 'tax_id' | 'contract' | 'other';

interface UsageInfo {
  totalRequests: number;
  monthlyRequests: number;
  lastRequestAt?: Date;
  apiLimits: {
    monthlyLimit: number;
    burstLimit: number;
  };
}

interface AdminNote {
  _id: string;
  content: string;
  addedBy: string;
  addedAt: Date;
}

type PartnerStatus = 'pending' | 'active' | 'suspended' | 'inactive' | 'rejected';
```

---

## 12. Next Steps

1. **Update Type Definitions**: Expand `packages/types/partners.ts` with full Partner model
2. **Implement Service Methods**: Complete all methods in `packages/partners/services.ts`
3. **Expand Onboarding Flow**: Update `onboarding.tsx` to 5 steps
4. **Create Partner Detail Screen**: New screen for partner details
5. **Create API Credentials Screen**: Secure credential display
6. **Implement Document Upload**: Add document upload functionality
7. **Enhance Usage Screen**: Integrate real usage data
8. **Add Location Picker**: For business address selection
9. **Implement Admin Features**: Admin-specific screens (if needed)
10. **Testing**: Write unit, integration, and E2E tests

---

*This analysis document should be updated as implementation progresses and new requirements are identified.*

