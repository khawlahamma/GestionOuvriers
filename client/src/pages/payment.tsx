import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Assurez-vous que la clé publique Stripe est correctement définie
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : Promise.resolve(null);

// Vérification de la clé publique Stripe
console.log("Stripe Public Key:", stripePublicKey);
if (!stripePublicKey) {
  console.error("VITE_STRIPE_PUBLIC_KEY is not defined or is empty!");
}

interface PaymentData {
  interventionId?: string;
  amount: number;
  description: string;
  workerName?: string;
  serviceType?: string;
}

function CheckoutForm({ paymentData }: { paymentData: PaymentData }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    console.log("CheckoutForm mounted");
    console.log("Stripe instance:", stripe);
    console.log("Elements instance:", elements);
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit button clicked");
    console.log("Stripe instance:", stripe);
    console.log("Elements instance:", elements);

    if (!stripe || !elements) {
      console.error("Stripe or Elements not initialized");
      toast({
        title: "Erreur",
        description: "Le système de paiement n'est pas initialisé correctement.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Confirming payment...");
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Payment exception:", err);
      toast({
        title: "Erreur de paiement",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <PaymentElement />
      </div>
      
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <ShieldCheck className="w-4 h-4" />
        <span>Paiement sécurisé avec chiffrement SSL</span>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Traitement en cours...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Payer {paymentData.amount} DH
          </div>
        )}
      </Button>
    </form>
  );
}

export default function Payment() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    description: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour effectuer un paiement.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const description = urlParams.get('description');
    const interventionId = urlParams.get('interventionId');
    const workerName = urlParams.get('workerName');
    const serviceType = urlParams.get('serviceType');

    console.log("URL Parameters:", {
      amount,
      description,
      interventionId,
      workerName,
      serviceType
    });

    if (!amount || !description) {
      toast({
        title: "Paramètres manquants",
        description: "Les informations de paiement sont incomplètes.",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    const paymentInfo = {
      amount: parseInt(amount),
      description: decodeURIComponent(description),
      interventionId: interventionId || undefined,
      workerName: workerName ? decodeURIComponent(workerName) : undefined,
      serviceType: serviceType ? decodeURIComponent(serviceType) : undefined,
    };

    console.log("Payment Info:", paymentInfo);
    setPaymentData(paymentInfo);
    createPaymentIntent(paymentInfo);
  }, [isAuthenticated]);

  const createPaymentIntent = async (data: PaymentData) => {
    try {
      console.log("Creating payment intent with data:", data);
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: data.amount,
        description: data.description,
        interventionId: data.interventionId,
      });
      
      const { clientSecret } = await response.json();
      console.log("Received clientSecret:", clientSecret);
      if (!clientSecret) {
        throw new Error("No client secret received from server");
      }
      setClientSecret(clientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour effectuer un paiement.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de créer l'intention de paiement.",
        variant: "destructive",
      });
      setLocation("/");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  console.log("Rendering Payment component. clientSecret:", clientSecret);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Préparation du paiement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  console.log("Stripe options:", options);
  console.log("StripePromise before Elements:", stripePromise);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/workers">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Paiement sécurisé</h1>
          <p className="text-gray-600 mt-2">Finalisez votre réservation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Résumé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{paymentData.description}</h3>
                  {paymentData.workerName && (
                    <p className="text-sm text-gray-600">Ouvrier: {paymentData.workerName}</p>
                  )}
                  {paymentData.serviceType && (
                    <Badge variant="secondary" className="mt-2">
                      {paymentData.serviceType}
                    </Badge>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">{paymentData.amount} DH</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm paymentData={paymentData} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}