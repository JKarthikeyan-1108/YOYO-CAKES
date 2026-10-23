import { useState } from 'react';
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
  CheckCircle,
  CheckCircle2
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES } from '@/data/products';
import { useProductStore } from '@/stores/productStore';

const TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Priya Sundaram',
    location: 'Anna Nagar, Chennai',
    verified: true,
    rating: 5,
    date: '3 days ago',
    headline: 'Best Chocolate Dream Cake in Chennai! Hands down.',
    comment: 'Ordered the 5-in-1 Chocolate Dream Cake for my daughter’s birthday. The crack on the top chocolate shell was so crisp and satisfying, and the cocoa layers underneath were melt-in-mouth! Delivery was right on time at 7 PM sharp.',
    productName: '5-in-1 Chocolate Dream Cake',
    productImage: '/images/products/dream-cake.jpg',
  },
  {
    id: 't-2',
    name: 'Karthik Raja',
    location: 'T. Nagar, Chennai',
    verified: true,
    rating: 5,
    date: '1 week ago',
    headline: 'Pure Belgian indulgence, absolutely uncompromised quality.',
    comment: 'The Assorted Brownie Box (Nutella + Biscoff + Pista) is pure bliss. Unlike bakery brownies loaded with excess sugar, YOYO uses authentic cocoa and butter. You can literally taste the premium ingredients. 10/10 recommendation!',
    productName: 'Assorted Brownie Box (6 Pcs)',
    productImage: '/images/products/assorted-brownies.jpg',
  },
  {
    id: 't-3',
    name: 'Ananya Krishnan',
    location: 'Velachery, Chennai',
    verified: true,
    rating: 5,
    date: '2 weeks ago',
    headline: 'The Mini Jar Cakes are so cute and super fresh!',
    comment: 'Ordered 10 Red Velvet and Mango mini jar cakes for an office anniversary party. The personal jars were a total hit—zero mess, perfectly portioned, and the cream cheese frosting was heavenly. Fast doorstep delivery in refrigerated packing.',
    productName: 'Mini Jar Cakes (Assorted)',
    productImage: '/images/products/mini-jar-cakes.jpg',
  },
  {
    id: 't-4',
    name: 'Vikram Chandran',
    location: 'RS Puram, Coimbatore',
    verified: true,
    rating: 5,
    date: '3 weeks ago',
    headline: 'Classic Tiramisu done right with mascarpone cream.',
    comment: 'Finally found real Italian-style tiramisu! Proper espresso soaked biscuits, light mascarpone layer, and fine dark cocoa powder. Delivered in cold insulated packaging so it arrived in picture-perfect shape.',
    productName: 'Classic Italian Tiramisu',
    productImage: '/images/products/tiramisu.jpg',
  },
];

export default function HomePage() {
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setPincodeStatus('Please enter a valid 6-digit delivery pincode');
      return;
    }
    if (cleanPin.startsWith('600') || cleanPin.startsWith('601') || cleanPin.startsWith('602') || cleanPin.startsWith('603')) {
      setPincodeStatus('✓ Delivery & Kitchen Pickup available in Chennai!');
    } else if (cleanPin.startsWith('641')) {
      setPincodeStatus('✓ Delivery & Kitchen Pickup available in Coimbatore!');
    } else {
      setPincodeStatus('Available in Chennai (600xxx) and Coimbatore (641xxx) delivery zones.');
    }
  };

  const products = useProductStore((s) => s.products);
  const cakes = products.filter((p) => p.categorySlug === 'cakes');
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 8);
  const miniJars = products.filter((p) => p.categorySlug === 'mini-jar-cakes');
  const brownies = products.filter((p) => p.categorySlug === 'brownies').slice(0, 4);

  // Daily Specials selection
  const dealProducts = [
    products.find((p) => p.id === 'cake-001'),
    products.find((p) => p.id === 'cake-002'),
    products.find((p) => p.id === 'br-010'),
    products.find((p) => p.id === 'tira-001'),
  ].filter(Boolean);

  return (
    <div className="bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)]">
      {/* Mobile Compact Bakery Discovery (First screen product discovery) */}
      <section className="sm:hidden bg-[#FFF8F0] border-b border-[#E8DFD5] pt-4 pb-3.5 px-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C9A184]/20 text-[#7F5643] text-[10px] font-bold uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7F5643]" />
              Patisserie Kitchen
            </div>
            <h1 className="font-heading text-lg font-black text-[#3D2417] leading-tight">
              Fresh Celebration Treats
            </h1>
            <p className="text-[11px] text-[#7F5643]/90 mt-0.5">
              Handcrafted daily with pure Belgian chocolate & dairy cream
            </p>
          </div>
          <Link
            to="/shop"
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-[#7F5643] text-white text-xs font-bold shadow-xs hover:bg-[#3D2417] transition-all flex items-center gap-1"
          >
            All 27 <ArrowRight size={12} />
          </Link>
        </div>

        {/* Mobile Horizontal Scrollable Category Shortcuts */}
        <div className="pt-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#7F5643] mb-2 px-0.5">
            <span>Categories</span>
            <Link to="/shop" className="text-[10px] text-[#7F5643] font-semibold underline">
              View all
            </Link>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="flex flex-col items-center flex-shrink-0 group text-center min-w-[64px]"
                aria-label={`Browse ${cat.name}`}
              >
                <div className="w-14 h-14 rounded-full p-0.5 border-2 border-[#C9A184]/70 bg-white group-hover:border-[#7F5643] group-active:scale-95 transition-all shadow-xs overflow-hidden mb-1">
                  <img
                    src={`/images/categories/${cat.slug}.jpg`}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                    loading="eager"
                  />
                </div>
                <span className="text-[11px] font-bold text-[#3D2417] group-hover:text-[#7F5643] transition-colors leading-tight line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop Hero Section */}
      <section className="hidden sm:block relative bg-[var(--color-brand-cream)] py-8 sm:py-14 lg:py-20">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-primary-dark)]" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-[var(--color-brand-primary-dark)]">
                  Handcrafted Artisanal Bakes
                </span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl font-bold text-[var(--color-brand-chocolate)] leading-[1.1] mb-4 sm:mb-6">
                Every Bite, a Little Happiness
              </h1>

              <p className="text-base sm:text-xl text-[var(--color-brand-muted)] mb-6 sm:mb-8 leading-relaxed max-w-2xl font-normal">
                Handcrafted cakes, fudgy brownies, classic tiramisu, and adorable mini jar cakes prepared in small batches with pure Belgian chocolate and real dairy cream.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                <Link to="/shop" className="btn-primary">
                  Shop All 27 Treats <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=cakes" className="btn-secondary">
                  Explore Signature Cakes
                </Link>
              </div>

              {/* Verified Metrics */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-[var(--color-brand-primary)]/20">
                <div>
                  <p className="font-heading text-2xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)]">
                    27
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] font-medium mt-0.5 sm:mt-1">
                    Signature Varieties
                  </p>
                </div>
                <div>
                  <p className="font-heading text-2xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)]">
                    100%
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] font-medium mt-0.5 sm:mt-1">
                    Fresh Baked Daily
                  </p>
                </div>
                <div>
                  <p className="font-heading text-2xl sm:text-4xl font-bold text-[var(--color-brand-primary-dark)]">
                    ₹50
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] font-medium mt-0.5 sm:mt-1">
                    Starting Price
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-[var(--color-brand-cream-dark)] shadow-md">
                <img
                  src="/images/products/dream-cake.jpg"
                  alt="YOYO CAKES Signature 5-in-1 Chocolate Dream Cake"
                  className="w-full h-[280px] sm:h-[420px] lg:h-[480px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-chocolate)]/85 via-transparent to-transparent flex items-end p-5 sm:p-8">
                  <div className="text-white">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-brand-primary)] block mb-1">
                      Featured Masterpiece
                    </span>
                    <p className="font-heading text-lg sm:text-2xl font-bold">
                      5-in-1 Chocolate Dream Cake
                    </p>
                    <p className="text-xs sm:text-sm text-white/80 mt-0.5 sm:mt-1">
                      Crisp cracked chocolate shell with cocoa dust — ₹150
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Swiggy-Style Category Quick-Access Ribbon (Desktop) */}
      <section className="hidden sm:block bg-white border-y border-gray-200 py-5">
        <div className="container-main">
          <div className="flex items-center justify-between gap-4 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="flex flex-col items-center flex-shrink-0 group text-center min-w-[72px]"
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
      <section className="bg-[var(--color-brand-cream-dark)] py-3.5 border-b border-gray-200/80">
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
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono outline-none focus:border-[var(--color-brand-primary-dark)] bg-white w-40"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white font-bold text-xs shadow-xs transition-colors"
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

      {/* Fresh Daily Specials */}
      <section className="py-10 sm:py-14 bg-white border-b border-gray-200">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-primary-dark)] text-white flex items-center justify-center shadow-xs">
                <Flame size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-gray-900">
                    Today's Fresh Daily Specials
                  </h2>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm">
                    FRESH BATCH
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Baked early morning with pure Belgian chocolate and real dairy cream.
                </p>
              </div>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-primary-dark)] hover:underline self-start sm:self-auto"
            >
              See all items <ArrowRight size={14} />
            </Link>
          </div>

          {/* Specials Grid - 2 cols on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {dealProducts.map((p) => p && (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category - desktop grid (mobile uses top horizontal shortcut scroll) */}
      <section className="hidden md:block py-20 bg-white">
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

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-8">
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
                Our most requested treats across our kitchens.
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
      {/* Verified Customer Reviews & Amazon-Style Social Proof */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="container-main">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Favorites</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)]">
                Loved by Celebration Hosts
              </h2>
              <p className="text-base text-[var(--color-brand-muted)] mt-1">
                Real customer feedback on our freshly baked cakes, brownies, and jar treats across Chennai & Coimbatore.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[var(--color-brand-cream)] px-4 py-2.5 rounded-xl border border-[var(--color-brand-primary)]/20 text-xs">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-900">100% Verified Purchases</p>
                <p className="text-gray-500 text-[11px]">Direct bakery orders & doorstep deliveries</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-[var(--color-brand-cream-dark)]/50 rounded-2xl p-6 border border-gray-200/80 flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">{t.date}</span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
                    "{t.headline}"
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-4 mb-4">
                    {t.comment}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200/60">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary-dark)] font-bold text-xs flex items-center justify-center">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{t.name}</p>
                      <p className="text-[10px] text-gray-500">{t.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle2 size={11} /> Verified Purchase
                    </span>
                    <span className="truncate max-w-[110px] text-gray-600">{t.productName}</span>
                  </div>
                </div>
              </div>
            ))}
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
