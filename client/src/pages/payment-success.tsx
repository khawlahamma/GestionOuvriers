import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Calendar, MessageCircle } from "lucide-react";

export default function PaymentSuccess() {
  useEffect(() => {
    // Parse URL parameters to get payment details
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    
    // Here you could make an API call to confirm payment status
    // and update the intervention status
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Paiement confirmé !
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">
                Votre paiement a été traité avec succès
              </p>
              <p className="text-green-700 text-sm mt-1">
                Un email de confirmation vous a été envoyé
              </p>
            </div>

            <div className="text-left space-y-3">
              <h3 className="font-semibold text-gray-900">Prochaines étapes :</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  L'ouvrier va confirmer votre réservation sous 24h
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  Vous recevrez une notification avec les détails de l'intervention
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  Vous pourrez communiquer directement avec l'ouvrier via le chat
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Voir mes interventions
                </Button>
              </Link>
              
              <Link href="/workers" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>

            <div className="border-t pt-6">
              <p className="text-xs text-gray-500">
                Besoin d'aide ? Contactez notre support client
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}