import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/common/stats-card";
import ServiceCategory from "@/components/common/service-category";
import { Link } from "wouter";
import { 
  Calendar, 
  CheckCircle, 
  Euro, 
  Star,
  Search,
  Heart,
  FileText,
  Plus,
  MessageCircle,
  Clock,
  MapPin
} from "lucide-react";
import type { User, InterventionWithDetails, Notification, Review } from "@shared/schema";

interface DashboardStats {
  activeInterventions?: number;
  completedThisMonth?: number;
  totalSpent?: number;
  favoriteWorkers?: number;
  monthlyEarnings?: number;
  averageRating?: string;
  acceptanceRate?: number;
  totalReviews?: number;
}

const serviceCategories = [
  { id: 'plumbing', name: 'Plomberie', icon: 'Wrench', color: 'primary', workerCount: 247 },
  { id: 'electricity', name: 'Électricité', icon: 'Zap', color: 'secondary', workerCount: 189 },
  { id: 'painting', name: 'Peinture', icon: 'Paintbrush', color: 'success', workerCount: 156 },
  { id: 'carpentry', name: 'Menuiserie', icon: 'Hammer', color: 'warning', workerCount: 134 },
];

export default function Home() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user,
  });

  const { data: recentInterventions, isLoading: interventionsLoading } = useQuery<InterventionWithDetails[]>({
    queryKey: ['/api/interventions/my'],
    enabled: !!user,
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const isClient = user?.role === 'client';
  const isWorker = user?.role === 'worker';

  const clientStats = [
    {
      title: "Interventions actives",
      value: stats?.activeInterventions || 0,
      icon: Calendar,
      color: "from-primary to-blue-600",
    },
    {
      title: "Terminées ce mois",
      value: stats?.completedThisMonth || 0,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Dépenses totales",
      value: `${stats?.totalSpent || 0}€`,
      icon: Euro,
      color: "from-secondary to-orange-600",
    },
    {
      title: "Ouvriers favoris",
      value: stats?.favoriteWorkers || 0,
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  const workerStats = [
    {
      title: "Interventions ce mois",
      value: stats?.completedThisMonth || 0,
      icon: Calendar,
      color: "from-primary to-blue-600",
    },
    {
      title: "Gains ce mois",
      value: `${stats?.monthlyEarnings || 0}€`,
      icon: Euro,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Note moyenne",
      value: stats?.averageRating || "0.0",
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      title: "Taux d'acceptation",
      value: `${stats?.acceptanceRate || 0}%`,
      icon: CheckCircle,
      color: "from-secondary to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Bonjour {user?.firstName || 'utilisateur'} !
          </h1>
          <p className="text-slate-600">
            {isClient && "Gérez vos interventions et trouvez les meilleurs ouvriers"}
            {isWorker && "Consultez vos demandes et gérez votre activité"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-grid mb-8">
          {(isClient ? clientStats : workerStats).map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="dashboard-content">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions for Clients */}
            {isClient && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/intervention/create">
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle demande
                      </Button>
                    </Link>
                    <Link href="/workers">
                      <Button className="w-full justify-start" variant="outline">
                        <Search className="w-4 h-4 mr-2" />
                        Chercher un ouvrier
                      </Button>
                    </Link>
                    <Link href="/favorites">
                      <Button className="w-full justify-start" variant="outline">
                        <Heart className="w-4 h-4 mr-2" />
                        Mes favoris
                      </Button>
                    </Link>
                    <div>
                      <a
                        href="/invoices"
                        className="inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full px-4 py-2"
                        onClick={() => console.log('Clicked Mes factures A-tag')}
                      >
                      <FileText className="w-4 h-4 mr-2" />
                      Mes factures
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services populaires */}
            {isClient && (
              <Card>
                <CardHeader>
                  <CardTitle>Services populaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {serviceCategories.map((category) => (
                      <ServiceCategory key={category.id} category={category} size="sm" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Interventions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {isClient ? "Interventions récentes" : "Mes interventions"}
                </CardTitle>
                <Link href={isClient ? "/dashboard" : "/dashboard"}>
                  <Button variant="outline" asChild>
                    Voir tout
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {interventionsLoading ? (
                  <div className="text-center py-4 text-slate-500">Chargement des interventions...</div>
                ) : recentInterventions && recentInterventions.length > 0 ? (
                  recentInterventions.map((intervention) => (
                    <div key={intervention.id} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                      <div>
                        <p className="font-medium text-slate-800">{intervention.title}</p>
                        <p className="text-sm text-slate-500">{intervention.category} - {intervention.status}</p>
                  </div>
                      <Link href={`/intervention/${intervention.id}`}>
                        <Button variant="ghost" size="sm">
                          Détails
                        </Button>
                      </Link>
                      </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4">
                    Aucune intervention {isClient ? "récente" : "à afficher"}.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Mon profil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-5xl font-bold mb-4">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{user?.firstName} {user?.lastName}</h3>
                <p className="text-slate-600 mb-4">{user?.role === 'client' ? 'Client' : 'Artisan'}</p>
                <a
                  href="/profile"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full px-4 py-2"
                  onClick={() => console.log('Clicked Modifier le profil A-tag')}
                >
                  Modifier le profil
                </a>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications récentes</CardTitle>
              </CardHeader>
              <CardContent>
                {notifications?.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    Aucune notification
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notifications?.slice(0, 5).map((notification: any) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-600">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
