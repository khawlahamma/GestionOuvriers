import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, requireAuth } from "./auth";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import {
  insertWorkerProfileSchema,
  insertInterventionSchema,
  insertReviewSchema,
  insertMessageSchema,
  insertFavoriteSchema,
  insertNotificationSchema,
  DashboardStats,
} from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth routes
  // Note: User routes are now handled in auth.ts

  // Worker routes
  app.get('/api/workers/search', async (req: Request, res: Response) => {
    try {
      console.log('Search workers query params:', req.query);
      
      const {
        category,
        city,
        minRating,
        maxHourlyRate,
        isAvailable,
        limit = 20,
        offset = 0
      } = req.query;

      // Convertir les paramètres en types appropriés
      const filters = {
        category: category ? String(category).toLowerCase() : undefined,
        city: city ? String(city) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        maxHourlyRate: maxHourlyRate ? Number(maxHourlyRate) : undefined,
        isAvailable: isAvailable === 'true' ? true : undefined,
        limit: Number(limit),
        offset: Number(offset)
      };

      console.log('Processed filters:', filters);

      const workers = await storage.searchWorkers(filters);
      console.log('Found workers:', workers.length);
      
      res.json(workers);
    } catch (error) {
      console.error("Error searching workers:", error);
      res.status(500).json({ message: "Failed to search workers" });
    }
  });

  app.get('/api/workers/:id', async (req: Request, res: Response) => {
    try {
      const workerId = req.params.id;
      const worker = await storage.getWorkerWithProfile(workerId);
      
      if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
      }

      const reviews = await storage.getReviewsByWorker(workerId);
      res.json({ ...worker, reviews });
    } catch (error) {
      console.error("Error fetching worker:", error);
      res.status(500).json({ message: "Failed to fetch worker" });
    }
  });

  // Worker profile routes
  app.post('/api/workers/profile', requireAuth, async (req: any, res: Response) => {
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

  app.put('/api/workers/profile', requireAuth, async (req: any, res: Response) => {
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

  // Intervention routes
  app.post('/api/interventions', requireAuth, async (req: any, res: Response) => {
    try {
      const clientId = req.user.id;
      console.log('Received intervention data:', req.body);

      const preferredDateParsed = new Date(req.body.preferredDate);
      const estimatedDurationParsed = Number(req.body.estimatedDuration);
      const maxBudgetParsed = String(req.body.maxBudget);

      const dataToValidate = {
        ...req.body,
        preferredDate: preferredDateParsed, 
        estimatedDuration: estimatedDurationParsed, 
        maxBudget: maxBudgetParsed, 
      };
      
      console.log('Data prepared for server-side validation:', dataToValidate);
      console.log('Type of preferredDate in dataToValidate:', typeof dataToValidate.preferredDate, dataToValidate.preferredDate instanceof Date);
      console.log('Type of estimatedDuration in dataToValidate:', typeof dataToValidate.estimatedDuration);
      console.log('Type of maxBudget in dataToValidate:', typeof dataToValidate.maxBudget);

      const validatedData = insertInterventionSchema.parse({
        ...dataToValidate,
        clientId
      });
      console.log('Validated intervention data:', validatedData);
      const intervention = await storage.createIntervention(validatedData);
      console.log('Intervention created successfully:', intervention);
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

  app.get('/api/interventions/my', requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      let interventions;
      if (user?.role === 'worker') {
        interventions = await storage.getInterventionsByWorker(userId);
      } else {
        interventions = await storage.getInterventionsByClient(userId);
      }
      
      res.json(interventions);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      res.status(500).json({ message: "Failed to fetch interventions" });
    }
  });

  app.get('/api/interventions/pending', requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      const workerId = user?.role === 'worker' ? userId : undefined;
      const interventions = await storage.getPendingInterventions(workerId);
      
      res.json(interventions);
    } catch (error) {
      console.error("Error fetching pending interventions:", error);
      res.status(500).json({ message: "Failed to fetch pending interventions" });
    }
  });

  app.get('/api/interventions/:id', requireAuth, async (req: any, res: Response) => {
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

  app.put('/api/interventions/:id', requireAuth, async (req: any, res: Response) => {
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

  // Review routes
  app.post('/api/reviews', requireAuth, async (req: any, res: Response) => {
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

  // Message routes
  app.get('/api/messages/:interventionId', requireAuth, async (req: any, res: Response) => {
    try {
      const interventionId = parseInt(req.params.interventionId);
      const messages = await storage.getMessagesByIntervention(interventionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', requireAuth, async (req: any, res: Response) => {
    try {
      const senderId = req.user.id;
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });

      const message = await storage.createMessage(validatedData);
      
      // Broadcast message via WebSocket
      broadcastMessage({
        type: 'new_message',
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

  // Favorite routes
  app.post('/api/favorites', requireAuth, async (req: any, res: Response) => {
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

  app.delete('/api/favorites/:workerId', requireAuth, async (req: any, res: Response) => {
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

  app.get('/api/favorites', requireAuth, async (req: any, res: Response) => {
    try {
      const clientId = req.user.id;
      const favorites = await storage.getFavoritesByClient(clientId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Notification routes
  app.get('/api/notifications', requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', requireAuth, async (req: any, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { limit = 50, offset = 0 } = req.query;
      const users = await storage.getAllUsers(Number(limit), Number(offset));
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/interventions', requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { limit = 50, offset = 0 } = req.query;
      const interventions = await storage.getAllInterventions(Number(limit), Number(offset));
      res.json(interventions);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      res.status(500).json({ message: "Failed to fetch interventions" });
    }
  });

  app.get('/api/admin/reviews/unmoderated', requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const reviews = await storage.getUnmoderatedReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching unmoderated reviews:", error);
      res.status(500).json({ message: "Failed to fetch unmoderated reviews" });
    }
  });

  app.put('/api/admin/reviews/:id/moderate', requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
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

  // Dashboard stats route
  app.get('/api/dashboard/stats', requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let stats: DashboardStats = {};

      // Only fetch stats for clients and workers
      if (user.role === 'client' || user.role === 'worker') {
        stats = await storage.getDashboardStats(userId, user.role);
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Stripe payment routes
  // User profile update route
  app.put('/api/user/profile', requireAuth, async (req: any, res: Response) => {
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
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/create-payment-intent", requireAuth, async (req: any, res: Response) => {
    try {
      console.log('Received request to create payment intent. Body:', req.body);
      const { amount, description, interventionId } = req.body;
      
      if (!amount || amount < 1) {
        console.error('Invalid amount received:', amount);
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "mad", // Moroccan Dirham
        description: description || "HandyConnect Service Payment",
        metadata: {
          userId: req.user.id,
          interventionId: interventionId || "",
        },
      });

      console.log('Stripe Payment Intent created:', paymentIntent);
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        // Handle different message types here
        console.log('Received message:', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  function broadcastMessage(message: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}