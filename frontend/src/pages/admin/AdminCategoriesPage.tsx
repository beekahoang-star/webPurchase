import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, ChevronRight, ChevronDown, Check, Layers, Code, Sparkles, Settings } from 'lucide-react';
import { api } from '../../services/api';
import { ApiResponse, Category, AttributeSchemaItem } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'select' | 'boolean'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const fetchCategories = () => {
    api.get<ApiResponse<Category[]>>('/categories')
      .then((res) => {
        const tree = res.data.data || [];
        setCategories(tree);
        if (!selectedCategory && tree.length > 0) {
          // Select first category child or root
          setSelectedCategory(tree[0]?.children?.[0] || tree[0]);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddFieldToSchema = async () => {
    if (!selectedCategory || !newFieldName || !newFieldLabel) return;

    const newField: AttributeSchemaItem = {
      name: newFieldName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
      label: newFieldLabel.trim(),
      type: newFieldType,
      options: newFieldType === 'select' ? newFieldOptions.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      required: true,
    };

    const updatedSchema = [...(selectedCategory.attributeSchema || []), newField];

    try {
      await api.put(`/categories/${selectedCategory.id}`, {
        name: selectedCategory.name,
        slug: selectedCategory.slug,
        attributeSchema: updatedSchema,
      });

      setSelectedCategory({ ...selectedCategory, attributeSchema: updatedSchema });
      fetchCategories();
      setNewFieldName('');
      setNewFieldLabel('');
      setNewFieldOptions('');
    } catch (err) {
      console.error('Failed to update attribute schema JSONB:', err);
      alert('Cập nhật schema thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Cấu Hình Danh Mục & Thuộc Tính Sản Phẩm
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập phân cấp danh mục và các trường thuộc tính đặc trưng cho từng ngành hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Tree Hierarchy */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-indigo-600" />
            Cây Phân Cấp Danh Mục
          </h3>

          <div className="space-y-2">
            {categories.map((root) => (
              <div key={root.id} className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(root)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                    selectedCategory?.id === root.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Level 1: {root.name}
                  </span>
                  <span className="text-[11px] opacity-75">{root.children?.length || 0} mục con</span>
                </button>

                {/* Subcategories (Level 2) */}
                {root.children && root.children.length > 0 && (
                  <div className="pl-6 space-y-1 border-l-2 border-slate-100 ml-4 py-1">
                    {root.children.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedCategory(sub)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedCategory?.id === sub.id
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> {sub.name}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          {sub.attributeSchema?.length || 0} fields
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Form UI & Schema JSONB Editor */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCategory ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Cấu Hình Thuộc Tính Ngành Hàng
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {selectedCategory.name}
                  </h3>
                </div>
                <span className="font-mono text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                  slug: {selectedCategory.slug}
                </span>
              </div>

              {/* Dynamic Form UI Preview */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Mẫu Form Nhập Liệu Tự Động Sinh
                </h4>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  {selectedCategory.attributeSchema && selectedCategory.attributeSchema.length > 0 ? (
                    selectedCategory.attributeSchema.map((field) => (
                      <div key={field.name}>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white">
                            <option value="">-- Chọn {field.label} --</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'number' ? (
                          <input
                            type="number"
                            placeholder={`Nhập ${field.label}...`}
                            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder={`Nhập ${field.label}...`}
                            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        )}
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                          field: {field.name} | type: {field.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-6">
                      Chưa có trường thuộc tính nào được định nghĩa
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Attribute Field to Schema */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Thêm Trường Thuộc Tính Động Mới
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">Tên field (key JSON) *</label>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="vd: battery_capacity"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">Nhãn hiển thị (UI Label) *</label>
                    <input
                      type="text"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="vd: Dung lượng Pin (mAh)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">Kiểu dữ liệu *</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="text">Văn bản (Text)</option>
                      <option value="number">Số (Number)</option>
                      <option value="select">Lựa chọn (Select Dropdown)</option>
                      <option value="boolean">Đúng / Sai (Boolean)</option>
                    </select>
                  </div>
                  {newFieldType === 'select' && (
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">Các lựa chọn (cách nhau dấu phẩy)</label>
                      <input
                        type="text"
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                        placeholder="vd: 5000mAh, 4500mAh, 4000mAh"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddFieldToSchema}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm Thuộc Tính Mới
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
              Chọn một danh mục bên trái để cấu hình thuộc tính
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
