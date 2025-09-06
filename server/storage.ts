import {
  users,
  workerProfiles,
  interventions,
  reviews,
  messages,
  favorites,
  notifications,
  type User,
  type UpsertUser,
  type WorkerProfile,
  type InsertWorkerProfile,
  type Intervention,
  type InsertIntervention,
  type Review,
  type InsertReview,
  type Message,
  type InsertMessage,
  type Favorite,
  type InsertFavorite,
  type Notification,
  type InsertNotification,
  type WorkerWithProfile,
  type InterventionWithDetails,
  type ReviewWithDetails,
  DashboardStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, sql, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;

  // Worker operations
  createWorkerProfile(profile: InsertWorkerProfile): Promise<WorkerProfile>;
  updateWorkerProfile(userId: string, updates: Partial<InsertWorkerProfile>): Promise<WorkerProfile>;
  getWorkerProfile(userId: string): Promise<WorkerProfile | undefined>;
  getWorkerWithProfile(userId: string): Promise<WorkerWithProfile | undefined>;
  searchWorkers(filters: {
    category?: string;
    city?: string;
    minRating?: number;
    maxHourlyRate?: number;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<WorkerWithProfile[]>;

  // Intervention operations
  createIntervention(intervention: InsertIntervention): Promise<Intervention>;
  updateIntervention(id: number, updates: Partial<InsertIntervention>): Promise<Intervention>;
  getIntervention(id: number): Promise<InterventionWithDetails | undefined>;
  getInterventionsByClient(clientId: string): Promise<InterventionWithDetails[]>;
  getInterventionsByWorker(workerId: string): Promise<InterventionWithDetails[]>;
  getPendingInterventions(workerId?: string): Promise<InterventionWithDetails[]>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByWorker(workerId: string): Promise<ReviewWithDetails[]>;
  getReviewsByClient(clientId: string): Promise<Review[]>;
  updateWorkerRating(workerId: string): Promise<void>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByIntervention(interventionId: number): Promise<Message[]>;
  markMessagesAsRead(interventionId: number, userId: string): Promise<void>;

  // Favorite operations
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(clientId: string, workerId: string): Promise<void>;
  getFavoritesByClient(clientId: string): Promise<WorkerWithProfile[]>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;

  // Dashboard operations
  getDashboardStats(userId: string, role: 'client' | 'worker'): Promise<DashboardStats>;

  // Admin operations
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  getAllInterventions(limit?: number, offset?: number): Promise<InterventionWithDetails[]>;
  getUnmoderatedReviews(): Promise<Review[]>;
  updateReviewModeration(id: number, isModerated: boolean, isVisible: boolean): Promise<Review>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Worker operations
  async createWorkerProfile(profile: InsertWorkerProfile): Promise<WorkerProfile> {
    const [workerProfile] = await db
      .insert(workerProfiles)
      .values(profile)
      .returning();
    return workerProfile;
  }

  async updateWorkerProfile(userId: string, updates: Partial<InsertWorkerProfile>): Promise<WorkerProfile> {
    const [workerProfile] = await db
      .update(workerProfiles)
      .set(updates)
      .where(eq(workerProfiles.userId, userId))
      .returning();
    return workerProfile;
  }

  async getWorkerProfile(userId: string): Promise<WorkerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(workerProfiles)
      .where(eq(workerProfiles.userId, userId));
    return profile;
  }

  async getWorkerWithProfile(userId: string): Promise<WorkerWithProfile | undefined> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(workerProfiles, eq(users.id, workerProfiles.userId))
      .where(eq(users.id, userId));

    if (result.length === 0) return undefined;

    const { users: user, worker_profiles: profile } = result[0];
    return {
      ...user,
      workerProfile: profile
    } as WorkerWithProfile;
  }

  async searchWorkers(filters: {
    category?: string;
    city?: string;
    minRating?: number;
    maxHourlyRate?: number;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<WorkerWithProfile[]> {
    try {
      console.log('searchWorkers filters:', filters);
      const conditions = [eq(users.role, "worker")];

      if (filters.category) {
        conditions.push(eq(workerProfiles.category, filters.category as any));
        console.log('Adding category condition:', filters.category);
      }
      if (filters.city) {
        conditions.push(ilike(users.city, `%${filters.city}%`));
        console.log('Adding city condition:', filters.city);
      }
      if (filters.minRating) {
        conditions.push(gte(workerProfiles.rating, filters.minRating.toString()));
        console.log('Adding minRating condition:', filters.minRating);
      }
      if (filters.maxHourlyRate) {
        conditions.push(lte(workerProfiles.hourlyRate, filters.maxHourlyRate.toString()));
        console.log('Adding maxHourlyRate condition:', filters.maxHourlyRate);
      }
      if (filters.isAvailable !== undefined) {
        conditions.push(eq(workerProfiles.isAvailable, filters.isAvailable));
        console.log('Adding isAvailable condition:', filters.isAvailable);
      }

      const query = db
        .select()
        .from(users)
        .leftJoin(workerProfiles, eq(users.id, workerProfiles.userId))
        .where(and(...conditions))
        .orderBy(desc(workerProfiles.rating))
        .limit(filters.limit || 20)
        .offset(filters.offset || 0);

      console.log('searchWorkers SQL query:', query.toSQL());

      const result = await query;
      console.log('searchWorkers query result count:', result.length);
      console.log('searchWorkers query results (first 5):', result.slice(0, 5));

      return result.map(({ users: user, worker_profiles: profile }) => ({
        ...user,
        workerProfile: profile
      })) as WorkerWithProfile[];
    } catch (error) {
      console.error('Error in searchWorkers:', error);
      return [];
    }
  }

  // Intervention operations
  async createIntervention(intervention: InsertIntervention): Promise<Intervention> {
    console.log('Attempting to create intervention with data:', intervention);
    try {
      const [newIntervention] = await db
        .insert(interventions)
        .values(intervention)
        .returning();
      console.log('Intervention successfully inserted:', newIntervention);
      return newIntervention;
    } catch (error) {
      console.error('Error inserting intervention into DB:', error);
      throw error; // Re-throw the error so it can be caught by the route handler
    }
  }

  async updateIntervention(id: number, updates: Partial<InsertIntervention>): Promise<Intervention> {
    const [updatedIntervention] = await db
      .update(interventions)
      .set(updates)
      .where(eq(interventions.id, id))
      .returning();
    return updatedIntervention;
  }

  async getIntervention(id: number): Promise<InterventionWithDetails | undefined> {
    const result = await db
      .select()
      .from(interventions)
      .leftJoin(users, eq(interventions.clientId, users.id))
      .leftJoin(users as typeof users, eq(interventions.workerId, (users as typeof users).id))
      .leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId))
      .where(eq(interventions.id, id));

    if (result.length === 0) return undefined;

    const { interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile } = result[0];
    const worker = workerUser ? { ...workerUser, workerProfile: workerProfile } : undefined;

    return {
      ...intervention,
      client: client!,
      worker: worker
    } as InterventionWithDetails;
  }

  async getInterventionsByClient(clientId: string): Promise<InterventionWithDetails[]> {
    const result = await db
      .select()
      .from(interventions)
      .leftJoin(users, eq(interventions.clientId, users.id))
      .leftJoin(users as typeof users, eq(interventions.workerId, (users as typeof users).id))
      .leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId))
      .where(eq(interventions.clientId, clientId))
      .orderBy(desc(interventions.createdAt));

    return result.map(({ interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile }) => {
      const worker = workerUser ? { ...workerUser, workerProfile: workerProfile } : undefined;
      return {
        ...intervention,
        client: client!,
        worker: worker
      };
    }) as InterventionWithDetails[];
  }

  async getInterventionsByWorker(workerId: string): Promise<InterventionWithDetails[]> {
    const result = await db
      .select()
      .from(interventions)
      .leftJoin(users, eq(interventions.clientId, users.id))
      .leftJoin(users as typeof users, eq(interventions.workerId, (users as typeof users).id))
      .leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId))
      .where(eq(interventions.workerId, workerId))
      .orderBy(desc(interventions.createdAt));

    return result.map(({ interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile }) => {
      const worker = workerUser ? { ...workerUser, workerProfile: workerProfile } : undefined;
      return {
        ...intervention,
        client: client!,
        worker: worker
      };
    }) as InterventionWithDetails[];
  }

  async getPendingInterventions(workerId?: string): Promise<InterventionWithDetails[]> {
    const conditions = [eq(interventions.status, "pending")];
    
    if (workerId) {
      conditions.push(eq(interventions.workerId, workerId));
    }

    const result = await db
      .select()
      .from(interventions)
      .leftJoin(users, eq(interventions.clientId, users.id))
      .leftJoin(users as typeof users, eq(interventions.workerId, (users as typeof users).id))
      .leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId))
      .where(and(...conditions))
      .orderBy(desc(interventions.createdAt));

    return result.map(({ interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile }) => {
      const worker = workerUser ? { ...workerUser, workerProfile: workerProfile } : undefined;
      return {
        ...intervention,
        client: client!,
        worker: worker
      };
    }) as InterventionWithDetails[];
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getReviewsByWorker(workerId: string): Promise<ReviewWithDetails[]> {
    const result = await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.clientId, users.id))
      .leftJoin(users as any, eq(reviews.workerId, users.id))
      .leftJoin(interventions, eq(reviews.interventionId, interventions.id))
      .where(eq(reviews.workerId, workerId));

    return result.map(({ reviews: review, users: clientUser, users: workerUser, interventions: intervention }) => ({
      ...review,
      client: clientUser!,
      worker: workerUser!,
      intervention: intervention!,
    })) as ReviewWithDetails[];
  }

  async getReviewsByClient(clientId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.clientId, clientId))
      .orderBy(desc(reviews.createdAt));
  }

  async updateWorkerRating(workerId: string): Promise<void> {
    // Calculate average rating
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`
      })
      .from(reviews)
      .where(eq(reviews.workerId, workerId));

    const avgRating = result[0]?.avgRating || 0;

    // Update worker profile
    await db
      .update(workerProfiles)
      .set({ rating: avgRating.toString() })
      .where(eq(workerProfiles.userId, workerId));
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMessagesByIntervention(interventionId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.interventionId, interventionId))
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(interventionId: number, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.interventionId, interventionId),
          eq(messages.receiverId, userId)
        )
      );
  }

  // Favorite operations
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(clientId: string, workerId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.clientId, clientId),
          eq(favorites.workerId, workerId)
        )
      );
  }

  async getFavoritesByClient(clientId: string): Promise<WorkerWithProfile[]> {
    const result = await db
      .select()
      .from(favorites)
      .innerJoin(users, eq(favorites.workerId, users.id))
      .leftJoin(workerProfiles, eq(users.id, workerProfiles.userId))
      .where(eq(favorites.clientId, clientId));

    return result.map(({ users: user, worker_profiles: profile }) => ({
      ...user,
      workerProfile: profile
    })) as WorkerWithProfile[];
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Dashboard operations
  async getDashboardStats(userId: string, role: 'client' | 'worker'): Promise<DashboardStats> {
    console.log(`Fetching dashboard stats for user ${userId} with role ${role}`);
    if (role === 'client') {
      // Client stats
      const activeInterventions = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(interventions)
        .where(and(eq(interventions.clientId, userId), eq(interventions.status, 'in_progress')))
        .execute();
      console.log('activeInterventions', activeInterventions);

      const completedThisMonth = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(interventions)
        .where(and(
          eq(interventions.clientId, userId),
          eq(interventions.status, 'completed'),
          gte(interventions.updatedAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
          lte(interventions.updatedAt, new Date())
        ))
        .execute();
      console.log('completedThisMonth', completedThisMonth);

      const totalSpent = await db
        .select({ sum: sql<number>`SUM(${interventions.maxBudget})` })
        .from(interventions)
        .where(and(eq(interventions.clientId, userId), eq(interventions.status, 'completed')))
        .execute();
      console.log('totalSpent', totalSpent);

      const favoriteWorkers = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(favorites)
        .where(eq(favorites.clientId, userId))
        .execute();
      console.log('favoriteWorkers', favoriteWorkers);

      return {
        activeInterventions: activeInterventions[0]?.count || 0,
        completedThisMonth: completedThisMonth[0]?.count || 0,
        totalSpent: totalSpent[0]?.sum || 0,
        favoriteWorkers: favoriteWorkers[0]?.count || 0,
      };
    } else {
      // Worker stats
      const completedThisMonth = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(interventions)
        .where(and(
          eq(interventions.workerId, userId),
          eq(interventions.status, 'completed'),
          gte(interventions.updatedAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
          lte(interventions.updatedAt, new Date())
        ))
        .execute();
      console.log('worker completedThisMonth', completedThisMonth);

      const monthlyEarnings = await db
        .select({ sum: sql<number>`SUM(${interventions.maxBudget})` })
        .from(interventions)
        .where(and(
          eq(interventions.workerId, userId),
          eq(interventions.status, 'completed'),
          gte(interventions.updatedAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
          lte(interventions.updatedAt, new Date())
        ))
        .execute();
      console.log('worker monthlyEarnings', monthlyEarnings);

      return {
        completedThisMonth: completedThisMonth[0]?.count || 0,
        monthlyEarnings: monthlyEarnings[0]?.sum || 0,
      };
    }
  }

  // Admin operations
  async getAllUsers(limit?: number, offset?: number): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .limit(limit || 20)
      .offset(offset || 0);
    return result;
  }

  async getAllInterventions(limit?: number, offset?: number): Promise<InterventionWithDetails[]> {
    const result = await db
      .select()
      .from(interventions)
      .leftJoin(users, eq(interventions.clientId, users.id))
      .leftJoin(users as typeof users, eq(interventions.workerId, (users as typeof users).id))
      .leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId))
      .orderBy(desc(interventions.createdAt));

    return result.map(({ interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile }) => {
      const worker = workerUser ? { ...workerUser, workerProfile: workerProfile } : undefined;
      return {
        ...intervention,
        client: client!,
        worker: worker
      };
    }) as InterventionWithDetails[];
  }

  async getUnmoderatedReviews(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.isModerated, false))
      .orderBy(desc(reviews.createdAt));
  }

  async updateReviewModeration(id: number, isModerated: boolean, isVisible: boolean): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set({
        isModerated: isModerated,
        isVisible: isVisible,
      })
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }
}

export const storage = new DatabaseStorage();