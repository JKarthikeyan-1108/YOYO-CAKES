import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Clock, Gift } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS, CATEGORIES, getBestsellers, getFeaturedProducts } from '@/data/products';

export default function HomePage() {
  const bestsellers = getBestsellers().slice(0, 8);
  const featured = getFeaturedProducts().slice(0, 4);
  const miniJars = PRODUCTS.filter((p) => p.categorySlug === 'mini-jar-cakes');
  const brownies = PRODUCTS.filter((p) => p.categorySlug === 'brownies').slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #FFF8F0 0%, #E8D5C4 40%, #C9A184 80%, #7F5643 100%)',
          }}
        />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(127,86,67,0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(201,161,132,0.4) 0%, transparent 50%),
                           radial-gradient(circle at 60% 80%, rgba(127,86,67,0.2) 0%, transparent 50%)`
        }} />

        <div className="container-main relative z-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-brand-primary)]/20 border border-[var(--color-brand-primary-dark)]/20 text-[var(--color-brand-primary-dark)] text-xs font-semibold tracking-wider uppercase mb-5 animate-fade-in">
                <span>✨ Artisanal Bakery & Patisserie</span>
              </div>
              <h1
                className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--color-brand-chocolate)] leading-[1.1] mb-6"
              >
                Every Bite, a Little{' '}
                <span className="text-[var(--color-brand-primary-dark)] italic">Happiness</span>
              </h1>
              <p
                className="text-base sm:text-lg lg:text-xl text-[var(--color-brand-chocolate-light)] mb-8 leading-relaxed max-w-xl"
              >
                Handcrafted cakes, fudgy brownies, classic tiramisu, and adorable mini jar cakes made with pure Belgian chocolate and dairy cream. Fresh from our kitchen to your celebrations.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/shop" className="btn-primary text-base px-8 py-3.5 shadow-elevated">
                  Shop All 27 Treats <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=brownies" className="btn-secondary text-base px-8 py-3.5">
                  Explore Brownies
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-6 border-t border-[var(--color-brand-primary-dark)]/15">
                <div>
                  <p className="text-3xl font-heading font-bold text-[var(--color-brand-chocolate)]">27+</p>
                  <p className="text-xs text-[var(--color-brand-muted)] uppercase tracking-wider font-semibold">Signature Varieties</p>
                </div>
                <div>
                  <p className="text-3xl font-heading font-bold text-[var(--color-brand-chocolate)]">100%</p>
                  <p className="text-xs text-[var(--color-brand-muted)] uppercase tracking-wider font-semibold">Fresh Baked Daily</p>
                </div>
                <div>
                  <p className="text-3xl font-heading font-bold text-[var(--color-brand-primary-dark)]">₹50</p>
                  <p className="text-xs text-[var(--color-brand-muted)] uppercase tracking-wider font-semibold">Starting Price</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-elevated border-4 border-white group">
                <img
                  src="/images/hero-banner.jpg"
                  alt="YOYO CAKES Artisanal Dessert Showcase"
                  className="w-full h-[380px] sm:h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-brand-primary-light)]">
                    Fresh from our oven
                  </span>
                  <p className="font-heading text-lg font-bold">Artisanal Cakes, Brownies & Jars</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[var(--color-brand-primary)]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-40 w-96 h-96 rounded-full bg-[var(--color-brand-primary-dark)]/8 blur-3xl pointer-events-none" />
      </section>

      {/* Shop by Category */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="text-[var(--color-brand-primary-dark)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
              Our Collection
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-4">
              Shop by Category
            </h2>
            <p className="text-[var(--color-brand-muted)] max-w-md mx-auto">
              Explore our handcrafted selection of cakes, brownies, tiramisu, and mini jar cakes
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {CATEGORIES.map((cat, index) => {
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] flex items-end p-4 lg:p-5 card border-0 shadow-card hover:shadow-card-hover transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={`/images/categories/${cat.slug}.jpg`}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/90 transition-colors" />
                  <div className="relative z-10 text-white">
                    <h3 className="font-heading text-base lg:text-lg font-bold text-white mb-0.5 drop-shadow-sm">
                      {cat.name}
                    </h3>
                    <p className="text-white/80 text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Shop treats <ArrowRight size={12} />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="section-padding bg-[var(--color-brand-cream)]">
        <div className="container-main">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[var(--color-brand-primary-dark)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
                Most Loved
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)]">
                Our Bestsellers
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-primary-dark)] hover:text-[var(--color-brand-chocolate)] transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="sm:hidden text-center mt-8">
            <Link to="/shop" className="btn-primary">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Brownies */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <p className="text-[var(--color-brand-primary-dark)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
                Fan Favorites
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-4">
                Our Signature Brownies
              </h2>
              <p className="text-[var(--color-brand-muted)] mb-6 leading-relaxed">
                From classic fudgy to exotic flavors like Biscoff and Pista — our brownies are baked to perfection with premium ingredients. Starting at just ₹50.
              </p>
              <Link to="/shop?category=brownies" className="btn-primary">
                Explore All Brownies <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {brownies.map((product) => (
                <ProductCard key={product.id} product={product} showQuickView={false} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mini Jar Cakes */}
      <section className="section-padding bg-[var(--color-brand-cream-dark)]">
        <div className="container-main">
          <div className="text-center mb-10">
            <p className="text-[var(--color-brand-primary-dark)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
              Little Jars of Joy
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-4">
              Mini Jar Cakes — Just ₹50 Each
            </h2>
            <p className="text-[var(--color-brand-muted)] max-w-md mx-auto">
              Adorable, shareable, and perfect for any occasion. Choose from 5 delightful flavors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {miniJars.map((product) => (
              <ProductCard key={product.id} product={product} showQuickView={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Gift Box Promo */}
      <section className="section-padding bg-gradient-to-r from-[var(--color-brand-primary-dark)] to-[var(--color-brand-chocolate)]">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto">
            <Gift size={48} className="mx-auto mb-6 text-[var(--color-brand-primary-light)]" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Gift Something Sweet
            </h2>
            <p className="text-white/70 mb-8 text-lg leading-relaxed">
              Our Assorted Brownie box at ₹199 makes the perfect gift. A curated selection of our finest brownie varieties, beautifully packaged.
            </p>
            <Link to="/product/brownie-010" className="btn-primary bg-white text-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-cream)]">
              Order Assorted Box — ₹199 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="text-[var(--color-brand-primary-dark)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
              Why YOYO
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)]">
              Why Choose YOYO CAKES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Star,
                title: 'Premium Quality',
                desc: 'Only the finest ingredients go into every creation. No shortcuts, no compromises.',
              },
              {
                icon: Clock,
                title: 'Freshly Baked',
                desc: 'Every order is baked fresh. We never sell day-old products.',
              },
              {
                icon: Truck,
                title: 'Local Delivery',
                desc: 'Quick and careful delivery to your doorstep. Also available for store pickup.',
              },
              {
                icon: Shield,
                title: 'Made with Love',
                desc: 'Each dessert is handcrafted with passion and attention to every detail.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-6 rounded-2xl hover:bg-[var(--color-brand-cream)] transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-primary)]/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-brand-primary)]/25 transition-colors">
                  <item.icon size={24} className="text-[var(--color-brand-primary-dark)]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[var(--color-brand-chocolate)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews - placeholder for genuine reviews */}
      <section className="section-padding bg-[var(--color-brand-cream)]">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="text-[var(--color-brand-primary-dark)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
              Testimonials
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-4">
              What Our Customers Say
            </h2>
            <p className="text-[var(--color-brand-muted)] max-w-md mx-auto text-sm">
              Customer reviews will be displayed here once genuine reviews are submitted through the review system.
            </p>
          </div>

          <div className="text-center py-12 bg-white rounded-2xl border border-[var(--color-brand-primary-light)]/20">
            <Star size={32} className="mx-auto mb-3 text-[var(--color-brand-primary)]" />
            <p className="text-[var(--color-brand-muted)] text-sm">
              Be the first to share your YOYO CAKES experience!
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <div className="bg-gradient-to-r from-[var(--color-brand-cream)] to-[var(--color-brand-primary-light)] rounded-3xl p-8 md:p-12 lg:p-16 text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-brand-chocolate)] mb-3">
              Have a Special Order?
            </h2>
            <p className="text-[var(--color-brand-muted)] mb-6 max-w-md mx-auto">
              Contact us for custom cakes, bulk orders, or special occasion requests.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:+918428855444" className="btn-primary">
                Call Us: 84288 55444
              </a>
              <Link to="/contact" className="btn-secondary">
                Contact Page
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
