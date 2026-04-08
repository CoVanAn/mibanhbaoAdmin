import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import createUserSlice, { UserState } from "./user";

type StoreState = UserState;

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createUserSlice(set, get),
    }),
    {
      name: "admin-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);

export default useStore;
