import apiClient from "./client";

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post("/api/user/login", {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/api/user/profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.patch("/api/user/profile", profileData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.patch("/api/user/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
