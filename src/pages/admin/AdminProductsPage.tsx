import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Filter,
  Upload,
  Package,
  AlertTriangle,
  Minus,
  CheckSquare,
  Square,
  ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIES, formatPrice, type Product } from '@/data/products';
import { useProductStore } from '@/stores/productStore';
import { uploadProductImageToStorage } from '@/services/firestoreService';

type StockFilterType = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export default function AdminProductsPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
    updateStockQuantity,
    batchUpdateStock,
    batchAdjustStockQuantity,
    fetchCatalog,
  } = useProductStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilterType>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Clean up object URL preview on unmount or URL change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const cleanupPreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadProgress(null);
    setUploadError(null);
  };

  // Filter calculation
  const inStockCount = products.filter((p) => p.inStock && (p.stockQuantity ?? 1) > 0).length;
  const lowStockCount = products.filter((p) => p.inStock && (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 5).length;
  const outOfStockCount = products.filter((p) => !p.inStock || (p.stockQuantity ?? 0) === 0).length;

  const filtered = products.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === 'all' || p.categorySlug === selectedCategory;

    let matchStock = true;
    if (stockFilter === 'in_stock') {
      matchStock = p.inStock && (p.stockQuantity ?? 1) > 0;
    } else if (stockFilter === 'low_stock') {
      matchStock = p.inStock && (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 5;
    } else if (stockFilter === 'out_of_stock') {
      matchStock = !p.inStock || (p.stockQuantity ?? 0) === 0;
    }

    return matchQuery && matchCategory && matchStock;
  });

  // Multi-select handlers
  const handleSelectAll = () => {
    if (selectedProductIds.length === filtered.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filtered.map((p) => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkRestock = async (delta: number) => {
    if (selectedProductIds.length === 0) return;
    await batchAdjustStockQuantity(selectedProductIds, delta);
    toast.success(`Restocked +${delta} units for ${selectedProductIds.length} items!`, { icon: '📦' });
  };

  const handleBulkStockStatus = async (inStock: boolean) => {
    if (selectedProductIds.length === 0) return;
    await batchUpdateStock(selectedProductIds, inStock);
    toast.success(`Marked ${selectedProductIds.length} items as ${inStock ? 'In Stock' : 'Sold Out'}`);
  };

  // Inline Stock Stepper
  const handleAdjustStock = async (product: Product, delta: number) => {
    const nextQty = Math.max(0, (product.stockQuantity ?? 0) + delta);
    await updateStockQuantity(product.id, nextQty);
    toast.success(`${product.name}: ${nextQty} in stock`, { duration: 1500 });
  };

  const handleEdit = (product: Product) => {
    cleanupPreview();
    setEditingProduct({ ...product });
    setIsNew(false);
  };

  const handleAddNew = () => {
    cleanupPreview();
    const newProd: Product = {
      id: `custom-${Date.now().toString(36)}`,
      name: '',
      price: 150,
      category: 'Cakes',
      categorySlug: 'cakes',
      description: '',
      image: '/images/products/dream-cake.jpg',
      inStock: true,
      stockQuantity: 20,
      featured: false,
      bestseller: false,
      ingredients: '',
      allergens: '',
    };
    setEditingProduct(newProd);
    setIsNew(true);
  };

  const handleCloseModal = () => {
    cleanupPreview();
    setEditingProduct(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validMimes.includes(file.type) && !file.type.startsWith('image/')) {
      toast.error(`Invalid image format (${file.type || 'unknown'}). Please choose JPEG, PNG, WebP, or GIF.`);
      return;
    }

    // Validate 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`Image size (${sizeMb} MB) exceeds the 5 MB limit. Please select a smaller file.`);
      return;
    }

    // Revoke previous blob if any
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadError(null);
    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const url = await uploadProductImageToStorage(file, editingProduct.id, (percent) => {
        setUploadProgress(percent);
      });
      setEditingProduct((prev) => (prev ? { ...prev, image: url } : null));
      toast.success('Image uploaded successfully to Firebase Storage!');
    } catch (err: any) {
      const msg = err?.message || 'Image upload failed';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (uploadingImage) {
      toast.error('Image is currently uploading. Please wait for upload to complete.');
      return;
    }

    if (uploadError) {
      toast.error('Cannot save product while image upload has failed. Please resolve the error.');
      return;
    }

    if (!editingProduct.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (editingProduct.price <= 0) {
      toast.error('Price must be greater than zero');
      return;
    }

    try {
      if (isNew) {
        await addProduct(editingProduct);
        toast.success(`${editingProduct.name} added to catalog`);
      } else {
        await updateProduct(editingProduct);
        toast.success(`${editingProduct.name} updated successfully`);
      }
      cleanupPreview();
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save product');
    }
  };

  const handleToggleStock = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const willBeInStock = !target.inStock;
    await toggleStock(id);
    toast.success(`${target.name} marked ${willBeInStock ? 'In Stock' : 'Out of Stock'}`);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    const target = products.find((p) => p.id === confirmDeleteId);
    if (!target) return;
    await deleteProduct(confirmDeleteId);
    toast.success(`${target.name} deleted from catalog`);
    setConfirmDeleteId(null);
  };

  const stockBadgeClass = (qty: number | undefined, inStock: boolean) => {
    if (!inStock || qty === 0) return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    if (qty !== undefined && qty <= 5) return 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-bold';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)]">
            Products & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-1">
            {products.length} signature bakery items with live stock counts and catalog controls
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-primary-light)] hover:opacity-90 text-[var(--color-brand-chocolate)] font-bold text-xs shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto min-h-[44px]"
          aria-label="Add new product"
        >
          <Plus size={16} aria-hidden="true" /> Add New Item
        </button>
      </div>

      {/* Low Stock Replenishment Alert Banner */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="text-amber-700 dark:text-amber-400 flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                Kitchen Replenishment Alert
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                {lowStockCount} item{lowStockCount > 1 ? 's are' : ' is'} running low (≤5 units) and {outOfStockCount} item{outOfStockCount > 1 ? 's are' : ' is'} sold out.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStockFilter('low_stock');
              setSelectedCategory('all');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-900 text-amber-100 hover:bg-amber-800 text-xs font-bold self-start sm:self-auto flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>View Low Stock</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Catalog', value: products.length, color: 'text-[var(--color-brand-chocolate)]', bg: 'bg-[var(--color-brand-surface)]', filter: 'all' as StockFilterType },
          { label: 'In Stock', value: inStockCount, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-[var(--color-brand-surface)]', filter: 'in_stock' as StockFilterType },
          { label: 'Low Stock (≤5)', value: lowStockCount, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-[var(--color-brand-surface)]', filter: 'low_stock' as StockFilterType },
          { label: 'Sold Out', value: outOfStockCount, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-[var(--color-brand-surface)]', filter: 'out_of_stock' as StockFilterType },
        ].map(({ label, value, color, bg, filter }) => (
          <button
            key={label}
            onClick={() => setStockFilter(filter)}
            className={`${bg} rounded-2xl p-4 border text-left transition-all shadow-xs ${
              stockFilter === filter
                ? 'border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20'
                : 'border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)]/40'
            }`}
          >
            <p className="text-xs font-bold text-[var(--color-brand-muted)]">{label}</p>
            <p className={`text-2xl font-black ${color} mt-0.5`}>{value}</p>
          </button>
        ))}
      </div>

      {/* Floating Bulk Actions Bar (When items selected) */}
      {selectedProductIds.length > 0 && (
        <div className="bg-[var(--color-brand-chocolate)] text-[var(--color-brand-cream)] p-3.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn border border-[var(--color-brand-border)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
            <span className="text-xs font-bold">
              {selectedProductIds.length} item{selectedProductIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => handleBulkRestock(10)}
              className="px-3 py-1.5 rounded-xl bg-[var(--color-brand-primary)] hover:opacity-90 text-[var(--color-brand-chocolate)] text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Package size={13} />
              <span>+10 Restock Units</span>
            </button>

            <button
              onClick={() => handleBulkStockStatus(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <CheckCircle size={13} />
              <span>Mark in Stock</span>
            </button>

            <button
              onClick={() => handleBulkStockStatus(false)}
              className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <XCircle size={13} />
              <span>Mark Sold Out</span>
            </button>

            <button
              onClick={() => setSelectedProductIds([])}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter Section */}
      <div className="bg-[var(--color-brand-surface)] p-4 rounded-2xl border border-[var(--color-brand-border)] shadow-xs space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40 min-h-[44px]"
            aria-label="Search products"
          />
        </div>

        {/* Stock Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--color-brand-border)]/60 pt-1">
          <span className="text-[11px] font-bold text-[var(--color-brand-muted)] flex-shrink-0">Stock State:</span>
          {[
            { key: 'all', label: 'All Inventory' },
            { key: 'in_stock', label: `In Stock (${inStockCount})` },
            { key: 'low_stock', label: `Low Stock ≤5 (${lowStockCount})` },
            { key: 'out_of_stock', label: `Sold Out (${outOfStockCount})` },
          ].map((sf) => (
            <button
              key={sf.key}
              onClick={() => setStockFilter(sf.key as StockFilterType)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 min-h-[32px] ${
                stockFilter === sf.key
                  ? 'bg-[var(--color-brand-chocolate)] text-[var(--color-brand-cream)] shadow-xs'
                  : 'bg-[var(--color-brand-cream)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter size={14} className="text-[var(--color-brand-muted)] flex-shrink-0" aria-hidden="true" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 min-h-[36px] ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-brand-chocolate)] text-[var(--color-brand-cream)] shadow-xs'
                : 'bg-[var(--color-brand-cream)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
            }`}
          >
            All Categories ({products.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = products.filter((p) => p.categorySlug === c.slug).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 min-h-[36px] ${
                  selectedCategory === c.slug
                    ? 'bg-[var(--color-brand-chocolate)] text-[var(--color-brand-cream)] shadow-xs'
                    : 'bg-[var(--color-brand-cream)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[var(--color-brand-muted)] font-medium">
          Showing {filtered.length} of {products.length} products
        </p>

        <button
          onClick={handleSelectAll}
          className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1.5"
        >
          {selectedProductIds.length === filtered.length && filtered.length > 0 ? (
            <><CheckSquare size={14} /> Deselect All</>
          ) : (
            <><Square size={14} /> Select All {filtered.length} Items</>
          )}
        </button>
      </div>

      {/* ===== DESKTOP TABLE VIEW ===== */}
      <div className="hidden md:block bg-[var(--color-brand-surface)] rounded-2xl border border-[var(--color-brand-border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[var(--color-brand-cream)] border-b border-[var(--color-brand-border)]">
                <th className="py-3.5 px-3 text-xs font-bold text-[var(--color-brand-muted)] w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.length === filtered.length && filtered.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all products"
                    className="rounded border-[var(--color-brand-border)]"
                  />
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wide">
                  Item Name
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wide">
                  Category
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wide">
                  Price
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wide">
                  Stock Units (Live Stepper)
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wide">
                  Status
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wide text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-brand-border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Package size={32} className="mx-auto text-[var(--color-brand-muted)]/50 mb-2" />
                    <p className="text-sm font-medium text-[var(--color-brand-chocolate)]">No products found</p>
                    <p className="text-xs text-[var(--color-brand-muted)]">Try a different search or inventory filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isChecked = selectedProductIds.includes(product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[var(--color-brand-cream)]/50 transition-colors group ${
                        isChecked ? 'bg-[var(--color-brand-primary)]/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(product.id)}
                          aria-label={`Select ${product.name}`}
                          className="rounded border-[var(--color-brand-border)]"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || '/images/products/dream-cake.jpg'}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-[var(--color-brand-border)] flex-shrink-0"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/products/dream-cake.jpg';
                            }}
                          />
                          <div>
                            <p className="font-bold text-[var(--color-brand-chocolate)] text-sm">{product.name}</p>
                            <p className="font-mono text-[10px] text-[var(--color-brand-muted)]">{product.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] border border-[var(--color-brand-border)]">
                          {product.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary-light)]">
                        {formatPrice(product.price)}
                      </td>

                      {/* Live Stock Stepper */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center border border-[var(--color-brand-border)] rounded-xl bg-[var(--color-brand-cream)] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(product, -1)}
                              disabled={(product.stockQuantity ?? 0) <= 0}
                              className="p-1.5 hover:bg-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] transition-colors disabled:opacity-30"
                              title="Decrease stock by 1"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-10 text-center font-mono font-bold text-xs text-[var(--color-brand-chocolate)]">
                              {product.stockQuantity ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(product, 1)}
                              className="p-1.5 hover:bg-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] transition-colors"
                              title="Increase stock by 1"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockBadgeClass(product.stockQuantity, product.inStock)}`}>
                            {product.inStock && (product.stockQuantity ?? 0) > 5 ? 'Good' : (product.stockQuantity ?? 0) > 0 ? 'Low' : 'Out'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStock(product.id)}
                          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                            product.inStock && (product.stockQuantity ?? 0) > 0
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                          aria-label={`${product.inStock ? 'Deactivate' : 'Activate'} ${product.name}`}
                        >
                          {product.inStock && (product.stockQuantity ?? 0) > 0 ? (
                            <><CheckCircle size={15} aria-hidden="true" /> In Stock</>
                          ) : (
                            <><XCircle size={15} aria-hidden="true" /> Sold Out</>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 rounded-lg text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream)] transition-colors"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit size={15} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(product.id)}
                            className="p-2 rounded-lg text-[var(--color-brand-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MOBILE CARD VIEW ===== */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[var(--color-brand-surface)] rounded-2xl border border-[var(--color-brand-border)] p-8 text-center">
            <Package size={32} className="mx-auto text-[var(--color-brand-muted)]/50 mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-[var(--color-brand-chocolate)]">No products found</p>
            <p className="text-xs text-[var(--color-brand-muted)] mt-1">Try a different search or filter</p>
          </div>
        ) : (
          filtered.map((product) => {
            const isChecked = selectedProductIds.includes(product.id);

            return (
              <div
                key={product.id}
                className={`bg-[var(--color-brand-surface)] rounded-2xl border border-[var(--color-brand-border)] shadow-xs overflow-hidden ${
                  isChecked ? 'ring-2 ring-[var(--color-brand-primary)]' : ''
                }`}
              >
                {/* Card Main Row */}
                <div className="p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSelectOne(product.id)}
                    aria-label={`Select ${product.name}`}
                    className="mt-1 rounded border-[var(--color-brand-border)]"
                  />

                  <img
                    src={product.image || '/images/products/dream-cake.jpg'}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-[var(--color-brand-border)] flex-shrink-0"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/products/dream-cake.jpg';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-[var(--color-brand-chocolate)] text-sm leading-tight truncate">{product.name}</h3>
                        <span className="inline-flex mt-0.5 items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] border border-[var(--color-brand-border)]">
                          {product.category}
                        </span>
                      </div>
                      <span className="font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary-light)] text-sm flex-shrink-0">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {/* Stock Stepper on Mobile */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[var(--color-brand-border)]">
                      <div className="inline-flex items-center border border-[var(--color-brand-border)] rounded-xl bg-[var(--color-brand-cream)] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(product, -1)}
                          disabled={(product.stockQuantity ?? 0) <= 0}
                          className="p-1.5 text-[var(--color-brand-chocolate)] disabled:opacity-30"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-xs text-[var(--color-brand-chocolate)]">
                          {product.stockQuantity ?? 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(product, 1)}
                          className="p-1.5 text-[var(--color-brand-chocolate)]"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStock(product.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${stockBadgeClass(product.stockQuantity, product.inStock)}`}
                        >
                          {product.inStock && (product.stockQuantity ?? 0) > 0 ? 'Active' : 'Sold Out'}
                        </button>

                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-lg text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream)]"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== EDIT / ADD MODAL ===== */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          <div className="bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[var(--color-brand-border)] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-cream)]">
              <div>
                <h2 id="product-modal-title" className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                  {isNew ? 'Add New Product' : `Edit: ${editingProduct.name}`}
                </h2>
                <p className="text-[11px] text-[var(--color-brand-muted)] mt-0.5">
                  {isNew ? 'Create a signature bakery item' : 'Update pricing, inventory stock, and media'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-[var(--color-brand-surface)] hover:bg-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Product Name */}
              <div>
                <label htmlFor="product-name" className="block text-xs font-bold text-[var(--color-brand-chocolate)] mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                  placeholder="e.g. Dream Cake"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-price" className="block text-xs font-bold text-[var(--color-brand-chocolate)] mb-1">
                    Price (₹ INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    required
                    min={1}
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                  />
                </div>
                <div>
                  <label htmlFor="product-stock" className="block text-xs font-bold text-[var(--color-brand-chocolate)] mb-1">
                    Stock Quantity (Units)
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    min={0}
                    value={editingProduct.stockQuantity ?? 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockQuantity: Number(e.target.value),
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="product-category" className="block text-xs font-bold text-[var(--color-brand-chocolate)] mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="product-category"
                  value={editingProduct.categorySlug}
                  onChange={(e) => {
                    const found = CATEGORIES.find((c) => c.slug === e.target.value);
                    setEditingProduct({
                      ...editingProduct,
                      categorySlug: e.target.value,
                      category: found ? found.name : 'Cakes',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Image Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-brand-chocolate)] mb-1.5">
                  Product Image
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={previewUrl || editingProduct.image || '/images/products/dream-cake.jpg'}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-[var(--color-brand-border)] bg-gray-100 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/products/dream-cake.jpg';
                    }}
                  />
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-brand-cream)] hover:bg-[var(--color-brand-border)] border border-[var(--color-brand-border)] text-xs font-bold text-[var(--color-brand-chocolate)] cursor-pointer transition-colors">
                      <Upload size={14} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image (Max 5MB)'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    <p className="text-[10px] text-[var(--color-brand-muted)] mt-1">
                      JPEG, PNG, WebP up to 5MB. Uploads to Firebase Storage.
                    </p>
                  </div>
                </div>

                {uploadProgress !== null && uploadingImage && (
                  <div className="w-full bg-[var(--color-brand-cream)] rounded-full h-1.5 mt-2 overflow-hidden border border-[var(--color-brand-border)]">
                    <div
                      className="bg-[var(--color-brand-primary)] h-1.5 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="product-description" className="block text-xs font-bold text-[var(--color-brand-chocolate)] mb-1">
                  Description
                </label>
                <textarea
                  id="product-description"
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                  placeholder="Artisanal recipe details, flavor notes, crust texture..."
                />
              </div>

              {/* Bestseller & Featured Checkboxes */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--color-brand-chocolate)]">
                  <input
                    type="checkbox"
                    checked={editingProduct.bestseller}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bestseller: e.target.checked })}
                    className="rounded border-[var(--color-brand-border)]"
                  />
                  <span>Mark as Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--color-brand-chocolate)]">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded border-[var(--color-brand-border)]"
                  />
                  <span>Featured Collection</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[var(--color-brand-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-cream)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[var(--color-brand-primary-dark)] transition-colors"
                >
                  <Save size={14} />
                  <span>{isNew ? 'Create Item' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] rounded-2xl max-w-sm w-full p-5 border border-[var(--color-brand-border)] shadow-xl">
            <h3 className="font-bold text-base mb-1">Delete Product?</h3>
            <p className="text-xs text-[var(--color-brand-muted)] mb-4">
              Are you sure you want to remove this item from the catalog? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-cream)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
