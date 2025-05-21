import { axiosInstance } from "@/lib/axios";
import { Message, User, Song } from "@/types";
import { create } from "zustand";
import { io } from "socket.io-client";

interface ChatStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	socket: any;
	isConnected: boolean;
	onlineUsers: Set<string>;
	userActivities: Map<string, string>;
	messages: Message[];
	selectedUser: User | null;

	fetchUsers: () => Promise<void>;
	initSocket: (userId: string) => void;
	disconnectSocket: () => void;
	sendMessage: (
		receiverId: string,
		senderId: string,
		content: string,
		type?: "text" | "song",
		song?: {
			songId: string;
			title: string;
			artist: string;
			thumbnailUrl: string;
			audioUrl: string;
		}
	) => void;
	fetchMessages: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;

	isSharing: boolean;
	shareError: string | null;
	shareSuccess: string | null;

  	songs: Song[];
  	fetchSongs: () => Promise<void>;
  	shareSong: (receiverId: string, senderId: string, song: Song) => Promise<void>;
}

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

const socket = io(baseURL, {
	autoConnect: false,
	withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
	users: [],
	isLoading: false,
	error: null,
	socket: socket,
	isConnected: false,
	onlineUsers: new Set(),
	userActivities: new Map(),
	messages: [],
	selectedUser: null,

	setSelectedUser: (user) => set({ selectedUser: user }),

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users");
			set({ users: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch users." });
		} finally {
			set({ isLoading: false });
		}
	},

	initSocket: (userId) => {
		if (!get().isConnected) {
			socket.auth = { userId };
			socket.connect();

			socket.emit("user_connected", userId);

			socket.on("users_online", (users: string[]) => {
				set({ onlineUsers: new Set(users) });
			});

			socket.on("activities", (activities: [string, string][]) => {
				set({ userActivities: new Map(activities) });
			});

			socket.on("user_connected", (userId: string) => {
				set((state) => ({
					onlineUsers: new Set([...state.onlineUsers, userId]),
				}));
			});

			socket.on("user_disconnected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set(state.onlineUsers);
					newOnlineUsers.delete(userId);
					return { onlineUsers: newOnlineUsers };
				});
			});

			socket.on("receive_message", (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
				}));
			});

			socket.on("message_sent", (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
				}));
			});

			socket.on("activity_updated", ({ userId, activity }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(userId, activity);
					return { userActivities: newActivities };
				});
			});

			set({ isConnected: true });
		}
	},

	disconnectSocket: () => {
		if (get().isConnected) {
			socket.disconnect();
			set({ isConnected: false });
		}
	},

	sendMessage: (receiverId, senderId, content, type = "text", song) => {
		const socket = get().socket;
		if (!socket) return;

		const message: any = { receiverId, senderId, type };

		if (type === "text") {
			message.content = content;
		} else if (type === "song" && song !== undefined) {
			message.song = song;
		}

		socket.emit("send_message", message);
	},

	fetchMessages: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			set({ messages: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch messages." });
		} finally {
			set({ isLoading: false });
		}
	},

	isSharing: false,
	shareError: null,
	shareSuccess: null,

	songs: [],

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
		const response = await axiosInstance.get("/songs"); // endpoint API lấy danh sách bài hát
		set({ songs: response.data });
		} catch (error: any) {
		set({ error: error.response?.data?.message || "Failed to fetch songs." });
		} finally {
		set({ isLoading: false });
		}
	},

	shareSong: async (receiverClerkId: string, senderId: string, song: Song) => {
		set({ isSharing: true, shareError: null, shareSuccess: null });
		try {
			const songToSend = {
			songId: song._id,
			title: song.title,
			artist: song.artist,
			thumbnailUrl: song.imageUrl || "",
			audioUrl: song.audioUrl,
			};

			// Gửi message với receiverId chính là ClerkId của người nhận (như MessageInput),
			// senderId có thể là user.id (thường là string id của Clerk)
			get().sendMessage(receiverClerkId, senderId, "", "song", songToSend);

			set({ shareSuccess: "Song shared successfully!" });
		} catch (error: any) {
			const message =
			error?.response?.data?.message ||
			(error instanceof Error ? error.message : "Failed to share song.");
			set({ shareError: message });
		} finally {
			set({ isSharing: false });
		}
	},


}));
