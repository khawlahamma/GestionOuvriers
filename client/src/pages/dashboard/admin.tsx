import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, DollarSign, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: interventions = [] } = useQuery({
    queryKey: ["/api/admin/interventions"],
  });

  const { data: unmoderatedReviews = [] } = useQuery({
    queryKey: ["/api/admin/reviews/unmoderated"],
  });

  const stats = {
    totalUsers: Array.isArray(users) ? users.length : 0,
    totalInterventions: Array.isArray(interventions) ? interventions.length : 0,
    totalRevenue: Array.isArray(interventions) ? interventions.reduce((sum: number, i: any) => sum + (i.price || 0), 0) : 0,
    pendingReviews: Array.isArray(unmoderatedReviews) ? unmoderatedReviews.length : 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the HandyConnect platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interventions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInterventions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(users) && users.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              ))}
              
              {!Array.isArray(users) || users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Interventions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Interventions</CardTitle>
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
                  <p className="text-muted-foreground">No interventions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
        <div className="flex gap-4">
          <Button>Manage Users</Button>
          <Button variant="outline">Moderate Reviews</Button>
          <Button variant="outline">View Reports</Button>
        </div>
      </div>
    </div>
  );
}