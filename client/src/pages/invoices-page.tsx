import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Download, Eye, Calendar, DollarSign } from "lucide-react";
import { InterventionWithDetails } from "@shared/schema";

export default function InvoicesPage() {
  const { data: interventions = [], isLoading } = useQuery<InterventionWithDetails[]>({
    queryKey: ["/api/interventions/my"],
  });

  // Filter only completed interventions that can be considered as invoices
  const completedInterventions = interventions.filter(
    intervention => intervention.status === 'completed'
  );

  const formatDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) {
      return '';
    }
    return new Date(dateInput).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateTotal = (intervention: InterventionWithDetails) => {
    const hourlyRate = Number(intervention.worker?.workerProfile?.hourlyRate) || 0;
    const duration = intervention.estimatedDuration || 1;
    return hourlyRate * duration;
  };

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
          <Receipt className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mes Factures</h1>
            <p className="text-muted-foreground">
              {completedInterventions.length} facture{completedInterventions.length !== 1 ? 's' : ''} disponible{completedInterventions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {completedInterventions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune facture</h3>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore de factures disponibles.
                </p>
                <Button>
                  Créer une intervention
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Receipt className="h-4 w-4 mr-2" />
                    Total des factures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedInterventions.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Montant total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {completedInterventions.reduce((sum, intervention) => sum + calculateTotal(intervention), 0)} DH
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ce mois-ci
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {completedInterventions.filter(intervention => {
                      const interventionDate = new Date(intervention.createdAt || '');
                      const now = new Date();
                      return interventionDate.getMonth() === now.getMonth() && 
                             interventionDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              {completedInterventions.map((intervention) => (
                <Card key={intervention.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center space-x-2">
                          <span>Facture #{intervention.id}</span>
                          <Badge variant="secondary">Payée</Badge>
                        </CardTitle>
                        <CardDescription>
                          {intervention.title}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {calculateTotal(intervention)} DH
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(intervention.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Détails du service</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Ouvrier:</span>
                            <span>{intervention.worker?.firstName} {intervention.worker?.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Catégorie:</span>
                            <span>{intervention.worker?.workerProfile?.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Durée estimée:</span>
                            <span>{intervention.estimatedDuration}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taux horaire:</span>
                            <span>{intervention.worker?.workerProfile?.hourlyRate} DH/h</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Information de facturation</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Date de début:</span>
                            <span>{formatDate(intervention.createdAt || '')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date de fin:</span>
                            <span>{formatDate(intervention.updatedAt || '')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Statut:</span>
                            <Badge variant="secondary" className="text-xs">
                              {intervention.status === 'completed' ? 'Terminé' : intervention.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {intervention.description && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {intervention.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}