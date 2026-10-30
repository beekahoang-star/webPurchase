# WebPurchase - Modular Monolith E-Commerce Platform

Dự án Thương mại Điện tử chuẩn **Production-Ready** theo mô hình **Modular Monolith (Domain-Driven Design)**, tích hợp Spring Boot 3.3, Java 21, PostgreSQL 16 JSONB & GIN Index, Redis, RabbitMQ, và React 18+ (Vite, Tailwind, Zustand).

---

## 1. Kiến Trúc & Tech Stack

- **Kiến trúc tổng thể**: Modular Monolith (DDD). Giao tiếp nội bộ giữa các bounded contexts (`catalog`, `inventory`, `order`, `notification`) hoàn toàn qua **Spring Application Events** và xử lý bất đồng bộ qua **RabbitMQ**.
- **Backend**: Java 21 LTS, Spring Boot 3.3.4, Spring Security 6 (JWT + RBAC).
- **Cơ sở dữ liệu & ORM**: PostgreSQL 16+ với các cột `JSONB` đánh chỉ mục `GIN Index`, Spring Data JPA (Hibernate 6), Flyway Migration.
- **Hạ tầng phụ trợ**: 
  - **Redis 7**: Cache cây danh mục Mega Menu, session, giỏ hàng.
  - **RabbitMQ 3**: Broker sự kiện bất đồng bộ khi phát sinh đơn hàng (`order.created`).
  - **MinIO**: S3-compatible Object Storage.
- **Frontend**: React 18+ (Vite), React Router v6, TanStack Query, Zustand, Tailwind CSS, Lucide Icons.
- **Realtime Notifications**: Server-Sent Events (SSE) stream đẩy thông báo đơn hàng và Live Counter Badges về Admin Dashboard trong thời gian thực.

---

## 2. Quy Chuẩn Core Database & Concurrency

| Bounded Context | Bảng | Đặc tả kỹ thuật & Quy chuẩn |
|---|---|---|
| **Categories** | `categories` | Đệ quy đa cấp (`parent_id`), cột `attribute_schema JSONB` tự động sinh Dynamic Form UI và định nghĩa thuộc tính sản phẩm. |
| **SPU Products** | `spu_products` | Cột `attributes JSONB` đánh chỉ mục **GIN Index** (`idx_spu_attributes_gin`), cho phép lọc động đa thuộc tính (RAM, Brand, Screen) với tốc độ cao. |
| **SKU Variants** | `sku_variants` | Cột `options JSONB` lưu tổ hợp màu sắc, dung lượng, phiên bản; độc lập giá bán và ảnh đại diện. |
| **Inventory** | `inventory_items` | Tách biệt `stock_on_hand` (tồn thực) và `stock_reserved` (tồn giữ chỗ). Áp dụng **Optimistic Locking (`@Version`)** với thuật toán Retry tự động chống bán lố (overselling) và Race Condition khi lưu lượng cao. |
| **Orders** | `orders`, `order_items` | Cột `variant_snapshot JSONB` **đóng băng dữ liệu** sản phẩm, phân loại, giá bán tại đúng thời điểm thanh toán nhằm bảo toàn lịch sử đơn hàng. |

---

## 3. UX/UI & Điều Hướng

### Storefront
1. **Sticky Header**: Thanh điều hướng bám đỉnh, tích hợp chọn danh mục Mega Menu và Mini-Cart widget.
2. **Smart Search**: Tìm kiếm thông minh với cơ chế **Debounce 300ms**, tự động gợi ý sản phẩm (Auto-suggest dropdown), xem trước ảnh và giá.
3. **Mega Menu**: Đọc trực tiếp từ cache Redis, phân cấp đa tầng từ danh mục gốc đến danh mục con.
4. **Mini-Cart Widget**: Slide-over Drawer với Realtime Badge phản ánh số lượng và tính tạm tính theo thời gian thực.
5. **Dynamic Variant Selector**: Tự động nhận diện các options trong SKU (Màu sắc, Dung lượng, Bộ nhớ) và chuyển đổi giá/tồn kho tương ứng.

### Admin Dashboard
1. **Sidebar Thu Gọn (Collapsible)**: Thu phóng 2 trạng thái với component `<PermissionGate>` ẩn/hiện menu theo quyền RBAC (`CATALOG_READ`, `ORDER_READ`, etc.).
2. **Live Counter Badges**: Huy hiệu đếm số đơn hàng chờ xử lý được đồng bộ hóa tức thời qua luồng **Server-Sent Events (SSE)**.
3. **Global Command Search (Cmd/Ctrl + K)**: Hộp thoại tìm kiếm lệnh toàn hệ thống, hỗ trợ phím tắt điều hướng nhanh.
4. **Dynamic Form UI Preview & Schema Editor**: Trực tiếp thêm/bớt trường thuộc tính động JSONB cho danh mục và xem trước form nhập liệu.

---

## 4. Hướng Dẫn Cài Đặt & Khởi Chạy

### Bước 1: Khởi động Hạ tầng Docker (Postgres, Redis, RabbitMQ, MinIO)
```bash
docker compose up -d
```
- **PostgreSQL**: `localhost:5432` (db: `webpurchase_db`, user: `postgres`, pass: `postgrespassword`)
- **Redis**: `localhost:6379` (pass: `redispassword`)
- **RabbitMQ Management**: `http://localhost:15672` (user: `rabbitmq`, pass: `rabbitmqpassword`)

### Bước 2: Chạy Backend Spring Boot 3
```bash
cd backend
mvn spring-boot:run
```
*(Backend sẽ tự động chạy Flyway Migration `V1__init_core_schema.sql` để tạo schema, GIN index và nạp sẵn dữ liệu mẫu).*

### Bước 3: Chạy Frontend React (Vite)
```bash
cd frontend
npm install
npm run dev
```
Truy cập: `http://localhost:5173`

---

## 5. Tài Khoản Mẫu (Seed Accounts)

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn (Permissions) |
|---|---|---|---|
| **System Admin** | `admin` | `Admin@123` | Toàn quyền (Bypass mọi `<PermissionGate>`) |
| **Customer** | `customer1` | `User@123` | Mua hàng, xem đơn hàng, duyệt catalog |

---

## 6. Định Dạng Chuẩn Exception & Response

Tất cả các API tuân thủ format thống nhất:
```json
{
  "code": "SUCCESS",
  "message": "Operation completed successfully",
  "data": { ... }
}
```
Khi có lỗi hoặc xung đột tồn kho:
```json
{
  "code": "ERR_303",
  "message": "Inventory update conflict detected due to high concurrency. Please retry.",
  "data": null
}
```
