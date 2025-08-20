import axios from "axios";
import { message } from "antd";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
      message.error("Phiên đăng nhập đã hết hạn");
    } else if (response?.status === 403) {
      message.error("Bạn không có quyền thực hiện thao tác này");
    } else if (response?.status === 500) {
      message.error("Lỗi server. Vui lòng thử lại sau");
    } else if (!response) {
      message.error("Không thể kết nối đến server");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
