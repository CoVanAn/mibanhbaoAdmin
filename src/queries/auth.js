import axios from "axios";
import apiClient, { setAccessToken, clearAccessToken } from "@/src/lib/api";
import { parseUser } from "@/src/schema/auth.schema";
import { API_URL } from "@/src/constants/api";

/**
 * Login with email and password
 */
export async function login(email, password) {
  const response = await apiClient.post("/api/user/login", {
    email,
    password,
  });

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
    const response = await apiClient.post("/api/user/logout", {});
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
    { withCredentials: true },
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
export async function updateProfile(profileData) {
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
 * Change password
 */
export async function changePassword(currentPassword, newPassword) {
  const response = await apiClient.patch("/api/user/change-password", {
    currentPassword,
    newPassword,
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Không thể đổi mật khẩu");
  }

  return response.data;
}
