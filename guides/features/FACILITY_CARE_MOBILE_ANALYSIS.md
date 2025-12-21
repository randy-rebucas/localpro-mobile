# Facility Care Features Analysis for Mobile App

## Executive Summary

This document provides a comprehensive analysis of the Facility Care features as documented in `FACILITY_CARE_FEATURES.md` and their implementation requirements for the mobile app. The Facility Care feature provides end-to-end facility care offerings including recurring services, formal contracts, and subscription management.

---

## 1. Feature Overview

### Core Capabilities
The Facility Care feature enables:
- **Service Management** - Create and manage facility care service listings (janitorial, landscaping, pest control, maintenance, security)
- **Contract Management** - Create and manage formal service contracts with detailed terms
- **Subscription Management** - Set up and manage recurring service subscriptions
- **Facility Information** - Manage facility details and information
- **Service Scheduling** - Schedule recurring services with flexible frequency options
- **Payment Management** - Handle payment terms, methods, and recurring payments
- **Performance Tracking** - Track KPIs and performance metrics
- **Document Management** - Upload and manage contract documents
- **Service Discovery** - Browse and search facility care services

---

## 2. Current Implementation Status

### ✅ Implemented
- **Package Structure**: Facility Care package exists at `packages/facility-care/`
- **Type Definitions**: Basic Facility, FacilityService, and FacilityBooking types defined in `packages/types/facility-care.ts`
- **Service Stubs**: FacilityCareService class with method stubs
- **Tab Navigation**: Facility Care tabs configured in `_layout.tsx`
  - Services (`services-fc.tsx`) - Service browsing with category filters
  - Contracts (`contracts.tsx`) - Contract list with status filters
  - Subscriptions (`subscriptions-fc.tsx`) - Subscription list with status filters
- **Basic UI Components**: Card-based layouts, search bars, filter chips, status badges

### ❌ Not Implemented
- **API Integration**: All service methods return empty arrays or throw errors
- **Service Detail Screen**: No service detail view
- **Service Creation/Editing**: No create/edit service screen
- **Contract Detail Screen**: No contract detail view
- **Contract Creation**: No create contract flow
- **Subscription Detail Screen**: No subscription detail view
- **Subscription Creation**: No create subscription flow
- **Facility Management**: No facility creation/management screens
- **Service Booking**: No booking creation flow
- **Image Upload**: No image upload functionality
- **Document Management**: No document upload/view functionality
- **Service History**: No service history tracking display
- **Payment History**: No payment history display
- **Performance Tracking**: No KPI tracking UI
- **Schedule Management**: No schedule configuration UI
- **Location Services**: No location-based search

---

## 3. Required Mobile App Screens

### 3.1 Primary Screens

#### A. Services Screen (`services-fc.tsx` - Enhanced)
**Current State**: Basic UI with category filters  
**Required Features**:
- Service listing with pagination
- Category filters (janitorial, landscaping, pest_control, maintenance, security)
- Search functionality
- Location-based filtering
- Pricing display (hourly, monthly, per_sqft, per_visit, contract)
- Provider information
- Service area display
- Rating and reviews
- Availability indicators
- Pull-to-refresh
- Infinite scroll pagination
- Create service button (for providers)
- Empty state with CTA

**Key Components Needed**:
- ServiceCard component (enhanced)
- CategoryFilterChips component
- PricingDisplay component
- ServiceAreaBadge component
- AvailabilityIndicator component

#### B. Service Detail Screen (New)
**Route**: `/(app)/facility-care/service/[id]`  
**Required Features**:
- Service images carousel
- Service name, description, category
- Provider information with profile link
- Pricing information:
  - Pricing model (hourly, monthly, per_sqft, per_visit, contract)
  - Base price
  - Currency
- Service area (zip codes, cities)
- Availability schedule (days, times)
- Service features list
- Service requirements list
- Rating and reviews
- Book service button
- Create contract button
- Create subscription button
- Share functionality
- Report/flag service option

**Key Components Needed**:
- ImageCarousel component
- ProviderCard component
- PricingInfo component
- AvailabilitySchedule component
- FeaturesList component
- RequirementsList component
- ReviewList component
- BookingCTAButton component

#### C. Contracts Screen (`contracts.tsx` - Enhanced)
**Current State**: Basic UI with status filters  
**Required Features**:
- Contract list with status badges
- Status filters (all, draft, pending, active, suspended, completed, terminated)
- Search functionality
- Contract details preview:
  - Facility information
  - Provider information
  - Service type
  - Start/end dates
  - Contract value
  - Expiration warnings
- Quick actions (renew, terminate, view)
- Create contract button
- Pull-to-refresh
- Empty state with CTA

**Key Components Needed**:
- ContractCard component (enhanced)
- StatusBadge component
- ExpirationWarning component
- QuickActions component

#### D. Contract Detail Screen (New)
**Route**: `/(app)/facility-care/contract/[id]`  
**Required Features**:
- Contract header with status
- Parties information (client, provider)
- Facility details:
  - Facility name
  - Address
  - Size (area, unit)
  - Facility type
- Contract details:
  - Start date, end date, duration
  - Frequency (daily, weekly, bi-weekly, monthly, quarterly, as_needed)
  - Service scope
  - Special requirements
- Pricing information:
  - Base price
  - Additional fees
  - Total amount
  - Currency
- Payment information:
  - Payment terms (net_15, net_30, net_60, due_on_receipt)
  - Payment method
  - Auto-pay status
- Performance KPIs:
  - Service level (standard, premium, custom)
  - KPI metrics (target vs actual)
- Documents section:
  - Contract documents
  - Invoices
  - Reports
  - Certificates
- Reviews section
- Actions:
  - Update status
  - Upload document
  - Renew contract
  - Terminate contract
  - View related subscription

**Key Components Needed**:
- ContractHeader component
- FacilityInfoCard component
- ContractDetailsCard component
- PricingCard component
- PaymentInfoCard component
- KPIDisplay component
- DocumentsList component
- ReviewsList component
- ContractActions component

#### E. Create/Edit Contract Screen (New)
**Route**: `/(app)/facility-care/contract/create` or `/(app)/facility-care/contract/[id]/edit`  
**Required Features**:
- Multi-step form:
  - **Step 1: Service Selection**
    - Select service
    - Select provider
  - **Step 2: Facility Information**
    - Facility name
    - Address (street, city, state, zip, country)
    - Facility size (area, unit)
    - Facility type (office, retail, warehouse, residential, industrial, healthcare, educational)
  - **Step 3: Contract Details**
    - Start date, end date
    - Duration
    - Frequency selection
    - Service scope (multi-select)
    - Special requirements (text input)
  - **Step 4: Pricing**
    - Base price
    - Additional fees (add multiple)
    - Total amount calculation
    - Currency selection
  - **Step 5: Payment**
    - Payment terms selection
    - Payment method selection
    - Auto-pay toggle
  - **Step 6: Performance**
    - Service level selection
    - KPI configuration (add multiple)
- Form validation
- Save as draft
- Submit for approval
- Preview contract

**Key Components Needed**:
- MultiStepForm component
- ServiceSelector component
- FacilityForm component
- ContractDetailsForm component
- PricingForm component
- PaymentForm component
- KPIConfigurator component
- ContractPreview component

#### F. Subscriptions Screen (`subscriptions-fc.tsx` - Enhanced)
**Current State**: Basic UI with status filters  
**Required Features**:
- Subscription list with status badges
- Status filters (all, active, paused, cancelled, expired)
- Search functionality
- Subscription details preview:
  - Service name
  - Facility name
  - Provider name
  - Plan name
  - Price and billing period
  - Start date, end date
  - Next billing date
  - Next service date
  - Auto-renew status
- Quick actions (pause, resume, cancel, renew)
- Create subscription button
- Pull-to-refresh
- Empty state with CTA

**Key Components Needed**:
- SubscriptionCard component (enhanced)
- StatusBadge component
- NextServiceIndicator component
- AutoRenewToggle component
- QuickActions component

#### G. Subscription Detail Screen (New)
**Route**: `/(app)/facility-care/subscription/[id]`  
**Required Features**:
- Subscription header with status
- Service information
- Facility information
- Contract link (if applicable)
- Plan details:
  - Plan name
  - Features list
  - Frequency (weekly, bi-weekly, monthly, quarterly)
  - Price and currency
- Schedule information:
  - Start date
  - Next service date
  - Last service date
  - Service history (list)
- Payment information:
  - Payment method
  - Auto-pay status
  - Last payment date
  - Next payment date
  - Payment history (list)
- Preferences:
  - Preferred time
  - Contact method
  - Special instructions
- Actions:
  - Update status (pause, resume, cancel)
  - Toggle auto-renew
  - View service history
  - View payment history
  - Update preferences
  - View related contract

**Key Components Needed**:
- SubscriptionHeader component
- PlanDetailsCard component
- ScheduleCard component
- ServiceHistoryList component
- PaymentInfoCard component
- PaymentHistoryList component
- PreferencesCard component
- SubscriptionActions component

#### H. Create Subscription Screen (New)
**Route**: `/(app)/facility-care/subscription/create`  
**Required Features**:
- Multi-step form:
  - **Step 1: Service & Contract**
    - Select service
    - Link to contract (optional)
    - Subscription type selection (janitorial, landscaping, pest_control, maintenance, comprehensive)
  - **Step 2: Plan Selection**
    - Select plan
    - View plan features
    - Frequency selection
    - Price display
  - **Step 3: Schedule**
    - Start date selection
    - Preferred time selection
  - **Step 4: Payment**
    - Payment method selection
    - Auto-pay toggle
  - **Step 5: Preferences**
    - Preferred time
    - Contact method
    - Special instructions
- Form validation
- Preview subscription
- Create subscription

**Key Components Needed**:
- MultiStepForm component
- ServiceSelector component
- ContractLinker component
- PlanSelector component
- SchedulePicker component
- PaymentForm component
- PreferencesForm component
- SubscriptionPreview component

### 3.2 Secondary Screens

#### I. Create/Edit Service Screen (Provider)
**Route**: `/(app)/facility-care/service/create` or `/(app)/facility-care/service/[id]/edit`  
**Required Features**:
- Service form:
  - Name, description
  - Category selection
  - Pricing configuration:
    - Pricing type (hourly, monthly, per_sqft, per_visit, contract)
    - Base price
    - Currency
  - Service area (zip codes, cities)
  - Availability schedule:
    - Day selection
    - Start time, end time
    - Timezone
  - Features list (add multiple)
  - Requirements list (add multiple)
  - Image upload (multiple)
- Form validation
- Save as draft
- Publish service

#### J. Facility Management Screen (New)
**Route**: `/(app)/facility-care/facility/[id]` or `/(app)/facility-care/facility/create`  
**Required Features**:
- Facility information form:
  - Facility name
  - Address (street, city, state, zip, country)
  - Facility size (area in square feet)
  - Facility type selection
- Facility image upload
- Linked contracts list
- Linked subscriptions list
- Facility actions (edit, delete)

#### K. Service History Screen (New)
**Route**: `/(app)/facility-care/subscription/[id]/history`  
**Required Features**:
- Service history list with dates
- Filter by status (scheduled, completed, cancelled, rescheduled)
- Service details:
  - Scheduled date
  - Actual date
  - Status
  - Provider information
  - Notes
- Calendar view option
- Export history

#### L. Payment History Screen (New)
**Route**: `/(app)/facility-care/subscription/[id]/payments`  
**Required Features**:
- Payment history list
- Filter by status (pending, paid, failed)
- Payment details:
  - Date
  - Amount
  - Status
  - Transaction ID
- Payment summary (total paid, total pending)
- Export payment history

---

## 4. Feature Breakdown by Category

### 4.1 Service Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|--------|----------|--------|----------------------|
| Browse Services | High | ⚠️ Partial | API integration, pagination, location search |
| Service Detail | High | ❌ Missing | Full service information display |
| Create Service | High | ❌ Missing | Multi-field form, pricing config, availability |
| Update Service | High | ❌ Missing | Pre-filled form, edit mode |
| Delete Service | Medium | ❌ Missing | Confirmation dialog |
| Image Upload | High | ❌ Missing | Image picker, multiple images, preview |
| Category Filtering | High | ⚠️ Partial | Category chips, correct categories |
| Location-Based Search | High | ❌ Missing | Map integration, location permission, radius |

### 4.2 Contract Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|--------|----------|--------|----------------------|
| Create Contract | High | ❌ Missing | Multi-step form, facility form, KPI config |
| Contract List | High | ⚠️ Partial | API integration, real data |
| Contract Detail | High | ❌ Missing | Full contract information, documents, KPIs |
| Update Contract | High | ❌ Missing | Edit form, status updates |
| Contract Status Management | High | ⚠️ Partial | Status badges, status update actions |
| Document Upload | High | ❌ Missing | Document picker, upload, preview |
| Document Management | Medium | ❌ Missing | Document list, download, delete |
| KPI Tracking | Medium | ❌ Missing | KPI display, performance charts |
| Contract Renewal | Medium | ⚠️ Partial | Renewal button, renewal flow |
| Contract Termination | Medium | ⚠️ Partial | Termination button, confirmation |

### 4.3 Subscription Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|--------|----------|--------|----------------------|
| Create Subscription | High | ❌ Missing | Multi-step form, plan selection, schedule |
| Subscription List | High | ⚠️ Partial | API integration, real data |
| Subscription Detail | High | ❌ Missing | Full subscription info, history, payments |
| Update Subscription | High | ❌ Missing | Status updates, preference updates |
| Subscription Status Management | High | ⚠️ Partial | Status badges, pause/resume/cancel |
| Service History | High | ❌ Missing | History list, calendar view, filters |
| Payment History | High | ❌ Missing | Payment list, filters, export |
| Auto-Renew Toggle | Medium | ⚠️ Partial | Toggle switch, API integration |
| Schedule Management | Medium | ❌ Missing | Schedule display, next service tracking |

### 4.4 Facility Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|--------|----------|--------|----------------------|
| Facility Creation | Medium | ❌ Missing | Facility form, address input, size input |
| Facility List | Medium | ❌ Missing | Facility list, filters |
| Facility Detail | Medium | ❌ Missing | Facility information, linked contracts/subscriptions |
| Facility Update | Medium | ❌ Missing | Edit form |
| Facility Deletion | Low | ❌ Missing | Confirmation dialog |

### 4.5 Service Scheduling Features

| Feature | Priority | Status | Mobile UI Requirements |
|--------|----------|--------|----------------------|
| Schedule Configuration | High | ❌ Missing | Frequency selector, date picker, time picker |
| Recurring Schedules | High | ❌ Missing | Recurrence pattern selector |
| Next Service Tracking | High | ❌ Missing | Next service date display, countdown |
| Service History Tracking | High | ❌ Missing | History list, status tracking |
| Schedule Calendar View | Medium | ❌ Missing | Calendar component, service markers |

### 4.6 Payment Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|--------|----------|--------|----------------------|
| Payment Terms Configuration | High | ❌ Missing | Payment terms selector |
| Payment Method Setup | High | ❌ Missing | Payment method selector |
| Auto-Pay Configuration | Medium | ⚠️ Partial | Auto-pay toggle, API integration |
| Payment History | High | ❌ Missing | Payment list, filters, export |
| Payment Status Tracking | Medium | ❌ Missing | Payment status indicators |

### 4.7 Performance & KPIs Features

| Feature | Priority | Status | Mobile UI Requirements |
|--------|----------|--------|----------------------|
| KPI Configuration | Medium | ❌ Missing | KPI form, metric/target/unit inputs |
| KPI Display | Medium | ❌ Missing | KPI cards, target vs actual |
| Performance Monitoring | Low | ❌ Missing | Performance charts, trends |
| Performance Reports | Low | ❌ Missing | Report generation, export |

### 4.8 Document Management Features

| Feature | Priority | Status | Mobile UI Requirements |
|--------|----------|--------|----------------------|
| Document Upload | High | ❌ Missing | Document picker, upload, progress |
| Document List | High | ❌ Missing | Document list, type filters |
| Document Preview | Medium | ❌ Missing | Document viewer, download |
| Document Delete | Medium | ❌ Missing | Delete button, confirmation |

---

## 5. API Integration Requirements

### 5.1 Required API Endpoints

**Public Endpoints - Services**:
- `GET /api/facility-care` - List services (page, limit, category, area, provider, isActive)
- `GET /api/facility-care/nearby` - Get nearby services (lat, lng, radius)
- `GET /api/facility-care/:id` - Get service details

**Authenticated Endpoints - Services**:
- `POST /api/facility-care` - Create service (provider, admin)
- `PUT /api/facility-care/:id` - Update service (provider, admin)
- `DELETE /api/facility-care/:id` - Delete service (provider, admin)
- `POST /api/facility-care/:id/images` - Upload images (provider, admin)
- `DELETE /api/facility-care/:id/images/:imageId` - Delete image (provider, admin)
- `POST /api/facility-care/:id/reviews` - Add review (authenticated)
- `GET /api/facility-care/my-services` - Get my services (authenticated)
- `POST /api/facility-care/:id/book` - Book service (authenticated)
- `PUT /api/facility-care/:id/bookings/:bookingId/status` - Update booking status (authenticated)
- `GET /api/facility-care/my-bookings` - Get my bookings (authenticated)

**Authenticated Endpoints - Contracts**:
- `GET /api/facility-care/contracts` - List contracts (authenticated)
- `POST /api/facility-care/contracts` - Create contract (authenticated)
- `GET /api/facility-care/contracts/:id` - Get contract details (authenticated)
- `PUT /api/facility-care/contracts/:id` - Update contract (authenticated)
- `PUT /api/facility-care/contracts/:id/status` - Update contract status (authenticated)
- `POST /api/facility-care/contracts/:id/documents` - Upload document (authenticated)
- `DELETE /api/facility-care/contracts/:id/documents/:docId` - Delete document (authenticated)

**Authenticated Endpoints - Subscriptions**:
- `GET /api/facility-care/subscriptions` - List subscriptions (authenticated)
- `POST /api/facility-care/subscriptions` - Create subscription (authenticated)
- `GET /api/facility-care/subscriptions/:id` - Get subscription details (authenticated)
- `PUT /api/facility-care/subscriptions/:id` - Update subscription (authenticated)
- `PUT /api/facility-care/subscriptions/:id/status` - Update subscription status (authenticated)
- `GET /api/facility-care/subscriptions/:id/history` - Get service history (authenticated)
- `GET /api/facility-care/subscriptions/:id/payments` - Get payment history (authenticated)

### 5.2 Service Implementation Tasks

**File**: `packages/facility-care/services.ts`

```typescript
// TODO: Implement all methods:

// Services
- getServices(filters) - with pagination, filters
- getService(id) - fetch single service
- getNearbyServices(lat, lng, radius) - location-based search
- createService(serviceData) - create new service
- updateService(id, serviceData) - update service
- deleteService(id) - delete service
- uploadServiceImages(id, images) - upload images
- deleteServiceImage(id, imageId) - delete image
- addServiceReview(id, reviewData) - add review
- getMyServices() - fetch user's services
- bookService(id, bookingData) - book service
- updateBookingStatus(id, bookingId, status) - update booking status
- getMyBookings() - fetch user's bookings

// Contracts
- getContracts(filters) - fetch contracts with filters
- getContract(id) - fetch single contract
- createContract(contractData) - create new contract
- updateContract(id, contractData) - update contract
- updateContractStatus(id, status) - update contract status
- uploadContractDocument(id, document) - upload document
- deleteContractDocument(id, docId) - delete document

// Subscriptions
- getSubscriptions(filters) - fetch subscriptions with filters
- getSubscription(id) - fetch single subscription
- createSubscription(subscriptionData) - create new subscription
- updateSubscription(id, subscriptionData) - update subscription
- updateSubscriptionStatus(id, status) - update subscription status
- getServiceHistory(id) - fetch service history
- getPaymentHistory(id) - fetch payment history
```

---

## 6. Mobile UI/UX Recommendations

### 6.1 Design Patterns

1. **Multi-Step Form Pattern**: Use for contract and subscription creation (5-6 steps)
2. **Card-Based Layout**: Service, contract, and subscription cards
3. **Bottom Sheet Pattern**: Use for filters, quick actions, document picker
4. **Status Badges**: Color-coded status indicators
5. **Pull-to-Refresh**: Refresh lists
6. **Infinite Scroll**: Load more items as user scrolls
7. **Skeleton Loading**: Show loading states during API calls
8. **Empty States**: Friendly empty states with CTAs
9. **Progress Indicators**: Show form completion progress
10. **Calendar Integration**: Calendar view for schedules and history

### 6.2 Navigation Flow

```
Services (services-fc.tsx)
  ├─> Service Detail
  │     ├─> Book Service
  │     ├─> Create Contract
  │     ├─> Create Subscription
  │     └─> Provider Profile
  ├─> Create Service (Provider)
  │     └─> Service Detail
  └─> Search Services

Contracts (contracts.tsx)
  ├─> Contract Detail
  │     ├─> Upload Document
  │     ├─> View Documents
  │     ├─> Update Status
  │     ├─> Renew Contract
  │     ├─> Terminate Contract
  │     └─> View Related Subscription
  └─> Create Contract (Multi-step)
        └─> Contract Detail

Subscriptions (subscriptions-fc.tsx)
  ├─> Subscription Detail
  │     ├─> Service History
  │     ├─> Payment History
  │     ├─> Update Status
  │     ├─> Update Preferences
  │     └─> View Related Contract
  └─> Create Subscription (Multi-step)
        └─> Subscription Detail
```

### 6.3 Key Components to Build

1. **ServiceCard** - Service display card
2. **ContractCard** - Contract display card
3. **SubscriptionCard** - Subscription display card
4. **MultiStepForm** - Multi-step form wrapper
5. **FacilityForm** - Facility information form
6. **PricingConfigurator** - Pricing configuration component
7. **SchedulePicker** - Schedule selection component
8. **KPIDisplay** - KPI metrics display
9. **DocumentsList** - Document list with preview
10. **ServiceHistoryList** - Service history timeline
11. **PaymentHistoryList** - Payment history list
12. **StatusBadge** - Status indicator badge
13. **ExpirationWarning** - Contract expiration warning
14. **NextServiceIndicator** - Next service date display

---

## 7. Implementation Priority

### Phase 1: Core Service Management (High Priority)
1. ✅ Enhanced services screen with API integration
2. ✅ Service detail screen
3. ✅ Create/edit service screen (provider)
4. ✅ Image upload functionality
5. ✅ Location-based search

### Phase 2: Contract Management (High Priority)
1. ✅ Contract list with API integration
2. ✅ Contract detail screen
3. ✅ Create contract flow (multi-step)
4. ✅ Document upload and management
5. ✅ Contract status management

### Phase 3: Subscription Management (High Priority)
1. ✅ Subscription list with API integration
2. ✅ Subscription detail screen
3. ✅ Create subscription flow (multi-step)
4. ✅ Service history tracking
5. ✅ Payment history tracking

### Phase 4: Enhanced Features (Medium Priority)
1. ✅ Facility management screens
2. ✅ KPI tracking and display
3. ✅ Performance monitoring
4. ✅ Schedule calendar view
5. ✅ Auto-pay configuration

### Phase 5: Advanced Features (Low Priority)
1. ✅ Performance reports
2. ✅ Export functionality
3. ✅ Advanced analytics
4. ✅ Notification integration

---

## 8. Technical Considerations

### 8.1 State Management
- Use React hooks for data fetching (`useServices`, `useContracts`, `useSubscriptions`)
- Consider React Query for caching and refetching
- Context for filter state management
- Local state for form management

### 8.2 Image & Document Handling
- Use `expo-image-picker` for image selection
- Use `expo-document-picker` for document selection
- Implement image compression before upload
- Use `expo-image` for optimized image display
- Support multiple file formats for documents
- Document preview functionality

### 8.3 Location Services
- Request location permissions
- Use `expo-location` for geolocation
- Implement radius-based filtering
- Cache user location
- Map integration for service area display

### 8.4 Calendar & Scheduling
- Use calendar library for schedule display
- Date picker for contract/subscription dates
- Time picker for preferred times
- Recurrence pattern handling
- Next service date calculation

### 8.5 Payment Integration
- Payment method selection
- Auto-pay configuration
- Payment history display
- Payment status tracking
- Integration with Finance feature

### 8.6 Performance
- Implement pagination (don't load all items at once)
- Use FlatList for efficient list rendering
- Image lazy loading
- Debounce search input
- Cache API responses
- Optimize image sizes

### 8.7 Form Management
- Multi-step form state management
- Form validation (client-side)
- Auto-save drafts
- Progress indicators
- Error handling and display

---

## 9. Testing Requirements

### 9.1 Unit Tests
- Service filtering logic
- Contract status transitions
- Subscription status transitions
- Pricing calculations
- Schedule calculations
- Form validation

### 9.2 Integration Tests
- API service methods
- Image/document upload
- Contract creation flow
- Subscription creation flow
- Payment processing

### 9.3 E2E Tests
- Complete contract creation flow
- Complete subscription creation flow
- Service booking flow
- Document upload flow
- Status update flows

---

## 10. Accessibility Considerations

- Screen reader support for service/contract/subscription cards
- Keyboard navigation for forms
- High contrast mode support
- Touch target sizes (minimum 44x44)
- Alt text for images
- ARIA labels for interactive elements
- Form error announcements
- Status announcements

---

## 11. Data Models Alignment

### Current Type Definitions vs. API Models

**Current** (`packages/types/facility-care.ts`):
```typescript
interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  // ... basic fields
}

interface FacilityService {
  id: string;
  facilityId: string;
  name: string;
  // ... basic fields
}
```

**Required** (Based on FACILITY_CARE_FEATURES.md):
- Full FacilityCareService model with:
  - Pricing (type, basePrice, currency)
  - Service area (array of zip codes/cities)
  - Availability (schedule with days, times, timezone)
  - Features and requirements arrays
  - Images array
  - Rating object
- Full Contract model with:
  - Facility object (name, address, size, type)
  - Contract details (startDate, endDate, duration, frequency, scope, specialRequirements)
  - Pricing (basePrice, frequency, additionalFees, totalAmount, currency)
  - Payment (terms, method, autoPay)
  - Performance (serviceLevel, kpis array)
  - Documents array
  - Reviews array
- Full Subscription model with:
  - Subscription type
  - Plan object (name, features, frequency, price, currency)
  - Schedule (startDate, nextService, lastService, serviceHistory)
  - Payment (method, autoPay, lastPayment, nextPayment, paymentHistory)
  - Preferences (preferredTime, contactMethod, specialInstructions)

**Action Required**: Update type definitions to match API models.

---

## 12. Next Steps

1. **Update Type Definitions** - Align `packages/types/facility-care.ts` with API models
2. **Implement API Service** - Complete all methods in `packages/facility-care/services.ts`
3. **Build Core Components** - ServiceCard, ContractCard, SubscriptionCard, etc.
4. **Create Service Detail Screen** - Full service information display
5. **Create Contract Detail Screen** - Full contract information with documents and KPIs
6. **Create Subscription Detail Screen** - Full subscription info with history
7. **Build Contract Creation Flow** - Multi-step form with all steps
8. **Build Subscription Creation Flow** - Multi-step form with all steps
9. **Add Image/Document Upload** - Image and document picker functionality
10. **Enhance Existing Screens** - API integration, real data, pagination

---

## 13. Related Documentation

- `FACILITY_CARE_FEATURES.md` - Full feature documentation
- `API_INTEGRATION.md` - API integration guidelines
- `packages/facility-care/` - Package implementation
- `packages/types/facility-care.ts` - Type definitions (needs update)

---

*Last Updated: Based on current codebase analysis and FACILITY_CARE_FEATURES.md*

