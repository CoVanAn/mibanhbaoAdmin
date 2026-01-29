import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import useStore from "../store/useStore";
import { setAccessToken, clearAccessToken } from "../lib/api";
import {
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  fetchProfile,
  updateProfile as updateProfileApi,
  changePassword as changePasswordApi,
} from "@/src/queries/auth";

/**
 * Hook to handle authentication for Admin panel
 * - Automatically refreshes access token on mount using HttpOnly cookie
 * - Provides login/logout functions
 * - Checks admin/staff role
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Store selectors
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  const isInitialized = useStore((state) => state.isInitialized);
  const setToken = useStore((state) => state.setToken);
  const setUser = useStore((state) => state.setUser);
  const clearAuth = useStore((state) => state.clearAuth);
  const setInitialized = useStore((state) => state.setInitialized);

  // Computed
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";
  const loading = !isInitialized;

  // Listen for auth failure events from API interceptor
  useEffect(() => {
    const handleAuthFailed = () => {
      console.log("Auth failed event received");
      clearAuth();
      clearAccessToken();
      // Only redirect if not already on login page
      if (location.pathname !== "/login") {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("auth:failed", handleAuthFailed);
    return () => {
      window.removeEventListener("auth:failed", handleAuthFailed);
    };
  }, [clearAuth, navigate, location.pathname]);

  // Initialize auth on mount - try to refresh token from HttpOnly cookie
  useEffect(() => {
    if (isInitialized) return;

    const initAuth = async () => {
      try {
        console.log("Admin: Attempting to restore session from cookie...");
        // Try to refresh access token using HttpOnly cookie
        const response = await refreshTokenApi();
        console.log("Admin: Refresh token response:", response);

        if (response.success && response.accessToken) {
          // Set token in store and axios interceptor
          setToken(response.accessToken);
          setAccessToken(response.accessToken);

          // Get user profile
          const userData = await fetchProfile();
          console.log("Admin: User profile loaded:", userData);

          // Check if user has admin/staff role
          if (userData.role === "ADMIN" || userData.role === "STAFF") {
            setUser(userData);
            console.log("Admin: Session restored successfully");
          } else {
            // User doesn't have admin access
            console.log("Admin: User doesn't have admin access");
            clearAuth();
            clearAccessToken();
          }
        } else {
          console.log("Admin: Refresh token failed - no token returned");
        }
      } catch (error) {
        // No valid refresh token cookie, user needs to login
        console.log(
          "Admin: No valid session -",
          error.response?.data?.message || error.message,
        );
        clearAuth();
        clearAccessToken();
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, [isInitialized, setInitialized, setToken, setUser, clearAuth]);

  // Login function
  const login = useCallback(
    async (email, password) => {
      try {
        const response = await loginApi(email, password);

        if (response.success) {
          const { accessToken, user: userData } = response;

          // Check if user has admin/staff role
          if (userData.role !== "ADMIN" && userData.role !== "STAFF") {
            throw new Error("Bạn không có quyền truy cập Admin Panel");
          }

          // Set token in store and axios interceptor
          setToken(accessToken);
          setAccessToken(accessToken);
          setUser(userData);

          return { success: true, user: userData };
        } else {
          throw new Error(response.message || "Đăng nhập thất bại");
        }
      } catch (error) {
        console.error("Login error:", error);
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Đăng nhập thất bại",
        );
      }
    },
    [setToken, setUser],
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      clearAccessToken();
      toast.success("Đã đăng xuất");
      navigate("/login", { replace: true });
    }
  }, [clearAuth, navigate]);

  // Update user profile
  const updateProfile = useCallback(
    async (profileData) => {
      try {
        const userData = await updateProfileApi(profileData);
        setUser(userData);
        toast.success("Cập nhật thông tin thành công!");
        return { success: true, user: userData };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.message || "Cập nhật thất bại";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [setUser],
  );

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await changePasswordApi(currentPassword, newPassword);
      toast.success("Đổi mật khẩu thành công!");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đổi mật khẩu thất bại";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateProfile,
    changePassword,
  };
};

export default useAuth;
