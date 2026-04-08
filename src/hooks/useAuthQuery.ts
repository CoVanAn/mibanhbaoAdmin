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
  uploadAvatar as uploadAvatarApi,
  changePassword as changePasswordApi,
} from "../queries/user/auth";
import { setAccessToken, clearAccessToken } from "../lib/api";
import type { User } from "../store/user";
import { getErrorMessage, getErrorStatus } from "../utils/httpError";

// Query Keys
export const authKeys = {
  all: ["auth"],
  profile: () => [...authKeys.all, "profile"],
};

const normalizeRole = (role?: string): User["role"] | undefined => {
  const normalized = role?.toUpperCase();

  if (normalized === "ADMIN") return "ADMIN";
  if (normalized === "STAFF") return "STAFF";
  if (normalized === "CUSTOMER") return "CUSTOMER";

  return undefined;
};

const isAdminRole = (
  role?: User["role"],
): role is Extract<User["role"], "ADMIN" | "STAFF"> => {
  return role === "ADMIN" || role === "STAFF";
};

const toStoreUser = (
  payload: {
    id: string | number;
    email: string;
    name: string;
    role: User["role"];
    avatar?: string | null;
    phone?: string | null;
    createdAt?: string;
    updatedAt?: string;
  },
): User => ({
  id: payload.id,
  email: payload.email,
  name: payload.name,
  role: payload.role,
  avatar: payload.avatar ?? undefined,
  phone: payload.phone ?? undefined,
  createdAt: payload.createdAt,
  updatedAt: payload.updatedAt,
});

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
        const normalizedRole = normalizeRole(user.role);

        // Check if user has admin/staff role
        if (!isAdminRole(normalizedRole)) {
          toast.error("Bạn không có quyền truy cập Admin Panel");
          throw new Error("Unauthorized");
        }

        setToken(accessToken);
        setAccessToken(accessToken);
        setUser(
          toStoreUser({
            ...user,
            role: normalizedRole,
          }),
        );
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
        toast.success("Đăng nhập thành công!");
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Đăng nhập thất bại"));
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
    onSuccess: (user) => {
      const normalizedRole = normalizeRole(user.role);
      if (!normalizedRole) return;

      setUser(
        toStoreUser({
          ...user,
          role: normalizedRole,
        }),
      );
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      toast.success("Cập nhật hồ sơ thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Cập nhật hồ sơ thất bại"));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Đổi mật khẩu thất bại"));
    },
  });
}

/**
 * Hook to upload avatar
 */
export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();
  const setUser = useStore((state) => state.setUser);

  return useMutation({
    mutationFn: uploadAvatarApi,
    onSuccess: (user) => {
      const normalizedRole = normalizeRole(user.role);
      if (!normalizedRole) return;

      setUser(
        toStoreUser({
          ...user,
          role: normalizedRole,
        }),
      );
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      toast.success("Cập nhật avatar thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Cập nhật avatar thất bại"));
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
  const profileQuery = useProfileQuery();
  const loading = !isInitialized || (!!token && profileQuery.isLoading && !user);

  // Initialize auth on mount - try to refresh token from HttpOnly cookie
  useEffect(() => {
    if (isInitialized) return;

    const initAuth = async () => {
      if (token) {
        setAccessToken(token);
      }

      try {
        // Try to refresh access token using HttpOnly cookie
        const response = await refreshTokenApi();

        if (response.success && response.accessToken) {
          // Set token in store and axios interceptor
          setToken(response.accessToken);
          setAccessToken(response.accessToken);
        }
      } catch (_error) {
        // If no persisted token is available, clear auth state.
        if (!token) {
          clearAuth();
          clearAccessToken();
        }
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, [isInitialized, token, setInitialized, setToken, clearAuth]);

  useEffect(() => {
    if (!token) return;

    if (profileQuery.data) {
      const normalizedRole = normalizeRole(profileQuery.data.role);

      if (isAdminRole(normalizedRole)) {
        setUser(
          toStoreUser({
            ...profileQuery.data,
            role: normalizedRole,
          }),
        );
      } else {
        clearAuth();
        clearAccessToken();
      }
    }

    const status = getErrorStatus(profileQuery.error);
    if (profileQuery.isError && status === 401) {
      clearAuth();
      clearAccessToken();
    }
  }, [
    token,
    profileQuery.data,
    profileQuery.isError,
    profileQuery.error,
    setUser,
    clearAuth,
  ]);

  // Mutations
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();

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

    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,

    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}
