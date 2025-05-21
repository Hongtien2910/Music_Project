import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";
// import { useChatStore } from "./useChatStore";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;

	initializeQueue: (songs: Song[]) => void;
	playSong: (song: Song, index?: number) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;

	currentTime: number;
  	setCurrentTime: (time: number) => void;

	setQueue: (songs: Song[]) => void;
	addToQueueAndPlay: (song: Song) => void;
	addToQueueOnly: (song: Song) => void;

	repeatMode: "off" | "all" | "one";
	shuffle: boolean;

	setRepeatMode: (mode: "off" | "all" | "one") => void;
	toggleShuffle: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	currentTime: 0,
  	setCurrentTime: (time: number) => set({ currentTime: time }),

	repeatMode: "off",
	shuffle: false,

	setRepeatMode: (mode) => set({ repeatMode: mode }),
	toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

	setQueue: (songs) => set({ queue: songs }),
	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	addToQueueOnly: (song: Song) => {
		set((state) => {
			const exists = state.queue.some((s) => s._id === song._id);
			return {
			queue: exists ? state.queue : [...state.queue, song],
			};
		});
	},

	addToQueueAndPlay: (song: Song) => {
		set((state) => {
			const exists = state.queue.some((s) => s._id === song._id);
			const updatedQueue = exists ? state.queue : [...state.queue, song];
			return {
			queue: updatedQueue,
			currentSong: song,
			isPlaying: true,
			};
		});
	},

	playSong: (song: Song, index?: number) => {
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
			userId: socket.auth.userId,
			activity: `Playing ${song.title} by ${song.artist}`,
			});
		}

		set({
			currentSong: song,
			currentIndex: index ?? -1,
			isPlaying: true,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const song = songs[startIndex];

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		}
		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		}

		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
		});
	},

	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;

		const currentSong = get().currentSong;
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity:
					willStartPlaying && currentSong ? `Playing ${currentSong.title} by ${currentSong.artist}` : "Idle",
			});
		}

		set({
			isPlaying: willStartPlaying,
		});
	},

	playNext: () => {
		const { currentIndex, queue, repeatMode, shuffle } = get();

		if (repeatMode === "one") {
			// Lặp lại bài hiện tại
			get().setCurrentSong(queue[currentIndex]);
			return;
		}

		let nextIndex = currentIndex + 1;

		// Shuffle logic
		if (shuffle) {
			const remainingIndices = queue.map((_, i) => i).filter(i => i !== currentIndex);
			nextIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
		}

		// Lặp toàn bộ playlist nếu hết bài
		if (nextIndex >= queue.length) {
			if (repeatMode === "all") {
				nextIndex = 0;
			} else {
				set({ isPlaying: false });
				return;
			}
		}

		const nextSong = queue[nextIndex];

		set({
			currentSong: nextSong,
			currentIndex: nextIndex,
			isPlaying: true,
		});
	},
	playPrevious: () => {
		const { currentIndex, queue } = get();
		const prevIndex = currentIndex - 1;

		// theres a prev song
		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
				});
			}

			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else {
			// no prev song
			set({ isPlaying: false });

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Idle`,
				});
			}
		}
	},
}));