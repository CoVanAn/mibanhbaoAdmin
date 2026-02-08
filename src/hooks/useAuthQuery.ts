import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useStore from "../store/useStore";
import {
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  fetchProfile,
  updateProfile as updateProfileApi,
  changePassword as changePasswordApi,
} from "../queries/auth";
import { setAccessToken, clearAccessToken } from "../lib/api";

// Query Keys
export const authKeys = {
  all: ["auth"],
  profile: () => [...authKeys.all, "profile"],
};

/**
 * Hook to fetch user profile
 */
export function useProfileQuery() {
  const token = useStore((state) => state.token);

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: fetchProfile,
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to handle login
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setToken = useStore((state) => state.setToken);
  const setUser = useStore((state) => state.setUser);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginApi(email, password),
    onSuccess: (data) => {
      if (data.success) {
        const { accessToken, user } = data;

        // Check if user has admin/staff role
        if (user.role !== "ADMIN" && user.role !== "STAFF") {
          toast.error("Bạn không có quyền truy cập Admin Panel");
          throw new Error("Unauthorized");
        }

        setToken(accessToken);
        setAccessToken(accessToken);
        setUser(user);
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
        toast.success("Đăng nhập thành công!");
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || error.message || "Đăng nhập thất bại",
      );
    },
  });
}

/**
 * Hook to handle logout
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearAuth = useStore((state) => state.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearAuth();
      clearAccessToken();
      queryClient.clear();
      navigate("/login");
      toast.success("Đăng xuất thành công!");
    },
    onError: () => {
      // Still clear auth even if API fails
      clearAuth();
      clearAccessToken();
      queryClient.clear();
      navigate("/login");
    },
  });
}

/**
 * Hook to update profile
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const setUser = useStore((state) => state.setUser);

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (user: any) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      toast.success("Cập nhật hồ sơ thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cập nhật hồ sơ thất bại");
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePasswordApi(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    },
  });
}

/**
 * Main auth hook - combines all auth functionality
 * Replaces legacy useAuth.ts with modern TanStack Query pattern
 */
export function useAuth() {
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
        const response = await refreshTokenApi();

        if (response.success && response.accessToken) {
          // Set token in store and axios interceptor
          setToken(response.accessToken);
          setAccessToken(response.accessToken);

          // Get user profile
          const userData = await fetchProfile();

          // Check if user has admin/staff role
          if (userData.role === "ADMIN" || userData.role === "STAFF") {
            setUser(userData as any); // Cast to bypass role type mismatch from API
            console.log("Admin session restored");
          } else {
            // User doesn't have admin access
            console.log("User doesn't have admin access");
            clearAuth();
            clearAccessToken();
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

  // Mutations
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  return {
    // State
    token,
    user,
    isAuthenticated,
    isAdmin,
    loading,
    isInitialized,

    // Mutations
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,

    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
