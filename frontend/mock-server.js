// Lightweight Native Node.js Backend API Server (Port 8080)
// Implements exact Spring Boot REST endpoints, JSONB data, Optimistic Locking, and SSE stream.
import http from 'http';

const PORT = 8080;

// State mimicking PostgreSQL & Redis
let categories = [
  {
    id: 1,
    parentId: null,
    name: 'Thiết Bị Điện Tử',
    slug: 'thiet-bi-dien-tu',
    level: 1,
    sortOrder: 1,
    active: true,
    attributeSchema: [
      { name: 'warranty_months', label: 'Bảo hành (tháng)', type: 'number', required: true }
    ],
    children: [
      {
        id: 2,
        parentId: 1,
        name: 'Điện Thoại Di Động',
        slug: 'dien-thoai-di-dong',
        level: 2,
        sortOrder: 1,
        active: true,
        attributeSchema: [
          { name: 'brand', label: 'Thương hiệu', type: 'select', options: ['Apple', 'Samsung', 'Xiaomi'], required: true },
          { name: 'ram', label: 'RAM', type: 'select', options: ['8GB', '12GB', '16GB'], required: true },
          { name: 'storage', label: 'Bộ nhớ trong', type: 'select', options: ['128GB', '256GB', '512GB', '1TB'], required: true },
          { name: 'screen_size', label: 'Kích thước màn hình', type: 'text', required: false }
        ]
      },
      {
        id: 3,
        parentId: 1,
        name: 'Laptop & Máy Tính',
        slug: 'laptop-may-tinh',
        level: 2,
        sortOrder: 2,
        active: true,
        attributeSchema: [
          { name: 'cpu', label: 'Bộ vi xử lý (CPU)', type: 'text', required: true },
          { name: 'gpu', label: 'Card đồ họa (GPU)', type: 'text', required: false },
          { name: 'ram', label: 'RAM', type: 'select', options: ['16GB', '32GB', '64GB'], required: true }
        ]
      }
    ]
  }
];

let products = [
  {
    id: 1,
    categoryId: 2,
    categoryName: 'Điện Thoại Di Động',
    categorySlug: 'dien-thoai-di-dong',
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description: 'Flagship hàng đầu của Apple với chip A17 Pro và khung viền Titan siêu bền.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    attributes: {
      brand: 'Apple',
      chip: 'Apple A17 Pro',
      screen_size: '6.7 inch Super Retina XDR OLED',
      connectivity: ['5G', 'Wi-Fi 6E', 'USB-C 3.0']
    },
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    variants: [
      {
        id: 1,
        spuId: 1,
        skuCode: 'IP15PM-256-NAT',
        barcode: '8930001001',
        price: 29990000,
        compareAtPrice: 34990000,
        options: { color: 'Titan Tự Nhiên', storage: '256GB' },
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        active: true,
        stockOnHand: 50,
        stockReserved: 2,
        availableStock: 48,
        version: 0
      },
      {
        id: 2,
        spuId: 1,
        skuCode: 'IP15PM-512-NAT',
        barcode: '8930001002',
        price: 35990000,
        compareAtPrice: 40990000,
        options: { color: 'Titan Tự Nhiên', storage: '512GB' },
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        active: true,
        stockOnHand: 30,
        stockReserved: 0,
        availableStock: 30,
        version: 0
      },
      {
        id: 3,
        spuId: 1,
        skuCode: 'IP15PM-256-BLU',
        barcode: '8930001003',
        price: 29990000,
        compareAtPrice: 34990000,
        options: { color: 'Titan Xanh', storage: '256GB' },
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        active: true,
        stockOnHand: 40,
        stockReserved: 1,
        availableStock: 39,
        version: 0
      }
    ]
  },
  {
    id: 2,
    categoryId: 2,
    categoryName: 'Điện Thoại Di Động',
    categorySlug: 'dien-thoai-di-dong',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Quyền năng AI trong tầm tay với vi xử lý Snapdragon 8 Gen 3 và bút S-Pen tích hợp.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    attributes: {
      brand: 'Samsung',
      chip: 'Snapdragon 8 Gen 3',
      screen_size: '6.8 inch Dynamic AMOLED 2X',
      connectivity: ['5G', 'Wi-Fi 7', 'USB-C']
    },
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    variants: [
      {
        id: 4,
        spuId: 2,
        skuCode: 'S24U-256-GRY',
        barcode: '8930002001',
        price: 27990000,
        compareAtPrice: 31990000,
        options: { color: 'Xám Titan', storage: '256GB' },
        imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
        active: true,
        stockOnHand: 35,
        stockReserved: 3,
        availableStock: 32,
        version: 0
      },
      {
        id: 5,
        spuId: 2,
        skuCode: 'S24U-512-BLK',
        barcode: '8930002002',
        price: 32990000,
        compareAtPrice: 36990000,
        options: { color: 'Đen Titan', storage: '512GB' },
        imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
        active: true,
        stockOnHand: 25,
        stockReserved: 0,
        availableStock: 25,
        version: 0
      }
    ]
  },
  {
    id: 3,
    categoryId: 3,
    categoryName: 'Laptop & Máy Tính',
    categorySlug: 'laptop-may-tinh',
    name: 'MacBook Pro 16 M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'Cỗ máy trạm di động mạnh mẽ nhất dành cho chuyên gia sáng tạo nội dung.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    attributes: {
      brand: 'Apple',
      cpu: 'Apple M3 Max 16-Core',
      gpu: '40-Core GPU',
      screen_size: '16.2 inch Liquid Retina XDR'
    },
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    variants: [
      {
        id: 6,
        spuId: 3,
        skuCode: 'MBP16-M3M-48G',
        barcode: '8930003001',
        price: 89990000,
        compareAtPrice: 95990000,
        options: { ram: '48GB', storage: '1TB', color: 'Space Black' },
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        active: true,
        stockOnHand: 15,
        stockReserved: 1,
        availableStock: 14,
        version: 0
      }
    ]
  }
];

let orders = [
  {
    id: 1,
    orderCode: 'ORD-20261029-001',
    customerName: 'Nguyen Van A',
    customerEmail: 'customer@webpurchase.com',
    customerPhone: '0912345678',
    shippingAddress: '123 Nguyen Hue, Quan 1, TP.HCM',
    paymentMethod: 'VNPAY',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    totalAmount: 29990000,
    notes: 'Giao gio hanh chinh',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    items: [
      {
        id: 1,
        skuId: 1,
        quantity: 1,
        unitPrice: 29990000,
        subtotal: 29990000,
        variantSnapshot: {
          spu_id: 1,
          spu_name: 'iPhone 15 Pro Max',
          sku_code: 'IP15PM-256-NAT',
          unit_price: 29990000,
          options: { color: 'Titan Tự Nhiên', storage: '256GB' },
          attributes: { brand: 'Apple', chip: 'Apple A17 Pro' },
          image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'
        }
      }
    ]
  },
  {
    id: 2,
    orderCode: 'ORD-20261029-002',
    customerName: 'Tran Thi B',
    customerEmail: 'tranthib@gmail.com',
    customerPhone: '0987654321',
    shippingAddress: '456 Le Duan, Ba Dinh, Ha Noi',
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    status: 'PROCESSING',
    totalAmount: 35990000,
    notes: 'Goi truoc khi giao',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      {
        id: 2,
        skuId: 2,
        quantity: 1,
        unitPrice: 35990000,
        subtotal: 35990000,
        variantSnapshot: {
          spu_id: 1,
          spu_name: 'iPhone 15 Pro Max',
          sku_code: 'IP15PM-512-NAT',
          unit_price: 35990000,
          options: { color: 'Titan Tự Nhiên', storage: '512GB' },
          attributes: { brand: 'Apple', chip: 'Apple A17 Pro' },
          image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'
        }
      }
    ]
  }
];

// SSE subscribers list
const sseClients = [];

function broadcastSSE(eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // SSE Stream
  if (pathname === '/api/v1/notifications/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`event: INIT\ndata: "Connected to WebPurchase Realtime Notification Stream"\n\n`);
    sseClients.push(res);

    req.on('close', () => {
      const index = sseClients.indexOf(res);
      if (index !== -1) sseClients.splice(index, 1);
    });
    return;
  }

  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const getBody = () =>
    new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });

  // Endpoints Routing
  (async () => {
    // 1. Categories
    if (req.method === 'GET' && pathname === '/api/v1/categories') {
      return sendJson(200, { code: 'SUCCESS', message: 'OK', data: categories });
    }

    if (req.method === 'PUT' && pathname.startsWith('/api/v1/categories/')) {
      const id = Number(pathname.split('/').pop());
      const body = await getBody();
      const updateNode = (list) => {
        for (const item of list) {
          if (item.id === id) {
            item.name = body.name || item.name;
            item.slug = body.slug || item.slug;
            if (body.attributeSchema) item.attributeSchema = body.attributeSchema;
            return item;
          }
          if (item.children) {
            const found = updateNode(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      const updated = updateNode(categories);
      return sendJson(200, { code: 'SUCCESS', message: 'Category updated', data: updated });
    }

    // 2. Products Suggest (Smart Search 300ms)
    if (req.method === 'GET' && pathname === '/api/v1/products/suggest') {
      const keyword = (url.searchParams.get('keyword') || '').toLowerCase();
      const matches = products.filter(
        (p) => p.name.toLowerCase().includes(keyword) || p.slug.includes(keyword)
      );
      const resData = matches.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryName: p.categoryName,
        thumbnailUrl: p.thumbnailUrl,
        minPrice: p.variants?.[0]?.price || 0,
        totalStock: p.variants?.reduce((sum, v) => sum + v.availableStock, 0) || 0,
      }));
      return sendJson(200, { code: 'SUCCESS', message: 'OK', data: resData });
    }

    // 3. Products List (Filter by Category & JSONB Attributes)
    if (req.method === 'GET' && pathname === '/api/v1/products') {
      const categoryId = url.searchParams.get('categoryId');
      const brand = url.searchParams.get('brand');
      const ram = url.searchParams.get('ram');
      const storage = url.searchParams.get('storage');

      let filtered = [...products];
      if (categoryId) {
        filtered = filtered.filter((p) => p.categoryId === Number(categoryId));
      }
      if (brand) {
        filtered = filtered.filter((p) => p.attributes?.brand === brand);
      }
      if (ram) {
        filtered = filtered.filter((p) =>
          p.variants?.some((v) => v.options?.ram === ram)
        );
      }
      if (storage) {
        filtered = filtered.filter((p) =>
          p.variants?.some((v) => v.options?.storage === storage)
        );
      }

      const content = filtered.map((p) => {
        const prices = p.variants?.map((v) => v.price) || [0];
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const totalStock = p.variants?.reduce((sum, v) => sum + v.availableStock, 0) || 0;
        return {
          id: p.id,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          name: p.name,
          slug: p.slug,
          thumbnailUrl: p.thumbnailUrl,
          attributes: p.attributes,
          status: p.status,
          minPrice,
          maxPrice,
          totalStock,
          createdAt: p.createdAt,
        };
      });

      return sendJson(200, {
        code: 'SUCCESS',
        message: 'OK',
        data: { content, totalElements: content.length },
      });
    }

    // 4. Product Detail by Slug
    if (req.method === 'GET' && pathname.startsWith('/api/v1/products/')) {
      const slug = pathname.replace('/api/v1/products/', '');
      const prod = products.find((p) => p.slug === slug);
      if (!prod) {
        return sendJson(404, { code: 'ERR_201', message: 'Product not found', data: null });
      }
      return sendJson(200, { code: 'SUCCESS', message: 'OK', data: prod });
    }

    // 5. Create Product (SPU & SKU)
    if (req.method === 'POST' && pathname === '/api/v1/products') {
      const body = await getBody();
      const newId = products.length + 1;
      const category = categories[0]?.children?.find((c) => c.id === body.categoryId) || categories[0];
      const newProd = {
        id: newId,
        categoryId: body.categoryId,
        categoryName: category?.name || 'Sản phẩm mới',
        name: body.name,
        slug: body.slug,
        description: body.description,
        thumbnailUrl: body.thumbnailUrl,
        attributes: body.attributes || {},
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        variants: (body.variants || []).map((v, idx) => ({
          id: newId * 10 + idx,
          spuId: newId,
          skuCode: v.skuCode,
          price: v.price,
          options: v.options || {},
          imageUrl: v.imageUrl || body.thumbnailUrl,
          active: true,
          stockOnHand: v.initialStock || 10,
          stockReserved: 0,
          availableStock: v.initialStock || 10,
          version: 0,
        })),
      };
      products.unshift(newProd);
      return sendJson(201, { code: 'SUCCESS', message: 'Created', data: newProd });
    }

    // 6. Create Order (Optimistic Inventory Locking + Variant Snapshot JSONB)
    if (req.method === 'POST' && pathname === '/api/v1/orders') {
      const body = await getBody();
      const orderCode = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      let runningTotal = 0;
      const orderItems = [];

      for (const itemReq of body.items || []) {
        // Find variant across products
        let targetVariant = null;
        let targetSpu = null;
        for (const p of products) {
          const v = p.variants?.find((varItem) => varItem.id === itemReq.skuId);
          if (v) {
            targetVariant = v;
            targetSpu = p;
            break;
          }
        }

        if (!targetVariant) {
          return sendJson(404, { code: 'ERR_202', message: `SKU ${itemReq.skuId} not found`, data: null });
        }

        // Optimistic Locking check
        if (targetVariant.availableStock < itemReq.quantity) {
          return sendJson(400, {
            code: 'ERR_302',
            message: `Tồn kho khả dụng (${targetVariant.availableStock}) không đủ đáp ứng số lượng yêu cầu (${itemReq.quantity})`,
            data: null,
          });
        }

        // Reserve stock (Optimistic Locking version bump)
        targetVariant.stockReserved += itemReq.quantity;
        targetVariant.availableStock = targetVariant.stockOnHand - targetVariant.stockReserved;
        targetVariant.version += 1;

        const subtotal = targetVariant.price * itemReq.quantity;
        runningTotal += subtotal;

        // Frozen variant_snapshot JSONB
        const snapshot = {
          spu_id: targetSpu.id,
          spu_name: targetSpu.name,
          sku_code: targetVariant.skuCode,
          unit_price: targetVariant.price,
          options: targetVariant.options,
          attributes: targetSpu.attributes,
          image_url: targetVariant.imageUrl,
        };

        orderItems.push({
          id: Math.floor(Math.random() * 10000),
          skuId: targetVariant.id,
          quantity: itemReq.quantity,
          unitPrice: targetVariant.price,
          subtotal,
          variantSnapshot: snapshot,
        });
      }

      const newOrder = {
        id: orders.length + 1,
        orderCode,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        paymentMethod: body.paymentMethod || 'COD',
        paymentStatus: 'UNPAID',
        status: 'PENDING',
        notes: body.notes || '',
        totalAmount: runningTotal,
        createdAt: new Date().toISOString(),
        items: orderItems,
      };

      orders.unshift(newOrder);

      // Broadcast realtime SSE event to Admin dashboard!
      broadcastSSE('ORDER_ALERT', {
        orderId: newOrder.id,
        orderCode: newOrder.orderCode,
        customerName: newOrder.customerName,
        totalAmount: newOrder.totalAmount,
      });

      return sendJson(201, { code: 'SUCCESS', message: 'Order created', data: newOrder });
    }

    // 7. Get Order by Code
    if (req.method === 'GET' && pathname.startsWith('/api/v1/orders/')) {
      const code = pathname.replace('/api/v1/orders/', '');
      const order = orders.find((o) => o.orderCode === code);
      if (!order) {
        return sendJson(404, { code: 'ERR_401', message: 'Order not found', data: null });
      }
      return sendJson(200, { code: 'SUCCESS', message: 'OK', data: order });
    }

    // 8. Admin List All Orders
    if (req.method === 'GET' && pathname === '/api/v1/admin/orders') {
      return sendJson(200, {
        code: 'SUCCESS',
        message: 'OK',
        data: { content: orders, totalElements: orders.length },
      });
    }

    // 9. Admin Update Order Status
    if (req.method === 'PATCH' && pathname.includes('/status')) {
      const parts = pathname.split('/');
      const orderId = Number(parts[parts.length - 2]);
      const body = await getBody();
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        order.status = body.status;
        if (body.status === 'DELIVERED') {
          // Permanently deduct on-hand and release reserved
          for (const item of order.items) {
            for (const p of products) {
              const v = p.variants?.find((varItem) => varItem.id === item.skuId);
              if (v) {
                v.stockOnHand -= item.quantity;
                v.stockReserved -= item.quantity;
                v.availableStock = v.stockOnHand - v.stockReserved;
                v.version += 1;
              }
            }
          }
        }
      }
      return sendJson(200, { code: 'SUCCESS', message: 'Updated', data: order });
    }

    // 10. IAM Auth Login
    if (req.method === 'POST' && pathname === '/api/v1/auth/login') {
      const body = await getBody();
      const isAdmin = body.username === 'admin';
      const authResponse = {
        accessToken: 'mock_jwt_token_production_ready_' + Date.now(),
        tokenType: 'Bearer',
        userId: isAdmin ? 1 : 2,
        username: body.username,
        email: isAdmin ? 'admin@webpurchase.com' : 'customer@webpurchase.com',
        fullName: isAdmin ? 'System Administrator' : 'Nguyen Van A',
        roles: isAdmin ? ['ROLE_ADMIN'] : ['ROLE_CUSTOMER'],
        permissions: isAdmin
          ? ['CATALOG_READ', 'CATALOG_WRITE', 'ORDER_READ', 'ORDER_WRITE', 'INVENTORY_READ', 'INVENTORY_WRITE', 'USER_MANAGE']
          : ['CATALOG_READ', 'ORDER_READ'],
      };
      return sendJson(200, { code: 'SUCCESS', message: 'Login successful', data: authResponse });
    }

    // Fallback 404
    sendJson(404, { code: 'ERR_NOT_FOUND', message: 'API Route Not Found', data: null });
  })();
});

// Heartbeat for SSE clients
setInterval(() => {
  broadcastSSE('HEARTBEAT', Date.now());
}, 15000);

server.listen(PORT, () => {
  console.log(`[WebPurchase Backend API] listening at http://localhost:${PORT}`);
});
