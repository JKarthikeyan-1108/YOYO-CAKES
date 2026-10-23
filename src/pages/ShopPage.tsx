import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Sparkles, 
  Check, 
  ChevronRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES } from '@/data/products';
import { useProductStore } from '@/stores/productStore';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';
type PriceRangeOption = 'all' | 'under-100' | '100-150' | '150-200' | 'over-200';

export default function ShopPage() {
  const { products, loading, error, fetchCatalog } = useProductStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = (searchParams.get('sort') as SortOption) || 'relevance';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [priceRange, setPriceRange] = useState<PriceRangeOption>('all');
  const [onlyBestsellers, setOnlyBestsellers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query (product name, description, category)
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
    }

    // Filter by category slug
    if (selectedCategory) {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    // Filter by price range
    if (priceRange === 'under-100') {
      result = result.filter((p) => p.price < 100);
    } else if (priceRange === '100-150') {
      result = result.filter((p) => p.price >= 100 && p.price <= 150);
    } else if (priceRange === '150-200') {
      result = result.filter((p) => p.price > 150 && p.price <= 200);
    } else if (priceRange === 'over-200') {
      result = result.filter((p) => p.price > 200);
    }

    // Filter by bestsellers
    if (onlyBestsellers) {
      result = result.filter((p) => p.bestseller);
    }

    // Sort options
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.bestseller && !b.bestseller) return -1;
          if (!a.bestseller && b.bestseller) return 1;
          return 0;
        });
    }

    return result;
  }, [products, search, selectedCategory, priceRange, onlyBestsellers, sortBy]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('relevance');
    setPriceRange('all');
    setOnlyBestsellers(false);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search || selectedCategory || priceRange !== 'all' || onlyBestsellers
  );

  const activeCategory = CATEGORIES.find((c) => c.slug === selectedCategory);

  const renderFilterSidebar = () => (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-heading font-extrabold text-sm text-[#0F1111] mb-3">
          Category
        </h3>
        <div className="space-y-1.5 text-xs">
          <button
            onClick={() => handleCategoryChange('')}
            className={`flex items-center justify-between w-full text-left py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors ${
              !selectedCategory ? 'bg-amber-50 font-bold text-[var(--color-brand-primary-dark)]' : 'text-gray-700'
            }`}
          >
            <span>All Categories</span>
            <span className="text-gray-400 font-mono text-[11px]">{products.length}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.categorySlug === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`flex items-center justify-between w-full text-left py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-amber-50 font-bold text-[var(--color-brand-primary-dark)]' : 'text-gray-700'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-gray-400 font-mono text-[11px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="font-heading font-extrabold text-sm text-[#0F1111] mb-3">
          Price Range
        </h3>
        <div className="space-y-2 text-xs text-gray-700">
          {[
            { id: 'all', label: 'All Prices' },
            { id: 'under-100', label: 'Under ₹100' },
            { id: '100-150', label: '₹100 to ₹150' },
            { id: '150-200', label: '₹150 to ₹200' },
            { id: 'over-200', label: 'Above ₹200' },
          ].map((pOpt) => (
            <label
              key={pOpt.id}
              className="flex items-center gap-2 cursor-pointer select-none hover:text-[#0F1111]"
            >
              <input
                type="radio"
                name="priceRange"
                checked={priceRange === pOpt.id}
                onChange={() => setPriceRange(pOpt.id as PriceRangeOption)}
                className="text-[var(--color-brand-primary-dark)] focus:ring-[var(--color-brand-primary)]"
              />
              <span className={priceRange === pOpt.id ? 'font-bold text-[#0F1111]' : ''}>
                {pOpt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Highlights Checkbox */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="font-heading font-extrabold text-sm text-[#0F1111] mb-3">
          Highlights
        </h3>
        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyBestsellers}
            onChange={(e) => setOnlyBestsellers(e.target.checked)}
            className="rounded text-[var(--color-brand-primary-dark)] focus:ring-[var(--color-brand-primary)]"
          />
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" /> Bestsellers Only
          </span>
        </label>
      </div>

      {/* Fresh Kitchen Guarantee */}
      <div className="pt-4 border-t border-gray-100 bg-amber-50/50 -mx-5 -mb-5 p-4 rounded-b-xl text-[11px] text-gray-600 space-y-1">
        <div className="font-bold text-gray-900 flex items-center gap-1">
          <Check size={14} className="text-[#007600]" /> 100% Fresh Daily Guarantee
        </div>
        <p>Every cake is handcrafted in small batches for your celebration.</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#EAEDED] min-h-screen font-sans">
      {/* Breadcrumb & Header Banner */}
      <div className="bg-white border-b border-gray-200 py-3.5 sm:py-4">
        <div className="container-main px-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Link to="/" className="hover:text-[var(--color-brand-primary-dark)]">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-[var(--color-brand-primary-dark)]">Fresh Bakery Menu</Link>
            {activeCategory && (
              <>
                <ChevronRight size={12} />
                <span className="font-bold text-gray-900">{activeCategory.name}</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F1111]">
                {activeCategory ? activeCategory.name : 'All Handcrafted Cakes & Desserts'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeCategory
                  ? activeCategory.description
                  : 'Artisanal collection of 27 fresh celebration treats baked daily in our patisserie kitchens.'}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> results
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category Filter Shortcut Pills Strip (Mobile & Desktop) */}
      <div className="bg-[#FFF8F0] border-b border-[#E8DFD5] py-2.5">
        <div className="container-main px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                !selectedCategory
                  ? 'bg-[var(--color-brand-primary-dark)] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              All ({products.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = products.filter((p) => p.categorySlug === cat.slug).length;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-[var(--color-brand-primary-dark)] text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container-main py-5 sm:py-6 px-4">
        {/* Top Control Bar (Search, Active Chips, Sort) */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-3.5 sm:p-4 mb-5 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center justify-between">
            {/* Search Box */}
            <div className="relative w-full lg:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cakes, brownies, tiramisu..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[var(--color-brand-primary-dark)]"
                aria-label="Search products by name"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Clear search input"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Toggle on Mobile & Sort Selector */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <SlidersHorizontal size={14} /> Filters {hasActiveFilters && <span className="badge badge-warning badge-xs">Active</span>}
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 hidden sm:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 pr-8 text-xs font-bold text-gray-900 outline-none hover:bg-gray-100 cursor-pointer"
                    aria-label="Sort products"
                  >
                    <option value="relevance">Featured & Bestsellers</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Alphabetical (A to Z)</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Pills Strip */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-gray-100 text-xs">
              <span className="text-gray-400 text-[11px] font-semibold">Active filters:</span>

              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-medium text-xs">
                  Category: {activeCategory?.name || selectedCategory}
                  <button onClick={() => handleCategoryChange('')} className="hover:text-red-600" aria-label="Clear category filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-medium text-xs">
                  Search: "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-red-600" aria-label="Clear search filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-medium text-xs">
                  Price: {priceRange.replace('-', ' ')}
                  <button onClick={() => setPriceRange('all')} className="hover:text-red-600" aria-label="Clear price filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {onlyBestsellers && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-medium text-xs">
                  Bestsellers Only
                  <button onClick={() => setOnlyBestsellers(false)} className="hover:text-red-600" aria-label="Clear bestsellers filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs text-[var(--color-brand-primary-dark)] hover:text-[var(--color-brand-chocolate)] hover:underline font-bold ml-1 flex items-center gap-1"
              >
                <RotateCcw size={11} /> Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Grid & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Filter Sidebar for Desktop (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            {renderFilterSidebar()}
          </aside>

          {/* Mobile Filter Modal */}
          {showFilters && (
            <div className="modal modal-open lg:hidden" role="dialog" aria-modal="true" aria-label="Filter products">
              <div className="modal-box max-w-md p-5 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <h3 className="font-heading font-extrabold text-base text-[#0F1111] flex items-center gap-2">
                    <SlidersHorizontal size={16} /> Filters & Sorting
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="btn btn-sm btn-circle btn-ghost"
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>

                {renderFilterSidebar()}

                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={clearAllFilters}
                    className="btn btn-outline btn-sm flex-1 text-xs"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="btn btn-primary btn-sm flex-1 text-xs font-bold"
                  >
                    Show {filteredProducts.length} Results
                  </button>
                </div>
              </div>
              <div className="modal-backdrop bg-black/50" onClick={() => setShowFilters(false)} />
            </div>
          )}

          {/* Right Product Grid (9 cols) */}
          <main className="lg:col-span-9">
            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 animate-pulse" aria-label="Loading products">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3">
                    <div className="aspect-square bg-gray-200 rounded-xl" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-9 bg-gray-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : error && products.length === 0 ? (
              /* Error State */
              <div className="bg-white rounded-2xl shadow-xs border border-red-200 p-8 sm:p-12 text-center">
                <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-1">
                  Unable to load product catalog
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                  {error}
                </p>
                <button
                  onClick={() => fetchCatalog()}
                  className="px-6 py-2.5 bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white font-bold text-xs rounded-full shadow-xs transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-8 sm:p-12 text-center">
                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                <h3 className="font-heading text-lg font-bold text-gray-800 mb-1">
                  No treats matched your search criteria
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  Try adjusting your search terms, selecting another category, or resetting all filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white font-bold text-xs rounded-full shadow-xs transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Populated Product Grid */
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
