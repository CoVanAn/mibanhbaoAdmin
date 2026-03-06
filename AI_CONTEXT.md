# AI_CONTEXT.md

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **State Management:** React Context, custom hooks
- **API Communication:** RESTful (via custom api/ layer)
- **Styling:** CSS Modules, global CSS
- **Testing:** Vitest

## Architecture Overview

- **SPA (Single Page Application)**
- **Component-based structure**
- **Pages:** Organized by feature (categories, login, orders, products, profile)
- **API layer:** src/api/ for backend communication
- **Hooks:** src/hooks/ for data fetching, business logic
- **Context:** AuthContext for authentication state
- **Store:** Zustand (useStore) for user state
- **Schema:** Zod schemas for validation

## Data Flow

1. **User action** → React component → API call (src/api/)
2. **API response** → Hook/context/store updates state
3. **State/context** → UI re-renders

## API Summary

- **Auth:** Login, register, profile, token management
- **User:** Profile info, authentication state
- **Product:** CRUD, media, variants, price management
- **Category:** CRUD
- **Order:** CRUD, status, stats, filtering
- **Cart:** (Not present in Admin)

## State Strategy

- **Auth:** React Context (AuthContext)
- **User:** Zustand store (user.ts)
- **Data:** React Query-like hooks for fetching (useProductQuery, useOrderQuery, etc.)
- **UI State:** Local state in components, modals

## Business Rules

- **Protected routes** for admin pages (ProtectedRoute)
- **Role-based access for admin features**
- **Form validation** via Zod schemas
- **Order management:** Status update, stats, filtering
- **Product management:** Price, variants, media

### Order State Machine (UI)

```
pending → confirmed → shipping → completed
pending → cancelled
```

- Admin có thể chuyển trạng thái order qua các bước trên.
- Khi chuyển sang "confirmed": hiển thị cảnh báo trừ kho.
- Khi chuyển sang "cancelled": hiển thị cảnh báo hoàn kho.

### Permission Matrix (UI)

| Role   | Orders              | Products   | Categories | Promotion |
| ------ | ------------------- | ---------- | ---------- | --------- |
| Admin  | CRUD                | CRUD       | CRUD       | CRUD      |
| Staff  | View, update status | View, edit | View       | View      |
| Viewer | View                | View       | View       | -         |

### Data Model Relationships (UI)

```
Product      1—N Variant
Order        1—N OrderItem
OrderItem    1—1 Product/Variant
Category     1—N Product
User         1—N Order
```

### API Contract Example

// Product API (GET /api/products)
Response:
[
{
"id": "string",
"name": "string",
"categoryId": "string",
"variants": [
{ "id": "string", "name": "string", "price": number }
],
"media": ["url1", "url2"]
}
]

// Order API (PATCH /api/orders/:id)
Request:
{
"status": "confirmed" | "shipping" | "completed" | "cancelled"
}

### UI/UX Flow

- Multi-step form cho thêm/sửa sản phẩm (thông tin, variant, media)
- Modal xác nhận khi thay đổi trạng thái order
- Bulk action: chọn nhiều order để cập nhật trạng thái
- Advanced filter: lọc order theo trạng thái, ngày, user

## Current Modules

- **Components:** Auth, common, forms, layout
- **Pages:** categories, login, orders (over/view), products (add/edit/list/view), profile
- **API:** auth, categories, client, orders, products
- **Hooks:** useApi, useAuthQuery, useCategoryQuery, useOrderQuery, useProductQuery, useVariants
- **Context:** AuthContext
- **Store:** user, useStore
- **Schema:** auth, category, order, product
- **Utils:** constants, helpers, validators
- **Styles:** CSS modules, global styles
- **Test:** App.test.tsx, setup.ts

## Planned Features

- Promotion management UI (tạo, sửa, áp dụng coupon/discount cho order)
- Order analytics dashboard (biểu đồ, thống kê theo trạng thái, doanh thu)
- Bulk product import/export (Excel/CSV)
- Advanced filtering/search for orders/products (multi-field, multi-status)
- Coupon management (tạo, kiểm tra, áp dụng coupon cho order)
