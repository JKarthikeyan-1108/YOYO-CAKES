import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { PRODUCTS, formatPrice } from '@/data/products';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const wishlistProducts = PRODUCTS.filter((p) => items.includes(p.id));

  const handleAddToCart = (product: (typeof PRODUCTS)[0]) => {
    addItem(product);
    toast.success(`${product.name} moved to cart`);
  };

  const handleAddAllToCart = () => {
    wishlistProducts.forEach((product) => {
      addItem(product);
    });
    toast.success(`All ${wishlistProducts.length} items moved to cart!`);
  };

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId);
    toast.success(`${productName} removed from wishlist`);
  };

  return (
    <div className="bg-[#EAEDED] min-h-screen py-8 font-sans">
      <div className="container-main max-w-6xl px-4">
        {/* Amazon-Style Wishlist Header */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart size={22} className="text-red-500 fill-red-500" />
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F1111]">
                  Your Wishlist & Saved Cakes
                </h1>
              </div>
              <p className="text-xs text-gray-500">
                Your private collection of dream cakes, party brownies, and celebration desserts.
              </p>
            </div>

            {wishlistProducts.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddAllToCart}
                  className="px-5 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs transition-all flex items-center gap-2"
                >
                  <ShoppingCart size={14} /> Move All to Cart
                </button>
                <button
                  onClick={clearWishlist}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors font-semibold"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Heart size={32} />
            </div>
            <h2 className="font-heading text-xl font-extrabold text-[#0F1111] mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-gray-600 mb-6 max-w-sm mx-auto">
              Explore our artisanal 5-in-1 Torte cakes, molten brownies, and mini jar cakes, then click the heart icon on any cake to save it!
            </p>
            <Link
              to="/shop"
              className="px-6 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs inline-flex items-center gap-2"
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
                  className="bg-white rounded-2xl shadow-xs border border-gray-200 hover:border-gray-300 hover:shadow-sm overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div>
                    {/* Image with Tag and Remove */}
                    <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
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
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-red-600 flex items-center justify-center transition-all shadow-xs"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={15} />
                      </button>

                      {discountPercent > 0 && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#CC0C39] text-white text-[10px] font-bold rounded-sm shadow-xs">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5">
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        {product.category}
                      </div>

                      <Link to={`/product/${product.id}`} className="block">
                        <h3 className="font-heading text-base font-bold text-[#0F1111] hover:text-[#C7511F] transition-colors line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-[#FFA41C]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-800">4.9</span>
                        <span className="text-[11px] text-gray-500">(184)</span>
                      </div>

                      {/* Price Tag */}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-extrabold text-[#0F1111]">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(mrp)}
                        </span>
                      </div>

                      {/* Stock Status */}
                      <div className="text-xs text-[#007600] font-semibold flex items-center gap-1 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#007600] inline-block animate-pulse" />
                        In Stock – Freshly Baked Daily
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Clock size={11} className="text-amber-600" /> FREE Delivery on orders over ₹500
                      </div>
                    </div>
                  </div>

                  {/* Amazon Gold Add to Cart Button */}
                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs transition-all flex items-center justify-center gap-2"
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
