import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { CATEGORIES } from '@/data/products';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartCount = useCartStore((s) => s.getItemCount());
  const { user } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[var(--color-brand-primary-dark)] text-white text-center py-2 px-4 text-sm font-medium tracking-wide">
        <span className="hidden sm:inline">🎂 Free delivery on orders above ₹500 • </span>
        Every bite, a little happiness ✨
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-[var(--color-brand-primary-light)]/30 shadow-soft">
        <div className="container-main">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-brand-cream)] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-primary-dark)] flex items-center justify-center text-white font-heading text-lg lg:text-xl font-bold shadow-md group-hover:shadow-lg transition-shadow">
                Y
              </div>
              <div className="hidden sm:block">
                <h1 className="font-heading text-xl lg:text-2xl font-bold text-[var(--color-brand-chocolate)] leading-none">
                  YOYO CAKES
                </h1>
                <p className="text-[10px] lg:text-xs text-[var(--color-brand-muted)] tracking-widest uppercase">
                  Every bite, a little happiness
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                to="/"
                className="text-sm font-medium text-[var(--color-brand-chocolate-light)] hover:text-[var(--color-brand-primary-dark)] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[var(--color-brand-primary-dark)] after:transition-all"
              >
                Home
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-[var(--color-brand-chocolate-light)] hover:text-[var(--color-brand-primary-dark)] transition-colors">
                  Shop <ChevronDown size={14} />
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-[var(--color-brand-primary-light)]/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <Link
                    to="/shop"
                    className="block px-4 py-2.5 text-sm text-[var(--color-brand-chocolate-light)] hover:bg-[var(--color-brand-cream)] hover:text-[var(--color-brand-primary-dark)] transition-colors"
                  >
                    All Products
                  </Link>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.slug}`}
                      className="block px-4 py-2.5 text-sm text-[var(--color-brand-chocolate-light)] hover:bg-[var(--color-brand-cream)] hover:text-[var(--color-brand-primary-dark)] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                to="/about"
                className="text-sm font-medium text-[var(--color-brand-chocolate-light)] hover:text-[var(--color-brand-primary-dark)] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[var(--color-brand-primary-dark)] after:transition-all"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium text-[var(--color-brand-chocolate-light)] hover:text-[var(--color-brand-primary-dark)] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[var(--color-brand-primary-dark)] after:transition-all"
              >
                Contact
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-full hover:bg-[var(--color-brand-cream)] transition-colors"
                aria-label="Search"
              >
                <Search size={20} className="text-[var(--color-brand-chocolate-light)]" />
              </button>
              <Link
                to="/wishlist"
                className="p-2.5 rounded-full hover:bg-[var(--color-brand-cream)] transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} className="text-[var(--color-brand-chocolate-light)]" />
              </Link>
              <Link
                to={user ? '/account' : '/login'}
                className="p-2.5 rounded-full hover:bg-[var(--color-brand-cream)] transition-colors"
                aria-label="Account"
              >
                <User size={20} className="text-[var(--color-brand-chocolate-light)]" />
              </Link>
              <Link
                to="/cart"
                className="p-2.5 rounded-full hover:bg-[var(--color-brand-cream)] transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingCart size={20} className="text-[var(--color-brand-chocolate-light)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--color-brand-primary-dark)] text-white text-[10px] font-bold flex items-center justify-center animate-fade-in">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-[var(--color-brand-primary-light)]/30 shadow-lg animate-slide-up z-40">
            <div className="container-main py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={20} className="text-[var(--color-brand-muted)] flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for cakes, brownies, desserts..."
                  className="flex-1 bg-transparent text-[var(--color-brand-chocolate)] placeholder:text-[var(--color-brand-muted)] focus:outline-none text-base"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-full hover:bg-[var(--color-brand-cream)] transition-colors"
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-[var(--color-brand-primary-light)]/30 shadow-lg z-40 animate-slide-up">
            <div className="py-4 px-6 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-[var(--color-brand-chocolate)] font-medium hover:text-[var(--color-brand-primary-dark)] transition-colors border-b border-[var(--color-brand-cream-dark)]"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-[var(--color-brand-chocolate)] font-medium hover:text-[var(--color-brand-primary-dark)] transition-colors border-b border-[var(--color-brand-cream-dark)]"
              >
                All Products
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 pl-4 text-sm text-[var(--color-brand-chocolate-light)] hover:text-[var(--color-brand-primary-dark)] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                to="/about"
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-[var(--color-brand-chocolate)] font-medium hover:text-[var(--color-brand-primary-dark)] transition-colors border-b border-[var(--color-brand-cream-dark)]"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-[var(--color-brand-chocolate)] font-medium hover:text-[var(--color-brand-primary-dark)] transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
