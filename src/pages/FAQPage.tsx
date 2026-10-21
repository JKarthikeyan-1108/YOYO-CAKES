import { useState } from 'react';
import { HelpCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Orders & Fulfillment',
    q: 'How does delivery work and what are the delivery charges?',
    a: 'We offer local city delivery. Orders above ₹500 enjoy complimentary FREE delivery! For orders under ₹500, a nominal delivery fee of ₹40 applies.',
  },
  {
    category: 'Orders & Fulfillment',
    q: 'Can I pick up my order from the store/kitchen?',
    a: 'Yes! You can choose "Store Pickup" at checkout with zero delivery charges. Orders are prepared and packed fresh, ready for collection within 2 hours of payment confirmation.',
  },
  {
    category: 'Dessert Care & Shelf Life',
    q: 'How should I store YOYO CAKES desserts?',
    a: 'Cakes and Tiramisu should be kept refrigerated at 2°C – 5°C and enjoyed within 2 to 3 days. Brownies and tea cakes can be kept at room temperature in an airtight container for up to 3 days or refrigerated for up to a week. For extra indulgence, warm brownies in the microwave for 15 seconds!',
  },
  {
    category: 'Dessert Care & Shelf Life',
    q: 'What is special about the Mini Jar Cakes?',
    a: 'Our Mini Jar Cakes (Black Forest, Black Current, Butterscotch, Strawberry, Mango at ₹50 each) are sealed in individual glass jars, making them perfect single-serve treats, party gifts, or travel-friendly sweets!',
  },
  {
    category: 'Payments',
    q: 'Which payment methods do you accept?',
    a: 'We accept all major Indian payment options via our secure Razorpay gateway: UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, MasterCard, RuPay), and Net Banking across all top Indian banks.',
  },
  {
    category: 'Ingredients & Allergens',
    q: 'Are your products vegetarian / eggless?',
    a: 'Ingredients and dietary classifications are clearly displayed on product pages. Missing or specific custom dietary options can be configured by the bakery. Please contact us directly if you have severe allergies (nuts, gluten, dairy).',
  },
  {
    category: 'Cancellations & Refunds',
    q: 'Can I cancel or modify my order after placing it?',
    a: 'Because our desserts are baked fresh upon order confirmation, cancellations can only be accepted if requested before baking commences. Please call our hotline immediately (+91 84288 55444 / +91 63796 03744) for urgent order modifications.',
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(FAQS.map((f) => f.category)))];

  const filteredFaqs =
    selectedCategory === 'All' ? FAQS : FAQS.filter((f) => f.category === selectedCategory);

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-12 lg:py-20">
      <div className="container-main max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-brand-primary-dark)] mb-3 block">
            Got Questions?
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[var(--color-brand-chocolate)] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-brand-muted)] max-w-lg mx-auto">
            Everything you need to know about our handcrafted baked treats, shipping, and care guidelines.
          </p>
        </div>

        {/* Category Filter using DaisyUI tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto">
          <div className="tabs tabs-box bg-white p-1 rounded-2xl shadow-xs border border-gray-200">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`tab text-xs font-bold rounded-xl transition-all ${
                  selectedCategory === cat
                    ? 'tab-active bg-[var(--color-brand-chocolate)] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion using DaisyUI collapse-plus */}
        <div className="space-y-3 mb-12">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="collapse collapse-plus bg-white border border-[var(--color-brand-primary-light)]/30 rounded-2xl shadow-xs hover:border-[var(--color-brand-primary-dark)]/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={() => setOpenIdx(isOpen ? null : idx)}
                  aria-label={faq.q}
                />
                <div className="collapse-title font-heading font-bold text-base sm:text-lg text-[var(--color-brand-chocolate)] pr-12">
                  {faq.q}
                </div>
                <div className="collapse-content text-sm text-[var(--color-brand-muted)] leading-relaxed border-t border-gray-100 pt-3">
                  <p>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="bg-white rounded-2xl shadow-elevated p-8 text-center border border-[var(--color-brand-primary-light)]/20">
          <HelpCircle size={40} className="mx-auto text-[var(--color-brand-primary-dark)] mb-3" />
          <h3 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-2">
            Still Have Questions?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] max-w-md mx-auto mb-6">
            We are always here to help you choose the best dessert box or assist with your order.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="btn-primary text-xs px-6 py-2.5">
              Contact Us Online
            </Link>
            <a
              href="tel:+918428855444"
              className="btn-secondary text-xs px-6 py-2.5 flex items-center justify-center gap-2"
            >
              <Phone size={14} /> Call +91 84288 55444
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
