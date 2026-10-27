import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import { PRODUCTS, formatPrice } from '@/data/products';
import { triggerHaptic } from '@/services/mobileService';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const catalogProducts = useProductStore((s) => s.products);

  const allAvailable = catalogProducts.length > 0 ? catalogProducts : PRODUCTS;
  const wishlistProducts = allAvailable.filter((p) => items.includes(p.id));

  const handleAddToCart = (product: (typeof allAvailable)[0]) => {
    triggerHaptic('success');
    addItem(product);
    toast.success(`${product.name} moved to cart`);
  };

  const handleAddAllToCart = () => {
    triggerHaptic('success');
    wishlistProducts.forEach((product) => {
      addItem(product);
    });
    toast.success(`All ${wishlistProducts.length} items moved to cart!`);
  };

  const handleRemove = (productId: string, productName: string) => {
    triggerHaptic('light');
    removeItem(productId);
    toast.success(`${productName} removed from wishlist`);
  };

  const handleClearWishlist = () => {
    triggerHaptic('warning');
    clearWishlist();
  };

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-6 sm:py-8 font-sans pb-28 lg:pb-12 transition-colors">
      <div className="container-main max-w-6xl px-4">
        {/* Wishlist Header Card */}
        <div className="bg-[var(--color-brand-surface)] rounded-2xl shadow-xs border border-[var(--color-brand-border)] p-5 sm:p-7 mb-6 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart size={22} className="text-red-500 fill-red-500" />
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)]">
                  Your Wishlist & Saved Cakes
                </h1>
              </div>
              <p className="text-xs text-[var(--color-brand-muted)]">
                Your private collection of dream cakes, party brownies, and celebration desserts.
              </p>
            </div>

            {wishlistProducts.length > 0 && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleAddAllToCart}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white font-bold text-xs rounded-full shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={14} /> Move All to Cart
                </button>
                <button
                  onClick={handleClearWishlist}
                  className="text-xs text-[var(--color-brand-muted)] hover:text-red-600 transition-colors font-semibold px-2 py-1"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-[var(--color-brand-surface)] rounded-2xl shadow-xs border border-[var(--color-brand-border)] p-10 sm:p-12 text-center max-w-lg mx-auto transition-colors">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Heart size={32} />
            </div>
            <h2 className="font-heading text-xl font-extrabold text-[var(--color-brand-chocolate)] mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-[var(--color-brand-muted)] mb-6 max-w-sm mx-auto leading-relaxed">
              Explore our artisanal 5-in-1 Torte cakes, molten brownies, and mini jar cakes, then click the heart icon on any cake to save it!
            </p>
            <Link
              to="/shop"
              className="px-6 py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white font-bold text-xs rounded-full shadow-xs inline-flex items-center gap-2 active:scale-95 transition-all"
            >
              Explore Cakes & Desserts <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wishlistProducts.map((product) => {
              const mrp = Math.round((product.price * 1.18) / 10) * 10;
              const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

              return (
                <div
                  key={product.id}
                  className="bg-[var(--color-brand-surface)] rounded-2xl shadow-xs border border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)]/50 hover:shadow-md overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div>
                    {/* Image with Tag and Remove */}
                    <div className="relative aspect-4/3 bg-[var(--color-brand-cream)] overflow-hidden">
                      <img
                        src={product.image || `/images/categories/${product.categorySlug}.jpg`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `/images/categories/${product.categorySlug}.jpg`;
                        }}
                      />
                      <button
                        onClick={() => handleRemove(product.id, product.name)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[var(--color-brand-surface)]/90 hover:bg-[var(--color-brand-surface)] text-[var(--color-brand-muted)] hover:text-red-500 flex items-center justify-center transition-all shadow-xs"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={15} />
                      </button>

                      {discountPercent > 0 && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-sm shadow-xs">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5">
                      <div className="text-[11px] font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-1">
                        {product.category}
                      </div>

                      <Link to={`/product/${product.id}`} className="block">
                        <h3 className="font-heading text-base font-bold text-[var(--color-brand-chocolate)] hover:text-[var(--color-brand-primary)] transition-colors line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price Tag */}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-extrabold text-[var(--color-brand-chocolate)]">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      {/* Stock Status */}
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        In Stock – Freshly Baked Daily
                      </div>
                      <div className="text-[11px] text-[var(--color-brand-muted)] flex items-center gap-1">
                        <Clock size={11} className="text-[var(--color-brand-muted)]" /> Delivery confirmed at checkout
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white font-bold text-xs rounded-full shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
