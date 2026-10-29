import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowUp, ShieldCheck, Heart } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';

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
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[var(--color-brand-footer-bg)] text-[var(--color-brand-footer-text)] font-sans border-t border-[var(--color-brand-border)]/50 transition-colors">
      {/* Back to Top Strip */}
      <button
        onClick={scrollToTop}
        className="w-full py-3.5 bg-[var(--color-brand-footer-strip)] hover:opacity-90 text-[var(--color-brand-footer-text)] text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowUp size={14} /> Back to top
      </button>

      {/* Desktop Main Footer Links & Info */}
      <div className="hidden lg:block container-main py-12 sm:py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Info */}
          <div>
            <div className="mb-4">
              <BrandLogo variant="white" size="md" />
            </div>
            <p className="text-white/70 text-xs leading-relaxed mb-6">
              Chennai's favorite handcrafted cloud bakery. Specializing in decadent 5-in-1 Torte cakes, molten Belgian brownies, and authentic Italian tiramisu, prepared in small fresh batches daily.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FFD814] hover:text-[#0F1111] flex items-center justify-center transition-all shadow-2xs"
                aria-label="Instagram"
              >
                <InstagramIcon size={16} />
              </a>
              <span className="text-xs text-white/60 font-medium">@yoyocakes_chennai</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Fresh Bakery Menu
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { to: '/shop', label: 'All 27 Fresh Treats' },
                { to: '/shop?category=cakes', label: 'Signature 5-in-1 Torte Cakes' },
                { to: '/shop?category=brownies', label: 'Fudgy Molten Brownies' },
                { to: '/shop?category=tiramisu', label: 'Italian Tiramisu & Desserts' },
                { to: '/shop?category=mini-jar-cakes', label: 'Mini Jar Cakes (₹50)' },
                { to: '/shop?category=teacakes-pies', label: 'Gourmet Teacakes & Cookie Pies' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/70 hover:text-[#FFD814] hover:underline transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Customer Support & Care
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { to: '/account', label: 'Your Account & Orders' },
                { to: '/wishlist', label: 'Your Saved Wishlist' },
                { to: '/cancellation-policy', label: 'Cancellation & Refund Guarantee' },
                { to: '/faq', label: 'Shelf Life & Eggless FAQs' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/privacy-policy', label: 'Privacy & Security Policy' },
                { to: '/admin/login', label: 'Bakery Admin Portal (Staff)' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/70 hover:text-[#FFD814] hover:underline transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Store Locations */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Kitchen & Contact
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="text-[#FFD814] mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+918428855444" className="hover:text-[#FFD814] transition-colors font-bold block text-white">
                    +91 84288 55444 (Order Hotline)
                  </a>
                  <a href="tel:+916379603744" className="hover:text-[#FFD814] transition-colors block text-white/70">
                    +91 63796 03744 (Kitchen WhatsApp)
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="text-[#FFD814] mt-0.5 flex-shrink-0" />
                <span className="text-white/70 font-mono">support@yoyocakes.in</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#FFD814] mt-0.5 flex-shrink-0" />
                <div className="text-white/70 leading-relaxed">
                  <span className="font-semibold text-white block">Central Kitchen:</span>
                  14/2, 2nd Ave, Anna Nagar & T. Nagar Hub, Chennai – 600040
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="text-[#FFD814] mt-0.5 flex-shrink-0" />
                <div className="text-white/70">
                  <span className="font-semibold text-white block">Operating Hours:</span>
                  Monday – Sunday: 9:00 AM – 11:30 PM (Kitchen Counter Pickup Active)
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Reassurance Strip (Desktop) */}
      <div className="hidden lg:block bg-[var(--color-brand-footer-bg)]/95 border-t border-[var(--color-brand-border)]/40 py-4 px-4 text-xs text-[var(--color-brand-footer-muted)]">
        <div className="container-main flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#A3E635]" />
            <span className="text-[var(--color-brand-footer-text)] font-medium">
              100% Secure Checkout with Razorpay & Counter Pay • 256-Bit SSL Encrypted
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--color-brand-footer-muted)] uppercase tracking-wider">
            <span>UPI</span>
            <span>•</span>
            <span>Google Pay</span>
            <span>•</span>
            <span>PhonePe</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span>Net Banking</span>
            <span>•</span>
            <span>Pay at Kitchen Counter</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar (Desktop) */}
      <div className="hidden lg:block bg-[var(--color-brand-footer-bg)] py-4 border-t border-[var(--color-brand-border)]/20">
        <div className="container-main px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--color-brand-footer-muted)]/70">
          <p>© {CURRENT_YEAR} YOYO CAKES Private Limited. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted with <Heart size={12} className="text-red-500 fill-red-500" /> in Chennai, India
          </p>
        </div>
      </div>

      {/* Streamlined Mobile App Footer (Mobile Viewports Only) */}
      <div className="lg:hidden px-4 pt-7 pb-20 text-center space-y-4">
        <div className="flex justify-center">
          <BrandLogo variant="white" size="sm" showTagline={true} />
        </div>

        {/* Quality Badges */}
        <div className="flex flex-wrap justify-center gap-1.5 text-[10px] text-white/80">
          <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">✨ Fresh Bake Daily</span>
          <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">🛡️ FSSAI Patisserie</span>
          <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">🔒 256-Bit SSL</span>
        </div>

        {/* Central Kitchen Info */}
        <div className="text-[11px] text-white/70 space-y-0.5">
          <p className="font-semibold text-white">Central Kitchen • Anna Nagar & T. Nagar, Chennai</p>
          <p>
            Hotline:{' '}
            <a href="tel:+918428855444" className="text-[#FFD814] font-bold underline">
              +91 84288 55444
            </a>
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-1 text-[11px] text-white/60">
          <Link to="/cancellation-policy" className="hover:text-[#FFD814] underline">Refunds</Link>
          <Link to="/privacy-policy" className="hover:text-[#FFD814] underline">Privacy</Link>
          <Link to="/terms" className="hover:text-[#FFD814] underline">Terms</Link>
          <Link to="/faq" className="hover:text-[#FFD814] underline">FAQs</Link>
        </div>

        {/* Copyright */}
        <p className="text-[10px] text-white/40 pt-1 border-t border-white/10">
          © {CURRENT_YEAR} YOYO CAKES Private Limited. Handcrafted with ❤️ in Chennai.
        </p>
      </div>
    </footer>
  );
}
