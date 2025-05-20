import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { User } from "@/types";

interface AuthStore {
	isAdmin: boolean;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	currentUser: User | null;

	checkAdminStatus: () => Promise<void>;
	checkSignedIn: () => Promise<void>;
	reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isAdmin: false,
	isAuthenticated: false,
	isLoading: false,
	error: null,
	currentUser: null,

	checkAdminStatus: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/check");
			set({ isAdmin: response.data.admin });
		} catch (error: any) {
			set({ isAdmin: false, error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	checkSignedIn: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/auth/status");
			set({ 
				isAuthenticated: response.data.authenticated,
				currentUser: response.data.user || null,
			});
		} catch (error: any) {
			set({ 
				isAuthenticated: false,
				currentUser: null,
				error: error.response?.data?.message || "Lỗi xác thực",
			});
		} finally {
			set({ isLoading: false });
		}
	},


	reset: () => {
		set({ isAdmin: false, isAuthenticated:false, currentUser: null, isLoading: false, error: null });
	},
}));