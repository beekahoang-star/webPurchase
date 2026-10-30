import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Package } from 'lucide-react';
import { SpuProduct } from '../../types';

interface ProductCardProps {
  product: SpuProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
      {/* Thumbnail */}
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden aspect-4/3 bg-slate-50">
        <img
          src={product.thumbnailUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-xs">
          {product.categoryName}
        </div>
      </Link>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* JSONB Brand badge */}
          {product.attributes?.brand && (
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 block mb-1">
              {product.attributes.brand}
            </span>
          )}

          <Link
            to={`/products/${product.slug}`}
            className="font-bold text-base text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2"
          >
            {product.name}
          </Link>

          {/* Quick specs from JSONB attributes */}
          {product.attributes && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.attributes.screen_size && (
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  {product.attributes.screen_size}
                </span>
              )}
              {product.attributes.chip && (
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  {product.attributes.chip}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Giá chỉ từ</div>
            <div className="text-base font-extrabold text-indigo-600">
              {product.minPrice ? `${Number(product.minPrice).toLocaleString('vi-VN')} đ` : 'Liên hệ'}
            </div>
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold text-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem chi tiết</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
