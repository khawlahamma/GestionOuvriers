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
  alias,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum("user_role", ["client", "worker", "admin"]);

// Intervention status enum
export const interventionStatusEnum = pgEnum("intervention_status", [
  "pending",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
  "disputed"
]);

// Service category enum
export const serviceCategoryEnum = pgEnum("service_category", [
  "plumbing",
  "electricity",
  "painting",
  "carpentry",
  "gardening",
  "cleaning",
  "renovation",
  "hvac"
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"),
  role: userRoleEnum().default("client"),
  city: varchar("city"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create an alias for the users table when used as a worker
export const workerUsers = alias(users, 'worker_users');

// Worker profiles table
export const workerProfiles = pgTable("worker_profiles", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interventions table
export const interventions = pgTable("interventions", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  interventionId: integer("intervention_id").notNull(),
  clientId: varchar("client_id").notNull(),
  workerId: varchar("worker_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isModerated: boolean("is_moderated").default(false),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  interventionId: integer("intervention_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id").notNull(),
  workerId: varchar("worker_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(),
  isRead: boolean("is_read").default(false),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  workerProfile: one(workerProfiles, {
    fields: [users.id],
    references: [workerProfiles.userId],
  }),
  clientInterventions: many(interventions, { relationName: "clientInterventions" }),
  workerInterventions: many(interventions, { relationName: "workerInterventions" }),
  clientReviews: many(reviews, { relationName: "clientReviews" }),
  workerReviews: many(reviews, { relationName: "workerReviews" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  favorites: many(favorites),
  notifications: many(notifications),
}));

export const workerProfilesRelations = relations(workerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [workerProfiles.userId],
    references: [users.id],
  }),
}));

export const interventionsRelations = relations(interventions, ({ one, many }) => ({
  client: one(users, {
    fields: [interventions.clientId],
    references: [users.id],
    relationName: "clientInterventions",
  }),
  worker: one(users, {
    fields: [interventions.workerId],
    references: [users.id],
    relationName: "workerInterventions",
  }),
  reviews: many(reviews),
  messages: many(messages),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  intervention: one(interventions, {
    fields: [reviews.interventionId],
    references: [interventions.id],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
    relationName: "clientReviews",
  }),
  worker: one(users, {
    fields: [reviews.workerId],
    references: [users.id],
    relationName: "workerReviews",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  intervention: one(interventions, {
    fields: [messages.interventionId],
    references: [interventions.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  client: one(users, {
    fields: [favorites.clientId],
    references: [users.id],
  }),
  worker: one(users, {
    fields: [favorites.workerId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertWorkerProfileSchema = createInsertSchema(workerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  totalReviews: true,
});

export const insertInterventionSchema = createInsertSchema(interventions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  isModerated: true,
  isVisible: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type WorkerProfile = typeof workerProfiles.$inferSelect;
export type InsertWorkerProfile = z.infer<typeof insertWorkerProfileSchema>;
export type Intervention = typeof interventions.$inferSelect;
export type InsertIntervention = z.infer<typeof insertInterventionSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Combined types
export type WorkerWithProfile = User & { workerProfile: WorkerProfile };
export type InterventionWithDetails = Intervention & {
  client: User;
  worker?: WorkerWithProfile;
  reviews?: Review[];
};
export type ReviewWithDetails = Review & {
  client: User;
  worker: User;
  intervention: Intervention;
};

export type DashboardStats = {
  activeInterventions?: number;
  completedThisMonth?: number;
  totalSpent?: number;
  favoriteWorkers?: number;
  monthlyEarnings?: number;
  averageRating?: string;
  acceptanceRate?: number;
  totalReviews?: number;
};