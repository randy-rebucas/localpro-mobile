# PayMongo API Endpoints

## Overview

PayMongo is the primary payment gateway for the LocalPro Super App, handling payment intents, charges, refunds, and escrow transactions for the Philippines market.

**Base Path:** `/api/paymongo`

---

## 📋 Table of Contents

1. [Payment Intent Endpoints](#payment-intent-endpoints)
2. [Payment Confirmation Endpoints](#payment-confirmation-endpoints)
3. [Charge Endpoints](#charge-endpoints)
4. [Refund Endpoints](#refund-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Webhook Endpoints](#webhook-endpoints)
7. [Request/Response Examples](#requestresponse-examples)

---

## 💳 Payment Intent Endpoints

### 1. Create Payment Intent

Creates a payment authorization (hold) for escrow transactions.

**Endpoint:** `POST /api/paymongo/create-intent`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required

#### Request Body

```json
{
  "bookingId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "providerId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "amount": 1500,
  "currency": "PHP"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookingId` | String | Yes | Booking ID for the transaction |
| `providerId` | String | Yes | Provider ID receiving payment |
| `amount` | Number | Yes | Amount in PHP (will be converted to cents) |
| `currency` | String | No | Currency code (default: "PHP") |

#### Response (Success - 201)

```json
{
  "success": true,
  "data": {
    "intentId": "pi_123456789",
    "clientSecret": "pi_123456789_secret_xyz",
    "publishableKey": "pk_test_xxxxxxxxxxxxx",
    "amount": 1500,
    "currency": "PHP"
  },
  "message": "Payment intent created successfully"
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "Missing required fields: bookingId, providerId, amount"
}
```

#### Response (Error - 500)

```json
{
  "success": false,
  "message": "Error message"
}
```

---

### 2. Get Payment Intent Details

Retrieves details of a specific payment intent.

**Endpoint:** `GET /api/paymongo/intent/:intentId`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intentId` | String | Yes | PayMongo payment intent ID |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "id": "pi_123456789",
    "status": "awaiting_payment_method",
    "amount": 150000,
    "currency": "PHP",
    "charges": []
  }
}
```

#### Response (Error - 404)

```json
{
  "success": false,
  "message": "Payment intent not found"
}
```

---

## ✅ Payment Confirmation Endpoints

### 3. Confirm Payment

Confirms a payment with a payment method and creates an escrow.

**Endpoint:** `POST /api/paymongo/confirm-payment`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required

#### Request Body

```json
{
  "intentId": "pi_123456789",
  "paymentMethodId": "pm_987654321",
  "bookingId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "providerId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "amount": 1500,
  "currency": "PHP"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intentId` | String | Yes | Payment intent ID from create-intent |
| `paymentMethodId` | String | Yes | Payment method ID from client-side |
| `bookingId` | String | No | Booking ID (for escrow creation) |
| `providerId` | String | No | Provider ID (for escrow creation) |
| `amount` | Number | No | Amount (for escrow creation) |
| `currency` | String | No | Currency (for escrow creation) |

#### Response (Success - 201)

```json
{
  "success": true,
  "data": {
    "escrow": {
      "_id": "escrow_id",
      "bookingId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "status": "FUNDS_HELD",
      "amount": 1500,
      "currency": "PHP"
    },
    "payment": {
      "intentId": "pi_123456789",
      "status": "succeeded",
      "chargeId": "ch_123456789"
    }
  },
  "message": "Payment confirmed and escrow created"
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "Missing required fields: intentId, paymentMethodId"
}
```

---

## 💰 Charge Endpoints

### 4. Get Charge Details

Retrieves details of a specific charge.

**Endpoint:** `GET /api/paymongo/charge/:chargeId`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chargeId` | String | Yes | PayMongo charge ID |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "id": "ch_123456789",
    "status": "paid",
    "amount": 150000,
    "currency": "PHP",
    "receipt_number": "RCP-123456789",
    "fees": {
      "amount": 3000,
      "currency": "PHP"
    }
  }
}
```

#### Response (Error - 404)

```json
{
  "success": false,
  "message": "Charge not found"
}
```

---

## 🔄 Refund Endpoints

### 5. Create Refund

Creates a refund for a charge (full or partial).

**Endpoint:** `POST /api/paymongo/refund`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required

#### Request Body

```json
{
  "chargeId": "ch_123456789",
  "amount": 500,
  "reason": "customer_request"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chargeId` | String | Yes | Charge ID to refund |
| `amount` | Number | No | Refund amount (if not provided, full refund) |
| `reason` | String | No | Refund reason (default: "customer_request") |

#### Response (Success - 201)

```json
{
  "success": true,
  "data": {
    "refundId": "rf_123456789",
    "status": "pending",
    "amount": 50000
  },
  "message": "Refund created successfully"
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "Charge ID is required"
}
```

---

### 6. Get Refund Details

Retrieves details of a specific refund.

**Endpoint:** `GET /api/paymongo/refund/:refundId`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refundId` | String | Yes | PayMongo refund ID |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "id": "rf_123456789",
    "status": "succeeded",
    "amount": 50000,
    "reason": "customer_request",
    "charge_id": "ch_123456789",
    "receipt_number": "RCP-REF-123456789"
  }
}
```

#### Response (Error - 404)

```json
{
  "success": false,
  "message": "Refund not found"
}
```

---

## 👨‍💼 Admin Endpoints

### 7. List Payment Intents

Lists all payment intents (admin only).

**Endpoint:** `GET /api/paymongo/intents`  
**Access:** Private (Admin Only)  
**Authentication:** Bearer Token + Admin Role Required

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | Number | No | Number of results (default: 20) |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": [
    {
      "id": "pi_123456789",
      "status": "succeeded",
      "amount": 150000,
      "currency": "PHP",
      "created_at": 1234567890
    }
  ],
  "pagination": {
    "has_more": false,
    "limit": 20
  }
}
```

---

### 8. List Charges

Lists all charges (admin only).

**Endpoint:** `GET /api/paymongo/charges`  
**Access:** Private (Admin Only)  
**Authentication:** Bearer Token + Admin Role Required

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | Number | No | Number of results (default: 20) |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": [
    {
      "id": "ch_123456789",
      "status": "paid",
      "amount": 150000,
      "currency": "PHP",
      "receipt_number": "RCP-123456789",
      "created_at": 1234567890
    }
  ],
  "pagination": {
    "has_more": false,
    "limit": 20
  }
}
```

---

## 🔔 Webhook Endpoints

### 9. PayMongo Webhook Handler

Handles PayMongo webhook events for payment status updates.

**Endpoint:** `POST /webhooks/payments/paymongo`  
**Access:** Public (Webhook Secret Verification)  
**Authentication:** Webhook Signature Verification

#### Webhook Events Handled

- `payment_intent.payment_failed` - Payment failed
- `payment_intent.succeeded` - Payment succeeded
- `payment_intent.awaiting_next_action` - Payment requires action
- `charge.created` - Charge created
- `charge.updated` - Charge updated
- `charge.refunded` - Charge refunded

#### Webhook Payload Example

```json
{
  "data": {
    "id": "pi_123456789",
    "type": "payment_intent",
    "attributes": {
      "status": "succeeded",
      "amount": 150000,
      "currency": "PHP"
    }
  },
  "type": "payment_intent.succeeded"
}
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## 📝 Request/Response Examples

### Complete Payment Flow Example

#### Step 1: Create Payment Intent

```bash
curl -X POST https://api.localpro.com/api/paymongo/create-intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "providerId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "amount": 1500,
    "currency": "PHP"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "intentId": "pi_123456789",
    "clientSecret": "pi_123456789_secret_xyz",
    "publishableKey": "pk_test_xxxxxxxxxxxxx",
    "amount": 1500,
    "currency": "PHP"
  }
}
```

#### Step 2: Client-Side Payment Method Creation

```javascript
// Using PayMongo.js SDK on client
const paymentMethod = await paymongo.paymentMethods.create({
  type: 'card',
  details: {
    cardNumber: '4111111111111111',
    expMonth: 12,
    expYear: 2025,
    cvc: '123'
  },
  billing: {
    name: 'Juan dela Cruz',
    email: 'juan@example.com',
    phone: '+639123456789'
  }
});
```

#### Step 3: Confirm Payment

```bash
curl -X POST https://api.localpro.com/api/paymongo/confirm-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intentId": "pi_123456789",
    "paymentMethodId": "pm_987654321",
    "bookingId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "providerId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "amount": 1500,
    "currency": "PHP"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "escrow": {
      "_id": "escrow_id",
      "status": "FUNDS_HELD",
      "amount": 1500
    },
    "payment": {
      "intentId": "pi_123456789",
      "status": "succeeded",
      "chargeId": "ch_123456789"
    }
  }
}
```

---

## 🔐 Authentication

All endpoints (except webhooks) require:

1. **JWT Token** in Authorization header:
   ```
   Authorization: Bearer <jwt_token>
   ```

2. **Admin Endpoints** require admin role:
   - User must have `roles: ['admin']` in their profile

3. **Webhook Endpoints** require:
   - Valid webhook signature verification
   - Webhook secret from `PAYMONGO_WEBHOOK_SECRET` env variable

---

## ⚙️ Environment Variables

Required environment variables:

```env
# PayMongo API Keys
PAYMONGO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYMONGO_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYMONGO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Webhook URL (configured in PayMongo Dashboard)
PAYMONGO_WEBHOOK_URL=https://your-domain.com/webhooks/payments?provider=paymongo
```

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🎯 Payment Intent Statuses

| Status | Description |
|--------|-------------|
| `awaiting_payment_method` | Waiting for payment method |
| `awaiting_next_action` | Requires additional action (3DS) |
| `processing` | Payment is being processed |
| `succeeded` | Payment succeeded |
| `payment_failed` | Payment failed |

---

## 💳 Charge Statuses

| Status | Description |
|--------|-------------|
| `pending` | Charge is pending |
| `paid` | Charge is paid |
| `failed` | Charge failed |
| `refunded` | Charge was refunded |

---

## 🔄 Refund Statuses

| Status | Description |
|--------|-------------|
| `pending` | Refund is pending |
| `succeeded` | Refund succeeded |
| `failed` | Refund failed |

---

## 🔗 Related Endpoints

### Marketplace Booking Endpoints

- `POST /api/marketplace/bookings` - Create booking with PayMongo payment
- `GET /api/marketplace/bookings/:id` - Get booking with payment details

### Escrow Endpoints

- `GET /api/escrows` - List escrows (includes PayMongo escrows)
- `GET /api/escrows/:id` - Get escrow details
- `POST /api/escrows/:id/capture` - Capture payment from escrow

### Finance Endpoints

- `POST /api/finance/top-up` - Top-up wallet with PayMongo
- `POST /api/finance/withdraw` - Withdraw using PayMongo

---

## 📚 Additional Resources

- [PayMongo API Documentation](https://developers.paymongo.com/docs)
- [PayMongo Dashboard](https://dashboard.paymongo.com)
- [PayMongo.js SDK](https://github.com/paymongo/paymongo-js)

---

## ⚠️ Important Notes

1. **Amount Conversion**: Amounts are automatically converted to cents (PHP × 100) when sent to PayMongo
2. **Authorization vs Capture**: 
   - `create-intent` creates an authorization (hold) - funds are reserved but not captured
   - Capture happens when service is completed via escrow capture endpoint
3. **Webhook Security**: Always verify webhook signatures to prevent fraud
4. **Test Mode**: Use test keys (`pk_test_` and `sk_test_`) for development
5. **Production**: Switch to live keys (`pk_live_` and `sk_live_`) for production

---

This documentation covers all PayMongo endpoints available in the LocalPro Super App.

