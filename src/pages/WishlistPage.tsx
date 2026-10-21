import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { PRODUCTS, formatPrice } from '@/data/products';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const wishlistProducts = PRODUCTS.filter((p) => items.includes(p.id));

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} moved to cart`);
  };

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId);
    toast.success(`${productName} removed from wishlist`);
  };

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-10">
      <div className="container-main max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--color-brand-chocolate)]">
              My Wishlist
            </h1>
            <p className="text-sm text-[var(--color-brand-muted)] mt-1">
              Your favorite YOYO CAKES treats saved for later
            </p>
          </div>
          {wishlistProducts.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-error)] transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-elevated p-12 text-center border border-[var(--color-brand-primary-light)]/20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[var(--color-brand-cream)] flex items-center justify-center mx-auto mb-4 text-[var(--color-brand-primary-dark)]">
              <Heart size={32} />
            </div>
            <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-[var(--color-brand-muted)] mb-6">
              Explore our artisanal cakes, brownies, and mini jar cakes, then click the heart icon to save your favorites!
            </p>
            <Link to="/shop" className="btn-primary justify-center">
              Explore Desserts <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-card overflow-hidden border border-[var(--color-brand-primary-light)]/20 flex flex-col justify-between group hover:shadow-card-hover transition-all"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)] px-2.5 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      className="p-1.5 text-gray-400 hover:text-[var(--color-brand-error)] hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <Link to={`/product/${product.id}`} className="block">
                    <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] hover:text-[var(--color-brand-primary-dark)] transition-colors mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-[var(--color-brand-muted)] line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <div className="font-bold text-lg text-[var(--color-brand-primary-dark)]">
                    {formatPrice(product.price)}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary w-full justify-center text-xs py-2.5 flex items-center gap-2"
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
