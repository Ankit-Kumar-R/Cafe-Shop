import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  role: text('role').default('customer').notNull(), // 'admin' or 'customer'
  loyaltyPoints: integer('loyalty_points').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const loyaltyActions = pgTable('loyalty_actions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  pointsEarned: integer('points_earned').notNull(),
  actionDescription: text('action_description').notNull(), // e.g., 'Completed Order #123'
  createdAt: timestamp('created_at').defaultNow(),
});

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
  isSpecialOffer: boolean('is_special_offer').default(false).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  stockLevel: integer('stock_level').default(50).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  time: text('time').notNull(), // HH:MM
  guests: integer('guests').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'accepted', 'declined', 'completed'
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'preparing', 'out_for_delivery', 'completed'
  orderToken: text('order_token').notNull().unique(),
  source: text('source').default('QR_SCAN').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  discountPercentage: integer('discount_percentage').notNull(), // e.g., 10 for 10%
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  menuItemId: integer('menu_item_id').references(() => menuItems.id).notNull(),
  quantity: integer('quantity').notNull(),
  priceAtTime: decimal('price_at_time', { precision: 10, scale: 2 }).notNull(),
});

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  rating: integer('rating').notNull(), // 1 to 5
  review: text('review'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  orders: many(orders),
  feedback: many(feedback),
  loyaltyActions: many(loyaltyActions),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const employeeShifts = pgTable('employee_shifts', {
  id: serial('id').primaryKey(),
  employeeName: text('employee_name').notNull(),
  role: text('role').notNull(),
  shiftDate: timestamp('shift_date').notNull(),
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
  createdAt: timestamp('created_at').defaultNow(),
});
