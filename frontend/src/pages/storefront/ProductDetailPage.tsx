import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, AlertCircle, ArrowLeft, PackageCheck } from 'lucide-react';
import { api } from '../../services/api';
import { ApiResponse, SpuProduct, SkuVariant } from '../../types';
import { useCartStore } from '../../store/useCartStore';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<SpuProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<SkuVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);

    api.get<ApiResponse<SpuProduct>>(`/products/${slug}`)
      .then((res) => {
        const prod = res.data.data;
        setProduct(prod);

        if (prod.variants && prod.variants.length > 0) {
          const firstVariant = prod.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedOptions(firstVariant.options || {});
        }
      })
      .catch((err) => {
        console.error('Failed to load product detail:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  // Extract all distinct option types (e.g. ['color', 'storage'])
  const optionTypes = React.useMemo(() => {
    if (!product?.variants) return [];
    const keys = new Set<string>();
    product.variants.forEach((v) => {
      if (v.options) {
        Object.keys(v.options).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [product]);

  // Extract distinct values for each option type
  const getValuesForOption = (optionKey: string) => {
    if (!product?.variants) return [];
    const values = new Set<string>();
    product.variants.forEach((v) => {
      if (v.options && v.options[optionKey]) {
        values.add(v.options[optionKey]);
      }
    });
    return Array.from(values);
  };

  // Find matching variant when user clicks an option
  const handleOptionSelect = (key: string, value: string) => {
    const nextOptions = { ...selectedOptions, [key]: value };
    setSelectedOptions(nextOptions);

    if (product?.variants) {
      // Find variant that matches chosen options
      const match = product.variants.find((v) => {
        return Object.entries(nextOptions).every(([k, val]) => v.options[k] === val);
      });
      if (match) {
        setSelectedVariant(match);
      }
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addItem({
      skuId: selectedVariant.id,
      spuId: product.id,
      spuName: product.name,
      skuCode: selectedVariant.skuCode,
      price: selectedVariant.price,
      quantity,
      options: selectedVariant.options,
      imageUrl: selectedVariant.imageUrl || product.thumbnailUrl,
      availableStock: selectedVariant.availableStock,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h2>
        <Link to="/" className="text-indigo-600 font-semibold text-sm hover:underline">
          &larr; Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const isAvailable = selectedVariant ? selectedVariant.availableStock > 0 : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay về danh sách sản phẩm
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm">
        {/* Product Image Gallery */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square relative shadow-inner">
            <img
              src={selectedVariant?.imageUrl || product.thumbnailUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {product.categoryName && (
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-xs">
                {product.categoryName}
              </span>
            )}
          </div>
        </div>

        {/* Product Details & Variant Selection */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                Chính Hãng
              </span>
              {selectedVariant && (
                <span className="text-xs font-mono font-medium text-slate-400">
                  Mã SP: {selectedVariant.skuCode}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
              {product.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-indigo-600">
                {selectedVariant
                  ? `${Number(selectedVariant.price).toLocaleString('vi-VN')} đ`
                  : 'Vui lòng chọn biến thể'}
              </span>
              {selectedVariant?.compareAtPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {Number(selectedVariant.compareAtPrice).toLocaleString('vi-VN')} đ
                </span>
              )}
            </div>

            {/* Dynamic Variant Selector (Reading options JSONB) */}
            <div className="space-y-4 mb-6">
              {optionTypes.map((optKey) => {
                const values = getValuesForOption(optKey);
                return (
                  <div key={optKey}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Chọn {optKey}:
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {values.map((val) => {
                        const isSelected = selectedOptions[optKey] === val;
                        return (
                          <button
                            key={val}
                            onClick={() => handleOptionSelect(optKey, val)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{val}</span>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Real-time Inventory Status */}
            <div className="mb-6 flex items-center gap-2">
              {isAvailable ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Còn hàng sẵn ({selectedVariant?.availableStock} sản phẩm)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Tạm thời hết hàng</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-3 text-slate-600 hover:bg-slate-200"
              >
                -
              </button>
              <span className="px-4 py-3 text-sm font-bold text-slate-800">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={!selectedVariant || quantity >= selectedVariant.availableStock}
                className="px-3.5 py-3 text-slate-600 hover:bg-slate-200 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-[0.99]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{isAvailable ? 'Thêm Vào Giỏ Hàng' : 'Tạm Hết Hàng'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SPU Technical Attributes JSONB Table */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <div className="mt-12 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Thông Số Kỹ Thuật Chi Tiết
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.attributes).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                <span className="font-semibold text-slate-500 uppercase">{key.replace('_', ' ')}</span>
                <span className="font-bold text-slate-800">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
