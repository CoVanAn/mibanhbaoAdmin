import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useStore from "../store/useStore";
import { authAPI, setAccessToken, clearAccessToken } from "../lib/api";

/**
 * Hook to handle authentication for Admin panel
 * - Automatically refreshes access token on mount using HttpOnly cookie
 * - Provides login/logout functions
 * - Checks admin/staff role
 */
export const useAuth = () => {
  const navigate = useNavigate();

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

  // Initialize auth on mount - try to refresh token from HttpOnly cookie
  useEffect(() => {
    if (isInitialized) return;

    const initAuth = async () => {
      try {
        // Try to refresh access token using HttpOnly cookie
        const response = await authAPI.refreshToken();

        if (response.success && response.accessToken) {
          // Set token in store and axios interceptor
          setToken(response.accessToken);
          setAccessToken(response.accessToken);

          // Get user profile
          const profileResponse = await authAPI.getProfile();
          if (profileResponse.user) {
            const userData = profileResponse.user;

            // Check if user has admin/staff role
            if (userData.role === "ADMIN" || userData.role === "STAFF") {
              setUser(userData);
              console.log("Admin session restored");
            } else {
              // User doesn't have admin access
              console.log("User doesn't have admin access");
              clearAuth();
              clearAccessToken();
            }
          }
        }
      } catch (error) {
        // No valid refresh token cookie, user needs to login
        console.log("No valid admin session, user needs to login");
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
        const response = await authAPI.login(email, password);

        if (response.success) {
          const { token: newToken, user: userData } = response;

          // Check if user has admin/staff role
          if (userData.role !== "ADMIN" && userData.role !== "STAFF") {
            throw new Error("Bạn không có quyền truy cập Admin Panel");
          }

          // Set token in store and axios interceptor
          setToken(newToken);
          setAccessToken(newToken);
          setUser(userData);

          return { success: true, user: userData };
        } else {
          throw new Error(response.message || "Đăng nhập thất bại");
        }
      } catch (error) {
        console.error("Login error:", error);
        throw new Error(
          error.response?.data?.message || error.message || "Đăng nhập thất bại"
        );
      }
    },
    [setToken, setUser]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
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
        const response = await authAPI.updateProfile(profileData);
        if (response.success) {
          setUser((prev) => ({ ...prev, ...response.user }));
          toast.success("Cập nhật thông tin thành công!");
          return { success: true, user: response.user };
        }
        throw new Error(response.message || "Cập nhật thất bại");
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.message || "Cập nhật thất bại";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [setUser]
  );

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      if (response.success) {
        toast.success("Đổi mật khẩu thành công!");
        return { success: true };
      }
      throw new Error(response.message || "Đổi mật khẩu thất bại");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Đổi mật khẩu thất bại";
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
