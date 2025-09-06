export interface SearchFilters {
  category?: string;
  city?: string;
  minRating?: number;
  maxHourlyRate?: number;
  isAvailable?: boolean;
  limit?: number;
  offset?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  workerCount: number;
}

export interface ChatMessage {
  id: number;
  interventionId: number;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  activeInterventions?: number;
  completedThisMonth?: number;
  totalSpent?: number;
  favoriteWorkers?: number;
  averageRating?: number;
  totalReviews?: number;
  monthlyEarnings?: number;
  acceptanceRate?: number;
  totalUsers?: number;
  totalRevenue?: number;
  pendingReviews?: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

export type UserRole = 'client' | 'worker' | 'admin';
export type InterventionStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type ServiceType = 'plumbing' | 'electricity' | 'painting' | 'carpentry' | 'gardening' | 'cleaning' | 'renovation' | 'hvac';
