export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface AttributeSchemaItem {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
}

export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  attributeSchema: AttributeSchemaItem[];
  level: number;
  sortOrder: number;
  active: boolean;
  children?: Category[];
}

export interface SkuVariant {
  id: number;
  spuId: number;
  skuCode: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  options: Record<string, string>;
  imageUrl?: string;
  active: boolean;
  stockOnHand: number;
  stockReserved: number;
  availableStock: number;
}

export interface SpuProduct {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug?: string;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl: string;
  attributes: Record<string, any>;
  status: string;
  minPrice?: number;
  maxPrice?: number;
  totalStock?: number;
  createdAt?: string;
  variants?: SkuVariant[];
}

export interface CartItem {
  skuId: number;
  spuId: number;
  spuName: string;
  skuCode: string;
  price: number;
  quantity: number;
  options: Record<string, string>;
  imageUrl?: string;
  availableStock: number;
}

export interface OrderItem {
  id: number;
  skuId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variantSnapshot: {
    spu_id?: number;
    spu_name?: string;
    sku_code?: string;
    unit_price?: number;
    options?: Record<string, string>;
    attributes?: Record<string, any>;
    image_url?: string;
  };
}

export interface Order {
  id: number;
  orderCode: string;
  userId?: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  roles: string[];
  permissions: string[];
}
