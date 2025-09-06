import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ServiceCategory from "@/components/common/service-category";
import { Search, Wrench, Zap, Paintbrush, Hammer, Leaf, Home } from "lucide-react";

const serviceCategories = [
  { id: 'plumbing', name: 'Plomberie', icon: Wrench, color: 'primary', workerCount: 247 },
  { id: 'electricity', name: 'Électricité', icon: Zap, color: 'secondary', workerCount: 189 },
  { id: 'painting', name: 'Peinture', icon: Paintbrush, color: 'success', workerCount: 156 },
  { id: 'carpentry', name: 'Menuiserie', icon: Hammer, color: 'warning', workerCount: 134 },
  { id: 'gardening', name: 'Jardinage', icon: Leaf, color: 'primary', workerCount: 98 },
  { id: 'cleaning', name: 'Nettoyage', icon: Home, color: 'slate-600', workerCount: 87 },
];

const testimonials = [
  {
    rating: 5,
    comment: "Service excellent ! J'ai trouvé un plombier en moins de 30 minutes et l'intervention s'est parfaitement déroulée.",
    author: "Marie Dubois",
    role: "Cliente",
  },
  {
    rating: 5,
    comment: "HandyConnect m'a permis de développer mon activité. Je reçois des demandes régulièrement et les clients sont sérieux.",
    author: "Thomas Petit",
    role: "Électricien",
  },
  {
    rating: 5,
    comment: "Interface intuitive et système de paiement sécurisé. Je recommande cette plateforme sans hésiter !",
    author: "Pierre Lambert",
    role: "Client régulier",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative gradient-primary text-white py-20">
        <div className="absolute inset-0 hero-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trouvez le bon ouvrier<br />
              <span className="text-secondary">au bon moment</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              HandyConnect connecte clients et ouvriers qualifiés pour des interventions rapides, sécurisées et de qualité.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Link href="/workers">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Trouver un ouvrier
                </Button>
              </Link>
              <Link href="/worker-registration">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Devenir ouvrier
                </Button>
              </Link>
            </div>
            
            {/* Search Bar */}
            <Card className="max-w-4xl mx-auto shadow-2xl">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Service</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Localisation</label>
                    <Input placeholder="Ville ou code postal" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Date</label>
                    <Input type="date" />
                  </div>
                  <div className="flex items-end">
                    <Link href="/workers" className="w-full">
                      <Button className="w-full btn-secondary">
                        <Search className="w-4 h-4 mr-2" />
                        Rechercher
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Nos Services</h2>
            <p className="text-xl text-slate-600">Des professionnels qualifiés dans tous les domaines</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {serviceCategories.map((category) => (
              <ServiceCategory key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-slate-600">Simple, rapide et sécurisé</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Recherchez</h3>
              <p className="text-slate-600">
                Trouvez l'ouvrier parfait grâce à notre recherche avancée par spécialité, localisation et disponibilité.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-secondary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Réservez</h3>
              <p className="text-slate-600">
                Consultez les profils, comparez les avis et réservez votre intervention en quelques clics.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Profitez</h3>
              <p className="text-slate-600">
                Suivez votre intervention en temps réel, communiquez avec l'ouvrier et payez en toute sécurité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Ce que disent nos utilisateurs</h2>
            <p className="text-xl text-slate-600">Des milliers de clients satisfaits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < testimonial.rating ? "star-filled" : "star-empty"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-slate-600">5/5</span>
                  </div>
                  <p className="text-slate-700 mb-4">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-slate-200 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-slate-900">{testimonial.author}</p>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl mb-8">Rejoignez des milliers d'utilisateurs satisfaits</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-slate-100">
              Trouver un ouvrier
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Devenir ouvrier
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
