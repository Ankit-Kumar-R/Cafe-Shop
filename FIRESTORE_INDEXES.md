# Firestore Composite Indexes Audit & Documentation

Although this application uses Cloud SQL (PostgreSQL) for its primary database, here is the documentation for the necessary Firestore composite indexes if you were to migrate the `Orders`, `Products` (`menu_items`), and `Bookings` collections to Firestore for the Admin Dashboard analytics and filtering, as requested.

## Orders Collection
To support high-performance analytics, revenue tracking, and status filtering on the Admin Dashboard:

1. **Revenue Trends & Analytics (Last 7 Days, Month-to-date, etc.)**
   - **Fields**: `createdAt` (ASC/DESC), `status` (ASC)
   - **Purpose**: Allows querying completed orders within a specific date range to calculate revenue, without reading unrelated or pending orders.

2. **Order Management & Filtering**
   - **Fields**: `status` (ASC), `createdAt` (DESC)
   - **Purpose**: Enables the Admin Dashboard to filter orders by status (e.g., 'pending', 'completed') and sort them by the most recent first.

3. **Customer Order History**
   - **Fields**: `userId` (ASC), `createdAt` (DESC)
   - **Purpose**: Optimizes fetching a specific user's order history sorted chronologically.

## Products Collection (Menu Items)
To support inventory management, POS system filtering, and category analysis:

1. **Category Filtering & Active Products**
   - **Fields**: `category` (ASC), `isAvailable` (ASC)
   - **Purpose**: Enables the POS system and Admin Menu tab to quickly filter available products by category.

2. **Promotional Filtering**
   - **Fields**: `isSpecialOffer` (ASC), `category` (ASC)
   - **Purpose**: Allows querying for all current special offers, optionally filtered by category.

## Bookings Collection
To support reservation management and calendar views on the Admin Dashboard:

1. **Daily/Monthly Booking Analytics**
   - **Fields**: `status` (ASC), `bookingDate` (ASC)
   - **Purpose**: Enables querying upcoming bookings (e.g., `status == 'pending'` or `'accepted'`) sorted by the date they are scheduled for.

2. **Customer Booking History**
   - **Fields**: `userId` (ASC), `bookingDate` (DESC)
   - **Purpose**: Optimizes fetching a user's past and upcoming reservations.

---
**Note:** When deploying to Firebase, you can add these to your `firestore.indexes.json` and deploy using the Firebase CLI (`firebase deploy --only firestore:indexes`).
