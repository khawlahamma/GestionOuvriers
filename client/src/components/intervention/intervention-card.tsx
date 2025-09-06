import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageCircle, 
  Star,
  Euro,
  AlertTriangle
} from "lucide-react";

interface InterventionCardProps {
  intervention: {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    isUrgent: boolean;
    scheduledDate?: string;
    estimatedCost?: string;
    finalCost?: string;
    address: string;
    city: string;
    client?: {
      firstName: string;
      lastName: string;
    };
    worker?: {
      firstName: string;
      lastName: string;
    };
  };
  showActions?: boolean;
  userRole?: 'client' | 'worker';
}

export default function InterventionCard({ 
  intervention, 
  showActions = true,
  userRole = 'client'
}: InterventionCardProps) {
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'En attente',
      'accepted': 'Acceptée',
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée',
      'disputed': 'Litige',
    };
    return statusMap[status] || status;
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      'plumbing': 'Plomberie',
      'electricity': 'Électricité',
      'painting': 'Peinture',
      'carpentry': 'Menuiserie',
      'gardening': 'Jardinage',
      'cleaning': 'Nettoyage',
      'renovation': 'Rénovation',
      'hvac': 'Chauffage/Climatisation',
    };
    return categoryMap[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'plumbing': '🔧',
      'electricity': '⚡',
      'painting': '🎨',
      'carpentry': '🔨',
      'gardening': '🌱',
      'cleaning': '🧹',
      'renovation': '🏗️',
      'hvac': '🌡️',
    };
    return iconMap[category] || '🔧';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Category Icon */}
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
            intervention.category === 'plumbing' ? 'bg-primary/10' :
            intervention.category === 'electricity' ? 'bg-secondary/10' :
            'bg-slate-100'
          }`}>
            {getCategoryIcon(intervention.category)}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{intervention.title}</h4>
                  {intervention.isUrgent && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                  <span>{getCategoryDisplay(intervention.category)}</span>
                  {intervention.scheduledDate && (
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(intervention.scheduledDate).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {intervention.city}
                  </span>
                </div>

                {/* Client/Worker info */}
                {userRole === 'worker' && intervention.client && (
                  <p className="text-sm text-slate-600 mb-2">
                    Client: {intervention.client.firstName} {intervention.client.lastName}
                  </p>
                )}
                {userRole === 'client' && intervention.worker && (
                  <p className="text-sm text-slate-600 mb-2">
                    Ouvrier: {intervention.worker.firstName} {intervention.worker.lastName}
                  </p>
                )}

                <p className="text-sm text-slate-700 line-clamp-2">
                  {intervention.description}
                </p>
              </div>

              <div className="text-right">
                <Badge className={`intervention-status status-${intervention.status} mb-2`}>
                  {getStatusDisplay(intervention.status)}
                </Badge>
                {(intervention.finalCost || intervention.estimatedCost) && (
                  <div className="flex items-center text-sm">
                    <Euro className="w-4 h-4 mr-1" />
                    <span className="font-medium">
                      {intervention.finalCost || intervention.estimatedCost}€
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  ID: #{intervention.id}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                  <Link href={`/intervention/${intervention.id}`}>
                    <Button size="sm" variant="outline">
                      Détails
                    </Button>
                  </Link>
                  {intervention.status === 'completed' && userRole === 'client' && (
                    <Button size="sm" variant="outline">
                      <Star className="w-4 h-4 mr-1" />
                      Noter
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
