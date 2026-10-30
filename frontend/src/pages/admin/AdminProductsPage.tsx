import React, { useEffect, useState } from 'react';
import { Package, Plus, Eye, Layers, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { api } from '../../services/api';
import { ApiResponse, SpuProduct, Category } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<SpuProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for creating SPU + SKUs
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [skuCode, setSkuCode] = useState('');
  const [price, setPrice] = useState(25000000);
  const [initialStock, setInitialStock] = useState(20);

  const fetchProducts = () => {
    setIsLoading(true);
    api.get<ApiResponse<{ content: SpuProduct[] }>>('/products?page=0&size=20')
      .then((res) => setProducts(res.data.data?.content || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get<ApiResponse<Category[]>>('/categories')
      .then((res) => setCategories(res.data.data || []))
      .catch(console.error);
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;

    const payload = {
      categoryId: Number(categoryId),
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      attributes: {
        brand,
        created_via: 'Admin GUI',
      },
      variants: [
        {
          skuCode: skuCode || `${slug.toUpperCase()}-01`,
          price,
          options: {
            color: 'Tiêu chuẩn',
          },
          imageUrl: thumbnailUrl,
          initialStock,
        },
      ],
    };

    try {
      await api.post('/products', payload);
      setIsCreateOpen(false);
      fetchProducts();
      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setThumbnailUrl('');
      setSkuCode('');
    } catch (err: any) {
      console.error('Failed to create product:', err);
      alert(err.response?.data?.message || 'Tạo sản phẩm thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Danh Sách Sản Phẩm
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý thông tin chi tiết sản phẩm, các phân loại biến thể và số lượng tồn kho khả dụng.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Sản Phẩm</th>
                <th className="py-3.5 px-4">Danh Mục</th>
                <th className="py-3.5 px-4">Thuộc Tính</th>
                <th className="py-3.5 px-4">Kho Hàng Khả Dụng</th>
                <th className="py-3.5 px-4">Giá Bán</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnailUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">slug: {p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700">{p.categoryName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {p.attributes && Object.entries(p.attributes).map(([k, v]) => (
                        <span key={k} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-mono">
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {p.totalStock ?? 0} khả dụng
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.minPrice ? `${Number(p.minPrice).toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="font-extrabold text-lg text-slate-900">Thêm Sản Phẩm Mới</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="Ví dụ: iPad Pro 13 M4"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Slug URL *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ipad-pro-13-m4"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Danh mục trực thuộc *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 outline-none"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ảnh đại diện (Thumbnail URL)</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt tính năng..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="font-bold text-indigo-900 uppercase tracking-wider text-[11px]">
                  Cấu hình phân loại biến thể & Khởi tạo Tồn kho
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Mã phân loại *</label>
                    <input
                      type="text"
                      required
                      value={skuCode}
                      onChange={(e) => setSkuCode(e.target.value)}
                      placeholder="IPAD-M4-01"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Giá bán (VND) *</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Tồn kho ban đầu *</label>
                    <input
                      type="number"
                      required
                      value={initialStock}
                      onChange={(e) => setInitialStock(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all mt-4"
              >
                Lưu Sản Phẩm Mới
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
