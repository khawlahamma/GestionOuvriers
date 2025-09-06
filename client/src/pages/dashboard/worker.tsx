import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Star, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function WorkerDashboard() {
  const { user } = useAuth();
  
  const { data: interventions = [] } = useQuery({
    queryKey: ["/api/interventions/my"],
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const stats = {
    pendingRequests: Array.isArray(interventions) ? interventions.filter((i: any) => i.status === 'pending').length : 0,
    activeJobs: Array.isArray(interventions) ? interventions.filter((i: any) => i.status === 'in_progress').length : 0,
    completedJobs: Array.isArray(interventions) ? interventions.filter((i: any) => i.status === 'completed').length : 0,
    monthlyEarnings: Array.isArray(interventions) ? interventions.reduce((sum: number, i: any) => sum + (i.price || 0), 0) : 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || 'Worker'}</h1>
        <p className="text-muted-foreground">Manage your jobs and track your earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyEarnings}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(interventions) && interventions.slice(0, 5).map((intervention: any) => (
                <div key={intervention.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{intervention.title || 'Intervention'}</h3>
                    <p className="text-sm text-muted-foreground">{intervention.category || 'General'}</p>
                  </div>
                  <Badge variant={
                    intervention.status === 'completed' ? 'default' :
                    intervention.status === 'in_progress' ? 'secondary' :
                    'outline'
                  }>
                    {intervention.status || 'pending'}
                  </Badge>
                </div>
              ))}
              
              {!Array.isArray(interventions) || interventions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No jobs yet</p>
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
              {Array.isArray(notifications) && notifications.slice(0, 5).map((notification: any) => (
                <div key={notification.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              
              {!Array.isArray(notifications) || notifications.length === 0 && (
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
          <Link href="/interventions/pending">
            <Button>View Pending Requests</Button>
          </Link>
          <Button variant="outline">Update Profile</Button>
        </div>
      </div>
    </div>
  );
}