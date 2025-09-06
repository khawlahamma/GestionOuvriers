import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  Clock, 
  MapPin, 
  Heart, 
  MessageCircle,
  Award
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface WorkerCardProps {
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    city?: string;
    workerProfile: {
      hourlyRate: string;
      experience: number;
      rating: string;
      totalReviews: number;
      specializations: string[];
      description?: string;
      skills?: string[];
      isAvailable: boolean;
    };
  };
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveFavoriteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/favorites", { workerId: worker.id });
    },
    onSuccess: () => {
      toast({
        title: "Ouvrier sauvegardé",
        description: "L'ouvrier a été ajouté à vos favoris",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour sauvegarder un ouvrier",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder cet ouvrier",
        variant: "destructive",
      });
    },
  });

  const handleSaveWorker = () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour sauvegarder un ouvrier",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    saveFavoriteMutation.mutate();
  };

  const handleContactWorker = () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour contacter un ouvrier",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    // Redirect to payment page with worker details
    const hourlyRate = parseFloat(worker.workerProfile.hourlyRate) || 100;
    const params = new URLSearchParams({
      amount: (hourlyRate * 2).toString(), // 2 hours minimum
      description: `Réservation - ${worker.firstName} ${worker.lastName}`,
      workerName: `${worker.firstName} ${worker.lastName}`,
      serviceType: worker.workerProfile.specializations?.[0] || 'Service',
    });
    
    window.location.href = `/payment?${params.toString()}`;
  };
  const rating = parseFloat(worker.workerProfile.rating);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const getSpecializationDisplay = (specialization: string) => {
    const displayMap: Record<string, string> = {
      'plumbing': 'Plomberie',
      'electricity': 'Électricité',
      'painting': 'Peinture',
      'carpentry': 'Menuiserie',
      'gardening': 'Jardinage',
      'cleaning': 'Nettoyage',
      'renovation': 'Rénovation',
      'hvac': 'Chauffage/Climatisation',
    };
    return displayMap[specialization] || specialization;
  };

  const getAvailabilityText = () => {
    if (!worker.workerProfile.isAvailable) return "Non disponible";
    return "Disponible aujourd'hui";
  };

  const getAvailabilityColor = () => {
    return worker.workerProfile.isAvailable ? "text-green-600" : "text-red-600";
  };

  return (
    <Card className="worker-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <Avatar className="w-32 h-32 mx-auto md:mx-0">
            <AvatarImage 
              src={worker.profileImageUrl} 
              alt={`${worker.firstName} ${worker.lastName}`}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl">
              {worker.firstName[0]}{worker.lastName[0]}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {worker.firstName} {worker.lastName}
                </h3>
                <p className="text-slate-600 mb-2">
                  {worker.workerProfile.specializations?.map(getSpecializationDisplay).join(", ")} • {worker.city}
                </p>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={i < fullStars || (i === fullStars && hasHalfStar) ? "star-filled" : "star-empty"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-slate-600">
                    {rating.toFixed(1)} ({worker.workerProfile.totalReviews} avis)
                  </span>
                </div>
                
                {/* Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className={`flex items-center ${getAvailabilityColor()}`}>
                    <Clock className="w-4 h-4 mr-1" />
                    {getAvailabilityText()}
                  </span>
                  <span className="flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    {worker.workerProfile.experience} ans d'expérience
                  </span>
                  {worker.city && (
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {worker.city}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Price */}
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  {worker.workerProfile.hourlyRate} DH
                </div>
                <div className="text-sm text-slate-600">par heure</div>
              </div>
            </div>

            {/* Description */}
            {worker.workerProfile.description && (
              <p className="text-slate-700 mb-4 line-clamp-2">
                {worker.workerProfile.description}
              </p>
            )}

            {/* Skills */}
            {worker.workerProfile.skills && worker.workerProfile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {worker.workerProfile.skills.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {worker.workerProfile.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{worker.workerProfile.skills.length - 4} autres
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {worker.workerProfile.specializations?.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {getSpecializationDisplay(spec)}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveWorker();
                  }}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Sauvegarder
                </Button>
                <Button 
                  size="sm" 
                  className="btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleContactWorker();
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Contacter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
