import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS, CATEGORIES } from '@/data/products';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
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

    // Sort
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
        // Featured first, then bestsellers
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.bestseller && !b.bestseller) return -1;
          if (!a.bestseller && b.bestseller) return 1;
          return 0;
        });
    }

    return result;
  }, [search, selectedCategory, sortBy]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('relevance');
    setSearchParams({});
  };

  const activeCategory = CATEGORIES.find((c) => c.slug === selectedCategory);

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen">
      {/* Header */}
      <div className="bg-[var(--color-brand-chocolate)] py-12 lg:py-16">
        <div className="container-main text-center">
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            {activeCategory ? activeCategory.name : 'All Products'}
          </h1>
          <p className="text-white/85 max-w-md mx-auto text-base">
            {activeCategory
              ? activeCategory.description
              : 'Discover our complete collection of 27 handcrafted cakes, brownies, and desserts'}
          </p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[var(--color-brand-primary-light)]/30 focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--color-brand-cream)] rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none w-full lg:w-48 px-4 py-3 pr-10 rounded-xl bg-white border border-[var(--color-brand-primary-light)]/30 focus:border-[var(--color-brand-primary)] outline-none text-sm cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] pointer-events-none"
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-[var(--color-brand-primary-light)]/30 text-sm font-medium"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block w-full lg:w-56 flex-shrink-0`}
          >
            <div className="bg-white rounded-xl p-5 shadow-card sticky top-24">
              <h3 className="font-heading text-lg font-semibold text-[var(--color-brand-chocolate)] mb-4">
                Categories
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-[var(--color-brand-primary-dark)] text-white font-medium'
                      : 'text-[var(--color-brand-chocolate-light)] hover:bg-[var(--color-brand-cream)]'
                  }`}
                >
                  All Products ({PRODUCTS.length})
                </button>
                {CATEGORIES.map((cat) => {
                  const count = PRODUCTS.filter((p) => p.categorySlug === cat.slug).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-[var(--color-brand-primary-dark)] text-white font-medium'
                          : 'text-[var(--color-brand-chocolate-light)] hover:bg-[var(--color-brand-cream)]'
                      }`}
                    >
                      {cat.name} ({count})
                    </button>
                  );
                })}
              </div>

              {(search || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-4 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-brand-error)] hover:bg-red-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results count */}
            <p className="text-sm text-[var(--color-brand-muted)] mb-6">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {search && <span> for "{search}"</span>}
            </p>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl">
                <Search size={48} className="mx-auto mb-4 text-[var(--color-brand-primary)]" />
                <h3 className="font-heading text-xl font-semibold text-[var(--color-brand-chocolate)] mb-2">
                  No products found
                </h3>
                <p className="text-[var(--color-brand-muted)] mb-6">
                  Try adjusting your search or filter criteria.
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
