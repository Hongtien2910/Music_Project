import { create } from "zustand";
import { User } from "@/types";
import type { AxiosInstance } from "axios";

interface AuthStore {
	isAdmin: boolean;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	currentUser: User | null;

	checkAdminStatus: (axios: AxiosInstance) => Promise<void>;
	checkSignedIn: (axios: AxiosInstance) => Promise<void>;
	reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isAdmin: false,
	isAuthenticated: false,
	isLoading: false,
	error: null,
	currentUser: null,

	checkAdminStatus: async (axios) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get("/admin/check");
			set({ isAdmin: response.data.admin });
		} catch (error: any) {
			set({ isAdmin: false, error: error.response?.data?.message || "Lỗi xác thực admin" });
		} finally {
			set({ isLoading: false });
		}
	},

	checkSignedIn: async (axios) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get("/auth/status");
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
		set({ 
			isAdmin: false, 
			isAuthenticated: false, 
			currentUser: null, 
			isLoading: false, 
			error: null 
		});
	},
}));
