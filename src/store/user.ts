// Access token stored in memory (not persisted to localStorage for security)
// Refresh token is stored in HttpOnly cookie (managed by server)

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserState {
  token: string; // Access token in memory only
  user: User | null; // User data
  isInitialized: boolean; // Track if we've tried to refresh on mount
  setToken: (tokenValue: string) => void;
  setUser: (userData: User | null) => void;
  clearAuth: () => void;
  setInitialized: (value: boolean) => void;
  isAdmin: () => boolean;
}

type SetUserState = (partial: Partial<UserState>) => void;
type GetUserState = () => UserState;

const createUserSlice = (set: SetUserState, get: GetUserState): UserState => ({
  token: "", // Access token in memory only
  user: null, // User data
  isInitialized: false, // Track if we've tried to refresh on mount

  setToken: (tokenValue: string) => {
    set({ token: tokenValue });
  },

  setUser: (userData: User | null) => {
    set({ user: userData });
  },

  clearAuth: () => {
    set({ token: "", user: null });
  },

  setInitialized: (value: boolean) => {
    set({ isInitialized: value });
  },

  // Check if user has admin/staff role
  isAdmin: () => {
    const user = get().user;
    return user?.role === "ADMIN" || user?.role === "STAFF";
  },
});

export default createUserSlice;
