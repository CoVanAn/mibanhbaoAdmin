import { create } from "zustand";
import createUserSlice, { UserState } from "./user";

type StoreState = UserState;

const useStore = create<StoreState>((set, get) => ({
  ...createUserSlice(set, get),
}));

export default useStore;
