import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@/data/products';
import { formatPrice } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';



interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

export default function ProductCard({ product, showQuickView = true }: ProductCardProps) {
  const categoryImage = `/images/categories/${product.categorySlug}.jpg`;
  const [imgSrc, setImgSrc] = useState(product.image || categoryImage);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(
      isInWishlist ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`
    );
  };

  const handleImageError = () => {
    if (!hasFailedOnce && imgSrc !== categoryImage) {
      setImgSrc(categoryImage);
      setHasFailedOnce(true);
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block card overflow-hidden border border-[var(--color-brand-primary-light)]/20 shadow-card hover:shadow-card-hover transition-all"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-brand-cream)]">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={handleImageError}
        />

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[var(--color-brand-primary-dark)] hover:text-white transition-colors"
              title="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                isInWishlist
                  ? 'bg-[var(--color-brand-error)] text-white'
                  : 'bg-white hover:bg-[var(--color-brand-error)] hover:text-white'
              }`}
              title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            {showQuickView && (
              <Link
                to={`/product/${product.id}`}
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[var(--color-brand-primary-dark)] hover:text-white transition-colors"
                title="Quick view"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.bestseller && (
            <span className="px-2.5 py-1 bg-[var(--color-brand-primary-dark)] text-white text-[10px] font-semibold rounded-full uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {product.featured && !product.bestseller && (
            <span className="px-2.5 py-1 bg-[var(--color-brand-primary)] text-white text-[10px] font-semibold rounded-full uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist - Top Right */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isInWishlist
              ? 'bg-[var(--color-brand-error)] text-white'
              : 'bg-white/80 text-[var(--color-brand-chocolate-light)] hover:bg-white'
          }`}
        >
          <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-brand-muted)] mb-1">
          {product.category}
        </p>
        <h3 className="font-heading text-base font-semibold text-[var(--color-brand-chocolate)] mb-2 group-hover:text-[var(--color-brand-primary-dark)] transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[var(--color-brand-primary-dark)]">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            className="px-3 py-1.5 bg-[var(--color-brand-primary-dark)] text-white text-xs font-semibold rounded-full hover:bg-[var(--color-brand-chocolate)] transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
