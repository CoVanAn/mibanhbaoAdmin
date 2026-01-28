// Access token stored in memory (not persisted to localStorage for security)
// Refresh token is stored in HttpOnly cookie (managed by server)
const createUserSlice = (set, get) => ({
  token: "", // Access token in memory only
  user: null, // User data
  isInitialized: false, // Track if we've tried to refresh on mount

  setToken: (tokenValue) => {
    set({ token: tokenValue });
  },

  setUser: (userData) => {
    set({ user: userData });
  },

  clearAuth: () => {
    set({ token: "", user: null });
  },

  setInitialized: (value) => {
    set({ isInitialized: value });
  },

  // Check if user has admin/staff role
  isAdmin: () => {
    const user = get().user;
    return user?.role === "ADMIN" || user?.role === "STAFF";
  },
});

export default createUserSlice;
