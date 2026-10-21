import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Star, 
  Sparkles, 
  Check, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS, CATEGORIES } from '@/data/products';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc';
type PriceRangeOption = 'all' | 'under-100' | '100-150' | '150-200' | 'over-200';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = (searchParams.get('sort') as SortOption) || 'relevance';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [priceRange, setPriceRange] = useState<PriceRangeOption>('all');
  const [onlyBestsellers, setOnlyBestsellers] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Filter by search
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
    }

    // Filter by category
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

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((p) => {
        const rating = p.bestseller ? 4.9 : 4.8;
        return rating >= minRating;
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => {
          const rA = a.bestseller ? 4.9 : 4.8;
          const rB = b.bestseller ? 4.9 : 4.8;
          return rB - rA;
        });
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
  }, [search, selectedCategory, priceRange, onlyBestsellers, minRating, sortBy]);

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
    setMinRating(0);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search || selectedCategory || priceRange !== 'all' || onlyBestsellers || minRating > 0
  );

  const activeCategory = CATEGORIES.find((c) => c.slug === selectedCategory);

  return (
    <div className="bg-[#EAEDED] min-h-screen font-sans">
      {/* Amazon-Style Breadcrumb & Banner Header */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container-main px-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Link to="/" className="hover:text-[#C7511F]">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-[#C7511F]">Fresh Bakery Menu</Link>
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
                  : 'Artisanal collection of 27 fresh celebration treats baked daily in Chennai.'}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> results
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-6 px-4">
        {/* Top Control Bar (Search, Active Chips, Sort) */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Box */}
            <div className="relative w-full lg:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cakes, chocolate, brownies..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#FF9900]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Toggle on Mobile & Sort Selector */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <SlidersHorizontal size={14} /> Filters {hasActiveFilters && '(Active)'}
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 hidden sm:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 pr-8 text-xs font-bold text-gray-900 outline-none hover:bg-gray-100 cursor-pointer"
                  >
                    <option value="relevance">Featured & Bestsellers</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Avg. Customer Review</option>
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
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
              <span className="text-gray-400 text-[11px] font-semibold">Active filters:</span>

              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-medium text-xs">
                  Category: {activeCategory?.name || selectedCategory}
                  <button onClick={() => handleCategoryChange('')} className="hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              )}

              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-medium text-xs">
                  Price: {priceRange.replace('-', ' ')}
                  <button onClick={() => setPriceRange('all')} className="hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              )}

              {onlyBestsellers && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-medium text-xs">
                  #1 Best Sellers
                  <button onClick={() => setOnlyBestsellers(false)} className="hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              )}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-medium text-xs">
                  {minRating}★ & above
                  <button onClick={() => setMinRating(0)} className="hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline font-bold ml-1 flex items-center gap-1"
              >
                <RotateCcw size={11} /> Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Grid & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Amazon Filter Sidebar (3 cols) */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block lg:col-span-3 space-y-4`}
          >
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-heading font-extrabold text-sm text-[#0F1111] mb-3">
                  Department
                </h3>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      !selectedCategory
                        ? 'font-extrabold text-[#0F1111] bg-amber-50'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-gray-400">({PRODUCTS.length})</span>
                  </button>
                  {CATEGORIES.map((cat) => {
                    const count = PRODUCTS.filter((p) => p.categorySlug === cat.slug).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                          selectedCategory === cat.slug
                            ? 'font-extrabold text-[#0F1111] bg-amber-50'
                            : 'text-gray-600 hover:text-black hover:bg-gray-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-gray-400">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-heading font-extrabold text-sm text-[#0F1111] mb-3">
                  Price
                </h3>
                <div className="space-y-1.5 text-xs text-gray-700">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-100', label: 'Under ₹100' },
                    { id: '100-150', label: '₹100 to ₹150' },
                    { id: '150-200', label: '₹150 to ₹200' },
                    { id: 'over-200', label: 'Over ₹200' },
                  ].map((pOpt) => (
                    <label
                      key={pOpt.id}
                      className="flex items-center gap-2 cursor-pointer hover:text-black select-none"
                    >
                      <input
                        type="radio"
                        name="priceFilter"
                        checked={priceRange === pOpt.id}
                        onChange={() => setPriceRange(pOpt.id as PriceRangeOption)}
                        className="text-[#FF9900] focus:ring-[#FF9900]"
                      />
                      <span className={priceRange === pOpt.id ? 'font-bold text-[#0F1111]' : ''}>
                        {pOpt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Best Seller Checkbox */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-heading font-extrabold text-sm text-[#0F1111] mb-3">
                  Highlights
                </h3>
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyBestsellers}
                    onChange={(e) => setOnlyBestsellers(e.target.checked)}
                    className="rounded text-[#FF9900] focus:ring-[#FF9900]"
                  />
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-500" /> #1 Best Sellers Only
                  </span>
                </label>
              </div>

              {/* Customer Review Rating Filter */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-heading font-extrabold text-sm text-[#0F1111] mb-3">
                  Avg. Customer Review
                </h3>
                <div className="space-y-1.5 text-xs">
                  {[4.8, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === r ? 0 : r)}
                      className={`flex items-center gap-1.5 w-full text-left py-1 px-1.5 rounded hover:bg-gray-50 transition-colors ${
                        minRating === r ? 'bg-amber-50 font-bold' : ''
                      }`}
                    >
                      <div className="flex text-[#FFA41C]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            fill={i < Math.floor(r) ? 'currentColor' : 'none'}
                            strokeWidth={i < Math.floor(r) ? 0 : 1.5}
                          />
                        ))}
                      </div>
                      <span className="text-gray-700">& Up</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reassurance Badge */}
              <div className="pt-4 border-t border-gray-100 bg-amber-50/50 -mx-5 -mb-5 p-4 rounded-b-xl text-[11px] text-gray-600 space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-1">
                  <Check size={14} className="text-[#007600]" /> 100% Fresh Daily Guarantee
                </div>
                <p>Every cake is baked to order on the morning of delivery.</p>
              </div>
            </div>
          </aside>

          {/* Right Product Grid (9 cols) */}
          <main className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-12 text-center">
                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                <h3 className="font-heading text-lg font-bold text-gray-800 mb-1">
                  No cakes matched your criteria
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  Try adjusting your search terms, resetting the price range, or clearing filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
