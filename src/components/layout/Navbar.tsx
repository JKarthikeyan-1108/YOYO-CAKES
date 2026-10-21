import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  MapPin, 
  ChevronDown, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { CATEGORIES } from '@/data/products';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [currentPincode, setCurrentPincode] = useState('600001');

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user, logout } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const catParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}${catParam}`);
    }
  };

  return (
    <>
      {/* Top Announcement Bar (Amazon Prime / Delivery Promo style) */}
      <div className="bg-[var(--color-brand-chocolate)] text-white text-xs font-semibold py-1.5 px-4 tracking-wide">
        <div className="container-main flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFD814] text-[#0F1111] text-[10px] font-black uppercase px-2 py-0.5 rounded-sm tracking-wider">
              FREE DELIVERY
            </span>
            <span>On all handcrafted orders above ₹500 across Chennai • Fresh same-day bakes</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-white/80">
            <a href="tel:+918428855444" className="hover:text-white flex items-center gap-1">
              <PhoneCall size={12} /> Helpline: +91 84288 55444
            </a>
            <span>|</span>
            <Link to="/contact" className="hover:text-white">Store Locator</Link>
          </div>
        </div>
      </div>

      {/* Main Amazon-Style Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
        <div className="container-main py-2.5 sm:py-3">
          <div className="flex items-center gap-3 sm:gap-6 justify-between">
            {/* Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label="Toggle Navigation"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--color-brand-primary-dark)] text-white flex items-center justify-center font-heading text-lg sm:text-xl font-bold shadow-xs transition-transform group-hover:scale-105">
                  Y
                </div>
                <div>
                  <span className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[var(--color-brand-chocolate)] leading-none block">
                    YOYO CAKES
                  </span>
                  <span className="text-[10px] text-[var(--color-brand-muted)] font-medium tracking-wider hidden sm:block">
                    Every bite, a little happiness
                  </span>
                </div>
              </Link>
            </div>

            {/* Amazon-Style "Deliver to" Location Selector */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="hidden xl:flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 text-left transition-colors text-xs text-gray-700"
            >
              <MapPin size={18} className="text-[var(--color-brand-primary-dark)] flex-shrink-0" />
              <div>
                <span className="text-[10px] text-gray-500 block leading-tight">Deliver to</span>
                <span className="font-bold text-gray-900 leading-tight">Chennai {currentPincode}</span>
              </div>
            </button>

            {/* Central Amazon Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-1 sm:mx-2">
              <div className="flex rounded-xl overflow-hidden border border-gray-300 focus-within:border-[var(--color-brand-primary-dark)] focus-within:ring-2 focus-within:ring-[#FFD814]/40 shadow-xs transition-all bg-white">
                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="hidden md:block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2.5 border-r border-gray-300 outline-none hover:bg-gray-200 cursor-pointer"
                >
                  <option value="all">All Cakes</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Search Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Matilda, Dream Cake, Tiramisu, Brownies..."
                  className="w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm outline-none font-medium text-gray-900 placeholder:text-gray-400"
                />

                {/* Amazon Gold Search Button */}
                <button
                  type="submit"
                  aria-label="Search"
                  className="bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] px-4 sm:px-5 flex items-center justify-center text-gray-900 transition-colors border-l border-gray-200"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Right Action Icons (Account, Returns & Orders, Wishlist, Cart) */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Returns & Orders */}
              <Link
                to={user ? '/account' : '/login'}
                className="hidden lg:flex flex-col p-1.5 rounded-lg hover:bg-gray-100 text-left transition-colors"
              >
                <span className="text-[10px] text-gray-500 font-medium">Returns</span>
                <span className="text-xs font-bold text-gray-900">& Orders</span>
              </Link>

              {/* Account Dropdown */}
              <div className="relative group">
                <Link
                  to={user ? '/account' : '/login'}
                  className="flex items-center gap-1 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <User size={20} className="text-gray-700" />
                  <div className="hidden sm:block text-left">
                    <span className="text-[10px] text-gray-500 font-medium block leading-tight">
                      {user ? `Hello, ${user.displayName?.split(' ')[0] || 'Customer'}` : 'Hello, Sign in'}
                    </span>
                    <span className="text-xs font-bold text-gray-900 leading-tight flex items-center">
                      Account <ChevronDown size={12} className="ml-0.5 text-gray-500" />
                    </span>
                  </div>
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-elevated border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 p-3 z-50">
                  {user ? (
                    <div>
                      <div className="pb-2 mb-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900">{user.displayName || 'Customer'}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email || user.phoneNumber}</p>
                      </div>
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
                        className="w-full block py-2 rounded-lg bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-xs font-bold shadow-xs mb-2 border border-[#FCD200]"
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

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors hidden sm:flex items-center relative"
                aria-label="Wishlist"
              >
                <Heart size={20} className={wishlistCount > 0 ? "text-red-500 fill-red-500" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Amazon-Style Cart Badge */}
              <Link
                to="/cart"
                className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-900 transition-colors relative"
                aria-label="Cart"
              >
                <div className="relative">
                  <ShoppingCart size={24} className="text-gray-900" />
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FFD814] text-[#0F1111] text-[10px] font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center border border-white shadow-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                </div>
                <span className="hidden md:inline text-xs font-bold">Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Amazon-Style Sub-Navigation Bar */}
        <div className="bg-[#232F3E] text-white text-xs font-medium overflow-x-auto scrollbar-none">
          <div className="container-main flex items-center gap-4 sm:gap-6 py-2 whitespace-nowrap">
            <Link to="/shop" className="flex items-center gap-1.5 hover:text-[#FFD814] font-bold">
              <Menu size={16} /> All Products
            </Link>
            <Link to="/shop?sort=bestseller" className="hover:text-[#FFD814] flex items-center gap-1">
              <Sparkles size={13} className="text-[#FFD814]" /> Best Sellers
            </Link>
            <Link to="/shop?category=cakes" className="hover:text-[#FFD814]">
              Signature Cakes
            </Link>
            <Link to="/shop?category=brownies" className="hover:text-[#FFD814]">
              Fudgy Brownies
            </Link>
            <Link to="/shop?category=tiramisu" className="hover:text-[#FFD814]">
              Italian Tiramisu
            </Link>
            <Link to="/shop?category=jar-cakes" className="hover:text-[#FFD814]">
              Jar Cakes
            </Link>
            <Link to="/shop?category=tea-cakes" className="hover:text-[#FFD814]">
              Tea Cakes
            </Link>
            <Link to="/about" className="hover:text-[#FFD814]">
              Our Bakery Story
            </Link>
            <Link to="/contact" className="hover:text-[#FFD814]">
              Bulk & Corporate Orders
            </Link>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 p-4 space-y-3 animate-slide-up shadow-lg">
            <div className="p-3 bg-gray-50 rounded-xl mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">
                {user ? `Signed in as ${user.displayName || user.email}` : 'Welcome, Guest'}
              </span>
              <Link
                to={user ? '/account' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="text-xs font-bold text-[var(--color-brand-primary-dark)] hover:underline"
              >
                {user ? 'View Account' : 'Sign In'}
              </Link>
            </div>

            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-bold text-gray-900 border-b border-gray-100"
            >
              Browse All Cakes & Desserts
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block py-1.5 pl-3 text-xs font-semibold text-gray-600 hover:text-[var(--color-brand-primary-dark)]"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-700 border-t border-gray-100 mt-2"
            >
              Saved Wishlist
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-700"
            >
              Customer Support & WhatsApp
            </Link>
          </div>
        )}
      </header>

      {/* Pincode Selector Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-elevated border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-base text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-[var(--color-brand-primary-dark)]" />
                Choose your location
              </h3>
              <button onClick={() => setLocationModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Select your delivery pincode to check local bakery delivery speed and slot availability.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                maxLength={6}
                value={currentPincode}
                onChange={(e) => setCurrentPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono outline-none focus:border-[var(--color-brand-primary-dark)]"
              />
              <button
                onClick={() => setLocationModalOpen(false)}
                className="px-4 py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-xs font-bold rounded-lg"
              >
                Apply
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              Popular delivery zones: Chennai Central (600001), Anna Nagar (600040), T. Nagar (600017), Velachery (600042).
            </p>
          </div>
        </div>
      )}
    </>
  );
}
