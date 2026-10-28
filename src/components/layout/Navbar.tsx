import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  Plus,
  Home,
  Package,
  Cake,
  Coffee,
  IceCream,
  BookOpen,
  Settings,
  ClipboardList,
  MessageSquare,
  ChevronRight,
  Star,
  Store,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { useProductStore } from '@/stores/productStore';
import BrandLogo from '@/components/common/BrandLogo';
import ThemeToggle from '@/components/common/ThemeToggle';
import { CATEGORIES, formatPrice } from '@/data/products';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const cartCount = useCartStore((s) => s.getItemCount());
  const addItemToCart = useCartStore((s) => s.addItem);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user, logout, isAdmin } = useAuthStore();
  const products = useProductStore((s) => s.products);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close drawer on Escape, trap focus within drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileOpen) {
          setMobileOpen(false);
          hamburgerRef.current?.focus();
        }
        if (isSearchOpen) setIsSearchOpen(false);
        if (isMobileSearchVisible) setIsMobileSearchVisible(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, isSearchOpen, isMobileSearchVisible]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile search input when it becomes visible
  useEffect(() => {
    if (isMobileSearchVisible && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchVisible]);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const searchResults = searchQuery.trim().length > 0
    ? products.filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.categorySlug === selectedCategory;
        const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      }).slice(0, 5)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMobileSearchVisible(false);
      const catParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}${catParam}`);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setIsSearchOpen(false);
    setIsMobileSearchVisible(false);
    navigate(`/product/${productId}`);
  };

  const handleSelectTrending = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(false);
    setIsMobileSearchVisible(false);
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  // Mobile nav items
  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/shop', label: 'All Products', icon: Package },
    { to: '/shop?category=cakes', label: 'Cakes', icon: Cake },
    { to: '/shop?category=tiramisu-desserts', label: 'Tiramisu & Desserts', icon: Coffee },
    { to: '/shop?category=brownies', label: 'Brownies', icon: IceCream },
    { to: '/shop?category=tea-cakes-pies', label: 'Tea Cakes & Pies', icon: BookOpen },
    { to: '/shop?category=mini-jar-cakes', label: 'Mini Jar Cakes', icon: IceCream },
    { to: '/about', label: 'Our Story & Kitchens', icon: Store },
  ];


  const accountLinks = [
    { to: '/cart', label: 'Shopping Cart', icon: ShoppingCart },
    { to: '/orders', label: 'My Orders', icon: ClipboardList },
    { to: '/account?tab=profile', label: 'My Profile', icon: User },
    { to: '/account?tab=settings', label: 'Account Settings', icon: Settings },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/contact', label: 'Contact', icon: MessageSquare },
  ];

  return (
    <>
      {/* Compact Announcement Bar */}
      <div className="bg-[var(--color-brand-strip-bg)] text-[var(--color-brand-strip-text)] text-[11px] font-medium py-1.5 px-4 tracking-wide border-b border-[var(--color-brand-border)]/50">
        <div className="container-main flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Sparkles size={12} className="text-[var(--color-brand-primary)] flex-shrink-0" />
            <span className="truncate">Handcrafted Artisanal Bakes • Fresh Baked Daily • Every bite, a little happiness</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-[var(--color-brand-strip-muted)] flex-shrink-0">
            <a href="tel:+918428855444" className="hover:text-[var(--color-brand-primary)] flex items-center gap-1">
              Helpline: +91 84288 55444
            </a>
            <span>|</span>
            <Link to="/contact" className="hover:text-[var(--color-brand-primary)]">Store Locator</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="bg-[var(--color-brand-surface)] border-b border-[var(--color-brand-border)] sticky top-0 z-50 shadow-xs transition-colors">
        <div className="container-main py-2 sm:py-2.5">
          <div className="flex items-center gap-2 sm:gap-3 justify-between">
            {/* Left: Hamburger + Logo + Location */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <button
                ref={hamburgerRef}
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-drawer"
              >
                <Menu size={20} />
              </button>

              <Link to="/" className="group inline-flex items-center flex-shrink-0" aria-label="YOYO CAKES Home">
                <BrandLogo size="sm" showTagline={false} />
              </Link>
            </div>

            {/* Center: Search Bar (desktop) */}
            <div ref={searchContainerRef} className="hidden sm:block flex-1 max-w-xl mx-2 relative">
              <form onSubmit={handleSearch}>
                <div className="flex rounded-full overflow-hidden border border-[var(--color-brand-border)] focus-within:border-[var(--color-brand-primary)] focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/20 shadow-xs transition-all bg-[var(--color-brand-surface-elevated)] hover:bg-[var(--color-brand-surface)]">
                  {/* Category Dropdown */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="hidden md:block bg-transparent text-[var(--color-brand-chocolate)] text-xs font-semibold px-3 py-2 border-r border-[var(--color-brand-border)] outline-none hover:bg-[var(--color-brand-cream-dark)] cursor-pointer"
                    aria-label="Filter by category"
                  >
                    <option value="all" className="bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)]">All</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.slug} className="bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)]">
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  {/* Search Input */}
                  <div className="relative flex-1 flex items-center">
                    <Search size={16} className="ml-3 text-[var(--color-brand-muted)] flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onFocus={() => setIsSearchOpen(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      placeholder="Search cakes, brownies, tiramisu..."
                      className="w-full px-2.5 py-2 text-sm outline-none font-medium text-[var(--color-brand-chocolate)] placeholder:text-[var(--color-brand-muted)] bg-transparent"
                      aria-label="Search products"
                      aria-autocomplete="list"
                      aria-controls={isSearchOpen ? 'search-results' : undefined}
                    />
                    {!searchQuery && (
                      <span className="hidden lg:inline-flex items-center gap-0.5 text-[10px] text-gray-400 bg-gray-200/60 px-1.5 py-0.5 rounded font-mono mr-2 pointer-events-none select-none">
                        ⌘K
                      </span>
                    )}
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="px-2 text-gray-400 hover:text-gray-600 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        aria-label="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Search Submit Button */}
                  <button
                    type="submit"
                    aria-label="Search"
                    className="bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] px-4 flex items-center justify-center text-white transition-colors min-w-[40px] min-h-[40px]"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </form>

              {/* Search Autocomplete Overlay */}
              {isSearchOpen && (
                <div
                  id="search-results"
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-2 bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] rounded-2xl shadow-2xl border border-[var(--color-brand-border)] z-50 overflow-hidden animate-fade-in"
                >
                  {searchQuery.trim().length > 0 ? (
                    <div>
                      {searchResults.length > 0 ? (
                        <div>
                          <div className="p-2.5 bg-[var(--color-brand-surface-elevated)] border-b border-[var(--color-brand-border)] flex items-center justify-between text-xs text-[var(--color-brand-muted)] font-medium">
                            <span>Matching items ({searchResults.length})</span>
                            <span className="text-[11px]">Click item or Add to Cart</span>
                          </div>
                          <div className="divide-y divide-[var(--color-brand-border)]">
                            {searchResults.map((item) => (
                              <div
                                key={item.id}
                                role="option"
                                aria-selected="false"
                                className="w-full p-3 hover:bg-[var(--color-brand-cream-dark)] transition-colors flex items-center justify-between gap-3 group"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSelectProduct(item.id)}
                                  className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                                >
                                  <img
                                    src={item.image || `/images/categories/${item.categorySlug}.jpg`}
                                    alt={item.name}
                                    className="w-11 h-11 rounded-xl object-cover flex-shrink-0 bg-[var(--color-brand-cream-dark)] border border-[var(--color-brand-border)]"
                                    loading="lazy"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold text-[var(--color-brand-chocolate)] truncate group-hover:text-[var(--color-brand-primary)]">
                                      {item.name}
                                    </h4>
                                    <p className="text-[11px] text-[var(--color-brand-muted)] truncate">{item.category}</p>
                                  </div>
                                </button>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="font-heading text-sm font-extrabold text-[var(--color-brand-chocolate)]">
                                    {formatPrice(item.price)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addItemToCart(item);
                                      toast.success(`${item.name} added to cart!`);
                                    }}
                                    className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] active:scale-95 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer min-w-[36px] min-h-[36px] justify-center"
                                    title="Add to cart"
                                    aria-label={`Add ${item.name} to cart`}
                                  >
                                    <Plus size={14} />
                                    <span className="hidden sm:inline">Add</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                            <button
                              type="button"
                              onClick={handleSearch}
                              className="text-xs font-bold text-[var(--color-brand-primary-dark)] hover:underline inline-flex items-center gap-1.5"
                            >
                              View all results for "{searchQuery}" <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          <p className="text-xs font-bold text-gray-800 mb-1">No matches for "{searchQuery}"</p>
                          <p className="text-[11px] mb-3">Try our popular categories:</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {['Dream Cake', 'Brownies', 'Tiramisu', 'Jar Cakes'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleSelectTrending(tag)}
                                className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-[var(--color-brand-primary)] hover:text-white text-[11px] font-semibold text-gray-700 transition-colors"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-3">
                        <Flame size={15} className="text-red-500" />
                        <span>Trending Favorites</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { term: '5-in-1 Chocolate Dream Cake', cat: 'Signature Cakes' },
                          { term: 'Matilda Dark Chocolate Cake', cat: 'Signature Cakes' },
                          { term: 'Assorted Brownie Box', cat: 'Brownies' },
                          { term: 'Classic Italian Tiramisu', cat: 'Tiramisu' },
                          { term: 'Red Velvet Mini Jar Cake', cat: 'Jar Cakes' },
                          { term: 'Nutella Hazelnut Brownie', cat: 'Brownies' },
                        ].map((trend) => (
                          <button
                            key={trend.term}
                            type="button"
                            onClick={() => handleSelectTrending(trend.term)}
                            className="p-2 rounded-xl hover:bg-[var(--color-brand-cream)]/70 transition-colors text-left flex items-center justify-between border border-transparent hover:border-gray-200 group"
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-900 group-hover:text-[var(--color-brand-primary-dark)]">
                                {trend.term}
                              </p>
                              <p className="text-[10px] text-gray-500">{trend.cat}</p>
                            </div>
                            <ArrowRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)}
              className="sm:hidden p-1.5 rounded-lg text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream-dark)] min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors"
              aria-label="Search products"
            >
              <Search size={20} />
            </button>

            {/* Right Action Icons */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Returns & Orders (desktop) */}
              <Link
                to={user ? '/account' : '/login'}
                className="hidden lg:flex flex-col p-1.5 rounded-lg hover:bg-gray-100 text-left transition-colors"
              >
                <span className="text-[10px] text-gray-500 font-medium">Returns</span>
                <span className="text-xs font-bold text-gray-900">& Orders</span>
              </Link>

              {/* Account Dropdown (desktop) */}
              <div className="relative group hidden sm:block">
                <Link
                  to={user ? '/account' : '/login'}
                  className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors min-w-[40px] min-h-[40px]"
                  aria-label={user ? 'My Account' : 'Sign in'}
                >
                  <User size={18} className="text-gray-700" />
                  <div className="hidden sm:block text-left">
                    <span className="text-[10px] text-gray-500 font-medium block leading-tight">
                      {user ? `Hello, ${user.displayName?.split(' ')[0] || 'You'}` : 'Hello, Sign in'}
                    </span>
                    <span className="text-xs font-bold text-gray-900 leading-tight flex items-center">
                      Account <ChevronDown size={12} className="ml-0.5 text-gray-500" />
                    </span>
                  </div>
                </Link>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-elevated border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 p-3 z-50">
                  {user ? (
                    <div>
                      <div className="pb-2 mb-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900">{user.displayName || 'Customer'}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email || user.phoneNumber}</p>
                      </div>
                      {isAdmin && (
                        <div className="space-y-1 mb-2">
                          <Link
                            to="/admin/products"
                            className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold border border-amber-200"
                          >
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck size={13} className="text-amber-700" />
                              Admin Products & Stock
                            </span>
                            <span className="text-[9px] bg-amber-200 px-1 py-0.5 rounded text-amber-950 font-extrabold uppercase">
                              Staff
                            </span>
                          </Link>
                          <Link
                            to="/admin/reviews"
                            className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold border border-amber-200"
                          >
                            <span className="flex items-center gap-1.5">
                              <Star size={13} className="text-amber-700" />
                              Moderate Reviews
                            </span>
                            <span className="text-[9px] bg-amber-200 px-1 py-0.5 rounded text-amber-950 font-extrabold uppercase">
                              Mod
                            </span>
                          </Link>
                        </div>
                      )}
                      <Link to="/account" className="block py-1.5 text-xs text-gray-700 hover:text-[var(--color-brand-primary-dark)] font-medium">
                        Your Profile & Addresses
                      </Link>
                      <Link to="/account" className="block py-1.5 text-xs text-gray-700 hover:text-[var(--color-brand-primary-dark)] font-medium">
                        Your Orders & Invoices
                      </Link>
                      <Link to="/wishlist" className="block py-1.5 text-xs text-gray-700 hover:text-[var(--color-brand-primary-dark)] font-medium">
                        Your Saved Wishlist
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="w-full text-left py-1.5 text-xs text-red-600 hover:underline font-bold mt-2 pt-2 border-t border-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Link
                        to="/login"
                        className="w-full block py-2 rounded-lg bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white text-xs font-bold shadow-xs mb-2"
                      >
                        Sign in
                      </Link>
                      <p className="text-[11px] text-gray-500">
                        New customer?{' '}
                        <Link to="/register" className="text-[var(--color-brand-primary-dark)] font-bold hover:underline">
                          Start here.
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Wishlist (desktop/tablet) */}
              <Link
                to="/wishlist"
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors hidden sm:flex items-center relative min-w-[40px] min-h-[40px] justify-center"
                aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
              >
                <Heart size={18} className={wishlistCount > 0 ? 'text-red-500 fill-red-500' : ''} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Mobile Quick Theme Toggle */}
              <div className="sm:hidden flex items-center">
                <ThemeToggle variant="compact" className="text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream-dark)]" />
              </div>

              {/* Theme Toggle Button & Dropdown (desktop/tablet) */}
              <div className="hidden sm:flex items-center">
                <ThemeToggle variant="desktop" />
              </div>

              {/* Cart (visible on all sizes) */}
              <Link
                to="/cart"
                className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] transition-colors relative min-w-[40px] min-h-[40px] justify-center"
                aria-label={`Shopping cart, ${cartCount} items`}
              >
                <div className="relative">
                  <ShoppingCart size={20} className="text-[var(--color-brand-chocolate)]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-brand-primary-dark)] text-white text-[9px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center border border-[var(--color-brand-surface)] shadow-xs">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline text-xs font-bold">Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (slides down when toggled) */}
        {isMobileSearchVisible && (
          <div className="sm:hidden px-3 pb-2.5 animate-fade-in">
            <form onSubmit={handleSearch} className="flex rounded-full overflow-hidden border border-[var(--color-brand-border)] focus-within:border-[var(--color-brand-primary)] focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/20 bg-[var(--color-brand-surface-elevated)]">
              <div className="relative flex-1 flex items-center">
                <Search size={16} className="ml-3 text-[var(--color-brand-muted)] flex-shrink-0" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Search cakes, brownies, tiramisu..."
                  className="w-full px-2.5 py-2 text-base outline-none font-medium text-[var(--color-brand-chocolate)] placeholder:text-[var(--color-brand-muted)] bg-transparent"
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                aria-label="Search"
                className="bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] px-3.5 flex items-center justify-center text-white min-h-[38px] transition-colors"
              >
                <Search size={16} />
              </button>
            </form>

            {/* Mobile search results */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="mt-2 bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] rounded-xl shadow-lg border border-[var(--color-brand-border)] overflow-hidden max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[var(--color-brand-border)]">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectProduct(item.id)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-[var(--color-brand-cream-dark)] text-left transition-colors cursor-pointer"
                      >
                        <img
                          src={item.image || `/images/categories/${item.categorySlug}.jpg`}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-[var(--color-brand-cream-dark)] border border-[var(--color-brand-border)]"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--color-brand-chocolate)] truncate">{item.name}</p>
                          <p className="text-xs text-[var(--color-brand-muted)]">{formatPrice(item.price)}</p>
                        </div>
                        <ArrowRight size={14} className="text-[var(--color-brand-muted)] flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--color-brand-muted)]">
                    No results for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Desktop Sub-Navigation Bar with horizontal scroll categories */}
        <div className="hidden sm:block bg-[var(--color-brand-strip-bg)] text-[var(--color-brand-strip-text)] text-xs font-medium overflow-x-auto scrollbar-none border-b border-[var(--color-brand-border)]/40">
          <div className="container-main flex items-center gap-4 sm:gap-5 py-2 whitespace-nowrap">
            <Link to="/shop" className="flex items-center gap-1.5 hover:text-[var(--color-brand-primary)] font-bold">
              <Menu size={14} /> All Products
            </Link>
            <Link to="/shop?sort=bestseller" className="hover:text-[var(--color-brand-primary)] flex items-center gap-1">
              <Sparkles size={12} className="text-[var(--color-brand-primary)]" /> Best Sellers
            </Link>

            <Link to="/shop?category=cakes" className="hover:text-[var(--color-brand-primary)]">
              Signature Cakes
            </Link>
            <Link to="/shop?category=brownies" className="hover:text-[var(--color-brand-primary)]">
              Fudgy Brownies
            </Link>
            <Link to="/shop?category=tiramisu-desserts" className="hover:text-[var(--color-brand-primary)]">
              Italian Tiramisu
            </Link>
            <Link to="/shop?category=mini-jar-cakes" className="hover:text-[var(--color-brand-primary)]">
              Jar Cakes
            </Link>
            <Link to="/shop?category=tea-cakes-pies" className="hover:text-[var(--color-brand-primary)]">
              Tea Cakes
            </Link>
            <Link to="/about" className="hover:text-[var(--color-brand-primary)]">
              Our Story
            </Link>
            <Link to="/contact" className="hover:text-[var(--color-brand-primary)]">
              Bulk & Corporate
            </Link>
          </div>
        </div>
      </header>

      {/* ===== MOBILE NAVIGATION DRAWER ===== */}
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
          onClick={closeMobileMenu}
        />
      )}

      {/* Drawer Panel */}
      <div
        id="mobile-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={`lg:hidden fixed top-0 left-0 h-full w-[300px] max-w-[85vw] z-[100] bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-r border-[var(--color-brand-border)] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]">
          <Link to="/" onClick={closeMobileMenu} aria-label="YOYO CAKES Home">
            <BrandLogo size="sm" />
          </Link>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-full bg-[var(--color-brand-surface-elevated)] hover:bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center border border-[var(--color-brand-border)]"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* User Info / Sign In */}
          <div className="p-4 bg-[var(--color-brand-cream-dark)] border-b border-[var(--color-brand-border)]">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-primary)] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--color-brand-chocolate)] truncate">
                    {user.displayName || 'Customer'}
                  </p>
                  <p className="text-[11px] text-[var(--color-brand-muted)] truncate">
                    {user.email || user.phoneNumber}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-[var(--color-brand-muted)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-brand-chocolate)]">Welcome, Guest</p>
                  <div className="flex gap-3 mt-1">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="text-xs font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] hover:underline"
                    >
                      Sign In
                    </Link>
                    <span className="text-[var(--color-brand-border)]">|</span>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="text-xs font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] hover:underline"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation">
            <div className="py-2">
              <p className="px-4 py-1.5 text-[10px] font-black text-[var(--color-brand-muted)] uppercase tracking-widest">Browse</p>
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to + label}
                  to={to}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream-dark)] hover:text-[var(--color-brand-primary-dark)] transition-colors group"
                >
                  <Icon size={18} className="text-[var(--color-brand-muted)] group-hover:text-[var(--color-brand-primary-dark)] dark:group-hover:text-[var(--color-brand-primary)] flex-shrink-0" />
                  <span>{label}</span>
                  <ChevronRight size={14} className="ml-auto text-[var(--color-brand-muted)] group-hover:text-[var(--color-brand-primary)]" />
                </Link>
              ))}
            </div>

            <div className="py-2 border-t border-[var(--color-brand-border)]">
              <p className="px-4 py-1.5 text-[10px] font-black text-[var(--color-brand-muted)] uppercase tracking-widest">My Account</p>
              {accountLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream-dark)] hover:text-[var(--color-brand-primary-dark)] transition-colors group"
                >
                  <Icon size={18} className="text-[var(--color-brand-muted)] group-hover:text-[var(--color-brand-primary-dark)] dark:group-hover:text-[var(--color-brand-primary)] flex-shrink-0" />
                  <span>{label}</span>
                  {label === 'Wishlist' && wishlistCount > 0 && (
                    <span className="ml-auto bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Admin Section — only shown to admins */}
            {isAdmin && (
              <div className="py-2 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-cream-dark)]">
                <p className="px-4 py-1.5 text-[10px] font-black text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] uppercase tracking-widest">
                  Admin
                </p>
                <Link
                  to="/admin"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-surface)] transition-colors group"
                >
                  <ShieldCheck size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" />
                  <span>Admin Dashboard</span>
                  <ChevronRight size={14} className="ml-auto text-[var(--color-brand-muted)]" />
                </Link>
                <Link
                  to="/admin/products"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-surface)] transition-colors"
                >
                  <Package size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" />
                  <span>Products & Stock</span>
                </Link>
                <Link
                  to="/admin/orders"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-surface)] transition-colors"
                >
                  <ClipboardList size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/admin/reviews"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-surface)] transition-colors"
                >
                  <Star size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" />
                  <span>Customer Reviews</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] space-y-3">
          {/* Mobile Theme Switcher */}
          <ThemeToggle variant="mobile" />

          {user ? (
            <button
              onClick={async () => {
                await logout();
                closeMobileMenu();
                toast.success('Signed out successfully');
              }}
              className="w-full py-3 px-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100 text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-red-200 dark:border-red-900/50"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Sign In to Your Account
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
