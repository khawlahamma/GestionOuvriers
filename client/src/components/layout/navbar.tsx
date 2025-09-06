import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Menu, 
  Settings, 
  User,
  Home,
  Search,
  Calendar,
  Shield
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: isAuthenticated,
  });

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  const navigation = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Trouver un Ouvrier', href: '/workers', icon: Search },
    ...(isAuthenticated ? [
      { name: 'Mes Interventions', href: '/dashboard', icon: Calendar },
    ] : []),
    ...(user?.role === 'admin' ? [
      { name: 'Administration', href: '/admin', icon: Shield },
    ] : []),
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">
                  HandyConnect
                </h1>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href}>
                      <span className={`nav-link ${isActive(item.href) ? 'active' : ''}`}>
                        <Icon className="w-4 h-4 mr-1 inline" />
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <a href="/api/login" className="text-slate-500 hover:text-primary font-medium transition-colors">
                  Se Connecter
                </a>
                <a href="/api/login">
                  <Button className="btn-primary">
                    S'inscrire
                  </Button>
                </a>
              </div>
            ) : (
              <>
                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-slate-700 hover:text-primary">
                      <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={user?.profileImageUrl || undefined} 
                          alt={`${user?.firstName} ${user?.lastName}`} 
                        />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block font-medium">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-2" />
                        Mon Profil
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Calendar className="w-4 h-4 mr-2" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
