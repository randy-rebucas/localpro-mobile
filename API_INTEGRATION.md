# API Integration Documentation

## Overview

The LocalPro app is now integrated with the production API at `https://localpro-super-app.onrender.com`. All API calls are secured with Bearer token authentication and use secure storage for token management.

## Security Features

### 1. Secure Token Storage
- **Native (iOS/Android)**: Uses `expo-secure-store` for encrypted token storage
- **Web**: Uses `localStorage` as fallback
- Tokens are automatically included in API requests via Authorization header

### 2. API Client
- Centralized API client with base URL configuration
- Automatic token injection in request headers
- Request timeout handling (30 seconds)
- Comprehensive error handling with status codes

### 3. Authentication Flow
- Phone-based authentication with OTP verification
- Secure token storage after successful authentication
- Automatic token refresh on API calls
- Token cleanup on logout or authentication failure

## Package Structure

### `@localpro/api`
Centralized API client package:
- `config.ts`: API configuration (base URL, endpoints, headers)
- `client.ts`: HTTP client with token management

### `@localpro/storage`
Secure storage package:
- `secure-storage.ts`: Platform-agnostic secure storage utility
- Uses `expo-secure-store` on native, `localStorage` on web

## API Endpoints

### Authentication Endpoints

#### Send OTP
```
POST /api/auth/send-otp
Body: { phone: string }
Response: { success: boolean, message?: string, sessionId?: string }
```

#### Verify OTP
```
POST /api/auth/verify-otp
Body: { phone: string, code: string, sessionId: string }
Response: { 
  success: boolean, 
  user?: User, 
  token?: string, 
  isNewUser: boolean 
}
```

#### Complete Onboarding
```
POST /api/auth/complete-onboarding
Headers: { Authorization: Bearer <token> }
Body: { name: string, email?: string, avatar?: string, phone: string }
Response: { user: User }
```

#### Get Current User
```
GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user: User }
```

#### Logout
```
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success: boolean }
```

## Usage

### Making API Calls

```typescript
import { apiClient } from '@localpro/api';
import { API_ENDPOINTS } from '@localpro/api';

// GET request
const user = await apiClient.get<User>(API_ENDPOINTS.auth.getCurrentUser);

// POST request
const response = await apiClient.post<ResponseType>(
  API_ENDPOINTS.auth.sendOTP,
  { phone: '+1234567890' }
);
```

### Token Management

```typescript
import { SecureStorage } from '@localpro/storage';

// Store token
await SecureStorage.setToken(token);

// Get token
const token = await SecureStorage.getToken();

// Remove token
await SecureStorage.removeToken();
```

## Error Handling

The API client throws `ApiError` objects with:
- `message`: Human-readable error message
- `status`: HTTP status code
- `code`: Optional error code from API

```typescript
try {
  await apiClient.post('/endpoint', data);
} catch (error: ApiError) {
  console.error(error.message);
  console.error(error.status);
}
```

## Configuration

API configuration is in `packages/api/config.ts`:

```typescript
export const API_CONFIG = {
  baseURL: 'https://localpro-super-app.onrender.com',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
```

## Security Best Practices

1. **Token Storage**: Always use `SecureStorage` instead of plain storage
2. **HTTPS Only**: All API calls use HTTPS
3. **Token Expiration**: Handle 401 responses by clearing tokens and redirecting to login
4. **Request Timeout**: 30-second timeout prevents hanging requests
5. **Error Handling**: Never expose sensitive error details to users

## Next Steps

1. **Update API Endpoints**: Verify and update endpoint paths based on actual API documentation
2. **Add Refresh Token**: Implement token refresh mechanism if API supports it
3. **Add Request Interceptors**: Add logging, retry logic, or request transformation
4. **Add Response Interceptors**: Add response transformation or caching
5. **Environment Variables**: Move API URL to environment variables for different environments

## Testing

To test the API integration:

1. **Send OTP**: Enter phone number and verify OTP is sent
2. **Verify OTP**: Enter OTP code and verify token is stored securely
3. **Get User**: Verify authenticated requests include Bearer token
4. **Logout**: Verify token is removed from storage

## API Documentation

The API provides a Postman collection at:
`https://localpro-super-app.onrender.com/LocalPro-Super-App-API.postman_collection.json`

For detailed API documentation, contact:
- Support: api-support@localpro.com
- Technical: tech@localpro.com

