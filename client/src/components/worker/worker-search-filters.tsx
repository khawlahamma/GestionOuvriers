import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/types";

interface WorkerSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
}

export default function WorkerSearchFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: WorkerSearchFiltersProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Filtres avancés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Category */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Service</Label>
          <Select 
            value={filters.category || "all"} 
            onValueChange={(value) => onFiltersChange({ category: value === "all" ? undefined : value })}
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
              <SelectItem value="renovation">Rénovation</SelectItem>
              <SelectItem value="hvac">Chauffage/Climatisation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Ville</Label>
          <Input 
            placeholder="Paris, Lyon, Marseille..."
            value={filters.city || ''}
            onChange={(e) => onFiltersChange({ city: e.target.value || undefined })}
          />
        </div>

        {/* Rating */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Note minimum</Label>
          <Select 
            value={filters.minRating?.toString() || ""} 
            onValueChange={(value) => onFiltersChange({ minRating: value ? parseFloat(value) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les notes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les notes</SelectItem>
              <SelectItem value="3">3 étoiles et plus</SelectItem>
              <SelectItem value="4">4 étoiles et plus</SelectItem>
              <SelectItem value="4.5">4.5 étoiles et plus</SelectItem>
              <SelectItem value="4.8">4.8 étoiles et plus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Tarif horaire maximum</Label>
          <Input 
            type="number" 
            placeholder="100€"
            value={filters.maxHourlyRate || ''}
            onChange={(e) => onFiltersChange({ 
              maxHourlyRate: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
          />
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
                  onFiltersChange({ isAvailable: checked ? true : undefined })
                }
              />
              <Label htmlFor="available" className="text-sm">
                Disponible maintenant
              </Label>
            </div>
          </div>
        </div>

        <Button onClick={onClearFilters} variant="outline" className="w-full">
          Effacer tous les filtres
        </Button>
      </CardContent>
    </Card>
  );
}
