import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WorkerCard from "@/components/worker/worker-card";
import { SearchFilters } from "@/types";
import { Search, Filter } from "lucide-react";

export default function WorkerSearch() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<SearchFilters>({
    limit: 20,
    offset: 0,
  });

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
      setFilters(prev => ({
        ...prev,
        category: category,
      }));
    }
  }, [location]);
  
  const [showFilters, setShowFilters] = useState(false);

  const { data: workers, isLoading, error } = useQuery({
    queryKey: ['/api/workers/search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/workers/search?${params}`);
      if (!response.ok) throw new Error('Failed to search workers');
      return response.json();
    },
  });

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    // Handle "all" values by setting to undefined
    if (newFilters.category === "all") {
      newFilters.category = undefined;
    }
    if (newFilters.minRating && newFilters.minRating.toString() === "all") {
      newFilters.minRating = undefined;
    }
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  };

  const clearFilters = () => {
    setFilters({ limit: 20, offset: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Trouver un ouvrier</h1>
          
          {/* Quick Search */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select 
                    value={filters.category || "all"} 
                    onValueChange={(value) => updateFilters({ category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les services</SelectItem>
                      <SelectItem value="plumbing">Plomberie</SelectItem>
                      <SelectItem value="electricity">Électricité</SelectItem>
                      <SelectItem value="painting">Peinture</SelectItem>
                      <SelectItem value="carpentry">Menuiserie</SelectItem>
                      <SelectItem value="gardening">Jardinage</SelectItem>
                      <SelectItem value="cleaning">Nettoyage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input 
                    placeholder="Paris, Lyon, Marseille..."
                    value={filters.city || ''}
                    onChange={(e) => updateFilters({ city: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Note minimum</Label>
                  <Select onValueChange={(value) => updateFilters({ minRating: value === "all" ? undefined : parseFloat(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les notes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les notes</SelectItem>
                      <SelectItem value="4">4 étoiles et plus</SelectItem>
                      <SelectItem value="4.5">4.5 étoiles et plus</SelectItem>
                      <SelectItem value="4.8">4.8 étoiles et plus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end space-x-2">
                  <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="flex-1">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </Button>
                  <Button onClick={clearFilters} variant="ghost">
                    Effacer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-1/4">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Filtres avancés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Tarif horaire</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="number" 
                        placeholder="Min DH"
                        onChange={(e) => updateFilters({ 
                          maxHourlyRate: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                      />
                      <Input 
                        type="number" 
                        placeholder="Max DH"
                        value={filters.maxHourlyRate || ''}
                        onChange={(e) => updateFilters({ 
                          maxHourlyRate: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Disponibilité</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="available"
                          checked={filters.isAvailable === true}
                          onCheckedChange={(checked) => 
                            updateFilters({ isAvailable: checked ? true : undefined })
                          }
                        />
                        <Label htmlFor="available" className="text-sm">
                          Disponible maintenant
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    Effacer tous les filtres
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? "lg:w-3/4" : "w-full"}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {isLoading ? "Recherche..." : `${workers?.length || 0} ouvriers trouvés`}
              </h2>
              <Select defaultValue="rating">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Note la plus élevée</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="experience">Expérience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="loading-skeleton h-48 rounded-xl"></div>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-red-600">Erreur lors de la recherche des ouvriers</p>
                  <Button onClick={() => window.location.reload()} className="mt-4">
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            ) : workers?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Aucun ouvrier trouvé
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Essayez d'ajuster vos critères de recherche
                  </p>
                  <Button onClick={clearFilters}>Effacer les filtres</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-6">
                  {workers?.map((worker: any) => (
                    <WorkerCard key={worker.id} worker={worker} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center mt-12">
                  <nav className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      disabled={filters.offset === 0}
                      onClick={() => updateFilters({ 
                        offset: Math.max(0, (filters.offset || 0) - (filters.limit || 20))
                      })}
                    >
                      Précédent
                    </Button>
                    <span className="px-4 py-2 text-sm text-slate-600">
                      Page {Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1}
                    </span>
                    <Button 
                      variant="ghost"
                      disabled={workers?.length < (filters.limit || 20)}
                      onClick={() => updateFilters({ 
                        offset: (filters.offset || 0) + (filters.limit || 20)
                      })}
                    >
                      Suivant
                    </Button>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
