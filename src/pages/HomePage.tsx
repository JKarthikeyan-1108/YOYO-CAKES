import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  Truck, 
  Shield, 
  Clock, 
  Phone, 
  Sparkles, 
  Flame, 
  MapPin, 
  CheckCircle 
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS, CATEGORIES, getBestsellers } from '@/data/products';

export default function HomePage() {
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.replace(/\D/g, '').length !== 6) {
      setPincodeStatus('Please enter a valid 6-digit Chennai pincode');
      return;
    }
    setPincodeStatus('✓ Fast 2-Hour Delivery & Midnight Slots Available in your area!');
  };

  const cakes = PRODUCTS.filter((p) => p.categorySlug === 'cakes');
  const bestsellers = getBestsellers().slice(0, 8);
  const miniJars = PRODUCTS.filter((p) => p.categorySlug === 'mini-jar-cakes');
  const brownies = PRODUCTS.filter((p) => p.categorySlug === 'brownies').slice(0, 4);

  // Lightning Deals selection
  const dealProducts = [
    PRODUCTS.find((p) => p.id === 'cake-001'),
    PRODUCTS.find((p) => p.id === 'cake-002'),
    PRODUCTS.find((p) => p.id === 'br-010'),
    PRODUCTS.find((p) => p.id === 'tira-001'),
  ].filter(Boolean);

  return (
    <div className="bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)]">
      {/* Hero Section */}
      <section className="relative bg-[var(--color-brand-cream)] py-16 sm:py-24">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-primary-dark)]" />
                <span className="text-sm font-semibold tracking-wide text-[var(--color-brand-primary-dark)]">
                  Handcrafted in Chennai
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-brand-chocolate)] leading-[1.08] mb-6">
                Every Bite, a Little Happiness
              </h1>

              <p className="text-lg sm:text-xl text-[var(--color-brand-muted)] mb-8 leading-relaxed max-w-2xl font-normal">
                Handcrafted cakes, fudgy brownies, classic tiramisu, and adorable mini jar cakes prepared in small batches with pure Belgian chocolate and real dairy cream.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link to="/shop" className="btn-primary">
                  Shop All 27 Treats <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=cakes" className="btn-secondary">
                  Explore Signature Cakes
                </Link>
              </div>

              {/* Verified Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[var(--color-brand-primary)]/20">
                <div>
                  <p className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)]">
                    27
                  </p>
                  <p className="text-sm text-[var(--color-brand-muted)] font-medium mt-1">
                    Signature Varieties
                  </p>
                </div>
                <div>
                  <p className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)]">
                    100%
                  </p>
                  <p className="text-sm text-[var(--color-brand-muted)] font-medium mt-1">
                    Fresh Baked Daily
                  </p>
                </div>
                <div>
                  <p className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-primary-dark)]">
                    ₹50
                  </p>
                  <p className="text-sm text-[var(--color-brand-muted)] font-medium mt-1">
                    Starting Price
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-[var(--color-brand-cream-dark)]">
                <img
                  src="/images/products/dream-cake.jpg"
                  alt="YOYO CAKES Signature 5-in-1 Chocolate Dream Cake"
                  className="w-full h-[420px] sm:h-[480px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-chocolate)]/80 via-transparent to-transparent flex items-end p-6 sm:p-8">
                  <div className="text-white">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-brand-primary)] block mb-1">
                      Featured Masterpiece
                    </span>
                    <p className="font-heading text-xl sm:text-2xl font-bold">
                      5-in-1 Chocolate Dream Cake
                    </p>
                    <p className="text-sm text-white/80 mt-1">
                      Crisp cracked chocolate shell with cocoa dust — ₹150
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amazon / E-Commerce Category Circle Quick-Access Ribbon */}
      <section className="bg-white border-y border-gray-200 py-6">
        <div className="container-main">
          <div className="flex items-center justify-between gap-5 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="flex flex-col items-center flex-shrink-0 group text-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 border-[var(--color-brand-primary-light)]/40 group-hover:border-[var(--color-brand-primary-dark)] group-hover:scale-105 transition-all shadow-xs overflow-hidden mb-2 bg-[var(--color-brand-cream)]">
                  <img
                    src={`/images/categories/${cat.slug}.jpg`}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-[var(--color-brand-primary-dark)] transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">Fresh Daily</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pincode Delivery Availability Checker Strip */}
      <section className="bg-[var(--color-brand-cream-dark)] py-4 border-b border-gray-200/80">
        <div className="container-main">
          <form onSubmit={handleCheckPincode} className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-800">
              <MapPin size={16} className="text-[var(--color-brand-primary-dark)] flex-shrink-0" />
              <span className="font-semibold">Check delivery speed & slots for your location:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono outline-none focus:border-[var(--color-brand-primary-dark)] bg-white w-44"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs shadow-xs border border-[#FCD200]"
              >
                Check
              </button>
            </div>
          </form>
          {pincodeStatus && (
            <p className="text-xs font-medium text-[var(--color-brand-chocolate)] mt-2 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-[var(--color-brand-success)]" />
              {pincodeStatus}
            </p>
          )}
        </div>
      </section>

      {/* Lightning Deals / Today's Offers (Amazon Style) */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                <Flame size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
                    Today's Fresh Lightning Deals
                  </h2>
                  <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm">
                    LIMITED BATCH
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Baked early morning with Belgian chocolate. Order before the deal timer ends!
                </p>
              </div>
            </div>

            {/* Live Countdown Timer */}
            <div className="flex items-center gap-2 bg-red-50 text-red-800 px-4 py-2 rounded-xl border border-red-200 text-xs font-bold self-start sm:self-auto">
              <Clock size={15} className="text-red-600 animate-pulse" />
              <span>Ends in:</span>
              <span className="font-mono text-sm tracking-wider bg-white px-2 py-0.5 rounded border border-red-200 text-red-700">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Deal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealProducts.map((p) => p && (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="max-w-2xl mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-3">
              Shop by Category
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-brand-muted)]">
              Handcrafted selections baked fresh every morning in our patisserie kitchen.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] flex items-end p-5 bg-[var(--color-brand-cream-dark)]"
              >
                <img
                  src={`/images/categories/${cat.slug}.jpg`}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-chocolate)]/90 via-[var(--color-brand-chocolate)]/30 to-transparent" />
                <div className="relative z-10 text-white">
                  <h3 className="font-heading text-lg font-bold mb-1">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-[var(--color-brand-primary)] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View collection <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Cakes Collection — Showcasing the 6 Cakes with Real Images */}
      <section className="py-20 bg-[var(--color-brand-cream-dark)]">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-[var(--color-brand-primary-dark)]" />
                <span className="text-sm font-semibold text-[var(--color-brand-primary-dark)]">
                  Handcrafted Creations
                </span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)]">
                Signature Cakes
              </h2>
            </div>
            <Link
              to="/shop?category=cakes"
              className="inline-flex items-center gap-2 text-base font-semibold text-[var(--color-brand-primary-dark)] hover:text-[var(--color-brand-chocolate)] transition-colors"
            >
              View all cakes <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {cakes.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Most Loved Bestsellers */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-2">
                Customer Favorites
              </h2>
              <p className="text-base text-[var(--color-brand-muted)]">
                Our most requested treats across Chennai.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-base font-semibold text-[var(--color-brand-primary-dark)] hover:text-[var(--color-brand-chocolate)] transition-colors"
            >
              Browse all 27 treats <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Fudgy Brownies Spotlight */}
      <section className="py-20 bg-[var(--color-brand-cream)]">
        <div className="container-main">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <span className="text-sm font-semibold text-[var(--color-brand-primary-dark)] mb-2 block">
                Pure Belgian Chocolate
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-4">
                Artisanal Fudgy Brownies
              </h2>
              <p className="text-base sm:text-lg text-[var(--color-brand-muted)] mb-6 leading-relaxed">
                From our classic ₹50 brownie to our Nutella, Biscoff, Pista, and Assorted Gift Box at ₹199 — each slice is baked with premium cocoa, rich butter, and a melt-in-mouth crinkly top.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-[var(--color-brand-chocolate)] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary-dark)]" />
                  10 distinctive brownie varieties
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--color-brand-chocolate)] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary-dark)]" />
                  Available in gift-ready assortment packs
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--color-brand-chocolate)] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary-dark)]" />
                  Prices starting from just ₹50
                </div>
              </div>
              <Link to="/shop?category=brownies" className="btn-primary">
                Explore All Brownies <ArrowRight size={16} />
              </Link>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
              {brownies.map((product) => (
                <ProductCard key={product.id} product={product} showQuickView={false} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mini Jar Cakes Section */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-3">
              Mini Jar Cakes — ₹50 Each
            </h2>
            <p className="text-base text-[var(--color-brand-muted)]">
              Layered sponge, velvety cream, and rich fruit fillings inside charming personal jars.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {miniJars.map((product) => (
              <ProductCard key={product.id} product={product} showQuickView={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Quality Promise & Standards */}
      <section className="py-20 bg-[var(--color-brand-cream-dark)]">
        <div className="container-main">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-3">
              The YOYO Kitchen Standard
            </h2>
            <p className="text-base text-[var(--color-brand-muted)]">
              Everything we bake is guided by traditional pastry craftsmanship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: 'Baked Fresh to Order',
                desc: 'Orders are prepared fresh on schedule in small kitchen batches with zero preservatives.',
              },
              {
                icon: Star,
                title: 'Pure Dairy & Cocoa',
                desc: 'Real Belgian chocolate, dairy cream, and pure butter. No synthetic fats or shortcuts.',
              },
              {
                icon: Truck,
                title: 'Careful City Delivery',
                desc: 'Temperature-managed packing to ensure your cakes arrive in immaculate presentation.',
              },
              {
                icon: Shield,
                title: 'Baking Passion',
                desc: 'Every bite is crafted to bring warmth and happiness to your celebrations.',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-cream-dark)] flex items-center justify-center mb-5 text-[var(--color-brand-primary-dark)]">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Direct Bakery Contact Banner */}
      <section className="py-20 bg-[var(--color-brand-chocolate)] text-white">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Celebrate with YOYO CAKES
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-8 leading-relaxed">
              Custom birthday cakes, bulk celebration hampers, and kitchen pickup inquiries are always welcome. Connect directly with our head baker.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="tel:+918428855444"
                className="btn-primary bg-[var(--color-brand-primary)] text-[var(--color-brand-chocolate)] hover:bg-white hover:text-[var(--color-brand-chocolate)]"
              >
                <Phone size={18} /> Call +91 84288 55444
              </a>
              <a
                href="tel:+916379603744"
                className="btn-secondary border-white/30 text-white hover:bg-white hover:text-[var(--color-brand-chocolate)] hover:border-white"
              >
                <Phone size={18} /> Call +91 63796 03744
              </a>
              <Link
                to="/contact"
                className="btn-secondary border-white/30 text-white hover:bg-white hover:text-[var(--color-brand-chocolate)] hover:border-white"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
