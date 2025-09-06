import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import type { InterventionWithDetails } from "@shared/schema";

export default function InterventionDetails() {
  const [match, params] = useRoute("/intervention/:id");
  const interventionId = params?.id;

  const { data: intervention, isLoading } = useQuery<InterventionWithDetails | undefined>({
    queryKey: ["/api/interventions", interventionId],
    enabled: !!interventionId,
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

  if (!intervention) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Intervention not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{intervention.title}</h1>
        <div className="flex items-center gap-4">
          <Badge variant={
            intervention.status === 'completed' ? 'default' :
            intervention.status === 'in_progress' ? 'secondary' :
            'outline'
          }>
            {intervention.status}
          </Badge>
          <Badge variant={
            intervention.urgency === 'high' ? 'destructive' :
            intervention.urgency === 'medium' ? 'secondary' :
            'outline'
          }>
            {intervention.urgency} priority
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {intervention.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Preferred Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(intervention.preferredDate || '').toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Estimated Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {intervention.estimatedDuration}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {intervention.address}, {intervention.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Budget</p>
                  <p className="text-sm text-muted-foreground">
                    Up to ${intervention.maxBudget}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">
                    {intervention.client?.firstName} {intervention.client?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {intervention.client?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(intervention.client?.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {intervention.worker && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Worker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">
                      {intervention.worker?.firstName} {intervention.worker?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {intervention.worker?.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {intervention.status === 'pending' && (
                <Button className="w-full">Accept Intervention</Button>
              )}
              {intervention.status === 'accepted' && (
                <Button className="w-full">Start Work</Button>
              )}
              {intervention.status === 'in_progress' && (
                <Button className="w-full">Mark as Complete</Button>
              )}
              {intervention.status === 'completed' && (
                <Button variant="outline" className="w-full">Leave Review</Button>
              )}
              <Button variant="outline" className="w-full">Send Message</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}