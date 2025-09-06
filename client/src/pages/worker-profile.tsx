import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Clock, 
  MapPin, 
  Heart, 
  MessageCircle,
  Award,
  Phone,
  Mail,
  Calendar,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { WorkerWithProfile } from "@shared/schema";

export default function WorkerProfile() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const { data: worker, isLoading } = useQuery<WorkerWithProfile | undefined>({
    queryKey: ['/api/workers', id],
  });

  const { data: reviews } = useQuery({
    queryKey: ['/api/reviews/worker', id],
    enabled: !!id,
  });

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      return apiRequest("POST", "/api/reviews", reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Avis ajouté",
        description: "Votre avis a été publié avec succès",
      });
      setReviewText("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/worker', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers', id] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour laisser un avis",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'avis",
        variant: "destructive",
      });
    },
  });

  const saveFavoriteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/favorites", { workerId: id });
    },
    onSuccess: () => {
      toast({
        title: "Ouvrier sauvegardé",
        description: "L'ouvrier a été ajouté à vos favoris",
      });
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

    if (!worker) return;

    const hourlyRate = parseFloat(worker.workerProfile.hourlyRate) || 100;
    const params = new URLSearchParams({
      amount: (hourlyRate * 2).toString(),
      description: `Réservation - ${worker.firstName} ${worker.lastName}`,
      workerName: `${worker.firstName} ${worker.lastName}`,
      serviceType: worker.workerProfile.specializations?.[0] || 'Service',
    });
    
    window.location.href = `/payment?${params.toString()}`;
  };

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

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour laisser un avis",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "Avis requis",
        description: "Veuillez saisir votre avis",
        variant: "destructive",
      });
      return;
    }

    addReviewMutation.mutate({
      workerId: id,
      rating: reviewRating,
      comment: reviewText.trim(),
    });
  };

  const getSpecializationDisplay = (spec: string) => {
    const specializations: { [key: string]: string } = {
      plumbing: "Plomberie",
      electricity: "Électricité", 
      painting: "Peinture",
      carpentry: "Menuiserie",
      gardening: "Jardinage",
      cleaning: "Nettoyage",
      renovation: "Rénovation",
      hvac: "Climatisation"
    };
    return specializations[spec] || spec;
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ouvrier introuvable</h1>
          <p className="text-gray-600 mb-8">Le profil demandé n'existe pas ou a été supprimé.</p>
          <Link href="/workers">
            <Button>Retour à la recherche</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const rating = parseFloat(worker.workerProfile.rating ?? '0') || 0;
  const profileImageUrl = worker.profileImageUrl != null
    ? worker.profileImageUrl
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.firstName ?? "-"}-${worker.lastName ?? "-"}`;
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="w-32 h-32 mx-auto md:mx-0">
                    <AvatarImage src={profileImageUrl ?? undefined} alt={`${worker.firstName ?? ""} ${worker.lastName ?? ""}`} />
                    <AvatarFallback className="text-2xl">
                      {(worker.firstName?.[0] || "")}{(worker.lastName?.[0] || "")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {worker.firstName ?? ""} {worker.lastName ?? ""}
                    </h1>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                      {worker.workerProfile.specializations?.map((spec: string) => (
                        <Badge key={spec} variant="secondary">
                          {getSpecializationDisplay(spec)}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        {renderStars(rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {rating.toFixed(1)} ({worker.workerProfile.totalReviews} avis)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {worker.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {worker.workerProfile.experience} ans d'expérience
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-green-600" />
                        {worker.workerProfile.isAvailable ? "Disponible" : "Occupé"}
                      </span>
                    </div>
                    
                    <p className="text-2xl font-bold text-primary mb-4">
                      {worker.workerProfile.hourlyRate} DH/heure
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={handleContactWorker} className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Réserver maintenant
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleSaveWorker}
                        className="flex-1"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {worker.workerProfile.description && (
              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {worker.workerProfile.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {worker.workerProfile.skills && worker.workerProfile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Compétences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {worker.workerProfile.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Avis clients ({safeReviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Review Form */}
                {isAuthenticated && (
                  <div className="border-b pb-6">
                    <h3 className="font-semibold mb-4">Laisser un avis</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Note</Label>
                        <div className="mt-1">
                          {renderStars(reviewRating, true, setReviewRating)}
                        </div>
                      </div>
                      <div>
                        <Label>Votre avis</Label>
                        <Textarea
                          placeholder="Partagez votre expérience avec cet ouvrier..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleSubmitReview}
                        disabled={addReviewMutation.isPending}
                      >
                        {addReviewMutation.isPending ? "Publication..." : "Publier l'avis"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {safeReviews.length > 0 ? (
                    safeReviews.map((review: any) => (
                      <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.client.profileImageUrl} />
                            <AvatarFallback>
                              {review.client.firstName?.[0] ?? ""}{review.client.lastName?.[0] ?? ""}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {review.client.firstName ?? ""} {review.client.lastName ?? ""}
                              </span>
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {review.comment}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString('fr-FR') : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Aucun avis pour le moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {worker.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{worker.email}</span>
                  </div>
                )}
                {worker.workerProfile.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{worker.workerProfile.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Membre depuis {worker.createdAt ? new Date(worker.createdAt).getFullYear() : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Note moyenne</span>
                  <span className="font-semibold">{rating.toFixed(1)}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avis totaux</span>
                  <span className="font-semibold">{worker.workerProfile.totalReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expérience</span>
                  <span className="font-semibold">{worker.workerProfile.experience} ans</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tarif</span>
                  <span className="font-semibold">{worker.workerProfile.hourlyRate} DH/h</span>
                </div>
              </CardContent>
            </Card>

            {/* Verification */}
            <Card>
              <CardHeader>
                <CardTitle>Vérifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Identité vérifiée</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Email vérifié</span>
                </div>
                {worker.workerProfile.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Téléphone vérifié</span>
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