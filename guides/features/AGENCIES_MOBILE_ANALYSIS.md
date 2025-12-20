# Agencies Features Analysis for Mobile App

## Executive Summary

This document provides a comprehensive analysis of the Agencies features as documented in `AGENCIES_FEATURES.md` and their implementation requirements for the mobile app. The Agencies feature provides comprehensive agency management functionality enabling businesses to create and manage agencies, onboard service providers, handle administrative tasks, and track performance analytics.

---

## 1. Feature Overview

### Core Capabilities
The Agencies feature enables:
- **Agency Management** - Create, update, and manage agency profiles with business information
- **Provider Management** - Onboard providers with commission rates and track performance
- **Administrative Controls** - Multi-level roles (owner, admin, manager, supervisor) with permissions
- **Service Area Management** - Define geographic coverage with coordinates and radius
- **Service Management** - Configure services and pricing across 20+ categories
- **Subscription Management** - Manage subscription plans (Basic, Professional, Enterprise)
- **Verification System** - Upload and manage business documents for verification
- **Analytics & Reporting** - Track performance metrics, revenue, and provider analytics
- **Agency Settings** - Configure auto-approval, verification requirements, and notifications
- **Agency Discovery** - Browse and search agencies by location and service type

---

## 2. Current Implementation Status

### ✅ Implemented
- **Package Structure**: Agencies package exists at `packages/agencies/`
- **Type Definitions**: Basic Agency and AgencyMember types defined (needs expansion)
- **Service Stubs**: AgenciesService class with basic method stubs
- **Tab Navigation**: Agencies tabs configured in `_layout.tsx`
  - Browse Agencies (`browse-agencies.tsx`) - Agency listing with search and filters
  - My Agencies (`my-agencies.tsx`) - User's agency memberships
  - Team (`team.tsx`) - Team members management
- **Browse Agencies Screen**: Agency listing with search, verified filter, agency cards
- **My Agencies Screen**: User agencies list with role badges, create/join buttons
- **Team Screen**: Team members list with role filters, search, add member button

### ❌ Not Implemented
- **API Integration**: All service methods return empty arrays or throw errors
- **Agency Detail Screen**: No agency detail view
- **Agency Creation**: No agency creation form
- **Provider Management**: No provider onboarding/management screens
- **Admin Management**: No admin management interface
- **Service Area Management**: No service area configuration
- **Service Configuration**: No service setup interface
- **Logo Upload**: No logo upload functionality
- **Document Upload**: No verification document upload
- **Analytics Dashboard**: No analytics display
- **Agency Settings**: No settings screen
- **Provider Performance**: No provider performance tracking UI
- **Commission Management**: No commission rate configuration
- **Subscription Management**: No subscription plan selection/management

---

## 3. Required Mobile App Screens

### 3.1 Primary Screens

#### A. Browse Agencies Screen (`browse-agencies.tsx` - Enhanced)
**Current State**: Good UI, needs API integration and more filters  
**Required Features**:
- Agency listing with pagination
- Search functionality (name, description, location)
- Advanced filters:
  - Location (city, state)
  - Service type (category filter)
  - Industry filter
  - Verified status (already implemented)
- Sort options (newest, rating, member count)
- Agency cards with:
  - Logo
  - Name, description
  - Location
  - Verified badge
  - Rating
  - Member count
  - Service categories
- Pull-to-refresh
- Infinite scroll
- Empty state

**Key Components Needed**:
- AgencyCard component (enhanced)
- LocationFilter component
- ServiceTypeFilter component
- IndustryFilter component
- SortDropdown component
- VerifiedBadge component

#### B. Agency Detail Screen (New)
**Route**: `/(app)/agency/[id]`  
**Required Features**:
- Agency header with logo
- Agency name, description
- Business information:
  - Business type
  - Registration number
  - License number
  - Insurance information
- Contact information (email, phone, website, address)
- Service areas (map view or list)
- Services offered (categories and subcategories)
- Provider list (if accessible)
- Analytics summary (if owner/admin)
- Verification status
- Subscription plan display
- Join agency button (if not member)
- Manage agency button (if owner/admin)
- Share functionality

**Key Components Needed**:
- AgencyHeader component
- BusinessInfoCard component
- ContactInfoCard component
- ServiceAreasMap component
- ServicesList component
- ProviderListPreview component
- AnalyticsSummaryCard component
- VerificationStatusBadge component
- JoinAgencyButton component

#### C. My Agencies Screen (`my-agencies.tsx` - Enhanced)
**Current State**: Good UI, needs API integration  
**Required Features**:
- User's agency memberships list
- Role badges (owner, admin, member)
- Quick actions:
  - Create Agency
  - Join Agency
- Agency cards with:
  - Logo
  - Name, description
  - Role badge
  - Location
  - Member count
  - Rating
- Navigate to agency management (if owner/admin)
- Navigate to agency detail
- Empty state with CTAs

**Key Components Needed**:
- UserAgencyCard component (enhanced)
- RoleBadge component
- QuickActionButtons component

#### D. Team Screen (`team.tsx` - Enhanced)
**Current State**: Good UI, needs API integration  
**Required Features**:
- Team members list with filters (all, owner, admin, member)
- Search functionality
- Add member button
- Member cards with:
  - Avatar
  - Name, email, phone
  - Role badge
  - Online status indicator
  - Join date
- Member actions (if owner/admin):
  - View profile
  - Change role
  - Remove member
  - View performance
- Empty state

**Key Components Needed**:
- TeamMemberCard component (enhanced)
- AddMemberButton component
- MemberActionsMenu component
- OnlineStatusIndicator component

### 3.2 Secondary Screens

#### E. Create Agency Screen (New)
**Route**: `/(app)/agency/create`  
**Required Features**:
- Multi-step form:
  - Step 1: Basic Info (name, description, logo upload)
  - Step 2: Business Information (type, registration, tax ID, license, insurance)
  - Step 3: Contact Information (email, phone, website, address)
  - Step 4: Service Areas (map picker, radius, zip codes)
  - Step 5: Services (category selection, pricing configuration)
  - Step 6: Subscription Plan Selection
  - Step 7: Verification Documents (upload business license, insurance, etc.)
  - Step 8: Review & Submit
- Form validation
- Save as draft
- Preview functionality

**Key Components Needed**:
- MultiStepForm component
- AgencyBasicInfoForm component
- BusinessInfoForm component
- ContactInfoForm component
- ServiceAreaPicker component
- ServicesConfigurationForm component
- SubscriptionPlanSelector component
- DocumentUpload component
- LogoUpload component

#### F. Agency Management Dashboard (Owner/Admin)
**Route**: `/(app)/agency/[id]/manage`  
**Required Features**:
- Agency overview
- Quick stats:
  - Total providers
  - Active providers
  - Total bookings
  - Total revenue
  - Average rating
- Quick actions:
  - Manage Providers
  - Manage Admins
  - Configure Services
  - Update Settings
  - View Analytics
- Recent activity
- Navigation to:
  - Provider management
  - Admin management
  - Service configuration
  - Settings
  - Analytics

**Key Components Needed**:
- AgencyOverviewCard component
- QuickStatsGrid component
- QuickActionsGrid component
- RecentActivityList component

#### G. Provider Management Screen (Owner/Admin)
**Route**: `/(app)/agency/[id]/providers`  
**Required Features**:
- Provider list with filters (all, active, inactive, suspended, pending)
- Search functionality
- Add provider button
- Provider cards with:
  - Avatar
  - Name, contact info
  - Status badge
  - Commission rate
  - Performance metrics (rating, jobs, completion rate)
  - Join date
- Provider actions:
  - View profile
  - Update status
  - Edit commission rate
  - View performance
  - Remove provider
- Add provider form (with commission rate)
- Bulk actions (if multiple selection)

**Key Components Needed**:
- ProviderCard component
- ProviderStatusBadge component
- AddProviderForm component
- CommissionRateInput component
- PerformanceMetricsCard component
- ProviderActionsMenu component

#### H. Admin Management Screen (Owner)
**Route**: `/(app)/agency/[id]/admins`  
**Required Features**:
- Admin list with role filters
- Add admin button
- Admin cards with:
  - Avatar
  - Name, email
  - Role badge
  - Permissions list
  - Added date
- Admin actions:
  - View profile
  - Change role
  - Update permissions
  - Remove admin
- Add admin form (with role and permissions)
- Permission management interface

**Key Components Needed**:
- AdminCard component
- RoleSelector component
- PermissionSelector component
- AddAdminForm component
- AdminActionsMenu component

#### I. Service Area Management Screen (Owner/Admin)
**Route**: `/(app)/agency/[id]/service-areas`  
**Required Features**:
- Service areas list
- Add service area button
- Map view of service areas
- Service area cards with:
  - Name
  - Coordinates
  - Radius
  - Zip codes
- Edit/delete service area
- Add service area form:
  - Name input
  - Map picker for location
  - Radius slider
  - Zip code input

**Key Components Needed**:
- ServiceAreaCard component
- ServiceAreaMap component
- AddServiceAreaForm component
- LocationPicker component
- RadiusSlider component
- ZipCodeInput component

#### J. Services Configuration Screen (Owner/Admin)
**Route**: `/(app)/agency/[id]/services`  
**Required Features**:
- Services list by category
- Add service button
- Service cards with:
  - Category
  - Subcategories
  - Base rate
  - Currency
- Edit/delete service
- Add service form:
  - Category selector
  - Subcategory multi-select
  - Base rate input
  - Currency selector

**Key Components Needed**:
- ServiceConfigCard component
- CategorySelector component
- SubcategoryMultiSelect component
- PricingInput component
- CurrencySelector component

#### K. Agency Analytics Screen (Owner/Admin)
**Route**: `/(app)/agency/[id]/analytics`  
**Required Features**:
- Performance metrics:
  - Total providers
  - Active providers
  - Total bookings
  - Total revenue
  - Average rating
  - Review count
- Monthly statistics chart
- Provider performance list
- Revenue trends chart
- Booking trends chart
- Time period filters (week, month, quarter, year)
- Export analytics

**Key Components Needed**:
- PerformanceMetricsCard component
- MonthlyStatsChart component
- ProviderPerformanceList component
- RevenueTrendsChart component
- BookingTrendsChart component
- TimePeriodFilter component
- ExportButton component

#### L. Agency Settings Screen (Owner/Admin)
**Route**: `/(app)/agency/[id]/settings`  
**Required Features**:
- General settings:
  - Auto-approve providers toggle
  - Require provider verification toggle
  - Default commission rate input
- Notification preferences:
  - Email notifications (new bookings, provider updates, payment updates)
  - SMS notifications (new bookings, urgent updates)
- Agency information edit
- Logo upload
- Delete agency (owner only)

**Key Components Needed**:
- SettingsToggle component
- CommissionRateInput component
- NotificationPreferencesForm component
- AgencyInfoEditForm component
- LogoUpload component
- DeleteAgencyButton component

#### M. Provider Performance Screen (Owner/Admin)
**Route**: `/(app)/agency/[id]/provider/[providerId]`  
**Required Features**:
- Provider profile information
- Performance metrics:
  - Rating
  - Total jobs
  - Completed jobs
  - Cancellation rate
- Commission rate display and edit
- Status management
- Job history
- Performance trends
- Actions (update status, edit commission, remove)

**Key Components Needed**:
- ProviderProfileCard component
- PerformanceMetricsCard component
- CommissionRateEditor component
- StatusManager component
- JobHistoryList component
- PerformanceTrendsChart component

#### N. Join Agency Screen (New)
**Route**: `/(app)/agency/[id]/join`  
**Required Features**:
- Agency information display
- Join request form
- Commission rate display (if applicable)
- Terms and conditions
- Submit join request
- Request status tracking

**Key Components Needed**:
- AgencyInfoCard component
- JoinRequestForm component
- TermsAndConditions component
- RequestStatusCard component

---

## 4. Feature Breakdown by Category

### 4.1 Agency Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|---------|----------|--------|----------------------|
| Create Agency | High | ❌ Missing | Multi-step form, document upload |
| Update Agency | High | ❌ Missing | Edit form, pre-filled data |
| Delete Agency | Medium | ❌ Missing | Confirmation dialog |
| Logo Upload | High | ❌ Missing | Image picker, preview |
| Agency Detail View | High | ❌ Missing | Comprehensive detail screen |
| Business Information | High | ❌ Missing | Business info form and display |

### 4.2 Provider Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|---------|----------|--------|----------------------|
| Add Provider | High | ❌ Missing | Add provider form, commission input |
| Provider List | High | ❌ Missing | Provider list with filters |
| Update Provider Status | High | ❌ Missing | Status selector, confirmation |
| Commission Management | High | ❌ Missing | Commission rate input, display |
| Provider Performance | High | ❌ Missing | Performance metrics display |
| Remove Provider | Medium | ❌ Missing | Confirmation dialog |
| Provider Verification | Medium | ❌ Missing | Verification status display |

### 4.3 Admin Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|---------|----------|--------|----------------------|
| Add Admin | High | ❌ Missing | Add admin form, role/permission selector |
| Admin List | High | ⚠️ Partial | Admin list (team screen exists) |
| Update Role | High | ❌ Missing | Role selector |
| Update Permissions | High | ❌ Missing | Permission selector |
| Remove Admin | Medium | ❌ Missing | Confirmation dialog |

### 4.4 Service Area Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|---------|----------|--------|----------------------|
| Add Service Area | High | ❌ Missing | Map picker, radius slider, zip codes |
| Service Area List | High | ❌ Missing | Service area list, map view |
| Edit Service Area | Medium | ❌ Missing | Edit form |
| Delete Service Area | Medium | ❌ Missing | Confirmation dialog |
| Map Visualization | Medium | ❌ Missing | Map component with service areas |

### 4.5 Service Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|---------|----------|--------|----------------------|
| Configure Services | High | ❌ Missing | Service configuration form |
| Category Selection | High | ❌ Missing | Category selector |
| Pricing Configuration | High | ❌ Missing | Pricing input, currency selector |
| Service List | Medium | ❌ Missing | Service list display |

### 4.6 Subscription Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|---------|----------|--------|----------------------|
| Plan Selection | Medium | ❌ Missing | Plan selector, feature comparison |
| Subscription Status | Medium | ❌ Missing | Status display |
| Plan Upgrade/Downgrade | Low | ❌ Missing | Plan change interface |

### 4.7 Verification Features

| Feature | Priority | Status | Mobile UI Requirements |
|---------|----------|--------|----------------------|
| Document Upload | High | ❌ Missing | File picker, document list |
| Verification Status | High | ❌ Missing | Status display, timeline |
| Document Management | Medium | ❌ Missing | Document viewer, delete |

### 4.8 Analytics Features

| Feature | Priority | Status | Mobile UI Requirements |
|---------|----------|--------|----------------------|
| Performance Metrics | High | ❌ Missing | Metrics cards |
| Monthly Statistics | Medium | ❌ Missing | Chart visualization |
| Provider Performance | Medium | ❌ Missing | Provider performance list |
| Revenue Trends | Medium | ❌ Missing | Revenue chart |
| Booking Trends | Medium | ❌ Missing | Booking chart |
| Export Analytics | Low | ❌ Missing | Export functionality |

### 4.9 Agency Discovery Features

| Feature | Priority | Status | Mobile UI Requirements |
|---------|----------|--------|----------------------|
| Browse Agencies | High | ⚠️ Partial | Agency listing (needs API) |
| Search Agencies | High | ✅ Implemented | Search bar |
| Location Filter | High | ❌ Missing | Location selector |
| Service Type Filter | High | ❌ Missing | Service type selector |
| Agency Details | High | ❌ Missing | Detail screen |
| Join Agency | High | ❌ Missing | Join request flow |

---

## 5. API Integration Requirements

### 5.1 Required API Endpoints

**Public Endpoints:**
- `GET /api/agencies` - List agencies with filters
- `GET /api/agencies/:id` - Get agency details

**Authenticated Endpoints - Agency Management:**
- `GET /api/agencies/my/agencies` - Get my agencies
- `POST /api/agencies` - Create agency
- `PUT /api/agencies/:id` - Update agency
- `DELETE /api/agencies/:id` - Delete agency
- `POST /api/agencies/:id/logo` - Upload logo

**Authenticated Endpoints - Provider Management:**
- `GET /api/agencies/:id/providers` - Get agency providers
- `POST /api/agencies/:id/providers` - Add provider
- `PUT /api/agencies/:id/providers/:providerId/status` - Update provider status
- `PUT /api/agencies/:id/providers/:providerId/commission` - Update commission rate
- `DELETE /api/agencies/:id/providers/:providerId` - Remove provider

**Authenticated Endpoints - Admin Management:**
- `GET /api/agencies/:id/admins` - Get agency admins
- `POST /api/agencies/:id/admins` - Add admin
- `PUT /api/agencies/:id/admins/:adminId` - Update admin role/permissions
- `DELETE /api/agencies/:id/admins/:adminId` - Remove admin

**Authenticated Endpoints - Analytics & Actions:**
- `GET /api/agencies/:id/analytics` - Get agency analytics
- `POST /api/agencies/join` - Join agency
- `POST /api/agencies/leave` - Leave agency

### 5.2 Service Implementation Tasks

**File**: `packages/agencies/services.ts`

```typescript
// TODO: Implement all methods:
- getAgencies(filters, pagination) - fetch agencies with filters
- getAgency(id) - fetch single agency with full details
- getMyAgencies(userId) - fetch user's agencies
- createAgency(agencyData) - create new agency
- updateAgency(id, agencyData) - update agency
- deleteAgency(id) - delete agency
- uploadLogo(agencyId, logoFile) - upload agency logo
- getProviders(agencyId) - fetch agency providers
- addProvider(agencyId, providerData) - add provider
- updateProviderStatus(agencyId, providerId, status) - update status
- updateProviderCommission(agencyId, providerId, commissionRate) - update commission
- removeProvider(agencyId, providerId) - remove provider
- getAdmins(agencyId) - fetch agency admins
- addAdmin(agencyId, adminData) - add admin
- updateAdmin(agencyId, adminId, adminData) - update admin
- removeAdmin(agencyId, adminId) - remove admin
- getAnalytics(agencyId) - fetch agency analytics
- joinAgency(agencyId) - request to join agency
- leaveAgency(agencyId) - leave agency
- updateServiceAreas(agencyId, serviceAreas) - update service areas
- updateServices(agencyId, services) - update services
- updateSettings(agencyId, settings) - update agency settings
- uploadVerificationDocument(agencyId, document) - upload document
```

### 5.3 Type Definitions Updates

**File**: `packages/types/agencies.ts`

The current type definitions are minimal. Need to expand to match the full data model from `AGENCIES_FEATURES.md`:

```typescript
// Expand Agency interface to include:
- Full business information (type, registration, tax ID, license, insurance)
- Complete contact information (email, phone, website, address with coordinates)
- Service areas array (name, coordinates, radius, zipCodes)
- Services array (category, subcategories, pricing)
- Subscription object (plan, startDate, endDate, isActive, features)
- Verification object (isVerified, verifiedAt, documents)
- Analytics object (totalBookings, totalRevenue, averageRating, totalReviews, monthlyStats)
- Settings object (autoApproveProviders, requireProviderVerification, defaultCommissionRate, notificationPreferences)
- Admins array (user, role, permissions, addedAt)
- Providers array (user, status, commissionRate, joinedAt, performance)
- Logo object (url, publicId)
- Owner reference
- Status (isActive)

// Expand AgencyMember interface to include:
- Full agency reference
- Full user reference
- Role (owner, admin, manager, supervisor)
- Permissions array
- Joined date
- Status

// Add new interfaces:
- Provider
- Admin
- ServiceArea
- ServiceConfiguration
- SubscriptionPlan
- VerificationDocument
- AgencyAnalytics
- AgencySettings
- ProviderPerformance
```

---

## 6. Mobile UI/UX Recommendations

### 6.1 Design Patterns

1. **Bottom Sheet Pattern**: Use for filters, forms, member actions, settings
2. **Card-Based Layout**: Agency cards, provider cards, admin cards
3. **Swipe Actions**: Swipe to remove provider/admin, change status
4. **Pull-to-Refresh**: Refresh agency listings, team members
5. **Infinite Scroll**: Load more agencies as user scrolls
6. **Skeleton Loading**: Show loading states during API calls
7. **Empty States**: Friendly empty states with CTAs
8. **Multi-Step Forms**: For agency creation
9. **Map Integration**: For service area selection and visualization
10. **Role Badges**: Color-coded role indicators
11. **Status Badges**: Status indicators for providers
12. **Permission Management**: Checkbox-based permission selector

### 6.2 Navigation Flow

```
Browse Agencies (browse-agencies.tsx)
  ├─> Agency Detail
  │     ├─> Join Agency
  │     ├─> Agency Management (if owner/admin)
  │     │     ├─> Provider Management
  │     │     │     └─> Provider Performance
  │     │     ├─> Admin Management
  │     │     ├─> Service Areas
  │     │     ├─> Services Configuration
  │     │     ├─> Analytics
  │     │     └─> Settings
  │     └─> Share
  ├─> My Agencies
  │     ├─> Agency Management
  │     └─> Agency Detail
  ├─> Team
  │     ├─> Add Member
  │     └─> Member Detail
  └─> Create Agency
        └─> Multi-Step Form
              └─> Agency Management
```

### 6.3 Key Components to Build

1. **AgencyCard** - Reusable agency card component
2. **AgencyDetailHeader** - Agency header with logo and info
3. **BusinessInfoCard** - Business information display
4. **ServiceAreaMap** - Map component for service areas
5. **ProviderCard** - Provider display card
6. **AdminCard** - Admin display card
7. **RoleBadge** - Role indicator component
8. **StatusBadge** - Status indicator component
9. **CommissionRateInput** - Commission rate input component
10. **PermissionSelector** - Permission management component
11. **ServiceAreaPicker** - Map-based service area picker
12. **ServicesConfigurationForm** - Service configuration form
13. **AnalyticsDashboard** - Analytics display component
14. **DocumentUpload** - Document upload component
15. **LogoUpload** - Logo upload component
16. **MultiStepForm** - Reusable multi-step form wrapper
17. **PerformanceMetricsCard** - Performance metrics display
18. **ProviderPerformanceChart** - Provider performance visualization

---

## 7. Implementation Priority

### Phase 1: Core Agency Management (High Priority)
1. ✅ API integration for agencies
2. ✅ Agency detail screen
3. ✅ Agency creation flow
4. ✅ Logo upload
5. ✅ My agencies with API integration

### Phase 2: Provider Management (High Priority)
1. ✅ Provider list and management
2. ✅ Add provider functionality
3. ✅ Provider status management
4. ✅ Commission rate management
5. ✅ Provider performance tracking

### Phase 3: Admin Management (High Priority)
1. ✅ Admin list and management
2. ✅ Add admin functionality
3. ✅ Role and permission management
4. ✅ Admin actions

### Phase 4: Service Configuration (High Priority)
1. ✅ Service area management
2. ✅ Services configuration
3. ✅ Map integration
4. ✅ Pricing configuration

### Phase 5: Analytics & Settings (Medium Priority)
1. ✅ Analytics dashboard
2. ✅ Performance metrics
3. ✅ Charts and visualizations
4. ✅ Agency settings
5. ✅ Notification preferences

### Phase 6: Verification & Subscription (Medium Priority)
1. ✅ Document upload
2. ✅ Verification status tracking
3. ✅ Subscription plan management
4. ✅ Plan selection interface

### Phase 7: Enhanced Features (Low Priority)
1. ✅ Advanced filtering
2. ✅ Bulk actions
3. ✅ Export functionality
4. ✅ Advanced analytics

---

## 8. Technical Considerations

### 8.1 State Management
- Use React hooks for data fetching
- Consider React Query for caching and refetching
- Context for agency permissions and role management
- Real-time updates for provider status changes

### 8.2 Map Integration
- Use `react-native-maps` or `expo-location` for map functionality
- Service area visualization
- Location picker for service areas
- Radius selection
- Zip code mapping

### 8.3 File Handling
- Use `expo-image-picker` for logo upload
- Use `expo-document-picker` for verification documents
- Image compression before upload
- Cloudinary integration for file storage
- Support multiple file formats

### 8.4 Permission Management
- Role-based access control
- Permission checking before actions
- Permission selector component
- Permission validation

### 8.5 Form Management
- Use form libraries (Formik or React Hook Form)
- Multi-step form state management
- Form validation with clear error messages
- Auto-save draft functionality
- Complex nested forms (business info, service areas)

### 8.6 Chart Libraries
- Use `react-native-chart-kit` or `victory-native` for charts
- Analytics visualizations
- Performance trends
- Revenue and booking charts

### 8.7 Performance
- Implement pagination (don't load all agencies/providers at once)
- Use FlatList for efficient list rendering
- Image lazy loading
- Debounce search input
- Cache API responses
- Optimize map rendering

### 8.8 Commission Calculations
- Commission rate validation (0-100%)
- Commission calculation display
- Commission history tracking

---

## 9. Testing Requirements

### 9.1 Unit Tests
- Agency filtering logic
- Commission calculation
- Permission validation
- Form validation
- Status transition logic

### 9.2 Integration Tests
- API service methods
- File upload functionality
- Map integration
- Permission checks
- Provider management flow

### 9.3 E2E Tests
- Complete agency creation flow
- Provider onboarding flow
- Admin management flow
- Service area configuration flow
- Analytics viewing flow

---

## 10. Accessibility Considerations

- Screen reader support for agency information
- Keyboard navigation for forms
- High contrast mode support
- Touch target sizes (minimum 44x44)
- Clear focus indicators
- Form error announcements
- Map accessibility (alternative text descriptions)
- Role and status announcements

---

## 11. Data Model Alignment

### Current vs. Required Types

The current type definitions in `packages/types/agencies.ts` are minimal. They need to be expanded to match the comprehensive data model documented in `AGENCIES_FEATURES.md`:

**Current Agency Interface** (Minimal):
- Basic fields only (id, name, description, logo, website, contactEmail, contactPhone, location, verified, rating, memberCount, createdAt)

**Required Agency Interface** (Comprehensive):
- Full business information (type, registrationNumber, taxId, licenseNumber, insurance)
- Complete contact information (email, phone, website, address with coordinates)
- Service areas array (name, coordinates, radius, zipCodes)
- Services array (category, subcategories, pricing with baseRate and currency)
- Subscription object (plan, startDate, endDate, isActive, features)
- Verification object (isVerified, verifiedAt, documents array)
- Analytics object (totalBookings, totalRevenue, averageRating, totalReviews, monthlyStats, providerPerformance)
- Settings object (autoApproveProviders, requireProviderVerification, defaultCommissionRate, notificationPreferences)
- Admins array (user, role, permissions, addedAt)
- Providers array (user, status, commissionRate, joinedAt, performance)
- Logo object (url, publicId)
- Owner reference
- Status (isActive)

**Current AgencyMember Interface** (Minimal):
- Basic fields only (id, agencyId, userId, role, joinedAt)

**Required AgencyMember Interface** (Comprehensive):
- Full agency reference
- Full user reference
- Role (owner, admin, manager, supervisor)
- Permissions array
- Joined date
- Status

**Missing Interfaces**:
- Provider
- Admin
- ServiceArea
- ServiceConfiguration
- SubscriptionPlan
- VerificationDocument
- AgencyAnalytics
- AgencySettings
- ProviderPerformance

---

## 12. Integration Points

### 12.1 Related Features
- **User Management** - Owner, admin, and provider profiles
- **Providers** - Provider profiles and management
- **Marketplace** - Service bookings and management
- **Finance** - Commission payments and revenue tracking
- **Analytics** - Performance analytics and reporting
- **File Storage** - Logo and document storage (Cloudinary)
- **Email Service** - Notification system
- **Maps & Location** - Service area mapping
- **Subscriptions** - Subscription plan management
- **Verification** - Document verification system

### 12.2 External Services
- **Cloudinary** - Logo and document storage
- **Maps API** - Service area mapping and visualization
- **Email Service** - Notifications
- **Analytics Service** - Performance tracking

---

## 13. Security & Permissions

### 13.1 Permission Levels
- **Owner**: Full control (create, update, delete, manage all)
- **Admin**: Administrative access (manage providers, view analytics, update settings)
- **Manager**: Management access (manage providers, view limited analytics)
- **Supervisor**: Supervisory access (view providers, limited management)

### 13.2 Security Features
- **Role-Based Access**: All endpoints check user role
- **Permission Validation**: Granular permission checks
- **Owner Protection**: Owner cannot be removed
- **Data Protection**: Agency data only accessible to members and admins
- **Audit Trail**: All admin actions logged

---

## 14. Next Steps

1. **Review and prioritize** features based on business needs
2. **Expand type definitions** in `packages/types/agencies.ts` to match full data model
3. **Design mockups** for key screens (agency creation, provider management, analytics)
4. **Set up API client** methods in `packages/api/client.ts`
5. **Implement service methods** in `packages/agencies/services.ts`
6. **Build core components** (AgencyCard, ProviderCard, etc.)
7. **Create screens** starting with Phase 1
8. **Integrate map library** for service areas
9. **Implement file upload** for logos and documents
10. **Add permission management** system
11. **Integrate APIs** and test end-to-end flows
12. **Add error handling** and loading states
13. **Implement analytics** visualizations
14. **Performance optimization** and testing
15. **Accessibility audit** and improvements

---

## 15. Related Documentation

- `AGENCIES_FEATURES.md` - Full feature documentation
- `API_INTEGRATION.md` - API integration guidelines
- `packages/agencies/` - Package implementation
- `packages/types/agencies.ts` - Type definitions (needs expansion)
- `MARKETPLACE_MOBILE_ANALYSIS.md` - Reference for similar patterns
- `JOB_BOARD_MOBILE_ANALYSIS.md` - Reference for similar patterns
- `FINANCE_MOBILE_ANALYSIS.md` - Reference for payment integration
- `ACADEMY_MOBILE_ANALYSIS.md` - Reference for similar patterns

---

*Last Updated: Based on current codebase analysis and AGENCIES_FEATURES.md*

