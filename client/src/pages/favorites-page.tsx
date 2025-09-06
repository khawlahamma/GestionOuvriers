import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Star, MapPin, Phone, Mail, Trash2 } from "lucide-react";
import { WorkerWithProfile } from "@shared/schema";

export default function FavoritesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<WorkerWithProfile[]>({
    queryKey: ["/api/favorites"],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (workerId: string) => {
      await apiRequest("DELETE", `/api/favorites/${workerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Favori supprimé",
        description: "L'ouvrier a été retiré de vos favoris.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">Mes Favoris</h1>
            <p className="text-muted-foreground">
              {favorites.length} ouvrier{favorites.length !== 1 ? 's' : ''} dans vos favoris
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun favori</h3>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore ajouté d'ouvriers à vos favoris.
                </p>
                <Button>
                  Rechercher des ouvriers
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((worker) => (
              <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {worker.firstName?.[0]}{worker.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {worker.firstName} {worker.lastName}
                        </CardTitle>
                        <CardDescription>
                          {worker.workerProfile?.category}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavoriteMutation.mutate(worker.id)}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {Number(worker.workerProfile?.rating)?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {worker.workerProfile?.hourlyRate} DH/h
                    </Badge>
                  </div>

                  {worker.city && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{worker.city}</span>
                    </div>
                  )}

                  {worker.workerProfile?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {worker.workerProfile.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <Badge variant={worker.workerProfile?.isAvailable ? "default" : "secondary"}>
                      {worker.workerProfile?.isAvailable ? "Disponible" : "Occupé"}
                    </Badge>
                    {worker.workerProfile?.experience && (
                      <Badge variant="outline">
                        {worker.workerProfile.experience} ans d'exp.
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Contacter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}