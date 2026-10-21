import { Link } from 'react-router-dom';
import { Cake, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="bg-[var(--color-brand-cream)] min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md bg-white p-8 sm:p-12 rounded-3xl shadow-elevated border border-[var(--color-brand-primary-light)]/20">
        <div className="w-20 h-20 rounded-full bg-[var(--color-brand-cream)] text-[var(--color-brand-primary-dark)] flex items-center justify-center mx-auto mb-6">
          <Cake size={40} />
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-brand-primary-dark)] block mb-1">
          Error 404
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-[var(--color-brand-muted)] mb-8 leading-relaxed">
          Looks like this sweet treat has crumbled or moved to a different plate! Let's get you back to our bakery shop.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-secondary text-sm flex items-center justify-center gap-2">
            <Home size={16} /> Home
          </Link>
          <Link to="/shop" className="btn-primary text-sm flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Explore All Cakes
          </Link>
        </div>
      </div>
    </div>
  );
}
