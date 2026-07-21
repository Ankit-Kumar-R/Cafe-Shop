import { db } from './index.ts';
import { users } from './schema.ts';
import { eq, sql } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    let user;
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      user = existing[0];
      // Force admin role for the owner
      if (email === 'kumarankit29734@gmail.com' && user.role !== 'admin') {
        const updated = await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id)).returning();
        user = updated[0];
      }
      return user;
    }
    
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(users);
    const isFirstUser = countRes[0].count === 0;
    const isAdmin = isFirstUser || email === 'kumarankit29734@gmail.com';

    const result = await db.insert(users)
      .values({
        uid,
        email,
        name: name || '',
        role: isAdmin ? 'admin' : 'customer',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Failed to create or get user.", { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid));
    return result[0] || null;
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Failed to fetch user.", { cause: error });
  }
}
