import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Sparkles, RefreshCcw, Check, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../../components/storefront/ProductCard';
import { api } from '../../services/api';
import { ApiResponse, SpuProduct, Category } from '../../types';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<SpuProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic filters
  const selectedCategory = searchParams.get('categoryId') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedRam = searchParams.get('ram') || '';
  const selectedStorage = searchParams.get('storage') || '';

  const brands = ['Apple', 'Samsung', 'Xiaomi'];
  const rams = ['8GB', '12GB', '16GB', '32GB'];
  const storages = ['128GB', '256GB', '512GB', '1TB'];

  useEffect(() => {
    // Load categories for filter
    api.get<ApiResponse<Category[]>>('/categories')
      .then((res) => setCategories(res.data.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('categoryId', selectedCategory);
    if (selectedBrand) params.append('brand', selectedBrand);
    if (selectedRam) params.append('ram', selectedRam);
    if (selectedStorage) params.append('storage', selectedStorage);

    api.get<ApiResponse<{ content: SpuProduct[] }>>(`/products?${params.toString()}`)
      .then((res) => {
        setProducts(res.data.data?.content || []);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCategory, selectedBrand, selectedRam, selectedStorage]);

  const handleFilterChange = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextParams.get(key) === value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl border border-indigo-900/30">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Ưu Đãi Mùa Mua Sắm 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Thiết Bị Công Nghệ Cao Cấp Chính Hãng
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Khám phá điện thoại, laptop và phụ kiện công nghệ đỉnh cao với chính sách bảo hành chính hãng và giao hàng siêu tốc trong 2h.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
      </div>

      {/* Main Content: Filter Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Dynamic Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Bộ Lọc Sản Phẩm</span>
              </div>
              {(selectedCategory || selectedBrand || selectedRam || selectedStorage) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Filter by Category */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Danh Mục
              </h4>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleFilterChange('categoryId', cat.id.toString())}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat.id.toString()
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id.toString() && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Brand */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Thương Hiệu
              </h4>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleFilterChange('brand', brand)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedBrand === brand
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by RAM */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Dung Lượng RAM
              </h4>
              <div className="flex flex-wrap gap-2">
                {rams.map((ram) => (
                  <button
                    key={ram}
                    onClick={() => handleFilterChange('ram', ram)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedRam === ram
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Storage */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Bộ Nhớ Trong (Storage)
              </h4>
              <div className="flex flex-wrap gap-2">
                {storages.map((storage) => (
                  <button
                    key={storage}
                    onClick={() => handleFilterChange('storage', storage)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedStorage === storage
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-900">
              Danh Sách Sản Phẩm ({products.length})
            </h2>
            <div className="text-xs text-slate-500">
              Cam kết 100% hàng chính hãng
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
              <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-xs text-slate-400 mb-4">Hãy thử chọn lại tiêu chí tìm kiếm khác.</p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
