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
  ChevronDown,
  ChevronUp,
  Package,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIES, formatPrice, type Product } from '@/data/products';
import { useProductStore } from '@/stores/productStore';
import { uploadProductImageToStorage } from '@/services/firestoreService';

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, toggleStock, fetchCatalog } = useProductStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const filtered = products.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === 'all' || p.categorySlug === selectedCategory;
    return matchQuery && matchCategory;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsNew(false);
  };

  const handleAddNew = () => {
    const newProd: Product = {
      id: `custom-${Date.now().toString(36)}`,
      name: '',
      price: 150,
      category: 'Cakes',
      categorySlug: 'cakes',
      description: '',
      image: '/images/products/dream-cake.jpg',
      inStock: true,
      stockQuantity: 0,
      featured: false,
      bestseller: false,
      ingredients: '',
      allergens: '',
    };
    setEditingProduct(newProd);
    setIsNew(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    setUploadingImage(true);
    try {
      const url = await uploadProductImageToStorage(file, editingProduct.id);
      setEditingProduct({ ...editingProduct, image: url });
      toast.success('Image uploaded to Firebase Storage!');
    } catch (err: any) {
      toast.error(err?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

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

  const inStockCount = products.filter((p) => p.inStock).length;
  const lowStockCount = products.filter((p) => (p.stockQuantity ?? 0) <= 10 && p.inStock).length;
  const bestsellerCount = products.filter((p) => p.bestseller).length;

  const stockLabel = (qty: number | undefined) => {
    if (qty === undefined || qty === null) return 'Not configured';
    if (qty === 0) return 'Out of Stock';
    if (qty <= 10) return `${qty} units (Low)`;
    return `${qty} units`;
  };

  const stockBadgeClass = (qty: number | undefined, inStock: boolean) => {
    if (!inStock) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (qty === undefined || qty === null) return 'bg-gray-100 text-gray-500 border-gray-200';
    if (qty === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (qty <= 10) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-brand-chocolate)]">
            Products & Stock
          </h1>
          <p className="text-sm text-[var(--color-brand-muted)] mt-1">
            {products.length} items in catalog
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
          aria-label="Add new product"
        >
          <Plus size={16} aria-hidden="true" /> Add New Item
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: products.length, color: 'text-[var(--color-brand-chocolate)]', bg: 'bg-amber-50' },
          { label: 'In Stock', value: inStockCount, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Low Stock', value: lowStockCount, color: 'text-orange-700', bg: 'bg-orange-50' },
          { label: 'Bestsellers', value: bestsellerCount, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-gray-200`}>
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search & Category Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            aria-label="Search products"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter size={14} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-brand-chocolate)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-pressed={selectedCategory === 'all'}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedCategory === c.slug
                  ? 'bg-[var(--color-brand-chocolate)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-pressed={selectedCategory === c.slug}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-xs text-gray-500 px-1">
          Showing {filtered.length} of {products.length} products
        </p>
      )}

      {/* ===== DESKTOP TABLE VIEW ===== */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Item Name
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Category
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Price
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Inventory
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Package size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-500">No products found</p>
                    <p className="text-xs text-gray-400">Try a different search or category filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || '/images/products/dream-cake.jpg'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/dream-cake.jpg'; }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                          <p className="font-mono text-[10px] text-gray-400">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${stockBadgeClass(product.stockQuantity, product.inStock)}`}>
                        {stockLabel(product.stockQuantity)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStock(product.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-70 ${
                          product.inStock ? 'text-green-700' : 'text-red-500'
                        }`}
                        aria-label={`${product.inStock ? 'Deactivate' : 'Activate'} ${product.name}`}
                      >
                        {product.inStock ? (
                          <><CheckCircle size={15} aria-hidden="true" /> Active</>
                        ) : (
                          <><XCircle size={15} aria-hidden="true" /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 rounded-lg text-gray-500 hover:text-[var(--color-brand-primary-dark)] hover:bg-amber-50 transition-colors"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit size={15} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(product.id)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MOBILE CARD VIEW ===== */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Package size={32} className="mx-auto text-gray-300 mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-500">No products found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search or filter</p>
          </div>
        ) : (
          filtered.map((product) => {
            const isExpanded = expandedCard === product.id;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden"
              >
                {/* Card Main Row */}
                <div className="p-4 flex items-start gap-3">
                  <img
                    src={product.image || '/images/products/dream-cake.jpg'}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-100 flex-shrink-0"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/dream-cake.jpg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{product.name}</h3>
                        <span className="inline-flex mt-0.5 items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                          {product.category}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 text-sm flex-shrink-0">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {/* Status Row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${stockBadgeClass(product.stockQuantity, product.inStock)}`}>
                        {stockLabel(product.stockQuantity)}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${product.inStock ? 'text-green-700' : 'text-red-500'}`}>
                        {product.inStock
                          ? <><CheckCircle size={11} aria-hidden="true" /> Active</>
                          : <><XCircle size={11} aria-hidden="true" /> Inactive</>
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Row */}
                <div className="flex items-center justify-between gap-2 px-4 pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-colors min-h-[36px]"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit size={13} aria-hidden="true" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleStock(product.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors min-h-[36px] ${
                        product.inStock
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                      aria-label={`${product.inStock ? 'Deactivate' : 'Activate'} ${product.name}`}
                    >
                      {product.inStock ? <XCircle size={13} aria-hidden="true" /> : <CheckCircle size={13} aria-hidden="true" />}
                      {product.inStock ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setConfirmDeleteId(product.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : product.id)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-2 bg-gray-50/50">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Product ID</span>
                      <p className="font-mono text-xs text-gray-600">{product.id}</p>
                    </div>
                    {product.description && (
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Description</span>
                        <p className="text-xs text-gray-700 line-clamp-2">{product.description}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${product.featured ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.featured ? 'Featured' : 'Not Featured'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${product.bestseller ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.bestseller ? 'Bestseller' : 'Regular'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ===== EDIT / ADD MODAL ===== */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 id="product-modal-title" className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                {isNew ? 'Add New Product' : `Edit: ${editingProduct.name}`}
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="overflow-y-auto max-h-[70vh] p-5 space-y-4">
              {/* Product Name */}
              <div>
                <label htmlFor="product-name" className="block text-xs font-bold text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  placeholder="e.g. Dream Cake"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-price" className="block text-xs font-bold text-gray-700 mb-1">
                    Price (₹ INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    required
                    min={1}
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label htmlFor="product-stock" className="block text-xs font-bold text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    min={0}
                    value={editingProduct.stockQuantity ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                    placeholder="Leave blank if N/A"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="product-category" className="block text-xs font-bold text-gray-700 mb-1">
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
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="product-description" className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="product-description"
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none"
                  placeholder="Describe the product..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Product Image (Firebase Storage)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="Paste URL or upload →"
                    className="flex-1 px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    aria-label="Image URL"
                  />
                  <label
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-colors border ${
                      uploadingImage
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <Upload size={13} aria-hidden="true" />
                    <span>{uploadingImage ? 'Uploading…' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {editingProduct.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={editingProduct.image}
                      alt="Product preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/dream-cake.jpg'; }}
                    />
                    <span className="text-[10px] text-gray-500 truncate max-w-xs">{editingProduct.image}</span>
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-1">
                {[
                  { key: 'inStock', label: 'Mark In Stock' },
                  { key: 'featured', label: 'Featured' },
                  { key: 'bestseller', label: 'Bestseller' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!editingProduct[key as keyof Product]}
                      onChange={(e) => setEditingProduct({ ...editingProduct, [key]: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--color-brand-primary-dark)]"
                    />
                    <span className="font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form=""
                onClick={handleSave}
                className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2"
              >
                <Save size={14} aria-hidden="true" /> {isNew ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" aria-hidden="true" />
              </div>
              <div>
                <h3 id="delete-confirm-title" className="font-bold text-gray-900">Delete Product?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  "{products.find(p => p.id === confirmDeleteId)?.name}" will be permanently removed from the catalog.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
