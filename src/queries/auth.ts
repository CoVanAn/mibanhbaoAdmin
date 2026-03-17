import axios from "axios";
import apiClient, { setAccessToken, clearAccessToken } from "../lib/api";
import { parseUser } from "../schema/auth.schema";
import { API_URL } from "../constants/api";
/**
 * Login with email and password
 */
export async function login(email: string, password: string) {
  const response = await apiClient.post("/api/user/login", {
    email,
    password,
  }, { headers: { "x-client-type": "admin" } });

  if (response.data.success && response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }

  return response.data;
}

/**
 * Logout
 */
export async function logout() {
  try {
    const response = await apiClient.post("/api/user/logout", {}, { headers: { "x-client-type": "admin" } });
    return response.data;
  } finally {
    clearAccessToken();
  }
}

/**
 * Refresh access token - uses raw axios to avoid interceptor loop
 */
export async function refreshToken() {
  // Use raw axios instead of apiClient to avoid interceptor loop
  const response = await axios.post(
    `${API_URL}/api/user/refresh-token`,
    {},
    { withCredentials: true, headers: { "x-client-type": "admin" } },
  );

  if (response.data.success && response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }

  return response.data;
}

/**
 * Fetch current user profile
 */
export async function fetchProfile() {
  const response = await apiClient.get("/api/user/profile");
  const payload = response.data;

  if (!payload.user) {
    throw new Error(payload.message || "Không thể tải hồ sơ");
  }

  return parseUser(payload.user);
}

/**
 * Update user profile
 */
export async function updateProfile(profileData: {
  name: string;
  email: string;
  phone?: string;
}) {
  const response = await apiClient.patch("/api/user/profile", {
    name: profileData.name?.trim(),
    email: profileData.email?.trim(),
    phone: profileData.phone?.trim() || null,
  });

  const payload = response.data;

  if (!payload.user) {
    throw new Error(payload.message || "Không thể cập nhật hồ sơ");
  }

  return parseUser(payload.user);
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await apiClient.post("/api/user/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const payload = response.data;

  if (!payload.user) {
    throw new Error(payload.message || "Khong the cap nhat avatar");
  }

  return parseUser(payload.user);
}

/**
 * Change password
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  const response = await apiClient.patch("/api/user/change-password", {
    currentPassword,
    newPassword,
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Không thể đổi mật khẩu");
  }

  return response.data;
}
