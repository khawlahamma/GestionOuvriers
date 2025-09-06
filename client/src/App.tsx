import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import WorkerSearch from "@/pages/worker-search";
import ClientDashboard from "@/pages/dashboard/client";
import WorkerDashboard from "@/pages/dashboard/worker";
import AdminDashboard from "@/pages/dashboard/admin";
import CreateIntervention from "@/pages/intervention/create";
import InterventionDetails from "@/pages/intervention/details";
import WorkerProfileOld from "@/pages/profile/worker";
import WorkerRegistration from "@/pages/worker-registration";
import WorkerProfile from "@/pages/worker-profile";
import Payment from "@/pages/payment";
import PaymentSuccess from "@/pages/payment-success";
import ProfilePage from "@/pages/profile-page";
import FavoritesPage from "@/pages/favorites-page";
import NotificationsPage from "@/pages/notifications-page";
import InvoicesPage from "@/pages/invoices-page";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!user ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/workers" component={WorkerSearch} />
          <Route path="/worker/:id" component={WorkerProfile} />
          <Route path="/worker-registration" component={WorkerRegistration} />
          <Route path="/payment" component={Payment} />
          <Route path="/payment-success" component={PaymentSuccess} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/workers" component={WorkerSearch} />
          <Route path="/worker/:id" component={WorkerProfile} />
          <Route path="/intervention/create" component={CreateIntervention} />
          <Route path="/intervention/:id" component={InterventionDetails} />
          <Route path="/payment" component={Payment} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/invoices" component={InvoicesPage} />
          
          {user?.role === 'client' && (
            <Route path="/dashboard" component={ClientDashboard} />
          )}
          
          {user?.role === 'worker' && (
            <Route path="/dashboard" component={WorkerDashboard} />
          )}
          
          {user?.role === 'admin' && (
            <Route path="/admin" component={AdminDashboard} />
          )}
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
