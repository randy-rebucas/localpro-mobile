# LocalPro - Local Service Provider App

A React Native app built with Expo for connecting users with local service providers. Features Firebase Authentication and Firestore for data management.

## Features

- 🔐 **Firebase Authentication** - Secure user registration and login
- 📊 **Firestore Database** - Real-time data storage and retrieval
- 🏠 **Service Discovery** - Browse and search for local services
- 👥 **Provider Profiles** - View service provider details and ratings
- 📱 **Modern UI** - Beautiful, responsive design with smooth animations
- 🔍 **Search Functionality** - Find services quickly with real-time search
- ⭐ **Rating System** - Provider ratings and reviews
- 📅 **Booking System** - Schedule appointments with providers

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth + Firestore)
- **UI Components**: Custom components with Expo Linear Gradient
- **Icons**: Expo Vector Icons (Ionicons)
- **State Management**: React Context API
- **Navigation**: Expo Router

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase project (see [Firebase Setup Guide](./FIREBASE_SETUP.md))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd localpro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Follow the [Firebase Setup Guide](./FIREBASE_SETUP.md)
   - Update `lib/firebase.ts` with your Firebase configuration

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Use Expo Go app to scan the QR code
   - Or run on iOS simulator: `npm run ios`
   - Or run on Android emulator: `npm run android`

## Project Structure

```
localpro/
├── app/                    # Expo Router pages
├── components/             # Reusable UI components
│   ├── FindServiceScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   └── ...
├── contexts/              # React Context providers
│   └── AuthContext.tsx
├── lib/                   # Firebase configuration and services
│   ├── firebase.ts        # Firebase initialization
│   └── firestore.ts       # Firestore operations
├── assets/                # Images, fonts, etc.
└── ...
```

## Firebase Configuration

The app uses Firebase for:
- **Authentication**: User registration and login
- **Firestore**: Database for services, providers, bookings, and reviews

### Collections Structure

- `services` - Available service categories
- `providers` - Service provider profiles
- `users` - User profiles
- `bookings` - User bookings
- `reviews` - Provider reviews

## Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the [Firebase Setup Guide](./FIREBASE_SETUP.md)
- Review the [Expo documentation](https://docs.expo.dev/)
- Open an issue on GitHub
