# LocalPro Monorepo Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Platform**
   ```bash
   npm run android  # Android
   npm run ios       # iOS
   npm run web       # Web
   ```

## Project Structure

### Apps
- `apps/localpro/` - Main Expo application

### Packages

#### Shared Packages
- `packages/types/` - TypeScript type definitions for all features
- `packages/utils/` - Utility functions (formatting, validation, dates, currency)
- `packages/ui/` - Reusable UI components (Button, Card, Input, Loading)

#### Feature Packages
All feature packages follow the same structure:
- `index.ts` - Main exports
- `services.ts` - API/service layer (to be implemented)
- `hooks.ts` - React hooks (where applicable)
- `components.tsx` - React components (where applicable)

**Available Feature Packages:**
1. `@localpro/auth` - Authentication & User Management
2. `@localpro/marketplace` - Marketplace (Services & Bookings)
3. `@localpro/job-board` - Job Board
4. `@localpro/referrals` - Referrals
5. `@localpro/agencies` - Agencies
6. `@localpro/supplies` - Supplies
7. `@localpro/academy` - Academy/Courses
8. `@localpro/finance` - Finance (Wallet, Transactions)
9. `@localpro/rentals` - Rentals
10. `@localpro/ads` - Ads
11. `@localpro/facility-care` - FacilityCare
12. `@localpro/subscriptions` - Subscriptions (LocalPro Plus)
13. `@localpro/trust` - Trust Verification
14. `@localpro/communication` - Communication (Chat, Notifications)
15. `@localpro/partners` - Partners

## Using Packages

### Import Types
```typescript
import type { User, Service, Booking } from '@localpro/types';
```

### Import Utilities
```typescript
import { formatCurrency, formatDate, isValidEmail } from '@localpro/utils';
```

### Import UI Components
```typescript
import { Button, Card, Input, Loading } from '@localpro/ui';
```

### Import Feature Packages
```typescript
import { useAuth } from '@localpro/auth';
import { MarketplaceService } from '@localpro/marketplace';
import { useJobs } from '@localpro/job-board';
```

## Next Steps

1. **Implement API Services**: Update the service files in each package to connect to your backend
2. **Add Components**: Create React components for each feature in their respective packages
3. **Add Hooks**: Create custom hooks for data fetching and state management
4. **Configure Routing**: Set up Expo Router routes for each feature
5. **Add State Management**: Consider adding a state management solution (Redux, Zustand, etc.)
6. **Add Testing**: Set up testing infrastructure for packages and app

## Metro Configuration

This project uses Expo SDK 54, which automatically configures Metro for monorepos. The `metro.config.js` in `apps/localpro/` uses the default Expo config that handles workspace resolution automatically.

## TypeScript Configuration

- Root `tsconfig.json` - Base configuration
- `apps/localpro/tsconfig.json` - App-specific config with path mappings
- `packages/types/tsconfig.json` - Types package config

## Workspace Dependencies

All packages use workspace dependencies (`"*"`) to reference other packages. This ensures you're always using the local version of packages during development.

## Notes

- All packages are private and scoped under `@localpro/`
- Services in packages currently have placeholder implementations
- UI components are basic implementations that can be extended
- Types are comprehensive and ready to use

