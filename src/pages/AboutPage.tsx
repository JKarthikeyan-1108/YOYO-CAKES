import { Link } from 'react-router-dom';
import { Heart, Sparkles, ChefHat, Award, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-12 lg:py-20">
      <div className="container-main max-w-4xl">
        {/* Hero Banner */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-brand-primary-dark)] mb-3 block">
            Our Story & Craft
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[var(--color-brand-chocolate)] mb-6">
            Handcrafting Joy, One Bite at a Time
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-brand-chocolate-light)] leading-relaxed max-w-2xl mx-auto">
            At <strong>YOYO CAKES</strong>, baking isn't just a process — it's an art of creating moments of pure happiness for you and your loved ones.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-[var(--color-brand-surface)] rounded-3xl shadow-elevated p-8 sm:p-12 mb-12 border border-[var(--color-brand-border)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-brand-chocolate)] mb-4">
                The YOYO Philosophy
              </h2>
              <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed mb-4">
                Founded with a passionate commitment to artisanal dessert craftsmanship, YOYO CAKES was born from the belief that exceptional desserts should bring comforting warmth and unforgettable indulgence to everyday life.
              </p>
              <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed mb-6">
                From our decadent <em>Dream Cake</em> and rich <em>Matilda Cake</em> to our crowd-favorite fudgy <em>Brownies</em> and delicate <em>Mini Jar Cakes</em>, every recipe is perfected with premium cocoa, velvety creams, and uncompromised love.
              </p>
              <div className="flex items-center gap-3 text-xs font-semibold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]">
                <Sparkles size={16} /> <span>100% Handcrafted • Freshly Baked Daily</span>
              </div>
            </div>

            <div className="bg-[var(--color-brand-surface-elevated)] p-8 rounded-2xl border border-[var(--color-brand-border)] text-center">
              <div className="text-4xl font-heading font-black text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] mb-2">
                27+
              </div>
              <div className="text-sm font-bold text-[var(--color-brand-chocolate)] mb-6">
                Signature Bakery Recipes
              </div>
              <div className="space-y-3 text-sm text-[var(--color-brand-chocolate)] text-left">
                <div className="flex items-center gap-2">
                  <ChefHat size={18} className="text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] flex-shrink-0" />
                  <span>Small-batch artisanal baking techniques</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] flex-shrink-0" />
                  <span>Finest Belgian chocolates & cocoa beans</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] flex-shrink-0" />
                  <span>Hygienic, temperature-controlled kitchen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-[var(--color-brand-surface)] rounded-2xl p-6 text-center border border-[var(--color-brand-border)] shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] flex items-center justify-center mx-auto mb-4">
              <ChefHat size={24} />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--color-brand-chocolate)] mb-2">Fresh Ingredients</h3>
            <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed">
              We never cut corners. Real butter, pure dairy cream, and authentic chocolate in every single bake.
            </p>
          </div>

          <div className="bg-[var(--color-brand-surface)] rounded-2xl p-6 text-center border border-[var(--color-brand-border)] shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] flex items-center justify-center mx-auto mb-4">
              <Heart size={24} />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--color-brand-chocolate)] mb-2">Baked with Love</h3>
            <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed">
              Every cake is iced and finished by skilled dessert artisans who take pride in their craft.
            </p>
          </div>

          <div className="bg-[var(--color-brand-surface)] rounded-2xl p-6 text-center border border-[var(--color-brand-border)] shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--color-brand-chocolate)] mb-2">Sweet Happiness</h3>
            <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed">
              Our guiding motto is simple: Every single bite should deliver a genuine smile of delight.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[var(--color-brand-chocolate)] text-white rounded-3xl p-8 sm:p-12 text-center shadow-lg">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Taste the Happiness?
          </h2>
          <p className="text-[var(--color-brand-cream)]/90 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
            Browse our full catalog of 27 artisanal desserts and have your favorites delivered fresh.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-sm px-8 py-3.5">
            Shop Our Catalog <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
