import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingCart, ArrowRight, Tag } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/data/products';
import { validateCouponInFirestore } from '@/services/firestoreService';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 500 ? 0 : 40; // Free delivery above ₹500
  const discount = couponApplied ? discountAmount : 0;
  const total = subtotal - discount + deliveryFee;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const res = await validateCouponInFirestore(couponCode, subtotal);
    if (res.valid) {
      setCouponApplied(true);
      setDiscountAmount(res.discount);
      toast.success(res.message || 'Coupon applied successfully!');
    } else {
      setCouponApplied(false);
      setDiscountAmount(0);
      toast.error(res.message || 'Invalid coupon code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center">
        <div className="text-center px-6">
          <ShoppingCart size={64} className="mx-auto mb-6 text-[var(--color-brand-primary)]" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-brand-chocolate)] mb-3">
            Your Cart is Empty
          </h2>
          <p className="text-[var(--color-brand-muted)] mb-8 max-w-md mx-auto">
            Looks like you haven't added any goodies yet. Explore our handcrafted collection!
          </p>
          <Link to="/shop" className="btn-primary text-base px-8 py-3.5">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen">
      <div className="container-main py-8 lg:py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-8">
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-xl p-4 md:p-6 shadow-card flex gap-4 md:gap-6 animate-fade-in"
              >
                {/* Product Image Placeholder */}
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[var(--color-brand-primary-light)] to-[var(--color-brand-primary)] flex items-center justify-center">
                  <span className="text-3xl md:text-4xl">
                    {item.product.categorySlug === 'brownies'
                      ? '🍫'
                      : item.product.categorySlug === 'cakes'
                      ? '🎂'
                      : item.product.categorySlug === 'mini-jar-cakes'
                      ? '🧁'
                      : item.product.categorySlug === 'tiramisu-desserts'
                      ? '🍮'
                      : '🍰'}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/product/${item.product.id}`}
                        className="font-heading text-base md:text-lg font-semibold text-[var(--color-brand-chocolate)] hover:text-[var(--color-brand-primary-dark)] transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                        {item.product.category}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        removeItem(item.product.id);
                        toast.success(`${item.product.name} removed from cart`);
                      }}
                      className="p-1.5 rounded-full hover:bg-[var(--color-brand-cream)] transition-colors text-[var(--color-brand-muted)] hover:text-[var(--color-brand-error)]"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-[var(--color-brand-primary-light)]/40 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="px-3 py-1.5 hover:bg-[var(--color-brand-cream)] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 py-1.5 font-semibold text-sm border-x border-[var(--color-brand-primary-light)]/40">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="px-3 py-1.5 hover:bg-[var(--color-brand-cream)] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--color-brand-primary-dark)]">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-[var(--color-brand-muted)]">
                          {formatPrice(item.product.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/shop" className="btn-secondary text-sm px-5 py-2.5">
                Continue Shopping
              </Link>
              <button
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared');
                }}
                className="text-sm px-5 py-2.5 text-[var(--color-brand-error)] hover:bg-red-50 rounded-full transition-colors font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-card sticky top-24">
              <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-6">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-2 block">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]"
                    />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm"
                      disabled={couponApplied}
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponApplied || !couponCode.trim()}
                    className="px-4 py-2.5 bg-[var(--color-brand-primary-dark)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-brand-chocolate)] transition-colors disabled:opacity-50"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                <p className="text-xs text-[var(--color-brand-muted)] mt-1.5">
                  Try: YOYO10 for 10% off
                </p>
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-[var(--color-brand-primary-light)]/20 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-brand-muted)]">
                    Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
                  </span>
                  <span className="font-medium text-[var(--color-brand-chocolate)]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-brand-success)]">Discount (10%)</span>
                    <span className="font-medium text-[var(--color-brand-success)]">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-brand-muted)]">Delivery</span>
                  <span className="font-medium text-[var(--color-brand-chocolate)]">
                    {deliveryFee === 0 ? (
                      <span className="text-[var(--color-brand-success)]">Free</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>

                {deliveryFee > 0 && (
                  <p className="text-xs text-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)] rounded-lg p-2.5 text-center">
                    Add {formatPrice(500 - subtotal)} more for free delivery!
                  </p>
                )}

                <div className="flex justify-between text-base font-bold pt-3 border-t border-[var(--color-brand-primary-light)]/20">
                  <span className="text-[var(--color-brand-chocolate)]">Total</span>
                  <span className="text-[var(--color-brand-primary-dark)] text-xl">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full mt-6 py-4 text-base justify-center"
              >
                Proceed to Checkout
              </Link>

              <p className="text-xs text-[var(--color-brand-muted)] text-center mt-3">
                Taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
