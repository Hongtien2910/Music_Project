import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { User } from "@/types";

interface UserStore {
  users: User[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get<User[]>("/users");
      set({ users: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch users", isLoading: false });
    }
  },

  reset: () => {
    set({ users: [], isLoading: false, error: null });
  },
}));
