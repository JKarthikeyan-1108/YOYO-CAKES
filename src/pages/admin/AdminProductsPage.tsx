import { useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PRODUCTS, CATEGORIES, formatPrice, type Product } from '@/data/products';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);

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
      image: '/images/products/custom.jpg',
      inStock: true,
      stockQuantity: 20,
      featured: false,
      bestseller: false,
      ingredients: 'Configured by bakery owner',
      allergens: 'Dairy, Wheat',
    };
    setEditingProduct(newProd);
    setIsNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
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
      setProducts([editingProduct, ...products]);
      toast.success(`${editingProduct.name} added to catalog`);
    } else {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
      );
      toast.success(`${editingProduct.name} updated successfully`);
    }
    setEditingProduct(null);
  };

  const handleToggleStock = (id: string) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const updated = { ...p, inStock: !p.inStock };
          toast.success(
            `${p.name} marked ${updated.inStock ? 'In Stock' : 'Out of Stock'}`
          );
          return updated;
        }
        return p;
      })
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      setProducts(products.filter((p) => p.id !== id));
      toast.success(`${name} deleted from catalog`);
    }
  };

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
      <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
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
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[var(--color-brand-chocolate)]">
                    <div>{product.name}</div>
                    <span className="font-mono text-[10px] text-gray-400 font-normal">
                      {product.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{product.category}</td>
                  <td className="py-3.5 px-4 font-bold text-[var(--color-brand-primary-dark)]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                        product.stockQuantity <= 10
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {product.stockQuantity} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
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
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                      title="Edit Product"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                {isNew ? 'Add New Product' : `Edit ${editingProduct.name}`}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
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
        </div>
      )}
    </div>
  );
}
