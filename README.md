# LocalPro Super App - Monorepo

A comprehensive super app built with Expo and organized in a monorepo structure following [Expo's monorepo documentation](https://docs.expo.dev/guides/monorepos/).

## Project Structure

```
localpro/
├── apps/
│   └── localpro/          # Main Expo app
├── packages/              # Shared packages
│   ├── types/            # Shared TypeScript types
│   ├── utils/           # Shared utilities
│   ├── ui/               # Shared UI components
│   ├── auth/             # Authentication & User Management
│   ├── marketplace/      # Marketplace (Services & Bookings)
│   ├── job-board/        # Job Board
│   ├── referrals/        # Referrals
│   ├── agencies/         # Agencies
│   ├── supplies/         # Supplies
│   ├── academy/          # Academy/Courses
│   ├── finance/          # Finance (Wallet, Transactions)
│   ├── rentals/          # Rentals
│   ├── ads/              # Ads
│   ├── facility-care/    # FacilityCare
│   ├── subscriptions/    # Subscriptions (LocalPro Plus)
│   ├── trust/            # Trust Verification
│   ├── communication/    # Communication (Chat, Notifications)
│   └── partners/         # Partners
└── package.json          # Root package.json with workspaces
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm, yarn, pnpm, or bun

### Installation

1. Install dependencies from the root directory:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

Or run platform-specific commands:

```bash
npm run android
npm run ios
npm run web
```

## Workspace Packages

All packages are organized under the `@localpro/` namespace:

### Shared Packages

- **@localpro/types** - Shared TypeScript type definitions
- **@localpro/utils** - Shared utility functions (formatting, validation, dates, currency)
- **@localpro/ui** - Shared UI components (Button, Card, Input, Loading)

### Feature Packages

- **@localpro/auth** - Authentication & User Management
- **@localpro/marketplace** - Marketplace (Services & Bookings)
- **@localpro/job-board** - Job Board
- **@localpro/referrals** - Referrals
- **@localpro/agencies** - Agencies
- **@localpro/supplies** - Supplies
- **@localpro/academy** - Academy/Courses
- **@localpro/finance** - Finance (Wallet, Transactions)
- **@localpro/rentals** - Rentals
- **@localpro/ads** - Ads
- **@localpro/facility-care** - FacilityCare
- **@localpro/subscriptions** - Subscriptions (LocalPro Plus)
- **@localpro/trust** - Trust Verification
- **@localpro/communication** - Communication (Chat, Notifications)
- **@localpro/partners** - Partners

## Using Packages in the App

Import packages in your app code:

```typescript
import { useAuth } from '@localpro/auth';
import { Button, Card } from '@localpro/ui';
import { formatCurrency } from '@localpro/utils';
import type { User, Service } from '@localpro/types';
```

## Metro Configuration

This project uses Expo SDK 54, which automatically configures Metro for monorepos. The `metro.config.js` in the app directory uses the default Expo Metro config, which handles workspace resolution automatically.

## Development

### Adding a New Package

1. Create a new directory in `packages/`
2. Add a `package.json` with the `@localpro/` namespace
3. Add the package as a dependency in `apps/localpro/package.json`
4. Run `npm install` from the root

### TypeScript Configuration

Each package can have its own `tsconfig.json`, but the main app's `tsconfig.json` includes paths to all packages for proper type resolution.

## Notes

- All packages use workspace dependencies (`"*"`) to reference other packages
- The root `package.json` defines workspaces for `apps/*` and `packages/*`
- Expo automatically detects and configures the monorepo structure
- Since we're using Expo SDK 54, Metro handles monorepo resolution automatically

## Resources

- [Expo Monorepo Documentation](https://docs.expo.dev/guides/monorepos/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
