import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Package } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../services/api';
import { ApiResponse, SpuProduct } from '../../types';

export const SmartSearchBar: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<SpuProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedKeyword = useDebounce(keyword, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedKeyword || debouncedKeyword.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    api.get<ApiResponse<SpuProduct[]>>(`/products/suggest?keyword=${encodeURIComponent(debouncedKeyword)}`)
      .then((res) => {
        if (isMounted) {
          setSuggestions(res.data.data || []);
          setIsOpen(true);
        }
      })
      .catch((err) => {
        console.error('Suggest search failed:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedKeyword]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (slug: string) => {
    setIsOpen(false);
    setKeyword('');
    navigate(`/products/${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setIsOpen(false);
      navigate(`/?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-lg" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Tìm kiếm điện thoại, laptop, linh kiện thông minh..."
          className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 text-sm pl-11 pr-10 py-2.5 rounded-full border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
        {isLoading && (
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin absolute right-3.5" />
        )}
      </form>

      {/* Auto-suggest dropdown popover */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-2 border-b border-slate-50 flex items-center justify-between text-xs text-slate-400 font-medium px-3">
            <span>Sản phẩm gợi ý ({suggestions.length})</span>
            <span className="text-indigo-600 font-semibold">Tìm kiếm thông minh</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {suggestions.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product.slug)}
                className="flex items-center gap-3.5 p-3 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <img
                  src={product.thumbnailUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'}
                  alt={product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-0.5">
                    {product.categoryName}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-indigo-600">
                      {product.minPrice ? `${Number(product.minPrice).toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                    </span>
                    {product.totalStock !== undefined && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <Package className="w-3 h-3" /> Còn {product.totalStock} máy
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
