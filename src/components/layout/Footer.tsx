import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-[var(--color-brand-chocolate)] text-white/90">
      {/* Main Footer */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[var(--color-brand-primary)] text-[var(--color-brand-chocolate)] flex items-center justify-center font-heading text-xl font-black shadow-sm">
                Y
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">YOYO CAKES</h3>
                <p className="text-xs text-white/50 tracking-widest uppercase">Every bite, a little happiness</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Handcrafted with love, our cakes and desserts bring joy to every celebration. From rich brownies to delicate tiramisu, every creation is a masterpiece.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--color-brand-primary)] flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: '/shop', label: 'Shop All' },
                { to: '/shop?category=cakes', label: 'Cakes' },
                { to: '/shop?category=brownies', label: 'Brownies' },
                { to: '/shop?category=tiramisu-desserts', label: 'Tiramisu & Desserts' },
                { to: '/shop?category=mini-jar-cakes', label: 'Mini Jar Cakes' },
                { to: '/about', label: 'About Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/60 hover:text-[var(--color-brand-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-5">Policies</h4>
            <ul className="space-y-3">
              {[
                { to: '/privacy-policy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms & Conditions' },
                { to: '/shipping-policy', label: 'Shipping & Delivery' },
                { to: '/cancellation-policy', label: 'Cancellation & Refund' },
                { to: '/faq', label: 'FAQs' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/60 hover:text-[var(--color-brand-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-white/60">
                  <a href="tel:+918428855444" className="hover:text-white transition-colors block">
                    +91 84288 55444
                  </a>
                  <a href="tel:+916379603744" className="hover:text-white transition-colors block">
                    +91 63796 03744
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60">hello@yoyocakes.in</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60">
                  Address to be configured in business settings
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60">
                  Hours to be configured in business settings
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {CURRENT_YEAR} YOYO CAKES. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Handcrafted with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}
