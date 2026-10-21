import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowUp, ShieldCheck, Heart } from 'lucide-react';

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
    <footer className="bg-[#232F3E] text-white/90 font-sans">
      {/* Amazon-Style Back to Top Strip */}
      <button
        onClick={scrollToTop}
        className="w-full py-3.5 bg-[#37475A] hover:bg-[#485769] text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
      >
        <ArrowUp size={14} /> Back to top
      </button>

      {/* Main Footer Links & Info */}
      <div className="container-main py-12 sm:py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FFD814] text-[#0F1111] flex items-center justify-center font-heading text-xl font-black shadow-xs">
                Y
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-white tracking-tight">YOYO CAKES</h3>
                <p className="text-[10px] text-white/60 tracking-wider uppercase font-semibold">
                  Every bite, a little happiness
                </p>
              </div>
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
                { to: '/shipping-policy', label: 'Chennai Express Delivery Info' },
                { to: '/cancellation-policy', label: 'Cancellation & Refund Guarantee' },
                { to: '/faq', label: 'Shelf Life & Eggless FAQs' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/privacy-policy', label: 'Privacy & Security Policy' },
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
                  Monday – Sunday: 9:00 AM – 11:30 PM (Midnight delivery active)
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Reassurance Strip */}
      <div className="bg-[#131A22] border-t border-white/10 py-4 px-4 text-xs text-white/60">
        <div className="container-main flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#A3E635]" />
            <span className="text-white/80 font-medium">
              100% Secure Checkout with Razorpay & Cash on Delivery • 256-Bit SSL Encrypted
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-white/70 uppercase tracking-wider">
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
            <span>Pay on Delivery</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#0D141E] py-4 border-t border-white/5">
        <div className="container-main px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/40">
          <p>© {CURRENT_YEAR} YOYO CAKES Private Limited. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted with <Heart size={12} className="text-red-500 fill-red-500" /> in Chennai, India
          </p>
        </div>
      </div>
    </footer>
  );
}
