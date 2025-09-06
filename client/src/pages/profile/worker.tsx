import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, DollarSign, Mail, Phone } from "lucide-react";
import type { WorkerWithProfile, Review, ReviewWithDetails } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function WorkerProfile() {
  const [match, params] = useRoute("/worker/:id");
  const workerId = params?.id;

  const { data: worker, isLoading } = useQuery<WorkerWithProfile | undefined>({
    queryKey: ["/api/workers", workerId],
    enabled: !!workerId,
  });

  const { data: reviews = [] } = useQuery<ReviewWithDetails[]>({
    queryKey: ["/api/workers", workerId, "reviews"],
    enabled: !!workerId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Worker not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rating = parseFloat(worker.workerProfile?.rating?.toString() || "0") || 0; // Ensure rating is a number
  const profileImageUrl = worker.profileImageUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.firstName}-${worker.lastName}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileImageUrl} alt={`${worker.firstName} ${worker.lastName}`} />
                    <AvatarFallback>{worker.firstName?.[0]}{worker.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                <div>
                    <CardTitle className="text-3xl font-bold">
                    {worker.firstName} {worker.lastName}
                  </CardTitle>
                    <p className="text-muted-foreground mt-1">{worker.workerProfile?.specializations?.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({worker.workerProfile?.totalReviews || 0} avis)
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {worker.workerProfile?.category && (
                  <Badge variant="secondary">
                    {worker.workerProfile.category}
                  </Badge>
                )}
                {worker.workerProfile?.specializations?.map((spec: string) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{worker.city || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{worker.workerProfile?.experience || 0} ans d'expérience</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{worker.workerProfile?.hourlyRate || 0} DH/heure</span>
                </div>
              </div>

              {worker.workerProfile?.description && (
                <div>
                  <h3 className="font-medium mb-2">À propos</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {worker.workerProfile.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Avis clients ({reviews?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(reviews) && reviews.length > 0 ? (
                  reviews.slice(0, 5).map((review: ReviewWithDetails) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {review.client?.firstName} {review.client?.lastName}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (review.rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun avis pour le moment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Statut</span>
                  <Badge variant={worker.workerProfile?.isAvailable ? 'default' : 'secondary'}>
                    {worker.workerProfile?.isAvailable ? 'Disponible' : 'Occupé'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">Demander une intervention</Button>
              <Button variant="outline" className="w-full">Envoyer un message</Button>
              <Button variant="outline" className="w-full">Ajouter aux favoris</Button>

              {worker.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{worker.email}</span>
                </div>
              )}
              {worker.workerProfile?.phoneNumber && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{worker.workerProfile.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Membre depuis {new Date(worker.createdAt || '').getFullYear()}</span>
              </div>
            </CardContent>
          </Card>

          {worker.workerProfile?.certifications && worker.workerProfile.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {worker.workerProfile.certifications.map((cert: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Statistiques Clés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Avis totaux:</span>
                <span className="font-semibold">{worker.workerProfile?.totalReviews || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Expérience:</span>
                <span className="font-semibold">{worker.workerProfile?.experience || 0} ans</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Taux horaire:</span>
                <span className="font-semibold">{worker.workerProfile?.hourlyRate || 0} DH/h</span>
              </div>
            </CardContent>
          </Card>

          {worker.workerProfile?.phoneNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Appeler l'ouvrier</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => window.location.href = `tel:${worker.workerProfile.phoneNumber}`}>
                  Appeler {worker.firstName} {worker.lastName}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}