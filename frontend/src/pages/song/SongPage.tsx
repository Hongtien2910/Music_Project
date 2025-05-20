import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SectionGrid from "./components/SectionGrid";
import { Plus, Check } from "lucide-react"; 
import { useAuthStore } from "@/stores/useAuthStore";
import { Heart } from "lucide-react";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const parseLRC = (lrc: string) => {
	const lines = lrc.split("\n");
	const parsed = lines
		.map((line) => {
			const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
			if (!match) return null;
			const [, min, sec, text] = match;
			const time = parseInt(min) * 60 + parseFloat(sec);
			return { time, text: text.trim() };
		})
		.filter(Boolean);
	return parsed;
};

const SongPage = () => {
	const { songId } = useParams();
	const navigate = useNavigate();  
	const { fetchSongById, currentSongM, isLoading, recommendedSongs, fetchRecommendedSong } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay, queue, addToQueueOnly } = usePlayerStore();
	const { likeOrUnlikeSong, isSongLiked } = useMusicStore();
	const { currentUser } = useAuthStore();

	// Lưu trữ lyrics sau khi tải từ URL
	const [lyrics, setLyrics] = useState<any[]>([]);

	useEffect(() => {
	if (songId) {
		console.log("Fetching song with id: ", songId);
		fetchSongById(songId);
	}
	}, [fetchSongById, songId]);

	useEffect(() => {
	if (currentSongM?.title) {
		fetchRecommendedSong(currentSongM.title);
	}
	}, [currentSongM?.title, fetchRecommendedSong]);


	// Tải lyrics từ URL nếu có
	useEffect(() => {
		const loadLyrics = async () => {
			if (currentSongM?.lyricUrl) {
				try {
					const response = await fetch(currentSongM.lyricUrl);
					const lrcText = await response.text();
					const parsedLyrics = parseLRC(lrcText);
					setLyrics(parsedLyrics);
				} catch (error) {
					console.error("Error loading lyrics:", error);
					setLyrics([]); // Nếu lỗi, không có lyrics
				}
			}
		};

		loadLyrics();
	}, [currentSongM]);

	// Hàm Play song
	const handlePlaySong = () => {
		if (!currentSongM) return;

		if (isPlaying && currentSong?._id === currentSongM._id) {
			// Nếu bài hiện tại đang phát là bài này thì toggle play/pause
			togglePlay();
		} else {
			// Nếu đang phát bài khác hoặc dừng thì phát bài này luôn
			playAlbum([currentSongM], 0);
		}
	}

	const isCurrentSongPlaying = isPlaying && currentSong?._id === currentSongM?._id;

	// Định dạng lời bài hát
	const parsedLyrics = lyrics;

	if (isLoading || !currentSongM) return null;

	// Hàm điều hướng tới trang album
	const handleNavigateToAlbum = () => {
	const albumId = currentSongM?.albumId;

	const id =
		typeof albumId === "object" && albumId !== null
		? (albumId as { _id: string })._id
		: albumId;

	if (id) {
		navigate(`/albums/${id}`);
	} else {
		console.warn("Không thể điều hướng: albumId không hợp lệ", albumId);
	}
	};

	return (
		<div className="h-full">
			<ScrollArea className="h-full rounded-md">
				<div className="relative min-h-full">
					<div
						className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-customRed/80 via-zinc-900 to-zinc-900 pointer-events-none"
						aria-hidden="true"
					/>
                    <div
						className="absolute top-[600px] left-0 right-0 bottom-0 bg-zinc-900 pointer-events-none"
						aria-hidden="true"
					/>
					<div className="relative z-10 p-6 space-y-6">

						{/* Info */}
						<div className="flex gap-6">
							<img
								src={currentSongM.imageUrl}
								alt={currentSongM.title}
								className="w-[240px] h-[240px] shadow-xl rounded"
							/>
							<div className="flex flex-col justify-end">
								<p className="text-sm font-medium">Song</p>
								<h1 className="text-5xl font-bold my-4">{currentSongM.title}</h1>
								<div className="text-sm text-zinc-100 flex gap-2">
									<span className="font-medium text-white">{currentSongM.artist}</span>
									{currentSongM.albumTitle && <span>• {currentSongM.albumTitle}</span>}
									{currentSongM.createdAt && <span>• {currentSongM.createdAt.split("T")[0]}</span>}
								</div>
								<div className="flex items-center gap-4 mt-4">
									<Button
										onClick={handlePlaySong}
										size="icon"
										className="w-14 h-14 rounded-full border border-white bg-customRed hover:bg-red-800 hover:scale-105 transition-all"
									>
										{isCurrentSongPlaying ? (
											<Pause className="h-7 w-7 text-white fill-white" />
										) : (
											<Play className="h-7 w-7 text-white fill-white" />
										)}
									</Button>

									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											likeOrUnlikeSong(currentSongM._id, currentUser?._id ?? "");
										}}
										>
										<Heart
											className={`w-10 h-10 ${
											isSongLiked(currentSongM._id)
												? "text-red-500 fill-red-500"
												: "text-zinc-400 hover:text-white"
											}`}
										/>
									</button>

									{/* Nút thêm vào queue */}
									<button
										onClick={(e) => {
											e.stopPropagation();
											if (currentSongM && !queue.some((s) => s._id === currentSongM._id)) {
												addToQueueOnly(currentSongM);
											}
										}}
										title={
											currentSongM && queue.some((s) => s._id === currentSongM._id)
												? "Already in playlist"
												: "Add to playlist"
										}
										className={`p-2 rounded-full  transition ${
											currentSongM && queue.some((s) => s._id === currentSongM._id)
												? "text-customRed border border-customRed"
												: "text-zinc-300 border border-white hover:text-red-500 hover:border-red-500"
										}`}
									>
										{currentSongM && queue.some((s) => s._id === currentSongM._id) ? (
											<Check className="w-5 h-5" />
										) : (
											<Plus className="w-5 h-5" />
										)}
									</button>
								</div>

							</div>
						</div>

						{/* Lyrics */}
						<div className="bg-black/20 backdrop-blur-sm p-6 rounded-md">
							<h2 className="text-xl font-semibold text-white mb-4">Lyrics</h2>
							<div className="space-y-1 text-zinc-200 text-sm">
								{parsedLyrics.length > 0 ? (
									parsedLyrics.map((line) => (
									<div key={line.time}>
										{line && line.text}
									</div>
									))
								) : (
									<p className="italic text-zinc-400">No lyrics.</p>
								)}
							</div>
						</div>

						{/* Duration and Album */}
						<div className="text-sm text-zinc-400 flex items-center gap-2">
							<Clock className="h-4 w-4" />
							<span>{formatDuration(currentSongM.duration)}</span>
						</div>
                        <div className="mt-4 flex justify-center">
                           {(currentSongM?.albumTitle || currentSongM?.albumId) && (
								<Button
									onClick={handleNavigateToAlbum}
									className="w-64 border-2 border-white text-white bg-customRed hover:bg-zinc-800 hover:border-red-800 transition-all py-2"
								>
									Go to Album: {currentSongM.albumTitle || "View"}
								</Button>
							)}
                        </div>
						
						{/* Recommended Songs */}
						{recommendedSongs && recommendedSongs.length > 0 && (
							<SectionGrid
							title="Recommended Songs"
							songs={recommendedSongs}
							isLoading={isLoading}
							columns="grid-cols-2"
							/>
						)}

					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default SongPage;
