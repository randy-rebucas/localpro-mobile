# Supplies Features Analysis for Mobile App

## Executive Summary

This document provides a comprehensive analysis of the Supplies features as documented in `SUPPLIES_FEATURES.md` and their implementation requirements for the mobile app. The Supplies feature provides an e-commerce marketplace for equipment, tools, materials, and cleaning supplies, enabling suppliers to list products and customers to browse, order, and review supplies.

---

## 1. Feature Overview

### Core Capabilities
The Supplies feature enables:
- **Product Management** - Create, update, and manage product listings with images and SKU tracking
- **Product Discovery** - Browse, search, and filter products by category, location, price, and availability
- **Inventory Management** - Real-time stock tracking with low stock alerts
- **Order Management** - Place orders, track status, and manage fulfillment
- **Pricing Management** - Retail and wholesale pricing with multi-currency support
- **Review & Rating System** - Rate and review purchased products
- **Subscription Support** - Recurring orders and subscription kits
- **Location Services** - Geospatial search to find nearby products
- **Supplier Dashboard** - Manage products, orders, inventory, and sales analytics
- **Customer Dashboard** - View orders, track deliveries, and manage reviews

---

## 2. Current Implementation Status

### ✅ Implemented
- **Package Structure**: Supplies package exists at `packages/supplies/`
- **Type Definitions**: Basic `Supply` and `SupplyOrder` interfaces defined
- **Service Stubs**: SuppliesService class with method stubs:
  - `getSupplies()` - Returns empty array
  - `createOrder()` - Throws error
  - `getOrders()` - Returns empty array
- **Tab Navigation**: Supplies tabs configured in `_layout.tsx`:
  - Shop (`shop.tsx`) - Browse products with search and filters
  - Orders (`orders.tsx`) - Order management screen
  - My Supplies (`my-supplies.tsx`) - Supplier's product management screen
- **UI Screens**: Basic UI implemented for all tabs with mock data

### ❌ Not Implemented
- **API Integration**: All service methods are stubs returning empty data
- **Product Detail Screen**: No detailed product view
- **Shopping Cart**: No cart functionality
- **Order Placement**: No order creation UI
- **Image Upload**: No image upload functionality for products
- **Inventory Management**: No stock tracking or low stock alerts
- **Location-Based Search**: No nearby products functionality
- **Review System**: No review submission UI
- **Pricing Display**: No retail/wholesale price differentiation
- **SKU Management**: No SKU tracking
- **Brand Management**: No brand organization
- **Subscription Support**: No subscription kit or recurring order functionality
- **Supplier Dashboard**: No sales analytics or performance metrics
- **Order Tracking**: No tracking number display or tracking screen
- **Search & Filtering**: Search exists but needs API integration and advanced filters
- **Category Browsing**: Category filters exist but need real data

---

## 3. Required Mobile App Screens

### 3.1 Primary Screens

#### A. Shop Screen (`shop.tsx` - Enhanced)
**Current State**: Good UI foundation, needs API integration  
**Required Features**:
- Product listing grid/list view toggle
- Search bar with real-time search
- Category filters (cleaning_supplies, tools, materials, equipment)
- Brand filter
- Price range filter
- Location filter (city, nearby)
- Availability filter (in stock only)
- Sort options (price, rating, newest, popularity)
- Featured products section
- Nearby products section (location-based)
- Pull-to-refresh
- Infinite scroll pagination
- Empty state handling
- Loading skeletons
- Add to cart functionality

**Key Components Needed**:
- ProductCard component (grid/list variants)
- CategoryFilter component
- BrandFilter component
- PriceRangeSlider component
- LocationFilter component
- SortDropdown component
- AddToCartButton component
- EmptyState component
- LoadingSkeleton component

**API Integration Required**:
- `GET /api/supplies?page={page}&limit={limit}&search={query}&category={cat}&location={loc}&minPrice={min}&maxPrice={max}&brand={brand}&sortBy={field}&sortOrder={order}`
- `GET /api/supplies/featured?limit={limit}`
- `GET /api/supplies/nearby?lat={lat}&lng={lng}&radius={radius}&page={page}&limit={limit}`

#### B. Product Detail Screen (New)
**Route**: `/(app)/supply/[id]`  
**Required Features**:
- Image carousel with multiple images
- Product name, title, description, and category
- Supplier information and profile link
- Pricing display:
  - Retail price
  - Wholesale price (if applicable)
  - Price per unit
  - Currency
- Inventory status:
  - In stock / Out of stock badge
  - Stock quantity (if available)
  - Low stock warning
- Specifications section:
  - Weight, dimensions
  - Material, color
  - Warranty information
- SKU display
- Brand information
- Location information:
  - Full address
  - Map view (if coordinates available)
  - Delivery area
- Reviews and ratings display:
  - Average rating
  - Rating distribution
  - Review list
- Quantity selector
- Add to cart button
- Order now button (direct order)
- Share functionality
- Report/flag product option
- Subscription eligibility indicator
- Subscription kit options (if applicable)

**Key Components Needed**:
- ImageCarousel component
- SupplierCard component
- PricingDisplay component
- InventoryStatusBadge component
- SpecificationsCard component
- LocationMap component
- ReviewList component
- QuantitySelector component
- AddToCartButton component
- OrderNowButton component
- SubscriptionKitSelector component

**API Integration Required**:
- `GET /api/supplies/:id` - Get product details

#### C. My Supplies Screen (`my-supplies.tsx` - Enhanced)
**Current State**: Good UI, needs API integration  
**Required Features**:
- Product list with search
- Filter by stock status (all, in-stock, out-of-stock)
- Add new product button
- Product cards showing:
  - Thumbnail image
  - Name and description
  - Category and brand
  - Price and unit
  - Stock status and quantity
  - Edit button
- Quick stats:
  - Total products
  - In stock products
  - Out of stock products
  - Low stock alerts
  - Total orders
  - Total revenue
- Low stock alerts section
- Navigate to product detail
- Navigate to add/edit product

**Key Components Needed**:
- ProductCard component (supplier view)
- QuickStatsCard component
- StockStatusBadge component
- LowStockAlertCard component
- EditProductButton component
- AddProductButton component

**API Integration Required**:
- `GET /api/supplies/my-supplies?page={page}&limit={limit}&search={query}&status={status}`
- `PUT /api/supplies/:id` - Update product
- `DELETE /api/supplies/:id` - Delete product

#### D. Orders Screen (`orders.tsx` - Enhanced)
**Current State**: Good UI, needs API integration  
**Required Features**:
- Order list with status filters:
  - All
  - Pending
  - Confirmed
  - Processing
  - Shipped
  - Delivered
  - Cancelled
- Order cards showing:
  - Order ID and date
  - Product items (with images)
  - Total amount
  - Status badge
  - Tracking number (if shipped)
- Order detail view:
  - Full order information
  - Product details
  - Delivery address
  - Contact information
  - Special instructions
  - Status timeline
  - Tracking information
- Customer actions:
  - Cancel order (if pending)
  - Track order (if shipped)
  - Add review (if delivered)
  - Contact supplier
- Supplier actions:
  - Confirm order
  - Update status
  - Add tracking number
  - View customer profile
- Pull-to-refresh
- Empty state handling

**Key Components Needed**:
- OrderCard component
- OrderStatusBadge component
- OrderDetailModal component
- StatusTimeline component
- TrackingInfoCard component
- CancelOrderButton component
- TrackOrderButton component

**API Integration Required**:
- `GET /api/supplies/my-orders?page={page}&limit={limit}&status={status}` - Get user's orders
- `PUT /api/supplies/:id/orders/:orderId/status` - Update order status
- `DELETE /api/supplies/:id/orders/:orderId` - Cancel order

### 3.2 Secondary Screens

#### E. Shopping Cart Screen (New)
**Route**: `/(app)/supplies/cart`  
**Required Features**:
- Cart items list:
  - Product image
  - Product name
  - Quantity selector
  - Price per unit
  - Total price
  - Remove item button
- Cart summary:
  - Subtotal
  - Delivery fee (if applicable)
  - Total amount
- Delivery address selection
- Special instructions input
- Checkout button
- Empty cart state
- Continue shopping button

**Key Components Needed**:
- CartItemCard component
- QuantitySelector component
- CartSummary component
- DeliveryAddressSelector component
- CheckoutButton component

**API Integration Required**:
- Local state management for cart (or API if cart is server-side)

#### F. Checkout Screen (New)
**Route**: `/(app)/supplies/checkout`  
**Required Features**:
- Order summary:
  - Product list
  - Quantity and prices
  - Subtotal
  - Delivery fee
  - Total
- Delivery address:
  - Address selection
  - Add new address option
  - Special instructions
- Contact information:
  - Phone number
  - Email
- Payment method selection
- Terms and conditions acceptance
- Place order button
- Cancel button
- Form validation
- Stock availability check

**Key Components Needed**:
- OrderSummaryCard component
- DeliveryAddressForm component
- ContactInfoForm component
- PaymentMethodSelector component
- TermsCheckbox component
- PlaceOrderButton component

**API Integration Required**:
- `POST /api/supplies/:id/order` - Create order (for single product)
- `POST /api/supplies/orders` - Create order (for cart)

#### G. Add/Edit Product Screen (New)
**Route**: `/(app)/supplies/add` or `/(app)/supplies/edit/[id]`  
**Required Features**:
- Basic information:
  - Name/title
  - Description
  - Category and subcategory
  - Brand
  - SKU
  - Tags
- Pricing section:
  - Retail price
  - Wholesale price (optional)
  - Currency selection
  - Unit (piece, box, pack, etc.)
- Inventory section:
  - Quantity
  - Minimum stock threshold
  - Maximum stock (optional)
  - Warehouse/location
- Specifications section:
  - Weight
  - Dimensions
  - Material
  - Color
  - Warranty
- Location section:
  - Address input
  - Map picker for coordinates (optional)
  - Delivery area definition
- Media section:
  - Image upload (multiple)
  - Image reordering
  - Image deletion
- Subscription section:
  - Subscription eligible toggle
  - Subscription kit configuration (if applicable)
- Save/Cancel buttons
- Form validation
- Image optimization before upload

**Key Components Needed**:
- ProductForm component
- PricingInput component
- InventoryInput component
- SpecificationsForm component
- LocationPicker component
- ImageUploader component
- SubscriptionSettings component

**API Integration Required**:
- `POST /api/supplies` - Create product
- `PUT /api/supplies/:id` - Update product
- `POST /api/supplies/:id/images` - Upload images
- `DELETE /api/supplies/:id/images/:imageId` - Delete image

#### H. Order Tracking Screen (New)
**Route**: `/(app)/supplies/orders/[id]/track`  
**Required Features**:
- Order information:
  - Order ID
  - Order date
  - Expected delivery date
- Status timeline:
  - Pending
  - Confirmed
  - Processing
  - Shipped
  - Delivered
- Tracking information:
  - Tracking number
  - Carrier information
  - Current location (if available)
- Delivery address
- Contact information
- Map view (if tracking available)
- Contact supplier button

**Key Components Needed**:
- OrderInfoCard component
- StatusTimeline component
- TrackingInfoCard component
- TrackingMap component
- ContactSupplierButton component

**API Integration Required**:
- `GET /api/supplies/orders/:id` - Get order details
- External tracking API integration (if applicable)

#### I. Product Reviews Screen (New)
**Route**: `/(app)/supply/[id]/reviews`  
**Required Features**:
- Reviews list with pagination
- Review cards showing:
  - User avatar and name
  - Rating (stars)
  - Comment
  - Date
- Average rating display
- Rating distribution chart
- Filter by rating
- Add review button (if user has purchased)
- Review form modal

**Key Components Needed**:
- ReviewList component
- ReviewCard component
- RatingDisplay component
- RatingDistributionChart component
- ReviewFormModal component

**API Integration Required**:
- `GET /api/supplies/:id/reviews?page={page}&limit={limit}&rating={rating}`
- `POST /api/supplies/:id/reviews` - Add review

#### J. Supplier Dashboard Screen (New)
**Route**: `/(app)/supplies/dashboard`  
**Required Features**:
- Overview statistics:
  - Total products
  - Active orders
  - Total revenue
  - Average rating
- Performance metrics:
  - Orders over time (chart)
  - Revenue over time (chart)
  - Top selling products
  - Low stock alerts
- Recent orders list
- Quick actions:
  - Add new product
  - View all orders
  - Manage inventory

**Key Components Needed**:
- StatsCard component
- PerformanceChart component
- RecentOrdersList component
- QuickActionsGrid component
- LowStockAlertsList component

**API Integration Required**:
- `GET /api/supplies/statistics` - Get supplier statistics (admin endpoint, may need user-specific)

---

## 4. Feature Breakdown

### 4.1 High Priority Features

#### Product Discovery & Browsing
- **Status**: UI exists, needs API integration
- **Screens**: `shop.tsx`
- **API Endpoints**:
  - `GET /api/supplies` - Get products with filters
  - `GET /api/supplies/featured` - Get featured products
  - `GET /api/supplies/nearby` - Get nearby products
- **Implementation Notes**:
  - Implement pagination
  - Add advanced filtering
  - Integrate location-based search
  - Add sorting options
  - Implement shopping cart

#### Product Detail View
- **Status**: Not implemented
- **Screens**: New screen needed
- **API Endpoints**:
  - `GET /api/supplies/:id` - Get product details
- **Implementation Notes**:
  - Display all product information
  - Show inventory status
  - Display reviews
  - Enable add to cart and order actions

#### Order Management
- **Status**: UI exists, needs API integration
- **Screens**: `orders.tsx`
- **API Endpoints**:
  - `GET /api/supplies/my-orders` - Get user's orders
  - `PUT /api/supplies/:id/orders/:orderId/status` - Update status
- **Implementation Notes**:
  - Status updates
  - Order cancellation
  - Tracking integration
  - Customer/supplier views

#### My Supplies Management
- **Status**: UI exists, needs API integration
- **Screens**: `my-supplies.tsx`
- **API Endpoints**:
  - `GET /api/supplies/my-supplies` - Get supplier's products
  - `PUT /api/supplies/:id` - Update product
- **Implementation Notes**:
  - Stock management
  - Edit product details
  - View order requests

### 4.2 Medium Priority Features

#### Shopping Cart & Checkout
- **Status**: Not implemented
- **Screens**: New screens needed
- **API Endpoints**:
  - `POST /api/supplies/orders` - Create order from cart
- **Implementation Notes**:
  - Cart state management
  - Multi-item checkout
  - Address management
  - Payment integration

#### Product Creation/Editing
- **Status**: Not implemented
- **Screens**: New screen needed
- **API Endpoints**:
  - `POST /api/supplies` - Create product
  - `PUT /api/supplies/:id` - Update product
  - `POST /api/supplies/:id/images` - Upload images
- **Implementation Notes**:
  - Multi-step form
  - Image upload with optimization
  - Form validation
  - SKU validation

#### Reviews & Ratings
- **Status**: Not implemented
- **Screens**: New screen needed
- **API Endpoints**:
  - `GET /api/supplies/:id/reviews` - Get reviews
  - `POST /api/supplies/:id/reviews` - Add review
- **Implementation Notes**:
  - Review submission
  - Rating display
  - Review filtering

### 4.3 Lower Priority Features

#### Location-Based Search
- **Status**: Not implemented
- **Screens**: `shop.tsx` (enhancement)
- **API Endpoints**:
  - `GET /api/supplies/nearby?lat={lat}&lng={lng}&radius={radius}`
- **Implementation Notes**:
  - Location permissions
  - Geospatial search
  - Distance calculation
  - Map integration

#### Inventory Management
- **Status**: Not implemented
- **Screens**: My Supplies, Dashboard
- **API Endpoints**:
  - Inventory updates included in product updates
- **Implementation Notes**:
  - Low stock alerts
  - Stock quantity tracking
  - Automatic updates on order

#### Subscription Support
- **Status**: Not implemented
- **Screens**: Product detail, checkout
- **API Endpoints**:
  - May need new endpoints for subscription kits
- **Implementation Notes**:
  - Subscription kit display
  - Recurring order setup
  - Subscription management

---

## 5. API Integration Requirements

### 5.1 Service Methods to Implement

```typescript
// packages/supplies/services.ts

export class SuppliesService {
  // Get all products with filters
  static async getSupplies(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    supplies: Supply[];
    pagination: PaginationInfo;
  }> {
    // GET /api/supplies?page={page}&limit={limit}&...
  }

  // Get product by ID
  static async getSupply(id: string): Promise<Supply> {
    // GET /api/supplies/:id
  }

  // Get featured products
  static async getFeaturedSupplies(limit?: number): Promise<Supply[]> {
    // GET /api/supplies/featured?limit={limit}
  }

  // Get nearby products
  static async getNearbySupplies(
    lat: number,
    lng: number,
    radius?: number,
    filters?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    supplies: Supply[];
    pagination: PaginationInfo;
  }> {
    // GET /api/supplies/nearby?lat={lat}&lng={lng}&radius={radius}&...
  }

  // Get product categories
  static async getCategories(): Promise<SupplyCategory[]> {
    // GET /api/supplies/categories
  }

  // Create product (supplier)
  static async createSupply(supply: CreateSupplyInput): Promise<Supply> {
    // POST /api/supplies
  }

  // Update product (supplier)
  static async updateSupply(id: string, updates: Partial<Supply>): Promise<Supply> {
    // PUT /api/supplies/:id
  }

  // Delete product (supplier)
  static async deleteSupply(id: string): Promise<void> {
    // DELETE /api/supplies/:id
  }

  // Upload product images
  static async uploadImages(
    id: string,
    images: File[]
  ): Promise<{
    images: ImageInfo[];
  }> {
    // POST /api/supplies/:id/images
    // multipart/form-data
  }

  // Delete product image
  static async deleteImage(id: string, imageId: string): Promise<void> {
    // DELETE /api/supplies/:id/images/:imageId
  }

  // Order product
  static async createOrder(
    supplyId: string,
    order: {
      quantity: number;
      deliveryAddress: {
        street: string;
        city: string;
        state?: string;
        zipCode?: string;
        country: string;
      };
      specialInstructions?: string;
      contactInfo: {
        phone: string;
        email: string;
      };
    }
  ): Promise<SupplyOrder> {
    // POST /api/supplies/:id/order
  }

  // Create order from cart
  static async createOrderFromCart(
    order: {
      items: {
        supplyId: string;
        quantity: number;
      }[];
      deliveryAddress: {
        street: string;
        city: string;
        state?: string;
        zipCode?: string;
        country: string;
      };
      specialInstructions?: string;
      contactInfo: {
        phone: string;
        email: string;
      };
    }
  ): Promise<SupplyOrder> {
    // POST /api/supplies/orders
  }

  // Get user's orders
  static async getOrders(
    userId: string,
    filters?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<{
    orders: SupplyOrder[];
    pagination: PaginationInfo;
  }> {
    // GET /api/supplies/my-orders?page={page}&limit={limit}&status={status}
  }

  // Get supplier's products
  static async getMySupplies(
    filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }
  ): Promise<{
    supplies: Supply[];
    pagination: PaginationInfo;
  }> {
    // GET /api/supplies/my-supplies?page={page}&limit={limit}&...
  }

  // Update order status
  static async updateOrderStatus(
    supplyId: string,
    orderId: string,
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
    trackingNumber?: string
  ): Promise<SupplyOrder> {
    // PUT /api/supplies/:id/orders/:orderId/status
  }

  // Cancel order
  static async cancelOrder(supplyId: string, orderId: string): Promise<void> {
    // DELETE /api/supplies/:id/orders/:orderId
  }

  // Get product reviews
  static async getReviews(
    supplyId: string,
    filters?: {
      page?: number;
      limit?: number;
      rating?: number;
    }
  ): Promise<{
    reviews: SupplyReview[];
    averageRating: number;
    pagination: PaginationInfo;
  }> {
    // GET /api/supplies/:id/reviews?page={page}&limit={limit}&rating={rating}
  }

  // Add product review
  static async addReview(
    supplyId: string,
    review: {
      rating: number;
      comment: string;
    }
  ): Promise<SupplyReview> {
    // POST /api/supplies/:id/reviews
  }
}
```

### 5.2 Required Type Definitions

```typescript
// packages/types/supplies.ts (needs expansion)

export interface Supply {
  id: string;
  name: string;
  title: string;
  description: string;
  category: 'cleaning_supplies' | 'tools' | 'materials' | 'equipment';
  subcategory: string;
  brand: string;
  sku: string;
  supplierId: string;
  supplier: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  pricing: {
    retailPrice: number;
    wholesalePrice?: number;
    currency: string;
  };
  inventory: {
    quantity: number;
    minStock: number;
    maxStock?: number;
    location?: string;
  };
  specifications: {
    weight?: string;
    dimensions?: string;
    material?: string;
    color?: string;
    warranty?: string;
  };
  location: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: {
    url: string;
    publicId: string;
    thumbnail: string;
    alt?: string;
  }[];
  reviews?: SupplyReview[];
  averageRating: number;
  views: number;
  isActive: boolean;
  isFeatured: boolean;
  isSubscriptionEligible: boolean;
  tags?: string[];
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyOrder {
  id: string;
  items: SupplyOrderItem[];
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  specialInstructions?: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  updatedAt: Date;
}

export interface SupplyOrderItem {
  supplyId: string;
  supply?: Supply;
  quantity: number;
  price: number;
}

export interface SupplyReview {
  id: string;
  supplyId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface SupplyCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface CreateSupplyInput {
  name: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  sku: string;
  pricing: {
    retailPrice: number;
    wholesalePrice?: number;
    currency: string;
  };
  inventory: {
    quantity: number;
    minStock: number;
    maxStock?: number;
    location?: string;
  };
  specifications: {
    weight?: string;
    dimensions?: string;
    material?: string;
    color?: string;
    warranty?: string;
  };
  location: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  unit: string;
  tags?: string[];
  isSubscriptionEligible?: boolean;
}
```

---

## 6. Mobile UI/UX Recommendations

### 6.1 Design Patterns

#### Product Cards
- **Grid View** - Compact cards with image, name, price, stock status
- **List View** - Horizontal cards with more details
- **Image First** - Prominent product image display
- **Price Prominence** - Clear pricing with unit indicator
- **Stock Badge** - Visual stock status indicator
- **Rating Display** - Star rating on product cards

#### Product Detail
- **Image Carousel** - Swipeable image gallery
- **Sticky Header** - Price and add to cart button always visible
- **Tabbed Sections** - Details, Reviews, Specifications
- **Expandable Sections** - Specifications, reviews
- **Quantity Selector** - Easy quantity adjustment
- **Stock Indicator** - Clear availability display

#### Shopping Cart
- **Item List** - Clear product information
- **Quantity Controls** - Easy quantity adjustment
- **Price Summary** - Transparent pricing breakdown
- **Quick Checkout** - Streamlined checkout process

### 6.2 Navigation Flow

```
Shop
  ├── Search & Filter
  ├── View Product Detail
  │   ├── View Supplier Profile
  │   ├── View Reviews
  │   ├── Add to Cart
  │   └── Order Now → Checkout
  ├── Shopping Cart → Checkout
  │   └── Place Order → Orders List
  └── View My Orders → Orders Screen
      └── Track Order → Tracking Screen

My Supplies (Supplier)
  ├── View Product List
  ├── Add New Product → Add Product Screen
  ├── Edit Product → Edit Product Screen
  └── View Product Detail
      ├── Manage Inventory
      ├── View Orders
      └── View Reviews
```

### 6.3 User Experience Enhancements

#### Discovery
- **Smart Filters** - Remember user preferences
- **Recent Searches** - Quick access to recent searches
- **Saved Products** - Favorite products functionality
- **Recommendations** - Suggest similar products
- **Browsing History** - Recently viewed products

#### Shopping
- **Quick Add to Cart** - One-tap add to cart
- **Stock Alerts** - Notify when out-of-stock items are back
- **Price Alerts** - Notify on price drops
- **Bulk Ordering** - Easy quantity selection for bulk orders
- **Wholesale Pricing** - Automatic wholesale price for eligible users

#### Order Management
- **Order Tracking** - Real-time order status updates
- **Delivery Notifications** - Push notifications for status changes
- **Reorder** - Quick reorder from order history
- **Order History** - Easy access to past orders

---

## 7. Implementation Priority

### Phase 1: Core Functionality (High Priority)
1. **API Integration for Shop**
   - Get products with filters
   - Search functionality
   - Category filtering

2. **Product Detail Screen**
   - Display product information
   - Image carousel
   - Add to cart and order actions

3. **Basic Order Flow**
   - Order creation
   - Order confirmation
   - Order list display

4. **My Supplies Management**
   - List supplier's products
   - Basic editing
   - Stock status display

### Phase 2: Enhanced Features (Medium Priority)
5. **Shopping Cart**
   - Cart functionality
   - Multi-item checkout
   - Address management

6. **Product Creation/Editing**
   - Multi-step form
   - Image upload
   - Form validation

7. **Order Management**
   - Status updates
   - Order cancellation
   - Tracking integration

8. **Reviews & Ratings**
   - Review display
   - Review submission
   - Rating aggregation

### Phase 3: Advanced Features (Lower Priority)
9. **Location Services**
   - Map integration
   - Nearby products
   - Distance calculation

10. **Inventory Management**
    - Low stock alerts
    - Stock quantity tracking
    - Automatic updates

11. **Supplier Dashboard**
    - Statistics display
    - Performance metrics
    - Sales tracking

12. **Subscription Support**
    - Subscription kits
    - Recurring orders
    - Subscription management

---

## 8. Technical Considerations

### 8.1 State Management
- **React Query** - For API data fetching and caching
- **Context API** - For shopping cart and filters
- **Local Storage** - Cache cart, search history, and favorites

### 8.2 Performance Optimization
- **Image Optimization** - Compress images before upload
- **Lazy Loading** - Load images on demand
- **Pagination** - For product lists and orders
- **Debouncing** - For search inputs
- **Caching** - Cache product details and categories

### 8.3 Third-Party Integrations
- **Image Picker** - `expo-image-picker` for image selection
- **Image Display** - `expo-image` for optimized image display
- **Maps** - `react-native-maps` for location display
- **File Upload** - Multi-part form data for images

### 8.4 Shopping Cart
- **Local State** - Cart stored in context/local storage
- **Sync with Server** - Optional server-side cart sync
- **Persistence** - Cart persists across app restarts
- **Quantity Management** - Easy quantity adjustment

### 8.5 Inventory Management
- **Stock Validation** - Validate stock before order creation
- **Atomic Updates** - Ensure inventory updates are atomic
- **Low Stock Alerts** - Notify suppliers of low stock
- **Automatic Updates** - Update inventory on order completion

### 8.6 Payment Integration
- **Payment Gateway** - PayPal/PayMaya integration
- **Order Processing** - Process payments on order creation
- **Refund Processing** - Process refunds for cancellations

---

## 9. Testing Requirements

### 9.1 Unit Tests
- Product filtering logic
- Pricing calculations
- Stock validation
- Cart management
- Order status transitions

### 9.2 Integration Tests
- API integration for all endpoints
- Image upload functionality
- Order creation flow
- Status update flow
- Review submission

### 9.3 E2E Tests
- Complete shopping flow:
  - Browse → View Detail → Add to Cart → Checkout → Order
- Supplier product management flow:
  - Create → Edit → Manage Inventory
- Order management flow:
  - Create → Update Status → Complete

### 9.4 Performance Tests
- Large product list rendering
- Image carousel performance
- Cart with many items
- Order list rendering

---

## 10. Data Model Alignment

### Current Types vs. Required Types

**Current** (`packages/types/supplies.ts`):
```typescript
export interface Supply {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  supplierId: string;
  supplierName: string;
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  createdAt: Date;
}

export interface SupplyOrder {
  id: string;
  items: SupplyOrderItem[];
  userId: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export interface SupplyOrderItem {
  supplyId: string;
  quantity: number;
  price: number;
}
```

**Required** (based on API documentation):
- Expanded `Supply` interface with:
  - `title` field
  - `pricing` object (retailPrice, wholesalePrice)
  - `inventory` object (quantity, minStock, maxStock, location)
  - `specifications` object
  - `location` object (address, coordinates)
  - `images` array of objects (not just strings)
  - `reviews` array
  - `averageRating` field
  - `brand` and `sku` fields
  - `isSubscriptionEligible` field
- Expanded `SupplyOrder` interface with:
  - `deliveryAddress` object
  - `specialInstructions` field
  - `contactInfo` object
  - `trackingNumber` field
  - `shippedAt` and `deliveredAt` dates
  - `user` populated object
- New interfaces:
  - `SupplyReview`
  - `SupplyCategory`
  - `CreateSupplyInput`

**Action Required**: Expand type definitions to match API response structure.

---

## 11. Integration Points

### 11.1 Related Features
- **User Management** - Supplier and customer profiles
- **Suppliers** - Supplier profiles and verification
- **Finance** - Order payment processing
- **File Storage** - Cloudinary for product images
- **Email Service** - Order notifications
- **Maps & Location** - Geospatial search and delivery
- **Reviews & Ratings** - Product review system
- **Analytics** - Sales and performance tracking
- **Subscriptions** - Recurring order management

### 11.2 External Services
- **Cloudinary** - Image storage
- **Maps API** - Location services and mapping
- **Payment Gateway** - PayPal/PayMaya for payments
- **Email Service** - Order notifications
- **SMS Service** - Order reminders (if applicable)
- **Tracking API** - Order tracking (if applicable)

---

## 12. Next Steps

### Immediate Actions
1. ✅ Review and expand type definitions in `packages/types/supplies.ts`
2. ✅ Implement API service methods in `packages/supplies/services.ts`
3. ✅ Create React hooks for supplies data (`useSupplies`, `useSupply`, `useSupplyOrders`, etc.)
4. ✅ Integrate API calls in existing screens (`shop.tsx`, `orders.tsx`, `my-supplies.tsx`)
5. ✅ Create product detail screen
6. ✅ Implement shopping cart functionality
7. ✅ Create checkout screen
8. ✅ Implement image upload functionality
9. ✅ Create add/edit product screen
10. ✅ Implement reviews and ratings
11. ✅ Add location-based search
12. ✅ Create supplier dashboard

### Future Enhancements
- Advanced analytics dashboard
- Subscription kit management
- Automated inventory management
- Product recommendations
- Social sharing features
- Bulk ordering features
- Wholesale pricing management

---

*This analysis document should be updated as implementation progresses and new requirements are identified.*

