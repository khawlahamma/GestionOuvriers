var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  favorites: () => favorites,
  favoritesRelations: () => favoritesRelations,
  insertFavoriteSchema: () => insertFavoriteSchema,
  insertInterventionSchema: () => insertInterventionSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertUserSchema: () => insertUserSchema,
  insertWorkerProfileSchema: () => insertWorkerProfileSchema,
  interventionStatusEnum: () => interventionStatusEnum,
  interventions: () => interventions,
  interventionsRelations: () => interventionsRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  serviceCategoryEnum: () => serviceCategoryEnum,
  sessions: () => sessions,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  workerProfiles: () => workerProfiles,
  workerProfilesRelations: () => workerProfilesRelations,
  workerUsers: () => workerUsers
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  pgEnum,
  alias
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var userRoleEnum = pgEnum("user_role", ["client", "worker", "admin"]);
var interventionStatusEnum = pgEnum("intervention_status", [
  "pending",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
  "disputed"
]);
var serviceCategoryEnum = pgEnum("service_category", [
  "plumbing",
  "electricity",
  "painting",
  "carpentry",
  "gardening",
  "cleaning",
  "renovation",
  "hvac"
]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"),
  role: userRoleEnum().default("client"),
  city: varchar("city"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var workerUsers = alias(users, "worker_users");
var workerProfiles = pgTable("worker_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  category: serviceCategoryEnum().notNull(),
  specializations: text("specializations").array(),
  experience: integer("experience").notNull(),
  skills: text("skills").array(),
  certifications: text("certifications").array(),
  description: text("description"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean("is_available").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  phoneNumber: varchar("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var interventions = pgTable("interventions", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id").notNull(),
  workerId: varchar("worker_id"),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: serviceCategoryEnum().notNull(),
  urgency: pgEnum("urgency", ["low", "medium", "high", "emergency"])().default("medium"),
  preferredDate: timestamp("preferred_date"),
  estimatedDuration: integer("estimated_duration"),
  maxBudget: decimal("max_budget", { precision: 10, scale: 2 }),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  status: interventionStatusEnum().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  interventionId: integer("intervention_id").notNull(),
  clientId: varchar("client_id").notNull(),
  workerId: varchar("worker_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isModerated: boolean("is_moderated").default(false),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  interventionId: integer("intervention_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id").notNull(),
  workerId: varchar("worker_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(),
  isRead: boolean("is_read").default(false),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ one, many }) => ({
  workerProfile: one(workerProfiles, {
    fields: [users.id],
    references: [workerProfiles.userId]
  }),
  clientInterventions: many(interventions, { relationName: "clientInterventions" }),
  workerInterventions: many(interventions, { relationName: "workerInterventions" }),
  clientReviews: many(reviews, { relationName: "clientReviews" }),
  workerReviews: many(reviews, { relationName: "workerReviews" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  favorites: many(favorites),
  notifications: many(notifications)
}));
var workerProfilesRelations = relations(workerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [workerProfiles.userId],
    references: [users.id]
  })
}));
var interventionsRelations = relations(interventions, ({ one, many }) => ({
  client: one(users, {
    fields: [interventions.clientId],
    references: [users.id],
    relationName: "clientInterventions"
  }),
  worker: one(users, {
    fields: [interventions.workerId],
    references: [users.id],
    relationName: "workerInterventions"
  }),
  reviews: many(reviews),
  messages: many(messages)
}));
var reviewsRelations = relations(reviews, ({ one }) => ({
  intervention: one(interventions, {
    fields: [reviews.interventionId],
    references: [interventions.id]
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
    relationName: "clientReviews"
  }),
  worker: one(users, {
    fields: [reviews.workerId],
    references: [users.id],
    relationName: "workerReviews"
  })
}));
var messagesRelations = relations(messages, ({ one }) => ({
  intervention: one(interventions, {
    fields: [messages.interventionId],
    references: [interventions.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages"
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages"
  })
}));
var favoritesRelations = relations(favorites, ({ one }) => ({
  client: one(users, {
    fields: [favorites.clientId],
    references: [users.id]
  }),
  worker: one(users, {
    fields: [favorites.workerId],
    references: [users.id]
  })
}));
var notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true
});
var insertWorkerProfileSchema = createInsertSchema(workerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  totalReviews: true
});
var insertInterventionSchema = createInsertSchema(interventions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  isModerated: true,
  isVisible: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true
});
var insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true
});

// server/db.ts
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, gte, lte, ilike, sql, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations (mandatory for Replit Auth)
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }
  // Worker operations
  async createWorkerProfile(profile) {
    const [workerProfile] = await db.insert(workerProfiles).values(profile).returning();
    return workerProfile;
  }
  async updateWorkerProfile(userId, updates) {
    const [workerProfile] = await db.update(workerProfiles).set(updates).where(eq(workerProfiles.userId, userId)).returning();
    return workerProfile;
  }
  async getWorkerProfile(userId) {
    const [profile] = await db.select().from(workerProfiles).where(eq(workerProfiles.userId, userId));
    return profile;
  }
  async getWorkerWithProfile(userId) {
    const result = await db.select().from(users).leftJoin(workerProfiles, eq(users.id, workerProfiles.userId)).where(eq(users.id, userId));
    if (result.length === 0) return void 0;
    const { users: user, worker_profiles: profile } = result[0];
    return {
      ...user,
      workerProfile: profile
    };
  }
  async searchWorkers(filters) {
    try {
      console.log("searchWorkers filters:", filters);
      const conditions = [eq(users.role, "worker")];
      if (filters.category) {
        conditions.push(eq(workerProfiles.category, filters.category));
        console.log("Adding category condition:", filters.category);
      }
      if (filters.city) {
        conditions.push(ilike(users.city, `%${filters.city}%`));
        console.log("Adding city condition:", filters.city);
      }
      if (filters.minRating) {
        conditions.push(gte(workerProfiles.rating, filters.minRating.toString()));
        console.log("Adding minRating condition:", filters.minRating);
      }
      if (filters.maxHourlyRate) {
        conditions.push(lte(workerProfiles.hourlyRate, filters.maxHourlyRate.toString()));
        console.log("Adding maxHourlyRate condition:", filters.maxHourlyRate);
      }
      if (filters.isAvailable !== void 0) {
        conditions.push(eq(workerProfiles.isAvailable, filters.isAvailable));
        console.log("Adding isAvailable condition:", filters.isAvailable);
      }
      const query = db.select().from(users).leftJoin(workerProfiles, eq(users.id, workerProfiles.userId)).where(and(...conditions)).orderBy(desc(workerProfiles.rating)).limit(filters.limit || 20).offset(filters.offset || 0);
      console.log("searchWorkers SQL query:", query.toSQL());
      const result = await query;
      console.log("searchWorkers query result count:", result.length);
      console.log("searchWorkers query results (first 5):", result.slice(0, 5));
      return result.map(({ users: user, worker_profiles: profile }) => ({
        ...user,
        workerProfile: profile
      }));
    } catch (error) {
      console.error("Error in searchWorkers:", error);
      return [];
    }
  }
  // Intervention operations
  async createIntervention(intervention) {
    console.log("Attempting to create intervention with data:", intervention);
    try {
      const [newIntervention] = await db.insert(interventions).values(intervention).returning();
      console.log("Intervention successfully inserted:", newIntervention);
      return newIntervention;
    } catch (error) {
      console.error("Error inserting intervention into DB:", error);
      throw error;
    }
  }
  async updateIntervention(id, updates) {
    const [updatedIntervention] = await db.update(interventions).set(updates).where(eq(interventions.id, id)).returning();
    return updatedIntervention;
  }
  async getIntervention(id) {
    const result = await db.select().from(interventions).leftJoin(users, eq(interventions.clientId, users.id)).leftJoin(users, eq(interventions.workerId, users.id)).leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId)).where(eq(interventions.id, id));
    if (result.length === 0) return void 0;
    const { interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile } = result[0];
    const worker = workerUser ? { ...workerUser, workerProfile } : void 0;
    return {
      ...intervention,
      client,
      worker
    };
  }
  async getInterventionsByClient(clientId) {
    const result = await db.select().from(interventions).leftJoin(users, eq(interventions.clientId, users.id)).leftJoin(users, eq(interventions.workerId, users.id)).leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId)).where(eq(interventions.clientId, clientId)).orderBy(desc(interventions.createdAt));
    return result.map(({ interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile }) => {
      const worker = workerUser ? { ...workerUser, workerProfile } : void 0;
      return {
        ...intervention,
        client,
        worker
      };
    });
  }
  async getInterventionsByWorker(workerId) {
    const result = await db.select().from(interventions).leftJoin(users, eq(interventions.clientId, users.id)).leftJoin(users, eq(interventions.workerId, users.id)).leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId)).where(eq(interventions.workerId, workerId)).orderBy(desc(interventions.createdAt));
    return result.map(({ interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile }) => {
      const worker = workerUser ? { ...workerUser, workerProfile } : void 0;
      return {
        ...intervention,
        client,
        worker
      };
    });
  }
  async getPendingInterventions(workerId) {
    const conditions = [eq(interventions.status, "pending")];
    if (workerId) {
      conditions.push(eq(interventions.workerId, workerId));
    }
    const result = await db.select().from(interventions).leftJoin(users, eq(interventions.clientId, users.id)).leftJoin(users, eq(interventions.workerId, users.id)).leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId)).where(and(...conditions)).orderBy(desc(interventions.createdAt));
    return result.map(({ interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile }) => {
      const worker = workerUser ? { ...workerUser, workerProfile } : void 0;
      return {
        ...intervention,
        client,
        worker
      };
    });
  }
  // Review operations
  async createReview(review) {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
  async getReviewsByWorker(workerId) {
    const result = await db.select().from(reviews).leftJoin(users, eq(reviews.clientId, users.id)).leftJoin(users, eq(reviews.workerId, users.id)).leftJoin(interventions, eq(reviews.interventionId, interventions.id)).where(eq(reviews.workerId, workerId));
    return result.map(({ reviews: review, users: clientUser, users: workerUser, interventions: intervention }) => ({
      ...review,
      client: clientUser,
      worker: workerUser,
      intervention
    }));
  }
  async getReviewsByClient(clientId) {
    return await db.select().from(reviews).where(eq(reviews.clientId, clientId)).orderBy(desc(reviews.createdAt));
  }
  async updateWorkerRating(workerId) {
    const result = await db.select({
      avgRating: sql`AVG(${reviews.rating})`
    }).from(reviews).where(eq(reviews.workerId, workerId));
    const avgRating = result[0]?.avgRating || 0;
    await db.update(workerProfiles).set({ rating: avgRating.toString() }).where(eq(workerProfiles.userId, workerId));
  }
  // Message operations
  async createMessage(message) {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  async getMessagesByIntervention(interventionId) {
    return await db.select().from(messages).where(eq(messages.interventionId, interventionId)).orderBy(messages.createdAt);
  }
  async markMessagesAsRead(interventionId, userId) {
    await db.update(messages).set({ isRead: true }).where(
      and(
        eq(messages.interventionId, interventionId),
        eq(messages.receiverId, userId)
      )
    );
  }
  // Favorite operations
  async addFavorite(favorite) {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }
  async removeFavorite(clientId, workerId) {
    await db.delete(favorites).where(
      and(
        eq(favorites.clientId, clientId),
        eq(favorites.workerId, workerId)
      )
    );
  }
  async getFavoritesByClient(clientId) {
    const result = await db.select().from(favorites).innerJoin(users, eq(favorites.workerId, users.id)).leftJoin(workerProfiles, eq(users.id, workerProfiles.userId)).where(eq(favorites.clientId, clientId));
    return result.map(({ users: user, worker_profiles: profile }) => ({
      ...user,
      workerProfile: profile
    }));
  }
  // Notification operations
  async createNotification(notification) {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }
  async getNotificationsByUser(userId) {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }
  async markNotificationAsRead(id) {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }
  // Dashboard operations
  async getDashboardStats(userId, role) {
    console.log(`Fetching dashboard stats for user ${userId} with role ${role}`);
    if (role === "client") {
      const activeInterventions = await db.select({ count: sql`COUNT(*)` }).from(interventions).where(and(eq(interventions.clientId, userId), eq(interventions.status, "in_progress"))).execute();
      console.log("activeInterventions", activeInterventions);
      const completedThisMonth = await db.select({ count: sql`COUNT(*)` }).from(interventions).where(and(
        eq(interventions.clientId, userId),
        eq(interventions.status, "completed"),
        gte(interventions.updatedAt, new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1)),
        lte(interventions.updatedAt, /* @__PURE__ */ new Date())
      )).execute();
      console.log("completedThisMonth", completedThisMonth);
      const totalSpent = await db.select({ sum: sql`SUM(${interventions.maxBudget})` }).from(interventions).where(and(eq(interventions.clientId, userId), eq(interventions.status, "completed"))).execute();
      console.log("totalSpent", totalSpent);
      const favoriteWorkers = await db.select({ count: sql`COUNT(*)` }).from(favorites).where(eq(favorites.clientId, userId)).execute();
      console.log("favoriteWorkers", favoriteWorkers);
      return {
        activeInterventions: activeInterventions[0]?.count || 0,
        completedThisMonth: completedThisMonth[0]?.count || 0,
        totalSpent: totalSpent[0]?.sum || 0,
        favoriteWorkers: favoriteWorkers[0]?.count || 0
      };
    } else {
      const completedThisMonth = await db.select({ count: sql`COUNT(*)` }).from(interventions).where(and(
        eq(interventions.workerId, userId),
        eq(interventions.status, "completed"),
        gte(interventions.updatedAt, new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1)),
        lte(interventions.updatedAt, /* @__PURE__ */ new Date())
      )).execute();
      console.log("worker completedThisMonth", completedThisMonth);
      const monthlyEarnings = await db.select({ sum: sql`SUM(${interventions.maxBudget})` }).from(interventions).where(and(
        eq(interventions.workerId, userId),
        eq(interventions.status, "completed"),
        gte(interventions.updatedAt, new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1)),
        lte(interventions.updatedAt, /* @__PURE__ */ new Date())
      )).execute();
      console.log("worker monthlyEarnings", monthlyEarnings);
      return {
        completedThisMonth: completedThisMonth[0]?.count || 0,
        monthlyEarnings: monthlyEarnings[0]?.sum || 0
      };
    }
  }
  // Admin operations
  async getAllUsers(limit, offset) {
    const result = await db.select().from(users).limit(limit || 20).offset(offset || 0);
    return result;
  }
  async getAllInterventions(limit, offset) {
    const result = await db.select().from(interventions).leftJoin(users, eq(interventions.clientId, users.id)).leftJoin(users, eq(interventions.workerId, users.id)).leftJoin(workerProfiles, eq(interventions.workerId, workerProfiles.userId)).orderBy(desc(interventions.createdAt));
    return result.map(({ interventions: intervention, users: client, users: workerUser, worker_profiles: workerProfile }) => {
      const worker = workerUser ? { ...workerUser, workerProfile } : void 0;
      return {
        ...intervention,
        client,
        worker
      };
    });
  }
  async getUnmoderatedReviews() {
    return await db.select().from(reviews).where(eq(reviews.isModerated, false)).orderBy(desc(reviews.createdAt));
  }
  async updateReviewModeration(id, isModerated, isVisible) {
    const [updatedReview] = await db.update(reviews).set({
      isModerated,
      isVisible
    }).where(eq(reviews.id, id)).returning();
    return updatedReview;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "handyconnect-secret-key",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
      sameSite: "lax",
      path: "/"
    },
    name: "connect.sid",
    rolling: true
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Email ou mot de passe incorrect" });
          }
          const isValidPassword = await comparePasswords(password, user.password || "");
          if (!isValidPassword) {
            return done(null, false, { message: "Email ou mot de passe incorrect" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, role = "client" } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Un utilisateur avec cet email existe d\xE9j\xE0" });
      }
      const hashedPassword = await hashPassword(password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = await storage.createUser({
        id: userId,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role
      });
      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    console.log("Login request received:", req.body);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Authentication failed:", info);
        return res.status(401).json({ message: info.message || "Email ou mot de passe incorrect" });
      }
      console.log("User authenticated:", user.id);
      req.login(user, (err2) => {
        if (err2) {
          console.error("Session login error:", err2);
          return next(err2);
        }
        console.log("Session created for user:", user.id);
        console.log("Session ID:", req.sessionID);
        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        });
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "D\xE9connexion r\xE9ussie" });
    });
  });
  app2.get("/api/login", (req, res) => {
    res.redirect("/auth");
  });
  app2.get("/api/user", (req, res) => {
    console.log("GET /api/user - Session ID:", req.sessionID);
    console.log("GET /api/user - Is authenticated:", req.isAuthenticated());
    console.log("GET /api/user - User:", req.user);
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non authentifi\xE9" });
    }
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role
    });
  });
}
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  next();
}

// server/routes.ts
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { z } from "zod";
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil"
});
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/workers/search", async (req, res) => {
    try {
      console.log("Search workers query params:", req.query);
      const {
        category,
        city,
        minRating,
        maxHourlyRate,
        isAvailable,
        limit = 20,
        offset = 0
      } = req.query;
      const filters = {
        category: category ? String(category).toLowerCase() : void 0,
        city: city ? String(city) : void 0,
        minRating: minRating ? Number(minRating) : void 0,
        maxHourlyRate: maxHourlyRate ? Number(maxHourlyRate) : void 0,
        isAvailable: isAvailable === "true" ? true : void 0,
        limit: Number(limit),
        offset: Number(offset)
      };
      console.log("Processed filters:", filters);
      const workers = await storage.searchWorkers(filters);
      console.log("Found workers:", workers.length);
      res.json(workers);
    } catch (error) {
      console.error("Error searching workers:", error);
      res.status(500).json({ message: "Failed to search workers" });
    }
  });
  app2.get("/api/workers/:id", async (req, res) => {
    try {
      const workerId = req.params.id;
      const worker = await storage.getWorkerWithProfile(workerId);
      if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
      }
      const reviews2 = await storage.getReviewsByWorker(workerId);
      res.json({ ...worker, reviews: reviews2 });
    } catch (error) {
      console.error("Error fetching worker:", error);
      res.status(500).json({ message: "Failed to fetch worker" });
    }
  });
  app2.post("/api/workers/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertWorkerProfileSchema.parse({
        ...req.body,
        userId
      });
      const profile = await storage.createWorkerProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating worker profile:", error);
      res.status(500).json({ message: "Failed to create worker profile" });
    }
  });
  app2.put("/api/workers/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertWorkerProfileSchema.partial().parse(req.body);
      const profile = await storage.updateWorkerProfile(userId, validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating worker profile:", error);
      res.status(500).json({ message: "Failed to update worker profile" });
    }
  });
  app2.post("/api/interventions", requireAuth, async (req, res) => {
    try {
      const clientId = req.user.id;
      console.log("Received intervention data:", req.body);
      const preferredDateParsed = new Date(req.body.preferredDate);
      const estimatedDurationParsed = Number(req.body.estimatedDuration);
      const maxBudgetParsed = String(req.body.maxBudget);
      const dataToValidate = {
        ...req.body,
        preferredDate: preferredDateParsed,
        estimatedDuration: estimatedDurationParsed,
        maxBudget: maxBudgetParsed
      };
      console.log("Data prepared for server-side validation:", dataToValidate);
      console.log("Type of preferredDate in dataToValidate:", typeof dataToValidate.preferredDate, dataToValidate.preferredDate instanceof Date);
      console.log("Type of estimatedDuration in dataToValidate:", typeof dataToValidate.estimatedDuration);
      console.log("Type of maxBudget in dataToValidate:", typeof dataToValidate.maxBudget);
      const validatedData = insertInterventionSchema.parse({
        ...dataToValidate,
        clientId
      });
      console.log("Validated intervention data:", validatedData);
      const intervention = await storage.createIntervention(validatedData);
      console.log("Intervention created successfully:", intervention);
      res.status(201).json(intervention);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation Error creating intervention:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating intervention:", error);
      res.status(500).json({ message: "Failed to create intervention" });
    }
  });
  app2.get("/api/interventions/my", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      let interventions2;
      if (user?.role === "worker") {
        interventions2 = await storage.getInterventionsByWorker(userId);
      } else {
        interventions2 = await storage.getInterventionsByClient(userId);
      }
      res.json(interventions2);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      res.status(500).json({ message: "Failed to fetch interventions" });
    }
  });
  app2.get("/api/interventions/pending", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const workerId = user?.role === "worker" ? userId : void 0;
      const interventions2 = await storage.getPendingInterventions(workerId);
      res.json(interventions2);
    } catch (error) {
      console.error("Error fetching pending interventions:", error);
      res.status(500).json({ message: "Failed to fetch pending interventions" });
    }
  });
  app2.get("/api/interventions/:id", requireAuth, async (req, res) => {
    try {
      const interventionId = parseInt(req.params.id);
      const intervention = await storage.getIntervention(interventionId);
      if (!intervention) {
        return res.status(404).json({ message: "Intervention not found" });
      }
      res.json(intervention);
    } catch (error) {
      console.error("Error fetching intervention:", error);
      res.status(500).json({ message: "Failed to fetch intervention" });
    }
  });
  app2.put("/api/interventions/:id", requireAuth, async (req, res) => {
    try {
      const interventionId = parseInt(req.params.id);
      const validatedData = insertInterventionSchema.partial().parse(req.body);
      const intervention = await storage.updateIntervention(interventionId, validatedData);
      res.json(intervention);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating intervention:", error);
      res.status(500).json({ message: "Failed to update intervention" });
    }
  });
  app2.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const clientId = req.user.id;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        clientId
      });
      const review = await storage.createReview(validatedData);
      await storage.updateWorkerRating(validatedData.workerId);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  app2.get("/api/messages/:interventionId", requireAuth, async (req, res) => {
    try {
      const interventionId = parseInt(req.params.interventionId);
      const messages2 = await storage.getMessagesByIntervention(interventionId);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const senderId = req.user.id;
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      const message = await storage.createMessage(validatedData);
      broadcastMessage({
        type: "new_message",
        data: message
      });
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  app2.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      const clientId = req.user.id;
      const validatedData = insertFavoriteSchema.parse({
        ...req.body,
        clientId
      });
      const favorite = await storage.addFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });
  app2.delete("/api/favorites/:workerId", requireAuth, async (req, res) => {
    try {
      const clientId = req.user.id;
      const workerId = req.params.workerId;
      await storage.removeFavorite(clientId, workerId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });
  app2.get("/api/favorites", requireAuth, async (req, res) => {
    try {
      const clientId = req.user.id;
      const favorites2 = await storage.getFavoritesByClient(clientId);
      res.json(favorites2);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });
  app2.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications2 = await storage.getNotificationsByUser(userId);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.get("/api/admin/users", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { limit = 50, offset = 0 } = req.query;
      const users2 = await storage.getAllUsers(Number(limit), Number(offset));
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/interventions", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { limit = 50, offset = 0 } = req.query;
      const interventions2 = await storage.getAllInterventions(Number(limit), Number(offset));
      res.json(interventions2);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      res.status(500).json({ message: "Failed to fetch interventions" });
    }
  });
  app2.get("/api/admin/reviews/unmoderated", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const reviews2 = await storage.getUnmoderatedReviews();
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching unmoderated reviews:", error);
      res.status(500).json({ message: "Failed to fetch unmoderated reviews" });
    }
  });
  app2.put("/api/admin/reviews/:id/moderate", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const reviewId = parseInt(req.params.id);
      const { isModerated, isVisible } = req.body;
      const review = await storage.updateReviewModeration(reviewId, isModerated, isVisible);
      res.json(review);
    } catch (error) {
      console.error("Error moderating review:", error);
      res.status(500).json({ message: "Failed to moderate review" });
    }
  });
  app2.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let stats = {};
      if (user.role === "client" || user.role === "worker") {
        stats = await storage.getDashboardStats(userId, user.role);
      }
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email, city } = req.body;
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        email,
        city
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      console.log("Received request to create payment intent. Body:", req.body);
      const { amount, description, interventionId } = req.body;
      if (!amount || amount < 1) {
        console.error("Invalid amount received:", amount);
        return res.status(400).json({ message: "Invalid amount" });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "mad",
        // Moroccan Dirham
        description: description || "HandyConnect Service Payment",
        metadata: {
          userId: req.user.id,
          interventionId: interventionId || ""
        }
      });
      console.log("Stripe Payment Intent created:", paymentIntent);
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        message: "Error creating payment intent: " + error.message
      });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        console.log("Received message:", data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });
    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });
  function broadcastMessage(message) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: ["localhost"]
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    console.log(`[Vite Middleware] Catch-all for URL: ${url}`);
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
