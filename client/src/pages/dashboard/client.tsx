import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, DollarSign, Star } from "lucide-react";
import { Link } from "wouter";
import type { InterventionWithDetails, Notification, DashboardStats } from "@shared/schema";

export default function ClientDashboard() {
  const { user } = useAuth();
  
  const { data: interventions = [] } = useQuery<InterventionWithDetails[]>({
    queryKey: ["/api/interventions/my"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Using fetched dashboardStats or default values if loading/undefined
  const stats = {
    activeInterventions: dashboardStats?.activeInterventions || 0,
    completedThisMonth: dashboardStats?.completedThisMonth || 0,
    totalSpent: dashboardStats?.totalSpent || 0,
    favoriteWorkers: dashboardStats?.favoriteWorkers || 0,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || 'Client'}</h1>
        <p className="text-muted-foreground">Manage your interventions and track progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interventions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "Loading..." : stats.activeInterventions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "Loading..." : stats.completedThisMonth}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "Loading..." : `$${stats.totalSpent}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "Loading..." : stats.favoriteWorkers}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Interventions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interventions.slice(0, 5).map((intervention: InterventionWithDetails) => (
                <div key={intervention.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{intervention.title}</h3>
                    <p className="text-sm text-muted-foreground">{intervention.category}</p>
                  </div>
                  <Badge variant={
                    intervention.status === 'completed' ? 'default' :
                    intervention.status === 'in_progress' ? 'secondary' :
                    'outline'
                  }>
                    {intervention.status}
                  </Badge>
                </div>
              ))}
              
              {interventions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No interventions yet</p>
                  <Link href="/workers">
                    <Button className="mt-4">Find Workers</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.slice(0, 5).map((notification: Notification) => (
                <div key={notification.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.createdAt ? new Date(notification.createdAt.toString()).toLocaleDateString() : ''}
                  </p>
                </div>
              ))}
              
              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No notifications</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link href="/workers">
            <Button>Find Workers</Button>
          </Link>
          <Link href="/intervention/create">
            <Button variant="outline">Create Intervention</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}