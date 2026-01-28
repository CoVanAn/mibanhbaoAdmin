import { create } from "zustand";
import createUserSlice from "./user";

const useStore = create((set, get) => ({
  ...createUserSlice(set, get),
}));

export default useStore;
