import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft, Star, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductById, getProductsByCategory, formatPrice } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'reviews'>('description');
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(id || ''));

  const product = id ? getProductById(id) : undefined;
  const categoryImage = product ? `/images/categories/${product.categorySlug}.jpg` : '';
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)] mb-3">
            Product Not Found
          </h2>
          <p className="text-[var(--color-brand-muted)] mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/shop" className="btn-primary">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = getProductsByCategory(product.categorySlug)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const displayImage = imgSrc || product.image || categoryImage;

  const handleImageError = () => {
    if (!hasFailedOnce && displayImage !== categoryImage) {
      setImgSrc(categoryImage);
      setHasFailedOnce(true);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} added to cart`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} — YOYO CAKES`,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[var(--color-brand-primary-light)]/20">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-brand-muted)]">
            <Link to="/" className="hover:text-[var(--color-brand-primary-dark)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[var(--color-brand-primary-dark)] transition-colors">
              Shop
            </Link>
            <span>/</span>
            <Link
              to={`/shop?category=${product.categorySlug}`}
              className="hover:text-[var(--color-brand-primary-dark)] transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-[var(--color-brand-chocolate)] font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-main py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-[var(--color-brand-cream)] group">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={handleImageError}
              />
            </div>

            {/* Badges */}
            {product.bestseller && (
              <span className="absolute top-4 left-4 px-4 py-1.5 bg-[var(--color-brand-primary-dark)] text-white text-sm font-semibold rounded-full shadow-md">
                Bestseller
              </span>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-brand-primary-dark)] font-semibold">
                {product.category}
              </p>
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-[var(--color-brand-primary-dark)]">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-[var(--color-brand-success)] font-medium bg-green-50 px-3 py-1 rounded-full">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <p className="text-[var(--color-brand-chocolate-light)] leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-3 block">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[var(--color-brand-primary-light)]/40 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-[var(--color-brand-cream)] transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-semibold text-center min-w-[3rem] border-x border-[var(--color-brand-primary-light)]/40">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-[var(--color-brand-cream)] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-[var(--color-brand-muted)]">
                  {product.stockQuantity} available
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 min-w-[200px] py-4 text-base"
                disabled={!product.inStock}
              >
                <ShoppingCart size={20} /> Add to Cart — {formatPrice(product.price * quantity)}
              </button>
              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(
                    isInWishlist
                      ? `${product.name} removed from wishlist`
                      : `${product.name} added to wishlist`
                  );
                }}
                className={`p-4 rounded-full border-2 transition-colors ${
                  isInWishlist
                    ? 'border-[var(--color-brand-error)] bg-[var(--color-brand-error)] text-white'
                    : 'border-[var(--color-brand-primary-light)] hover:border-[var(--color-brand-error)] hover:text-[var(--color-brand-error)]'
                }`}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-4 rounded-full border-2 border-[var(--color-brand-primary-light)] hover:border-[var(--color-brand-primary-dark)] hover:text-[var(--color-brand-primary-dark)] transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-t border-[var(--color-brand-primary-light)]/20 pt-6">
              <div className="flex gap-6 mb-6 border-b border-[var(--color-brand-primary-light)]/20">
                {(['description', 'ingredients', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-[1px] ${
                      activeTab === tab
                        ? 'border-[var(--color-brand-primary-dark)] text-[var(--color-brand-primary-dark)]'
                        : 'border-transparent text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'description' && (
                <p className="text-sm text-[var(--color-brand-chocolate-light)] leading-relaxed">
                  {product.description}
                </p>
              )}

              {activeTab === 'ingredients' && (
                <div className="text-sm text-[var(--color-brand-chocolate-light)] space-y-3">
                  <div>
                    <p className="font-semibold text-[var(--color-brand-chocolate)] mb-1">Ingredients</p>
                    <p className="text-[var(--color-brand-muted)] italic">{product.ingredients}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-brand-chocolate)] mb-1">Allergen Information</p>
                    <p className="text-[var(--color-brand-muted)] italic">{product.allergens}</p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-8">
                  <Star size={24} className="mx-auto mb-2 text-[var(--color-brand-primary)]" />
                  <p className="text-sm text-[var(--color-brand-muted)]">
                    No reviews yet. Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h2 className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)] mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
