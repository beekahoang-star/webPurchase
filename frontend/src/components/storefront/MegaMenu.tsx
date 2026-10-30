import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Grid, Smartphone, Laptop, Sparkles } from 'lucide-react';
import { Category } from '../../types';

interface MegaMenuProps {
  categories: Category[];
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ categories }) => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getIconForCategory = (name: string) => {
    if (name.toLowerCase().includes('thoại') || name.toLowerCase().includes('phone')) {
      return Smartphone;
    }
    if (name.toLowerCase().includes('laptop') || name.toLowerCase().includes('máy tính')) {
      return Laptop;
    }
    return Grid;
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => {
        setIsOpen(false);
        setActiveCategory(null);
      }}
    >
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-semibold text-sm">
        <Grid className="w-4 h-4" />
        <span>Danh Mục Sản Phẩm</span>
        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[720px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 flex overflow-hidden animate-in fade-in slide-in-from-top-1">
          {/* Level 1 Sidebar */}
          <div className="w-64 bg-slate-50 p-3 border-r border-slate-100 space-y-1">
            <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tất cả danh mục
            </div>
            {categories.map((cat) => {
              const Icon = getIconForCategory(cat.name);
              const isSelected = activeCategory?.id === cat.id;

              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setActiveCategory(cat)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                      : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{cat.name}</span>
                  </div>
                  {cat.children && cat.children.length > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Level 2 & Level 3 Panel */}
          <div className="flex-1 p-6">
            {activeCategory ? (
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900">{activeCategory.name}</h3>
                  </div>
                  <Link
                    to={`/?categoryId=${activeCategory.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Xem tất cả &rarr;
                  </Link>
                </div>

                {activeCategory.children && activeCategory.children.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {activeCategory.children.map((subCat) => (
                      <div key={subCat.id} className="p-3 rounded-xl bg-slate-50/70 hover:bg-indigo-50/50 transition-colors">
                        <Link
                          to={`/?categoryId=${subCat.id}`}
                          className="font-semibold text-sm text-slate-800 hover:text-indigo-600 block mb-1"
                        >
                          {subCat.name}
                        </Link>
                        {subCat.attributeSchema && subCat.attributeSchema.length > 0 && (
                          <div className="text-xs text-slate-500">
                            Đặc điểm: {subCat.attributeSchema.map((s) => s.label).join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 py-6 text-center">
                    Chưa có danh mục con trực thuộc
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-12">
                <Grid className="w-8 h-8 mb-2 text-slate-300" />
                <span>Rê chuột vào một danh mục bên trái để khám phá</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
