# Hệ thống Quản lý Sản phẩm - Admin

Hệ thống quản lý sản phẩm được xây dựng dựa trên backend API và sử dụng kiến trúc hiện đại với React, Ant Design và các custom hooks.

## Tính năng chính

### 1. Danh sách sản phẩm (`/products`)

- Hiển thị tất cả sản phẩm với hình ảnh, tên, danh mục, giá
- Tìm kiếm theo tên và mô tả sản phẩm
- Lọc theo danh mục
- Phân trang và tùy chỉnh số item/trang
- Hành động: Xem, Chỉnh sửa, Xóa

### 2. Thêm sản phẩm mới (`/products/add`)

- Form nhập thông tin sản phẩm cơ bản
- Upload nhiều hình ảnh với drag & drop
- Chọn danh mục từ dropdown
- Cài đặt trạng thái hoạt động và nổi bật
- Validation form và file upload

### 3. Chỉnh sửa sản phẩm (`/products/edit/:id`)

- Tương tự như thêm mới nhưng có dữ liệu sẵn
- Quản lý hình ảnh hiện tại (xóa, thêm mới)
- Cập nhật thông tin sản phẩm

## Cấu trúc Backend API

### Product Model

- **id**: ID sản phẩm
- **name**: Tên sản phẩm
- **slug**: URL slug (tự động tạo)
- **description**: Mô tả ngắn
- **content**: Nội dung chi tiết (HTML)
- **isActive**: Trạng thái hoạt động
- **isFeatured**: Sản phẩm nổi bật
- **media[]**: Danh sách hình ảnh
- **variants[]**: Biến thể sản phẩm (giá, SKU, inventory)
- **categories[]**: Danh mục liên kết

### API Endpoints

- `GET /api/product/list` - Lấy danh sách sản phẩm
- `POST /api/product/add` - Thêm sản phẩm mới (multipart/form-data)
- `GET /api/product/:id` - Lấy chi tiết sản phẩm
- `PATCH /api/product/:id` - Cập nhật sản phẩm
- `DELETE /api/product/:id` - Xóa sản phẩm
- `POST /api/product/:id/media` - Thêm hình ảnh
- `DELETE /api/product/:id/media/:mediaId` - Xóa hình ảnh
- `PUT /api/product/:id/categories` - Cập nhật danh mục

## Cấu trúc Frontend

### Components

```
src/pages/Products/
├── ProductsList.jsx     # Danh sách sản phẩm
├── ProductsList.css
├── ProductsAdd.jsx      # Thêm sản phẩm
├── ProductsAdd.css
├── ProductsEdit.jsx     # Chỉnh sửa sản phẩm
├── ProductsEdit.css
└── index.js            # Export components
```

### Hooks

```
src/hooks/useProducts.js  # Custom hook quản lý products
```

### API Layer

```
src/api/products.js      # API client cho products
```

## Routing

### Cấu trúc Route

- `/products` - Danh sách sản phẩm (default)
- `/products/add` - Thêm sản phẩm mới
- `/products/edit/:id` - Chỉnh sửa sản phẩm

### Navigation Menu

- **Products**
  - Danh sách
  - Thêm mới

## Tính năng nâng cao

### 1. Upload hình ảnh

- Hỗ trợ drag & drop
- Nhiều file cùng lúc
- Preview trước khi upload
- Validation file type và size
- Cloudinary integration (backend)

### 2. Quản lý danh mục

- Select dropdown với danh mục có sẵn
- Có thể chọn hoặc không chọn danh mục

### 3. Trạng thái sản phẩm

- **isActive**: Hiển thị/ẩn sản phẩm
- **isFeatured**: Sản phẩm nổi bật

### 4. Validation

- Required fields
- Price validation (số hợp lệ)
- File upload validation
- Form validation với Ant Design

## Responsive Design

- Mobile-first design
- Tablet và desktop optimization
- Grid layout responsive
- Touch-friendly UI

## Performance

- Lazy loading images
- Optimized API calls
- Debounced search
- Pagination
- Efficient re-renders với custom hooks

## Cách sử dụng

### 1. Thêm sản phẩm mới

1. Click "Thêm sản phẩm" từ menu hoặc danh sách
2. Điền thông tin cơ bản (tên, mô tả, giá)
3. Chọn danh mục (tùy chọn)
4. Upload hình ảnh (drag & drop hoặc click)
5. Cài đặt trạng thái
6. Click "Lưu sản phẩm"

### 2. Chỉnh sửa sản phẩm

1. Click icon chỉnh sửa từ danh sách
2. Cập nhật thông tin cần thiết
3. Quản lý hình ảnh (xóa cũ, thêm mới)
4. Click "Cập nhật"

### 3. Xóa sản phẩm

1. Click icon xóa từ danh sách
2. Xác nhận xóa trong popup

## Lưu ý kỹ thuật

### Backend Integration

- Sử dụng FormData cho file upload
- JWT authentication headers
- Error handling với try-catch
- Success/error notifications

### State Management

- Custom hooks pattern
- React Context cho auth
- Local state cho UI
- Server state với API calls

### Styling

- CSS Variables cho theming
- Ant Design components
- Custom CSS cho responsive
- Animation transitions

## Troubleshooting

### Lỗi thường gặp

1. **File upload fails**: Kiểm tra file size (<5MB) và format
2. **API errors**: Kiểm tra authentication token
3. **Images not showing**: Kiểm tra Cloudinary config
4. **Routing issues**: Kiểm tra React Router setup

### Debug

- Sử dụng browser dev tools
- Check console logs
- Network tab cho API calls
- React Developer Tools

## Future Enhancements

- Product variants management
- Inventory tracking
- Bulk operations
- Advanced search filters
- Image optimization
- SEO meta fields
