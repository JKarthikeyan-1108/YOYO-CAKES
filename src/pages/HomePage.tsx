import { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Eye,
  Gift,
  Zap,
  RotateCcw,
  Store,
  Award
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES, formatPrice, type Product } from '@/data/products';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
import toast from 'react-hot-toast';

// 5-in-1 Chocolate Dream Cake Layer Anatomy
const DREAM_CAKE_LAYERS = [
  {
    level: 1,
    title: 'Fine Dutch Cocoa Dust',
    tagline: 'Velvety bitter-sweet crown',
    cocoa: '100% Alkalized Dutch Cocoa',
    desc: 'A delicate velvet veil of alkalized Dutch cocoa powder providing a deep, roasted cocoa aroma and a sophisticated matte finish.',
    color: '#3E2723',
    accent: '#8D6E63',
    icon: '✨'
  },
  {
    level: 2,
    title: 'Crisp Belgian Dark Chocolate Shell',
    tagline: 'The iconic crackable disc',
    cocoa: '64% Belgian Couverture',
    desc: 'Tempered chocolate disc that gives the famous audible snap when tapped with a spoon! Seals in the creamy textures underneath.',
    color: '#4E342E',
    accent: '#A1887F',
    icon: '🍫',
    canCrack: true,
  },
  {
    level: 3,
    title: 'Whipped Silk Chocolate Mousse',
    tagline: 'Airy cloud of milk chocolate',
    cocoa: '42% Pure Milk Chocolate & Dairy Cream',
    desc: 'Whipped to airy perfection with real dairy butter and dairy cream. Featherlight, smooth, and melting on the palate.',
    color: '#6D4C41',
    accent: '#BCAAA4',
    icon: '☁️'
  },
  {
    level: 4,
    title: 'Moist Cocoa Sponge Cake',
    tagline: 'Tender crumb soaked in cocoa drizzle',
    cocoa: 'Natural Cocoa & Espresso Hint',
    desc: 'Ultra-soft, springy chocolate sponge baked fresh daily with organic flour and cultured butter, infused with a subtle espresso syrup.',
    color: '#5D4037',
    accent: '#D7CCC8',
    icon: '🎂'
  },
  {
    level: 5,
    title: 'Molten Lava Fudge Ganache',
    tagline: 'Rich gooey bottom river',
    cocoa: '72% Dark Chocolate & Fresh Butter',
    desc: 'A dense, gooey ganache river made by melting dark chocolate buttons with double cream. The ultimate chocolate lover’s reward.',
    color: '#2B150C',
    accent: '#C9A184',
    icon: '🌋'
  },
];

const FAQS = [
  {
    q: 'Are all YOYO cakes, brownies, and jar desserts 100% Eggless?',
    a: 'Yes, absolutely! Every single item in our patisserie is 100% vegetarian and eggless. We craft our signature textures using cultured dairy butter, premium cocoa butter, and fresh cream without any egg binders or artificial preservatives.'
  },
  {
    q: 'How do I serve and enjoy the 5-in-1 Chocolate Dream Cake?',
    a: 'Keep the tin chilled in your refrigerator until 10 minutes before serving. Take a dessert spoon, give the hard top Belgian chocolate disc a firm tap to hear that satisfying CRACK, and scoop straight down to get all 5 layers in every single bite!'
  },
  {
    q: 'Do you provide birthday candles, message cards, and wooden knives?',
    a: 'Yes! Every cake order includes complimentary celebration candles and a food-grade wooden knife. You can also write a customized birthday or anniversary message during checkout at zero extra cost.'
  }
];

export default function HomePage() {
  const products = useProductStore((s) => s.products);
  const { addItem } = useCartStore();

  // 1. Interactive Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  // 2. Interactive Dream Cake Crack & Layer State
  const [activeLayerLevel, setActiveLayerLevel] = useState<number>(2);
  const [isCracked, setIsCracked] = useState(false);
  const [crackAnimation, setCrackAnimation] = useState(false);

  // 3. Interactive Celebration Mood Finder State
  type MoodType = 'all' | 'birthday' | 'chocolate' | 'coffee' | 'gifting' | 'budget';
  const [selectedMood, setSelectedMood] = useState<MoodType>('all');

  // 5. Interactive Daily Specials Category State
  const [specialsFilter, setSpecialsFilter] = useState<'all' | 'cakes' | 'brownies' | 'jars' | 'tiramisu'>('all');


  // 7. Interactive FAQs State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Hero Carousel Items
  const heroItems = useMemo(() => {
    return [
      {
        id: 'cake-001',
        title: '5-in-1 Chocolate Dream Cake',
        price: 150,
        badge: 'Viral Bestseller',
        category: 'Signature Cakes',
        description: 'Crisp cracked chocolate shell with molten cocoa ganache and whipped mousse layers.',
        image: '/images/products/dream-cake.jpg',
        accentBg: 'from-amber-950/80 via-[#2B150C]/90 to-[#17110F]',
        tagline: 'Crack the Shell • 5 Layers of Pure Bliss',
      },
      {
        id: 'cake-002',
        title: 'Matilda Chocolate Fudge Cake',
        price: 200,
        badge: 'Decadent Classic',
        category: 'Celebration Cakes',
        description: 'Inspired by the iconic chocolate cake. Deep, dense, and infused with rich Belgian cocoa.',
        image: '/images/products/matilda-cake.jpg',
        accentBg: 'from-orange-950/80 via-[#241914]/90 to-[#17110F]',
        tagline: '70% Dark Belgian Chocolate • Melt-in-Mouth',
      },
      {
        id: 'brownie-010',
        title: 'Assorted Fudgy Brownie Box',
        price: 199,
        badge: 'Gifting Favorite',
        category: 'Gourmet Brownies',
        description: '6 artisan brownie varieties including Nutella, Biscoff, Roasted Pistachio, and Classic Fudge.',
        image: '/images/products/assorted-brownie.jpg',
        accentBg: 'from-stone-900/80 via-[#2B150C]/90 to-[#17110F]',
        tagline: 'Crinkly Top • Dense Fudgy Center • Gift Box',
      },
      {
        id: 'tiramisu-001',
        title: 'Classic Italian Tiramisu',
        price: 250,
        badge: 'Italian Masterpiece',
        category: 'Tiramisu & Desserts',
        description: 'Traditional Savoiardi ladyfingers soaked in real espresso, layered with velvety mascarpone cream.',
        image: '/images/products/classic-tiramisu.jpg',
        accentBg: 'from-amber-900/80 via-[#302219]/90 to-[#17110F]',
        tagline: 'Savoiardi Ladyfingers • Fresh Mascarpone • Chilled',
      },
    ];
  }, []);

  // Auto-advance hero carousel unless user hovers
  useEffect(() => {
    if (isHeroPaused) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHeroPaused, heroItems.length]);

  // Handle Quick Add to Cart from Hero or Dream Cake Card
  const handleQuickAdd = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      addItem(prod, 1);
      toast.success(`${prod.name} added to cart!`);
    }
  };

  // Handle Shell Crack Interactive Click
  const handleCrackShell = () => {
    setCrackAnimation(true);
    setTimeout(() => {
      setIsCracked(true);
      setCrackAnimation(false);
      setActiveLayerLevel(2);
      toast('💥 CRACK! Shell opened — 5 layers revealed!', {
        icon: '🍫',
        style: {
          borderRadius: '16px',
          background: '#2B150C',
          color: '#FFF8F0',
          fontWeight: 700,
        },
      });
    }, 350);
  };

  // Reset Shell Crack
  const handleResetShell = () => {
    setIsCracked(false);
    toast('Shell reset! Tap to crack again.', { icon: '🔄' });
  };

  // Mood Filter Products
  const moodProducts = useMemo(() => {
    if (selectedMood === 'birthday') {
      return products.filter((p) => p.categorySlug === 'cakes');
    }
    if (selectedMood === 'chocolate') {
      return products.filter((p) => 
        p.id === 'cake-001' || 
        p.id === 'cake-002' || 
        p.id === 'brownie-001' || 
        p.id === 'brownie-002' || 
        p.id === 'brownie-003' ||
        p.id === 'jar-002'
      );
    }
    if (selectedMood === 'coffee') {
      return products.filter((p) => 
        p.categorySlug === 'tiramisu-desserts' || 
        p.categorySlug === 'tea-cakes-pies' ||
        p.id === 'brownie-006'
      );
    }
    if (selectedMood === 'gifting') {
      return products.filter((p) => 
        p.id === 'brownie-010' || 
        p.categorySlug === 'mini-jar-cakes' ||
        p.id === 'cake-001'
      );
    }
    if (selectedMood === 'budget') {
      return products.filter((p) => p.price <= 300);
    }
    // 'all'
    return products.filter((p) => p.bestseller).slice(0, 8);
  }, [products, selectedMood]);

  // Daily Specials products
  const specialsProducts = useMemo(() => {
    const list = [
      products.find((p) => p.id === 'cake-001'),
      products.find((p) => p.id === 'cake-002'),
      products.find((p) => p.id === 'brownie-010'),
      products.find((p) => p.id === 'tiramisu-001'),
      products.find((p) => p.id === 'jar-001'),
      products.find((p) => p.id === 'brownie-001'),
    ].filter(Boolean) as Product[];

    if (specialsFilter === 'cakes') return list.filter((p) => p.categorySlug === 'cakes');
    if (specialsFilter === 'brownies') return list.filter((p) => p.categorySlug === 'brownies');
    if (specialsFilter === 'jars') return list.filter((p) => p.categorySlug === 'mini-jar-cakes');
    if (specialsFilter === 'tiramisu') return list.filter((p) => p.categorySlug === 'tiramisu-desserts');
    return list;
  }, [products, specialsFilter]);


  const activeLayer = DREAM_CAKE_LAYERS.find((l) => l.level === activeLayerLevel) || DREAM_CAKE_LAYERS[1];
  const currentHero = heroItems[heroIndex];

  return (
    <div className="bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] min-h-screen">
      {/* ============================================================== */}
      {/* 1. MOBILE QUICK DISCOVERY STRIP (Top App Bar & Categories) */}
      {/* ============================================================== */}
      <section className="sm:hidden bg-[var(--color-brand-surface)] border-b border-[var(--color-brand-border)] pt-3.5 pb-3 px-4">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
              100% Eggless Patisserie
            </div>
            <h1 className="font-heading text-base font-extrabold text-[var(--color-brand-chocolate)] mt-1">
              Fresh Daily Bakes
            </h1>
          </div>
          <Link
            to="/shop"
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
          >
            All 27 Treats <ArrowRight size={11} />
          </Link>
        </div>

        {/* Mobile Horizontal Category Icons */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center flex-shrink-0 group text-center min-w-[62px]"
            >
              <div className="w-13 h-13 rounded-full p-0.5 border-2 border-[var(--color-brand-primary)]/40 bg-[var(--color-brand-surface-elevated)] group-hover:border-[var(--color-brand-primary)] group-active:scale-95 transition-all shadow-xs overflow-hidden mb-1">
                <img
                  src={`/images/categories/${cat.slug}.jpg`}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                  loading="eager"
                />
              </div>
              <span className="text-[10px] font-bold text-[var(--color-brand-chocolate)] group-hover:text-[var(--color-brand-primary)] transition-colors leading-tight line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. INTERACTIVE HERO CAROUSEL (Hero Showcase with 1-Click Buy) */}
      {/* ============================================================== */}
      <section 
        className="relative overflow-hidden bg-[var(--color-brand-cream)] py-6 sm:py-12 lg:py-16"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        <div className="container-main">
          <div className="relative rounded-3xl overflow-hidden border border-[var(--color-brand-border)] shadow-xl bg-[var(--color-brand-surface)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] lg:min-h-[500px]">
              
              {/* Left Content Column */}
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between z-10">
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]">
                      {currentHero.badge}
                    </span>
                    <span className="text-xs text-[var(--color-brand-muted)] font-semibold">
                      {currentHero.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 100% Eggless
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-brand-chocolate)] leading-tight mb-2">
                    {currentHero.title}
                  </h2>

                  {/* Tagline */}
                  <p className="text-xs sm:text-sm font-bold text-[var(--color-brand-primary)] mb-3">
                    {currentHero.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-base text-[var(--color-brand-muted)] leading-relaxed mb-6 max-w-xl">
                    {currentHero.description}
                  </p>

                  {/* Price & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                    <div className="flex items-baseline gap-1.5 pr-2">
                      <span className="text-2xl sm:text-3xl font-black text-[var(--color-brand-chocolate)]">
                        {formatPrice(currentHero.price)}
                      </span>
                      <span className="text-[11px] text-[var(--color-brand-muted)] font-semibold">
                        Fresh Baked
                      </span>
                    </div>

                    <button
                      onClick={() => handleQuickAdd(currentHero.id)}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Plus size={16} /> Quick Add to Cart
                    </button>

                    <Link
                      to={`/product/${currentHero.id}`}
                      className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)] text-[var(--color-brand-chocolate)] font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                    >
                      <Eye size={15} /> Details
                    </Link>
                  </div>
                </div>

                {/* Interactive Carousel Selector Tabs */}
                <div className="pt-4 border-t border-[var(--color-brand-border)]/60">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                      {heroItems.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setHeroIndex(idx)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex-shrink-0 ${
                            heroIndex === idx
                              ? 'bg-[var(--color-brand-chocolate)] text-[var(--color-brand-cream)] shadow-xs scale-102'
                              : 'bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] border border-[var(--color-brand-border)]'
                          }`}
                        >
                          <img
                            src={item.image}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="hidden sm:inline line-clamp-1 max-w-[120px]">{item.title}</span>
                          <span className="sm:hidden">{idx + 1}</span>
                        </button>
                      ))}
                    </div>

                    {/* Prev / Next controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setHeroIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length)}
                        className="w-8 h-8 rounded-full border border-[var(--color-brand-border)] hover:bg-[var(--color-brand-surface-elevated)] flex items-center justify-center text-[var(--color-brand-chocolate)] active:scale-90 transition-all"
                        aria-label="Previous Creation"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setHeroIndex((prev) => (prev + 1) % heroItems.length)}
                        className="w-8 h-8 rounded-full border border-[var(--color-brand-border)] hover:bg-[var(--color-brand-surface-elevated)] flex items-center justify-center text-[var(--color-brand-chocolate)] active:scale-90 transition-all"
                        aria-label="Next Creation"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Image Visual Column */}
              <div className="lg:col-span-5 relative overflow-hidden bg-[var(--color-brand-cream-dark)] min-h-[260px] sm:min-h-[340px] lg:min-h-full">
                <img
                  key={currentHero.id}
                  src={currentHero.image}
                  alt={currentHero.title}
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105 animate-fade-in"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${currentHero.accentBg} opacity-60 lg:opacity-40 pointer-events-none`} />

                {/* Floating Rating Pill */}
                <div className="absolute top-4 right-4 bg-[var(--color-brand-surface)]/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[var(--color-brand-border)] shadow-md flex items-center gap-1.5 text-xs font-black text-[var(--color-brand-chocolate)]">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>

                {/* Floating Fresh Pill */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-[var(--color-brand-surface)]/95 backdrop-blur-xs p-3 rounded-2xl border border-[var(--color-brand-border)] shadow-lg max-w-xs">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-brand-primary)]">
                    Patisserie Fresh Batch
                  </p>
                  <p className="text-xs font-bold text-[var(--color-brand-chocolate)] line-clamp-1">
                    Baked fresh today in small batches
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. INTERACTIVE 5-IN-1 DREAM CAKE "TAP TO CRACK" EXPERIENCE */}
      {/* ============================================================== */}
      <section className="py-12 sm:py-16 bg-[var(--color-brand-surface)] border-y border-[var(--color-brand-border)]">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Interactive Experience
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[var(--color-brand-chocolate)]">
              Anatomy of the 5-in-1 Dream Cake
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-1.5">
              Tap the layers to explore our viral chocolate masterpiece, or tap the hammer to crack the chocolate disc!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Visual Crack Interactive Stage */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div 
                className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-4 ${
                  isCracked ? 'border-amber-500 shadow-2xl' : 'border-[var(--color-brand-border)] shadow-lg'
                } bg-[#2B150C] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 ${
                  crackAnimation ? 'animate-crack-shake' : 'hover:scale-102'
                }`}
                onClick={isCracked ? handleResetShell : handleCrackShell}
                title="Tap to crack chocolate shell"
              >
                <img
                  src="/images/products/dream-cake.jpg"
                  alt="Dream Cake Shell"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    isCracked ? 'opacity-30 blur-xs scale-105' : 'opacity-90'
                  }`}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

                {/* Interactive Center Content */}
                <div className="relative z-10 text-white flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mb-3 shadow-inner ${
                    isCracked ? 'bg-amber-500 text-white' : 'animate-pulse'
                  }`}>
                    {isCracked ? '✨' : '🔨'}
                  </div>

                  <h3 className="font-heading text-lg font-black tracking-wide">
                    {isCracked ? 'SHELL CRACKED!' : 'Tap to Crack Shell!'}
                  </h3>

                  <p className="text-[11px] text-white/80 mt-1 max-w-[180px] leading-tight">
                    {isCracked 
                      ? '5 decadent molten layers unlocked! Tap again to reset.' 
                      : 'Audible Belgian chocolate crack followed by gooey ganache.'}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider">
                    {isCracked ? <RotateCcw size={11} /> : <span>🔨 Tap Here</span>}
                    {isCracked ? 'Reset Shell' : 'Crack Now'}
                  </div>
                </div>
              </div>

              {/* Instant 1-Click Order Button */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => handleQuickAdd('cake-001')}
                  className="px-6 py-2.5 rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Order Dream Cake — ₹150
                </button>
              </div>
            </div>

            {/* Interactive Layer Breakdown */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--color-brand-muted)] mb-1 px-1">
                <span>5 Decadent Layers (Top to Bottom)</span>
                <span>Active: Layer {activeLayer.level}</span>
              </div>

              {DREAM_CAKE_LAYERS.map((layer) => {
                const isActive = activeLayerLevel === layer.level;
                return (
                  <button
                    key={layer.level}
                    onClick={() => {
                      setActiveLayerLevel(layer.level);
                      if (layer.canCrack && !isCracked) {
                        handleCrackShell();
                      }
                    }}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative overflow-hidden ${
                      isActive
                        ? 'bg-[var(--color-brand-surface-elevated)] border-[var(--color-brand-primary)] shadow-md ring-2 ring-[var(--color-brand-primary)]/20'
                        : 'bg-[var(--color-brand-surface)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)]/50'
                    }`}
                  >
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: `${layer.color}25`, color: layer.color }}
                    >
                      {layer.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-heading text-xs sm:text-sm font-extrabold text-[var(--color-brand-chocolate)]">
                          Layer {layer.level}: {layer.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-brand-cream)] text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] flex-shrink-0">
                          {layer.cocoa}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-brand-muted)] font-medium mt-0.5">
                        {layer.tagline}
                      </p>
                      {isActive && (
                        <p className="text-xs text-[var(--color-brand-chocolate)]/90 mt-2 pt-2 border-t border-[var(--color-brand-border)]/60 leading-relaxed animate-fade-in">
                          {layer.desc}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. INTERACTIVE CELEBRATION MOOD & CRAVING MATCHER */}
      {/* ============================================================== */}
      <section className="py-12 sm:py-16 bg-[var(--color-brand-cream)]">
        <div className="container-main">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-wider mb-2">
                <Gift size={13} /> Interactive Craving Matcher
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[var(--color-brand-chocolate)]">
                What are you craving today?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-1">
                Select your celebration mood to discover curated artisanal treats.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-primary)] hover:underline self-start md:self-auto"
            >
              Browse complete 27 catalog <ArrowRight size={13} />
            </Link>
          </div>

          {/* Interactive Mood Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'all', label: '🌟 All Favorites', desc: 'Bestseller Selection' },
              { id: 'birthday', label: '🎂 Birthday Party', desc: 'Signature Cakes' },
              { id: 'chocolate', label: '🍫 Deep Chocolate', desc: 'Fudge & Lava' },
              { id: 'coffee', label: '☕ Coffee & Tea Pair', desc: 'Tiramisu & Tea Cakes' },
              { id: 'gifting', label: '🎁 Luxury Gifting', desc: 'Brownie & Jar Boxes' },
              { id: 'budget', label: '⚡ Under ₹100', desc: '₹50 Personal Treats' },
            ].map((mood) => {
              const isSelected = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id as MoodType)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-start min-w-[130px] flex-shrink-0 ${
                    isSelected
                      ? 'bg-[var(--color-brand-chocolate)] text-[var(--color-brand-cream)] shadow-md scale-102 ring-2 ring-[var(--color-brand-primary)]'
                      : 'bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)]'
                  }`}
                >
                  <span className="font-extrabold">{mood.label}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-brand-muted)]'}`}>
                    {mood.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filtered Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {moodProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. FRESH KITCHEN PICKUP & BAKING SCHEDULE */}
      {/* ============================================================== */}
      <section className="py-12 sm:py-16 bg-[var(--color-brand-surface-elevated)] border-y border-[var(--color-brand-border)]">
        <div className="container-main max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] text-xs font-bold mb-2">
              <Store size={13} />
              <span>Direct Kitchen Pickup & Counter Orders</span>
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)] tracking-tight">
              Fresh Daily Baking Schedule & Kitchens
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-1.5">
              Order your favorite cakes and desserts online and collect them freshly packaged straight from our patisserie kitchen counters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* Kitchen 1: Anna Nagar */}
            <div className="p-6 rounded-3xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] shadow-xs hover:border-[var(--color-brand-primary)]/40 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-[var(--color-brand-chocolate)]">
                      Anna Nagar Central Kitchen
                    </h3>
                    <p className="text-[11px] font-bold text-[var(--color-brand-primary)]">
                      Main Production & Master Chef Studio
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Open Now
                </span>
              </div>
              <p className="text-xs text-[var(--color-brand-muted)] mb-3 leading-relaxed">
                14/2, 2nd Ave, Anna Nagar, Chennai – 600040. Full live cake counter, custom celebration orders, and fresh tasting.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--color-brand-border)]/60 text-xs">
                <span className="flex items-center gap-1 text-[var(--color-brand-chocolate)] font-semibold">
                  <Clock size={13} className="text-[var(--color-brand-primary)]" /> 9:00 AM – 10:30 PM
                </span>
                <a
                  href="tel:+918428855444"
                  className="ml-auto inline-flex items-center gap-1 font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] hover:underline"
                >
                  <Phone size={12} /> Call Kitchen
                </a>
              </div>
            </div>

            {/* Kitchen 2: T. Nagar */}
            <div className="p-6 rounded-3xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] shadow-xs hover:border-[var(--color-brand-primary)]/40 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-[var(--color-brand-chocolate)]">
                      T. Nagar Patisserie Hub
                    </h3>
                    <p className="text-[11px] font-bold text-[var(--color-brand-primary)]">
                      Quick Pickup & Dessert Bar
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Open Now
                </span>
              </div>
              <p className="text-xs text-[var(--color-brand-muted)] mb-3 leading-relaxed">
                28, South Usman Road, T. Nagar, Chennai – 600017. Fast takeaway station for Dream Cakes, Brownies & Mini Jars.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--color-brand-border)]/60 text-xs">
                <span className="flex items-center gap-1 text-[var(--color-brand-chocolate)] font-semibold">
                  <Clock size={13} className="text-[var(--color-brand-primary)]" /> 9:30 AM – 11:00 PM
                </span>
                <a
                  href="tel:+916379603744"
                  className="ml-auto inline-flex items-center gap-1 font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] hover:underline"
                >
                  <Phone size={12} /> Call Kitchen
                </a>
              </div>
            </div>
          </div>

          {/* Daily Baking Batch Schedule Banner */}
          <div className="p-5 rounded-2xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-chocolate)] flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[var(--color-brand-chocolate)]">
                  Fresh Batch Baking Hours Daily
                </h4>
                <p className="text-xs text-[var(--color-brand-muted)]">
                  Morning Batch: 10:00 AM • Afternoon Batch: 3:00 PM • Evening Batch: 7:00 PM
                </p>
              </div>
            </div>
            <Link
              to="/shop"
              className="px-5 py-2.5 rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white text-xs font-bold transition-all shadow-xs flex-shrink-0"
            >
              Pre-Order Fresh Batch
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. FRESH DAILY SPECIALS WITH LIVE TABS */}
      {/* ============================================================== */}
      <section className="py-12 sm:py-16 bg-[var(--color-brand-surface)] border-b border-[var(--color-brand-border)]">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)] text-white flex items-center justify-center shadow-xs">
                <Flame size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)]">
                    Today’s Fresh Batch Specials
                  </h2>
                  <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    HOT IN OVEN
                  </span>
                </div>
                <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                  Small-batch artisan bakes made fresh every morning.
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Specials' },
                { id: 'cakes', label: 'Cakes' },
                { id: 'brownies', label: 'Brownies' },
                { id: 'jars', label: 'Mini Jars (₹50)' },
                { id: 'tiramisu', label: 'Tiramisu' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSpecialsFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    specialsFilter === tab.id
                      ? 'bg-[var(--color-brand-chocolate)] text-[var(--color-brand-cream)]'
                      : 'bg-[var(--color-brand-cream)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specials Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {specialsProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. QUALITY CRAFTSMANSHIP PROMISE */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-16 bg-[var(--color-brand-cream-dark)]">
        <div className="container-main">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)]">
              The YOYO Kitchen Standard
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-1">
              Pure dairy butter, genuine Belgian cocoa, and 100% vegetarian craftsmanship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Clock,
                title: 'Baked Fresh Daily',
                desc: 'Orders are prepared fresh on schedule in small kitchen batches with zero preservatives.',
              },
              {
                icon: Star,
                title: '100% Eggless Pure Veg',
                desc: 'Real Belgian chocolate, dairy cream, and pure butter. No synthetic fats or shortcuts.',
              },
              {
                icon: Truck,
                title: 'Insulated Cold Transit',
                desc: 'Temperature-managed packing to ensure your cakes arrive in picture-perfect presentation.',
              },
              {
                icon: Shield,
                title: 'FSSAI Certified Kitchen',
                desc: 'Strict hygiene, safe food-handling, and sanitized patisserie preparation standards.',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] flex items-center justify-center mb-4 text-[var(--color-brand-primary)]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--color-brand-chocolate)] mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. PATISSERIE HERITAGE & MASTER CHEF CRAFTSMANSHIP */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-16 bg-[var(--color-brand-surface)] border-t border-[var(--color-brand-border)]">
        <div className="container-main">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold mb-3">
              <Award size={13} />
              <span>Artisanal Quality Standard & Master Craftsmanship</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[var(--color-brand-chocolate)] tracking-tight">
              The YOYO Patisserie Standard
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-2">
              Every creation is freshly baked in small batches in our dedicated eggless kitchens in Chennai, using pure Belgian chocolate and slow-churned dairy butter.
            </p>
          </div>

          {/* 4 Craftsmanship Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              {
                icon: '🍫',
                title: 'Belgian Couverture',
                subtitle: 'Zero Palm Oil & Zero Compound',
                desc: 'Single-origin cocoa mass and pure natural cocoa butter for a silken melt and glossy finish.'
              },
              {
                icon: '🥛',
                title: 'Cultured Dairy Butter',
                subtitle: 'Slow-Churned Richness',
                desc: '82% butterfat unsalted dairy butter infused with natural Bourbon vanilla beans for aromatic depth.'
              },
              {
                icon: '🌱',
                title: '100% Eggless Purity',
                subtitle: 'Zero Gelatin Guaranteed',
                desc: 'Crafted with premium plant-based stabilizers and food-grade agar-agar. Dedicated egg-free kitchen.'
              },
              {
                icon: '✨',
                title: 'Small Batch Baking',
                subtitle: 'Fresh Daily Batches',
                desc: 'Crafted daily at our Anna Nagar & T. Nagar kitchens for supreme moisture and silken crumb.'
              }
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="bg-[var(--color-brand-surface-elevated)] rounded-2xl p-5 border border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)]/40 hover:shadow-md transition-all duration-300"
              >
                <div className="text-2xl mb-3">{pillar.icon}</div>
                <h3 className="font-heading font-extrabold text-sm sm:text-base text-[var(--color-brand-chocolate)] mb-1">
                  {pillar.title}
                </h3>
                <p className="text-[11px] font-bold text-[var(--color-brand-primary)] mb-2">
                  {pillar.subtitle}
                </p>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Custom Celebration Banner Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2A160D] via-[#1E0F09] to-[#140A06] border border-amber-900/40 p-6 sm:p-8 text-white shadow-xl">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[#FFD814] text-xs font-bold mb-3">
                  <Sparkles size={13} />
                  <span>Custom Orders & Celebration Cakes</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-white mb-2">
                  Have a Special Birthday or Wedding Celebration?
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
                  Work directly with our head pastry chef for custom dessert hampers, tiered dream cakes, and personalized celebration messaging. Fresh kitchen collection ready when you arrive.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                    🎂 Custom Fondant & Torte
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                    ✨ 100% Eggless Certified
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                    📍 Anna Nagar & T. Nagar
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <a
                  href="tel:+918428855444"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD814] to-[#F7CA00] hover:from-[#F7CA00] hover:to-[#E5B500] text-[#1E1008] font-extrabold text-sm shadow-lg transition-all transform active:scale-95"
                >
                  <Phone size={16} />
                  <span>Call Master Chef</span>
                </a>
                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-colors"
                >
                  <span>Explore Menu</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. INTERACTIVE PATISSERIE FAQ ACCORDION */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-16 bg-[var(--color-brand-cream)] border-t border-[var(--color-brand-border)]">
        <div className="container-main max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-1">
              Everything you need to know about our fresh eggless bakes and kitchen pickup.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[var(--color-brand-chocolate)] hover:text-[var(--color-brand-primary)] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-full bg-[var(--color-brand-cream)] text-[var(--color-brand-muted)] flex-shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-0 text-xs text-[var(--color-brand-muted)] leading-relaxed border-t border-[var(--color-brand-border)]/60 animate-fade-in">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 10. DIRECT CHEF ORDER / CONTACT CALLOUT BANNER */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-16 bg-[var(--color-brand-strip-bg)] text-white">
        <div className="container-main text-center max-w-2xl">
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white mb-2">
            Have a Custom Celebration Request?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mb-6 leading-relaxed">
            Personalized birthday messaging, bulk event dessert hampers, and kitchen pickup orders are welcome. Speak directly with our head pastry chef.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:+918428855444"
              className="px-5 py-2.5 rounded-full bg-[var(--color-brand-primary)] text-[var(--color-brand-chocolate)] font-black text-xs hover:bg-white transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Phone size={14} /> Call +91 84288 55444
            </a>
            <a
              href="tel:+916379603744"
              className="px-5 py-2.5 rounded-full border border-white/30 text-white font-bold text-xs hover:bg-white hover:text-[var(--color-brand-chocolate)] transition-colors flex items-center gap-1.5"
            >
              <Phone size={14} /> Call +91 63796 03744
            </a>
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-full border border-white/30 text-white font-bold text-xs hover:bg-white hover:text-[var(--color-brand-chocolate)] transition-colors"
            >
              Custom Order Form
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
