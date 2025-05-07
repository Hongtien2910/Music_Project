import { axiosInstance } from '@/lib/axios';
import { Album, Song } from '@/types';
import { create } from 'zustand';

interface MusicStore {
    albums: Album[];
    songs: Song[];
    isLoading: boolean;
    error: string | null;
    currentAlbum: Album | null;
    currentSong: Song | null;
    fetchAlbums: () => Promise<void>;
    fetchAlbumById: (albumId: string) => Promise<void>;
    fetchSongs: () => Promise<void>;
    fetchSongById: (songId: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
    albums: [],
    songs: [],
    isLoading: false,
    error: null,
    currentAlbum: null,
    currentSong: null,

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
            const response = await axiosInstance.get('/songs');
            set({ songs: response.data });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Lỗi khi tải bài hát' });
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
            set({ currentSong: response.data });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Lỗi khi tải bài hát' });
        }
        finally {
            set({ isLoading: false });
        }
    }
}));