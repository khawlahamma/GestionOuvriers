import { Link } from "wouter";

export default function Footer() {
  const serviceLinks = [
    { name: 'Plomberie', href: '/workers?category=plumbing' },
    { name: 'Électricité', href: '/workers?category=electricity' },
    { name: 'Peinture', href: '/workers?category=painting' },
    { name: 'Menuiserie', href: '/workers?category=carpentry' },
    { name: 'Jardinage', href: '/workers?category=gardening' },
  ];

  const companyLinks = [
    { name: 'À propos', href: '/about' },
    { name: 'Carrières', href: '/careers' },
    { name: 'Presse', href: '/press' },
    { name: 'Blog', href: '/blog' },
    { name: 'Partenaires', href: '/partners' },
  ];

  const supportLinks = [
    { name: "Centre d'aide", href: '/help' },
    { name: 'Contact', href: '/contact' },
    { name: "Conditions d'utilisation", href: '/terms' },
    { name: 'Politique de confidentialité', href: '/privacy' },
    { name: 'Sécurité', href: '/security' },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: 'fab fa-facebook-f' },
    { name: 'Twitter', href: '#', icon: 'fab fa-twitter' },
    { name: 'LinkedIn', href: '#', icon: 'fab fa-linkedin-in' },
    { name: 'Instagram', href: '#', icon: 'fab fa-instagram' },
  ];

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">HandyConnect</h3>
            <p className="text-slate-400 mb-4">
              La plateforme de référence pour trouver des ouvriers qualifiés et gérer vos interventions en toute simplicité.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.href}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-slate-400">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-2 text-slate-400">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2024 HandyConnect. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-slate-400 text-sm">Paiements sécurisés par</span>
            <div className="flex space-x-2 text-slate-400">
              <i className="fab fa-cc-visa text-2xl"></i>
              <i className="fab fa-cc-mastercard text-2xl"></i>
              <i className="fab fa-paypal text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
