import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const AuthContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [loading, setLoading] = useState(true);

  // Configure axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("adminToken", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("adminToken");
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/user/profile`);
          if (response.data && response.data.user) {
            const userData = response.data.user;

            // Check if user has admin/staff role
            if (userData.role === "ADMIN" || userData.role === "STAFF") {
              setUser(userData);
            } else {
              // User doesn't have admin access
              logout();
            }
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;

        // Check if user has admin/staff role
        if (userData.role !== "ADMIN" && userData.role !== "STAFF") {
          throw new Error("Access denied - Admin/Staff only");
        }

        setToken(newToken);
        setUser(userData);

        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("adminToken");
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/user/profile`,
        profileData
      );
      if (response.data.success) {
        setUser((prevUser) => ({ ...prevUser, ...response.data.user }));
        toast.success("Profile updated successfully!");
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during profile update.";
      console.error("Profile update error:", errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUserAvatar = async (avatarFile) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const response = await axios.post(
        `${API_URL}/api/user/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          avatar: response.data.avatarUrl,
        }));
        toast.success("Avatar updated successfully!");
        return { success: true, avatarUrl: response.data.avatarUrl };
      } else {
        throw new Error(response.data.message || "Failed to update avatar");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during avatar update.";
      console.error("Avatar update error:", errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changeUserPassword = async (passwordData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/user/change-password`,
        passwordData
      );
      if (response.data.success) {
        toast.success("Password changed successfully!");
        return { success: true };
      } else {
        throw new Error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while changing password.";
      console.error("Password change error:", errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const contextValue = {
    useAuth,
    user,
    token,
    loading,
    login,
    logout,
    updateUserProfile,
    updateUserAvatar,
    changeUserPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContextProvider;
