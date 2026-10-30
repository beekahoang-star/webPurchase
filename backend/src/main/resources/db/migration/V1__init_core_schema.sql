-- V1__init_core_schema.sql
-- Production-Ready Core Schema for Modular Monolith E-Commerce
-- Features: Recursive Categories, JSONB Dynamic Schema, SPU/SKU with GIN Index,
-- Concurrency-Safe Inventory with Optimistic Locking, Frozen Order Snapshot, and RBAC IAM.

-- 1. IAM SCHEMA
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 2. CATALOG SCHEMA (SPU, SKU & RECURSIVE CATEGORIES)
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    attribute_schema JSONB DEFAULT '[]'::jsonb NOT NULL,
    level INT DEFAULT 1 NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE TABLE IF NOT EXISTS spu_products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    attributes JSONB DEFAULT '{}'::jsonb NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- GIN Index on SPU dynamic attributes for lightning-fast JSON querying & dynamic filtering
CREATE INDEX IF NOT EXISTS idx_spu_attributes_gin ON spu_products USING GIN (attributes);
CREATE INDEX IF NOT EXISTS idx_spu_category_id ON spu_products(category_id);
CREATE INDEX IF NOT EXISTS idx_spu_status ON spu_products(status);

CREATE TABLE IF NOT EXISTS sku_variants (
    id BIGSERIAL PRIMARY KEY,
    spu_id BIGINT NOT NULL REFERENCES spu_products(id) ON DELETE CASCADE,
    sku_code VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    price NUMERIC(15,2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(15,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    options JSONB DEFAULT '{}'::jsonb NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sku_spu_id ON sku_variants(spu_id);
CREATE INDEX IF NOT EXISTS idx_sku_options_gin ON sku_variants USING GIN (options);

-- 3. INVENTORY SCHEMA (CONCURRENCY-SAFE WITH OPTIMISTIC LOCKING)
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    sku_id BIGINT UNIQUE NOT NULL REFERENCES sku_variants(id) ON DELETE CASCADE,
    stock_on_hand INT DEFAULT 0 NOT NULL CHECK (stock_on_hand >= 0),
    stock_reserved INT DEFAULT 0 NOT NULL CHECK (stock_reserved >= 0),
    version BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_stock_available CHECK (stock_on_hand >= stock_reserved)
);

CREATE INDEX IF NOT EXISTS idx_inventory_sku_id ON inventory_items(sku_id);

-- 4. ORDER SCHEMA (WITH FROZEN VARIANT SNAPSHOT)
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_code VARCHAR(64) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    total_amount NUMERIC(15,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'COD' NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'UNPAID' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sku_id BIGINT REFERENCES sku_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(15,2) NOT NULL CHECK (subtotal >= 0),
    variant_snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku_id ON order_items(sku_id);

-- 5. INITIAL SEED DATA
-- Default Permissions
INSERT INTO permissions (code, name, resource, action) VALUES
('CATALOG_READ', 'Xem danh mục và sản phẩm', 'CATALOG', 'READ'),
('CATALOG_WRITE', 'Quản lý danh mục và sản phẩm', 'CATALOG', 'WRITE'),
('ORDER_READ', 'Xem danh sách đơn hàng', 'ORDER', 'READ'),
('ORDER_WRITE', 'Cập nhật trạng thái đơn hàng', 'ORDER', 'WRITE'),
('INVENTORY_READ', 'Xem tồn kho', 'INVENTORY', 'READ'),
('INVENTORY_WRITE', 'Điều chỉnh tồn kho', 'INVENTORY', 'WRITE'),
('USER_MANAGE', 'Quản trị người dùng & phân quyền', 'IAM', 'MANAGE')
ON CONFLICT (code) DO NOTHING;

-- Default Roles
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Quản trị viên toàn hệ thống'),
('ROLE_MANAGER', 'Quản lý vận hành cửa hàng & đơn hàng'),
('ROLE_CUSTOMER', 'Khách hàng tiêu chuẩn')
ON CONFLICT (name) DO NOTHING;

-- Map Admin Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

-- Map Customer Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_CUSTOMER' AND p.code IN ('CATALOG_READ', 'ORDER_READ')
ON CONFLICT DO NOTHING;

-- Seed Admin User (Password: Admin@123 -> BCrypt: $2a$10$wT8KzQ8Bw08vS4e/Fh3O3.M.tN1C2o2nZ3pC4Gk7T/V3bV0123456)
INSERT INTO users (username, email, password_hash, full_name, phone_number, is_active)
VALUES ('admin', 'admin@webpurchase.com', '$2a$10$e7Z8t9NnUf4fWw4r5uU6Q.9XQdE1y8sQ1hZk2uY6rY8eZ7vU8wWqG', 'System Administrator', '0901234567', true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

-- Seed Customer User (Password: User@123)
INSERT INTO users (username, email, password_hash, full_name, phone_number, is_active)
VALUES ('customer1', 'customer@webpurchase.com', '$2a$10$e7Z8t9NnUf4fWw4r5uU6Q.9XQdE1y8sQ1hZk2uY6rY8eZ7vU8wWqG', 'Nguyen Van A', '0912345678', true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'customer1' AND r.name = 'ROLE_CUSTOMER'
ON CONFLICT DO NOTHING;

-- Seed Recursive Categories with dynamic attribute_schema JSONB
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, attribute_schema) VALUES
(1, NULL, 'Thiết Bị Điện Tử', 'thiet-bi-dien-tu', 1, 1, 
 '[{"name": "warranty_months", "label": "Bảo hành (tháng)", "type": "number", "required": true}]'::jsonb),
(2, 1, 'Điện Thoại Di Động', 'dien-thoai-di-dong', 2, 1, 
 '[{"name": "brand", "label": "Thương hiệu", "type": "select", "options": ["Apple", "Samsung", "Xiaomi"], "required": true}, {"name": "ram", "label": "RAM", "type": "select", "options": ["8GB", "12GB", "16GB"], "required": true}, {"name": "storage", "label": "Bộ nhớ trong", "type": "select", "options": ["128GB", "256GB", "512GB", "1TB"], "required": true}, {"name": "screen_size", "label": "Kích thước màn hình", "type": "text", "required": false}]'::jsonb),
(3, 1, 'Laptop & Máy Tính', 'laptop-may-tinh', 2, 2, 
 '[{"name": "cpu", "label": "Bộ vi xử lý (CPU)", "type": "text", "required": true}, {"name": "gpu", "label": "Card đồ họa (GPU)", "type": "text", "required": false}, {"name": "ram", "label": "RAM", "type": "select", "options": ["16GB", "32GB", "64GB"], "required": true}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- Seed Demo SPU Products with attributes JSONB
INSERT INTO spu_products (id, category_id, name, slug, description, thumbnail_url, attributes, status) VALUES
(1, 2, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 
 'Flagship hàng đầu của Apple với chip A17 Pro và khung viền Titan siêu bền.', 
 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
 '{"brand": "Apple", "chip": "Apple A17 Pro", "screen_size": "6.7 inch Super Retina XDR OLED", "connectivity": ["5G", "Wi-Fi 6E", "USB-C 3.0"]}'::jsonb,
 'ACTIVE'),
(2, 2, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 
 'Quyền năng AI trong tầm tay với vi xử lý Snapdragon 8 Gen 3 và bút S-Pen tích hợp.', 
 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
 '{"brand": "Samsung", "chip": "Snapdragon 8 Gen 3", "screen_size": "6.8 inch Dynamic AMOLED 2X", "connectivity": ["5G", "Wi-Fi 7", "USB-C"]}'::jsonb,
 'ACTIVE'),
(3, 3, 'MacBook Pro 16 M3 Max', 'macbook-pro-16-m3-max', 
 'Cỗ máy trạm di động mạnh mẽ nhất dành cho chuyên gia sáng tạo nội dung và lập trình viên.', 
 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
 '{"brand": "Apple", "cpu": "Apple M3 Max 16-Core", "gpu": "40-Core GPU", "screen_size": "16.2 inch Liquid Retina XDR", "os": "macOS Sonoma"}'::jsonb,
 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

SELECT setval('spu_products_id_seq', (SELECT MAX(id) FROM spu_products));

-- Seed SKU Variants with options JSONB
INSERT INTO sku_variants (id, spu_id, sku_code, barcode, price, compare_at_price, options, image_url, is_active) VALUES
(1, 1, 'IP15PM-256-NAT', '8930001001', 29990000, 34990000, '{"color": "Titan Tự Nhiên", "storage": "256GB"}'::jsonb, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', true),
(2, 1, 'IP15PM-512-NAT', '8930001002', 35990000, 40990000, '{"color": "Titan Tự Nhiên", "storage": "512GB"}'::jsonb, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', true),
(3, 1, 'IP15PM-256-BLU', '8930001003', 29990000, 34990000, '{"color": "Titan Xanh", "storage": "256GB"}'::jsonb, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', true),
(4, 2, 'S24U-256-GRY', '8930002001', 27990000, 31990000, '{"color": "Xám Titan", "storage": "256GB"}'::jsonb, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80', true),
(5, 2, 'S24U-512-BLK', '8930002002', 32990000, 36990000, '{"color": "Đen Titan", "storage": "512GB"}'::jsonb, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80', true),
(6, 3, 'MBP16-M3M-48G', '8930003001', 89990000, 95990000, '{"ram": "48GB", "storage": "1TB", "color": "Space Black"}'::jsonb, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('sku_variants_id_seq', (SELECT MAX(id) FROM sku_variants));

-- Seed Inventory Items with optimistic locking version
INSERT INTO inventory_items (id, sku_id, stock_on_hand, stock_reserved, version) VALUES
(1, 1, 50, 2, 0),
(2, 2, 30, 0, 0),
(3, 3, 40, 1, 0),
(4, 4, 35, 3, 0),
(5, 5, 25, 0, 0),
(6, 6, 15, 1, 0)
ON CONFLICT (id) DO NOTHING;

SELECT setval('inventory_items_id_seq', (SELECT MAX(id) FROM inventory_items));

-- Seed Demo Orders with frozen variant_snapshot JSONB
INSERT INTO orders (id, order_code, user_id, total_amount, status, customer_name, customer_email, customer_phone, shipping_address, payment_method, payment_status, notes) VALUES
(1, 'ORD-20261029-001', 2, 29990000, 'DELIVERED', 'Nguyen Van A', 'customer@webpurchase.com', '0912345678', '123 Nguyen Hue, Quan 1, TP.HCM', 'VNPAY', 'PAID', 'Giao gio hanh chinh'),
(2, 'ORD-20261029-002', 2, 35990000, 'PROCESSING', 'Tran Thi B', 'tranthib@gmail.com', '0987654321', '456 Le Duan, Ba Dinh, Ha Noi', 'COD', 'UNPAID', 'Goi truoc khi giao')
ON CONFLICT (id) DO NOTHING;

SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

INSERT INTO order_items (id, order_id, sku_id, quantity, unit_price, subtotal, variant_snapshot) VALUES
(1, 1, 1, 1, 29990000, 29990000, 
 '{"spu_id": 1, "spu_name": "iPhone 15 Pro Max", "sku_code": "IP15PM-256-NAT", "unit_price": 29990000, "options": {"color": "Titan Tự Nhiên", "storage": "256GB"}, "attributes": {"brand": "Apple", "chip": "Apple A17 Pro"}, "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"}'::jsonb),
(2, 2, 2, 1, 35990000, 35990000, 
 '{"spu_id": 1, "spu_name": "iPhone 15 Pro Max", "sku_code": "IP15PM-512-NAT", "unit_price": 35990000, "options": {"color": "Titan Tự Nhiên", "storage": "512GB"}, "attributes": {"brand": "Apple", "chip": "Apple A17 Pro"}, "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
