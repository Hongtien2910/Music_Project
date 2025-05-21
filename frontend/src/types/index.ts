export interface Song {
    _id: string;
    title: string;
    artist: string;
    albumId: string | null;
    imageUrl: string;
    audioUrl: string;
    lyricUrl: string;
    duration: number;
    createdAt: string;
    updatedAt: string;
	albumTitle: string;
}

export interface Album {
    _id: string;
    title: string;
    artist: string;
    imageUrl: string;
    songs: Song[];
    releaseYear: number;
    createdAt: string;
    updatedAt: string;
}


export interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
}

export interface SongPayload {
	songId: string;
	title: string;
	artist: string;
	thumbnailUrl: string;
	audioUrl: string;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	type: "text" | "song";
	content?: string;        
	song?: SongPayload;        
	createdAt: string;
	updatedAt: string;
}