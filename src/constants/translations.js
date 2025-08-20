// Vietnamese translations for Admin
export const ADMIN_VI_TRANSLATIONS = {
  // Navigation
  dashboard: "Bảng điều khiển",
  addItem: "Thêm món",
  listItems: "Danh sách món", 
  orders: "Đơn hàng",
  analytics: "Thống kê",
  settings: "Cài đặt",
  logout: "Đăng xuất",
  
  // Add Item Page
  addItems: "Thêm món ăn",
  uploadImage: "Tải ảnh lên",
  productName: "Tên sản phẩm",
  productDescription: "Mô tả sản phẩm",
  productCategory: "Danh mục sản phẩm", 
  productPrice: "Giá sản phẩm",
  selectCategory: "Chọn danh mục",
  enterProductName: "Nhập tên sản phẩm",
  enterProductDescription: "Nhập mô tả sản phẩm",
  enterProductPrice: "Nhập giá sản phẩm",
  add: "Thêm",
  
  // List Items Page
  allFoodsList: "Tất cả danh sách món ăn",
  image: "Hình ảnh",
  name: "Tên",
  category: "Danh mục", 
  price: "Giá",
  action: "Hành động",
  edit: "Sửa",
  delete: "Xóa",
  
  // Edit Item Modal
  editItem: "Chỉnh sửa món ăn",
  change: "Thay đổi",
  cancel: "Hủy",
  
  // Orders Page
  allOrders: "Tất cả đơn hàng",
  orderItems: "Món đã đặt",
  customerName: "Tên khách hàng",
  customerAddress: "Địa chỉ khách hàng", 
  orderStatus: "Trạng thái đơn hàng",
  orderTotal: "Tổng đơn hàng",
  orderDate: "Ngày đặt",
  
  // Order Status
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận", 
  preparing: "Đang chuẩn bị",
  outForDelivery: "Đang giao hàng",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  
  // Categories
  salad: "Salad",
  rolls: "Cuộn", 
  deserts: "Tráng miệng",
  sandwich: "Bánh mì",
  cake: "Bánh ngọt",
  pureVeg: "Chay",
  pasta: "Mì Ý", 
  noodles: "Mì",
  
  // Messages
  itemAddedSuccessfully: "Đã thêm món ăn thành công",
  itemUpdatedSuccessfully: "Đã cập nhật món ăn thành công",
  itemDeletedSuccessfully: "Đã xóa món ăn thành công",
  orderStatusUpdated: "Đã cập nhật trạng thái đơn hàng",
  error: "Có lỗi xảy ra",
  loading: "Đang tải...",
  noItemsFound: "Không tìm thấy món ăn nào",
  noOrdersFound: "Không tìm thấy đơn hàng nào",
  confirmDelete: "Bạn có chắc chắn muốn xóa món ăn này không?",
  
  // Form validation
  nameRequired: "Tên món ăn là bắt buộc",
  descriptionRequired: "Mô tả món ăn là bắt buộc", 
  priceRequired: "Giá món ăn là bắt buộc",
  categoryRequired: "Danh mục món ăn là bắt buộc",
  imageRequired: "Hình ảnh món ăn là bắt buộc",
  invalidPrice: "Giá không hợp lệ",
  priceGreaterThanZero: "Giá phải lớn hơn 0",
  
  // File upload
  selectImage: "Chọn hình ảnh",
  dragDropImage: "Kéo và thả hình ảnh vào đây",
  supportedFormats: "Hỗ trợ: JPG, PNG, JPEG",
  maxFileSize: "Kích thước tối đa: 5MB",
  imageUploaded: "Đã tải lên hình ảnh",
  
  // Search and filter
  search: "Tìm kiếm",
  searchByName: "Tìm kiếm theo tên",
  filterByCategory: "Lọc theo danh mục",
  allCategories: "Tất cả danh mục",
  sortBy: "Sắp xếp theo",
  nameAZ: "Tên A-Z",
  nameZA: "Tên Z-A", 
  priceLowHigh: "Giá thấp đến cao",
  priceHighLow: "Giá cao đến thấp",
  newest: "Mới nhất",
  oldest: "Cũ nhất",
  
  // Pagination
  previous: "Trước",
  next: "Sau",
  page: "Trang",
  of: "của",
  itemsPerPage: "món/trang",
  showingResults: "Hiển thị",
  to: "đến",
  totalResults: "tổng cộng",
  results: "kết quả",
  
  // Dashboard
  totalOrders: "Tổng đơn hàng",
  totalRevenue: "Tổng doanh thu", 
  totalCustomers: "Tổng khách hàng",
  totalProducts: "Tổng sản phẩm",
  recentOrders: "Đơn hàng gần đây",
  topSellingItems: "Món bán chạy",
  salesChart: "Biểu đồ doanh số",
  
  // Time periods
  today: "Hôm nay",
  yesterday: "Hôm qua",
  thisWeek: "Tuần này", 
  lastWeek: "Tuần trước",
  thisMonth: "Tháng này",
  lastMonth: "Tháng trước",
  
  // Currency and formatting
  currency: "₫",
  free: "Miễn phí",
  
  // Common actions
  save: "Lưu",
  reset: "Đặt lại",
  confirm: "Xác nhận",
  close: "Đóng",
  back: "Quay lại",
  continue: "Tiếp tục",
  refresh: "Làm mới",
  export: "Xuất",
  import: "Nhập",
  print: "In"
};

// Helper function to format currency for admin
export const formatAdminCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};
