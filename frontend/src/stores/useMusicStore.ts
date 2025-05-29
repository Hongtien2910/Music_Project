import { axiosInstance } from '@/lib/axios';
import { Album, Song, Stats } from '@/types';
import toast from 'react-hot-toast';
import { create } from 'zustand';

interface MusicStore {
    albums: Album[];
    songs: Song[];
    isLoading: boolean;
    error: string | null;
    currentAlbum: Album | null;
    currentSongM: Song | null;

    fetchAlbums: () => Promise<void>;
    fetchAlbumById: (albumId: string) => Promise<void>;
    fetchSongs: () => Promise<void>;
    fetchSongById: (songId: string) => Promise<void>;

    featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
    fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: (iendpoint: string) => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;

    stats: Stats;
    fetchStats: () => Promise<void>;

	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;

	fetchRecommendedSong: (songName: string) => Promise<void>;
	recommendedSongs: Song[];

	randomAlbums: Album[];
	fetchRandomAlbums: () => Promise<void>;

	searchedSongs: Song[]; 
    searchByAudio: (file: File) => Promise<void>;

	likedSongs: Song[];
	fetchLikedSongs: (userId: string) => Promise<void>;
	likeOrUnlikeSong: (songId: string, userId: string) => Promise<void>;
	isSongLiked: (songId: string) => boolean;

	updateSong: (id: string, updatedSongData: Partial<Song> | FormData) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
    albums: [],
    songs: [],
    isLoading: false,
    error: null,
    currentAlbum: null,
    currentSongM: null,
    madeForYouSongs: [],
	featuredSongs: [],
	trendingSongs: [],
	recommendedSongs: [],
	randomAlbums: [],
	searchedSongs: [],


    stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
	},

    fetchAlbums: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/albums');
            set({albums: response.data});
        } catch (error: any) {
            set({ error: error.response.data.message});
        } finally {
            set({ isLoading: false });
        }
    },

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			set({ songs: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

    fetchAlbumById: async (albumId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/albums/${albumId}`);
            set({ currentAlbum: response.data });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Lỗi khi tải album' });
        } finally {
            set({ isLoading: false });
        }
    },
    
    fetchSongById: async (songId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/songs/${songId}`);
            set({
				currentSongM: {
					...response.data,
					albumTitle: response.data.albumId?.title || null
				}
			});
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Lỗi khi tải bài hát' });
        }
        finally {
            set({ isLoading: false });
        }
    },

    fetchFeaturedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			set({ featuredSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMadeForYouSongs: async (endpoint: string) => {
	set({ isLoading: true, error: null });
	try {
		const response = await axiosInstance.get(endpoint);
		set({ madeForYouSongs: response.data });
	} catch (error: any) {
		set({ error: error.response?.data?.message || error.message || "Lỗi khi tải bài hát Made For You" });
	} finally {
		set({ isLoading: false });
	}
	},

	fetchTrendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			set({ trendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

    fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));

			await get().fetchStats();

			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},
	
	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			
			await get().fetchStats();

			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},
	
	fetchRecommendedSong: async (songName: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/songs/recommend", {
			songName
			});
			set({ recommendedSongs: response.data });
		} catch (error: any) {
			console.error("Lỗi khi gọi fetchRecommendedSong:", error);
			set({ error: error.response?.data?.message || "Lỗi khi gợi ý bài hát" });
		} finally {
			set({ isLoading: false });
		}
	},
	fetchRandomAlbums: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get('/albums/randomAlbum');
			set({ randomAlbums: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || 'Lỗi khi tải album ngẫu nhiên' });
		} finally {
			set({ isLoading: false });
		}
	},


	searchByAudio: async (file: File) => {
		set({ error: null, searchedSongs: [] });

		try {
			const formData = new FormData();
			formData.append('file', file);

			const recogResponse = await axiosInstance.post('/songs/recognize', formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
			});

			const recognizedSong = recogResponse.data;

			if (!recognizedSong || !recognizedSong.title) {
			throw new Error('Không tìm thấy tên bài hát từ file âm thanh');
			}

			// Lưu kết quả tìm được vào store
			set({
				searchedSongs: [recognizedSong],
			});
		} catch (error: any) {
			set({
				error: error.response?.data?.message || error.message || 'Lỗi khi tìm kiếm theo audio',
			});
		}
	},

	likedSongs: [],

	fetchLikedSongs: async (userId: string) => {
		set({ error: null });
		try {
			const res = await axiosInstance.get(`/users/${userId}/likedSongs`);
			set({ likedSongs: res.data });
		} catch (error: any) {
			toast.error("Cannot get favorite songs");
			set({ error: error.response?.data?.message || "Lỗi khi tải liked songs" });
		} finally {
			set({ isLoading: false });
		}
	},

	likeOrUnlikeSong: async (songId: string, userId: string) => {
		const { likedSongs, songs } = get();
		const isLiked = likedSongs.some((s) => s._id === songId);
		set({ error: null });
		
		try {
			if (isLiked) {
			// Gỡ like
			await axiosInstance.post(`/songs/${songId}/unlike`, { userId });
			set({ likedSongs: likedSongs.filter((s) => s._id !== songId) });
			} else {
			// Thêm like
			await axiosInstance.post(`/songs/${songId}/like`, { userId });
			const song = songs.find((s) => s._id === songId);
			if (song) {
				set({ likedSongs: [...likedSongs, song] });
			}
			}
		} catch (error: any) {
			toast.error("Operation failed");
			set({ error: error.response?.data?.message || "Lỗi khi thao tác yêu thích bài hát" });
		} finally {
			set({ isLoading: false });
		}
	},

	isSongLiked: (songId: string) => {
		return get().likedSongs.some((s) => s._id === songId);
	},

	updateSong: async (id, data: Record<string, any> | FormData) => {
		set({ isLoading: true, error: null });
		try {
			const isFormData = data instanceof FormData;

			const response = await axiosInstance.put(
				`/admin/songs/${id}`,
				data,
				isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
			);

			set((state) => ({
				songs: state.songs.map((song) =>
					song._id === id ? { ...song, ...response.data } : song
				),
			}));

			await get().fetchStats();

			toast.success("Song updated successfully");
		} catch (error: any) {
			console.error("Error in updateSong ", error);
			toast.error("Failed to update song");
			set({ error: error.response?.data?.message || error.message || "Update song error" });
		} finally {
			set({ isLoading: false });
		}
	},

}));