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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIES, formatPrice, type Product } from '@/data/products';
import { useProductStore } from '@/stores/productStore';
import {
  uploadProductImageToStorage,
} from '@/services/firestoreService';

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, toggleStock, fetchCatalog } = useProductStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Filtered products
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
      stockQuantity: 20,
      featured: false,
      bestseller: false,
      ingredients: 'Artisanal ingredients handcrafted with love',
      allergens: 'Dairy, Wheat',
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

    if (isNew) {
      await addProduct(editingProduct);
      toast.success(`${editingProduct.name} added to catalog`);
    } else {
      await updateProduct(editingProduct);
      toast.success(`${editingProduct.name} updated successfully`);
    }

    setEditingProduct(null);
  };

  const handleToggleStock = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const willBeInStock = !target.inStock;

    await toggleStock(id);
    toast.success(
      `${target.name} marked ${willBeInStock ? 'In Stock' : 'Out of Stock'}`
    );
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteProduct(id);
      toast.success(`${name} deleted from catalog`);
    }
  };

  const inStockCount = products.filter((p) => p.inStock).length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= 10).length;
  const bestsellerCount = products.filter((p) => p.bestseller).length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--color-brand-chocolate)]">
            Product & Stock Management
          </h1>
          <p className="text-sm text-[var(--color-brand-muted)] mt-1">
            Manage pricing, stock counts, and catalog status for all {products.length} bakery items
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {/* DaisyUI Stats Strip */}
      <div className="stats stats-vertical sm:stats-horizontal shadow-xs border border-gray-200/80 bg-white w-full rounded-2xl">
        <div className="stat py-4 px-6">
          <div className="stat-title text-xs font-semibold text-gray-500">Total Catalog</div>
          <div className="stat-value text-2xl font-bold text-[var(--color-brand-chocolate)]">{products.length} items</div>
          <div className="stat-desc text-xs text-gray-400">Fresh bakes & dessert menu</div>
        </div>
        <div className="stat py-4 px-6">
          <div className="stat-title text-xs font-semibold text-gray-500">In Stock Ready</div>
          <div className="stat-value text-2xl font-bold text-[#007600]">{inStockCount} items</div>
          <div className="stat-desc text-xs text-[#007600] font-semibold">{products.length - inStockCount} paused</div>
        </div>
        <div className="stat py-4 px-6">
          <div className="stat-title text-xs font-semibold text-gray-500">Low Stock Alert</div>
          <div className="stat-value text-2xl font-bold text-red-600">{lowStockCount}</div>
          <div className="stat-desc text-xs text-red-600 font-semibold">10 or fewer units in inventory</div>
        </div>
        <div className="stat py-4 px-6">
          <div className="stat-title text-xs font-semibold text-gray-500">Top Bestsellers</div>
          <div className="stat-value text-2xl font-bold text-amber-600">{bestsellerCount}</div>
          <div className="stat-desc text-xs text-amber-600 font-semibold">Flagship signature items</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-brand-chocolate)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.slug
                  ? 'bg-[var(--color-brand-chocolate)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra table-hover w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-[var(--color-brand-muted)] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (INR)</th>
                <th className="py-3.5 px-4">Inventory</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[var(--color-brand-chocolate)]">
                    <div>{product.name}</div>
                    <span className="font-mono text-[10px] text-gray-400 font-normal">
                      {product.id}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge badge-ghost text-[11px] font-semibold">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[var(--color-brand-primary-dark)]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`badge badge-sm font-bold text-[10px] ${
                        product.stockQuantity <= 10
                          ? 'badge-error text-white'
                          : 'badge-success text-white'
                      }`}
                    >
                      {product.stockQuantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStock(product.id)}
                      className={`flex items-center gap-1 font-semibold text-[11px] ${
                        product.inStock ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {product.inStock ? (
                        <>
                          <CheckCircle size={14} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> Out of Stock
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn btn-ghost btn-xs text-gray-600 hover:text-[var(--color-brand-primary-dark)]"
                      title="Edit Product"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50"
                      title="Delete Product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add DaisyUI Modal */}
      {editingProduct && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                {isNew ? 'Add New Product' : `Edit ${editingProduct.name}`}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="input-field py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="input-field py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.stockQuantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                    className="input-field py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={editingProduct.categorySlug}
                  onChange={(e) => {
                    const found = CATEGORIES.find((c) => c.slug === e.target.value);
                    setEditingProduct({
                      ...editingProduct,
                      categorySlug: e.target.value,
                      category: found ? found.name : 'Cakes',
                    });
                  }}
                  className="input-field py-2 text-xs"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="input-field py-2 text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Image (Firebase Storage)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editingProduct.image || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, image: e.target.value })
                    }
                    placeholder="https://... or /images/products/..."
                    className="input-field py-2 text-xs flex-1"
                  />
                  <label className={`btn-secondary text-xs px-3 py-2 cursor-pointer flex items-center gap-1 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload size={14} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
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
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-md border"
                    />
                    <span className="text-[10px] text-gray-500 truncate max-w-xs">
                      {editingProduct.image}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        inStock: e.target.checked,
                      })
                    }
                    className="rounded text-[var(--color-brand-primary-dark)]"
                  />
                  <span>Mark In Stock</span>
                </label>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.bestseller}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        bestseller: e.target.checked,
                      })
                    }
                    className="rounded text-[var(--color-brand-primary-dark)]"
                  />
                  <span>Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <Save size={14} /> Save Product
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setEditingProduct(null)} />
        </div>
      )}
    </div>
  );
}
