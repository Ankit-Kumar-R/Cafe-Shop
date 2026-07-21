import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getOrCreateUser } from "./src/db/users.ts";
import { requireAuth, AuthRequest, requireAdmin } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { menuItems, orders, orderItems, bookings, feedback, users, loyaltyActions, promotions, employeeShifts } from "./src/db/schema.ts";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      ai = new GoogleGenAI({ apiKey: key });
    }
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Auth & Users API ---
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { uid, email, name } = req.user!;
      const user = await getOrCreateUser(uid, email || "", name || "");
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      res.json({ user: req.dbUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Menu API ---
  app.get("/api/menu", async (req, res) => {
    try {
      const items = await db.select().from(menuItems).orderBy(desc(menuItems.createdAt));
      res.json({ items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/menu", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { name, description, price, category, imageUrl, isSpecialOffer, isAvailable } = req.body;
      const result = await db.insert(menuItems).values({
        name,
        description,
        price: price.toString(),
        category,
        imageUrl,
        isSpecialOffer,
        isAvailable,
      }).returning();
      res.json({ item: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/menu/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, category, imageUrl, isSpecialOffer, isAvailable } = req.body;
      const result = await db.update(menuItems).set({
        name,
        description,
        price: price.toString(),
        category,
        imageUrl,
        isSpecialOffer,
        isAvailable,
      }).where(eq(menuItems.id, parseInt(id))).returning();
      res.json({ item: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/menu/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await db.delete(menuItems).where(eq(menuItems.id, parseInt(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Bookings API ---
  app.post("/api/bookings", async (req: AuthRequest, res) => {
    // Note: We'll allow public booking, but link to user if logged in (passed via optional token in production)
    try {
      const { name, email, phone, date, time, guests, userId } = req.body;
      const result = await db.insert(bookings).values({
        name,
        email,
        phone,
        date,
        time,
        guests: parseInt(guests),
        userId: userId || null,
      }).returning();
      res.json({ booking: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bookings/my", requireAuth, async (req: AuthRequest, res) => {
    try {
      const myBookings = await db.select().from(bookings).where(eq(bookings.userId, req.dbUser.id)).orderBy(desc(bookings.createdAt));
      res.json({ bookings: myBookings });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/bookings/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      // ensure the booking belongs to the user
      const existing = await db.select().from(bookings).where(and(eq(bookings.id, parseInt(id)), eq(bookings.userId, req.dbUser.id)));
      if (existing.length === 0) return res.status(404).json({ error: 'Booking not found' });
      
      const result = await db.update(bookings).set({ status: 'cancelled' }).where(eq(bookings.id, parseInt(id))).returning();
      res.json({ booking: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/verify", requireAdmin, (req, res) => {
    res.json({ isAdmin: true });
  });

  app.get("/api/admin/bookings", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
      res.json({ bookings: allBookings });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/bookings/:id/status", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await db.update(bookings).set({ status }).where(eq(bookings.id, parseInt(id))).returning();
      res.json({ booking: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Orders API ---
  app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { items, totalAmount, pointsToRedeem, source } = req.body; // items: {menuItemId, quantity, price}[]
      const orderToken = uuidv4().split('-')[0].toUpperCase();
      
      let finalAmount = parseFloat(totalAmount);
      let pointsUsed = 0;
      
      if (pointsToRedeem && pointsToRedeem > 0) {
        if (req.dbUser.loyaltyPoints >= pointsToRedeem) {
           const discount = pointsToRedeem * 0.1; // 10 points = 1 rupee
           finalAmount = Math.max(0, finalAmount - discount);
           pointsUsed = pointsToRedeem;
        } else {
           return res.status(400).json({ error: "Insufficient loyalty points" });
        }
      }

      // We should use a transaction here, but for simplicity we'll insert one by one
      const orderResult = await db.insert(orders).values({
        userId: req.dbUser.id,
        totalAmount: finalAmount.toString(),
        orderToken,
        status: 'pending',
        source: source || 'QR_SCAN',
      }).returning();
      const order = orderResult[0];

      const orderItemsToInsert = items.map((item: any) => ({
        orderId: order.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        priceAtTime: item.price.toString(),
      }));

      await db.insert(orderItems).values(orderItemsToInsert);
      
      if (pointsUsed > 0) {
        await db.update(users).set({ loyaltyPoints: req.dbUser.loyaltyPoints - pointsUsed }).where(eq(users.id, req.dbUser.id));
        await db.insert(loyaltyActions).values({
          userId: req.dbUser.id,
          pointsEarned: -pointsUsed,
          actionDescription: `Redeemed for Order #${orderToken}`
        });
        // Update user state for next action
        req.dbUser.loyaltyPoints -= pointsUsed;
      }

      const pointsEarned = Math.floor(finalAmount * 0.1);
      if (pointsEarned > 0) {
        await db.update(users).set({ loyaltyPoints: req.dbUser.loyaltyPoints + pointsEarned }).where(eq(users.id, req.dbUser.id));
        await db.insert(loyaltyActions).values({
          userId: req.dbUser.id,
          pointsEarned,
          actionDescription: `Earned from Order #${orderToken}`
        });
      }

      // Simulate sending confirmation email
      console.log(`[EMAIL SERVICE] Sent order confirmation to ${req.dbUser.email} for order #${orderToken}`);
      
      res.json({ order });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/my", requireAuth, async (req: AuthRequest, res) => {
    try {
      const myOrders = await db.select().from(orders).where(eq(orders.userId, req.dbUser.id)).orderBy(desc(orders.createdAt));
      res.json({ orders: myOrders });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/track/:token", async (req: AuthRequest, res) => {
    try {
      const { token } = req.params;
      const result = await db.select().from(orders).where(eq(orders.orderToken, token));
      if (result.length === 0) return res.status(404).json({ error: 'Order not found' });
      res.json({ order: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      res.json({ orders: allOrders });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/orders/:id/status", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await db.update(orders).set({ status }).where(eq(orders.id, parseInt(id))).returning();
      res.json({ order: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Employee Shifts API ---
  app.get("/api/admin/shifts", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allShifts = await db.select().from(employeeShifts).orderBy(desc(employeeShifts.shiftDate));
      res.json({ shifts: allShifts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/shifts", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { employeeName, role, shiftDate, startTime, endTime } = req.body;
      const result = await db.insert(employeeShifts).values({
        employeeName,
        role,
        shiftDate: new Date(shiftDate),
        startTime,
        endTime
      }).returning();
      res.json({ shift: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/shifts/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await db.delete(employeeShifts).where(eq(employeeShifts.id, parseInt(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/promotions", async (req, res) => {
    try {
      const allPromos = await db.select().from(promotions)
        .where(eq(promotions.isActive, true))
        .orderBy(desc(promotions.createdAt));
        
      // Filter out expired promos
      const now = new Date();
      const activePromos = allPromos.filter(p => new Date(p.endDate) >= now && new Date(p.startDate) <= now);
      
      res.json({ promotions: activePromos });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/promotions", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allPromos = await db.select().from(promotions).orderBy(desc(promotions.createdAt));
      res.json({ promotions: allPromos });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/promotions", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { name, discountPercentage, startDate, endDate, isActive } = req.body;
      const result = await db.insert(promotions).values({
        name,
        discountPercentage: parseInt(discountPercentage),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true
      }).returning();
      res.json({ promotion: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/promotions/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await db.delete(promotions).where(eq(promotions.id, parseInt(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Feedback API ---
  app.post("/api/feedback", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { rating, review } = req.body;
      const result = await db.insert(feedback).values({
        userId: req.dbUser.id,
        rating: parseInt(rating),
        review,
      }).returning();
      res.json({ feedback: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/feedback", async (req, res) => {
    try {
      const allFeedback = await db.select({
        id: feedback.id,
        rating: feedback.rating,
        review: feedback.review,
        createdAt: feedback.createdAt,
        user: { name: users.name }
      }).from(feedback).leftJoin(users, eq(feedback.userId, users.id)).where(isNotNull(feedback.review)).orderBy(desc(feedback.createdAt)).limit(12);
      res.json({ feedback: allFeedback });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/feedback", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allFeedback = await db.select({
        id: feedback.id,
        rating: feedback.rating,
        review: feedback.review,
        createdAt: feedback.createdAt,
        user: { name: users.name, email: users.email }
      }).from(feedback).leftJoin(users, eq(feedback.userId, users.id)).orderBy(desc(feedback.createdAt));
      res.json({ feedback: allFeedback });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/feedback/sentiment", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const aiClient = getAI();
      if (!aiClient) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const recentFeedback = await db.select({
        rating: feedback.rating,
        review: feedback.review
      }).from(feedback).where(isNotNull(feedback.review)).orderBy(desc(feedback.createdAt)).limit(20);

      if (recentFeedback.length === 0) {
        return res.json({ analysis: "No reviews to analyze." });
      }

      const reviewsText = recentFeedback.map(f => `Rating: ${f.rating}/5 - ${f.review}`).join('\n');
      
      const prompt = `You are an expert customer experience analyst for a coffee shop. 
      Analyze the following recent customer reviews and provide a short summary of actionable insights (e.g. 'Fast Service', 'Cold Coffee', 'Friendly Staff'). Keep it concise and use bullet points.
      
      Reviews:
      ${reviewsText}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Loyalty API ---
  app.get("/api/loyalty/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const actions = await db.select().from(loyaltyActions).where(eq(loyaltyActions.userId, req.dbUser.id)).orderBy(desc(loyaltyActions.createdAt));
      res.json({ loyaltyPoints: req.dbUser.loyaltyPoints, actions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Analytics API ---
  app.get("/api/admin/analytics", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allOrders = await db.select().from(orders);
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let totalRevenue = 0;
      let dailyRevenue = 0;
      let monthlyRevenue = 0;

      // Calculate trend for last 7 days
      const trendMap = new Map();
      const hoursMap = new Map();
      const categoriesMap = new Map();
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        trendMap.set(d.toLocaleDateString('en-US', { weekday: 'short' }), 0);
      }
      
      for (let i = 8; i <= 22; i++) {
         hoursMap.set(`${i}:00`, 0);
      }

      allOrders.forEach(order => {
        const amount = parseFloat(order.totalAmount as string);
        const orderDate = new Date(order.createdAt);
        
        totalRevenue += amount;
        if (orderDate >= startOfDay) dailyRevenue += amount;
        if (orderDate >= startOfMonth) monthlyRevenue += amount;
        
        // Add to trend if within last 7 days
        const diffTime = Math.abs(now.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          const dayName = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (trendMap.has(dayName)) {
            trendMap.set(dayName, trendMap.get(dayName) + amount);
          }
        }
        
        // Peak hours
        const hour = orderDate.getHours();
        if (hour >= 8 && hour <= 22) {
           const hourKey = `${hour}:00`;
           hoursMap.set(hourKey, (hoursMap.get(hourKey) || 0) + 1);
        }
      });

      // Categories
      const allOrderItems = await db.select({
        quantity: orderItems.quantity,
        category: menuItems.category
      }).from(orderItems).innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id));
      
      allOrderItems.forEach(item => {
        if (item.category) {
          categoriesMap.set(item.category, (categoriesMap.get(item.category) || 0) + item.quantity);
        }
      });

      const revenueTrend = Array.from(trendMap.entries()).map(([name, total]) => ({ name, total }));
      const peakHours = Array.from(hoursMap.entries()).map(([time, count]) => ({ time, orders: count }));
      
      // Top 5 categories
      const trendingCategories = Array.from(categoriesMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
      
      const allBookings = await db.select().from(bookings);
      const activeBookings = allBookings.filter(b => b.status === 'pending' || b.status === 'accepted').length;

      const allUsers = await db.select().from(users).where(eq(users.role, 'customer'));
      const totalCustomers = allUsers.length;

      res.json({
        totalRevenue,
        dailyRevenue,
        monthlyRevenue,
        revenueTrend,
        peakHours,
        trendingCategories,
        pendingOrders,
        activeBookings,
        totalCustomers,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
