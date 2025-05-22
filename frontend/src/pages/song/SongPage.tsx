import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Pause, Play, Share2, X, Plus, Check, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SectionGrid from "./components/SectionGrid";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { useChatStore } from "@/stores/useChatStore";
import toast from "react-hot-toast";
import { useUser } from "@clerk/clerk-react";

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

	const { fetchSongById, currentSongM, isLoading, recommendedSongs, fetchRecommendedSong, likeOrUnlikeSong, isSongLiked, fetchLikedSongs } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay, queue, addToQueueOnly } = usePlayerStore();
	const { currentUser } = useAuthStore();
	const { users, fetchUsers, isLoading: isUsersLoading, error: usersError } = useUserStore();

	const { shareSong } = useChatStore();

	const [lyrics, setLyrics] = useState<any[]>([]);
	const [showShareDialog, setShowShareDialog] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [sharing, setSharing] = useState(false);
	const [shareError, setShareError] = useState("");
	const [shareSuccess, setShareSuccess] = useState("");

	const { user } = useUser();

	useEffect(() => {
		if (songId) {
			fetchSongById(songId);
		}
	}, [fetchSongById, songId]);

	useEffect(() => {
		if (currentSongM?.title) {
			fetchRecommendedSong(currentSongM.title);
		}
	}, [currentSongM?.title, fetchRecommendedSong]);

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
					setLyrics([]);
				}
			}
		};
		loadLyrics();
	}, [currentSongM]);

	useEffect(() => {
		if (currentSongM) {
			isSongLiked(currentSongM._id);
		}
	}, [ currentUser, currentSongM, fetchUsers, isSongLiked]);

	useEffect(() => {
		if (currentUser?._id) {
			fetchLikedSongs(currentUser._id);
		}
	}, [currentUser]);

	useEffect(() => {
		if (users.length === 0) {
			fetchUsers();
		}
	}, [fetchUsers, users.length]);

	const handlePlaySong = () => {
		if (!currentSongM) return;
		if (isPlaying && currentSong?._id === currentSongM._id) {
			togglePlay();
		} else {
			playAlbum([currentSongM], 0);
		}
	};

	const isCurrentSongPlaying = isPlaying && currentSong?._id === currentSongM?._id;
	const parsedLyrics = lyrics;

	if (isLoading || !currentSongM) return null;

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

	const filteredUsers = users.filter((u) =>
		u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleSendShare = async (receiverUserId: string) => {
		if (!user?.id) {
			toast.error("User not logged in.");
			return;
		}
		const receiverUser = users.find(u => u._id === receiverUserId);
		if (!receiverUser || !receiverUser.clerkId) {
			toast.error("Selected user not found or missing Clerk ID.");
			return;
		}
		if (!currentSongM) return;

		try {
			setSharing(true);
			setShareError("");
			setShareSuccess("");
			await shareSong(receiverUser.clerkId, user.id, currentSongM);
			setShareSuccess(`Shared with ${receiverUser.fullName} successfully!`);
		} catch (error) {
			setShareError("Failed to share song.");
		} finally {
			setSharing(false);
		}
	};

	const handleOpenShareDialog = () => {
		setShowShareDialog(true);
		setSearchTerm("");
		setShareError("");
		setShareSuccess("");
	};

	const handleCloseShareDialog = () => {
		setShowShareDialog(false);
		setSearchTerm("");
		setShareError("");
		setShareSuccess("");
	};

	return (
		<div className="h-full">
			<ScrollArea className="h-full rounded-md">
				<div className="relative min-h-full">
					<div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-customRed/80 via-zinc-900 to-zinc-900 pointer-events-none" />
					<div className="absolute top-[600px] left-0 right-0 bottom-0 bg-zinc-900 pointer-events-none" />
					<div className="relative z-10 p-6 space-y-6">

						{/* Song Info */}
						<div className="flex gap-6">
							<img src={currentSongM.imageUrl} alt={currentSongM.title} className="w-[240px] h-[240px] shadow-xl rounded" />
							<div className="flex flex-col justify-end">
								<p className="text-sm font-medium">Song</p>
								<h1 className="text-5xl font-bold my-4">{currentSongM.title}</h1>
								<div className="text-sm text-zinc-100 flex gap-2">
									<span className="font-medium text-white">{currentSongM.artist}</span>
									{currentSongM.albumTitle && <span>• {currentSongM.albumTitle}</span>}
									{currentSongM.createdAt && <span>• {currentSongM.createdAt.split("T")[0]}</span>}
								</div>

								{/* Controls */}
								<div className="flex items-center gap-4 mt-4">
									<Button onClick={handlePlaySong} size="icon" className="w-14 h-14 rounded-full border border-white bg-customRed hover:bg-red-800 hover:scale-105 transition-all">
										{isCurrentSongPlaying ? <Pause className="h-7 w-7 text-white fill-white" /> : <Play className="h-7 w-7 text-white fill-white" />}
									</Button>
									
									{currentUser && (
										<button
											onClick={(e) => {
												e.stopPropagation();
												likeOrUnlikeSong(currentSongM._id, currentUser._id).then(() => {
													fetchLikedSongs(currentUser._id);
												});
											}}
										>
											<Heart className={`w-10 h-10 ${isSongLiked(currentSongM._id) ? "text-red-500 fill-red-500" : "text-zinc-400 hover:text-white"}`} />
										</button>
									)}

									<button
										onClick={(e) => {
											e.stopPropagation();
											if (!queue.some((s) => s._id === currentSongM._id)) addToQueueOnly(currentSongM);
										}}
										title={queue.some((s) => s._id === currentSongM._id) ? "Already in playlist" : "Add to playlist"}
										className={`p-2 rounded-full transition ${queue.some((s) => s._id === currentSongM._id) ? "text-customRed border border-customRed" : "text-zinc-300 border border-white hover:text-red-500 hover:border-red-500"}`}
									>
										{queue.some((s) => s._id === currentSongM._id) ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
									</button>

									<button
										onClick={(e) => {
											e.stopPropagation();
											handleOpenShareDialog();
										}}
										title="Share song to friend"
										className="p-2 rounded-full text-zinc-300 border border-white hover:text-red-500 hover:border-red-500 transition"
									>
										<Share2 className="w-6 h-6" />
									</button>
								</div>
							</div>
						</div>

						{/* Lyrics */}
						<div className="bg-black/20 backdrop-blur-sm p-6 rounded-md">
							<h2 className="text-xl font-semibold text-white mb-4">Lyrics</h2>
							<div className="space-y-1 text-zinc-200 text-sm">
								{parsedLyrics.length > 0 ? (
									parsedLyrics.map((line, index) => <div key={`${line.time}-${index}`}>{line && line.text}</div>)
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

					{/* Share Dialog */}
					{showShareDialog && (
						<div
							className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
							onClick={handleCloseShareDialog}
						>
							<div
								className="bg-zinc-900 p-6 rounded max-w-md w-full"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-xl font-semibold text-white">Share Song</h3>
									<button onClick={handleCloseShareDialog}>
										<X className="w-6 h-6 text-white" />
									</button>
								</div>

								<input
									type="text"
									placeholder="Search user..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full p-2 mb-4 rounded bg-zinc-800 text-white placeholder-zinc-400"
									disabled={sharing}
								/>

								{isUsersLoading && <p className="text-white">Loading users...</p>}
								{usersError && <p className="text-red-500">{usersError}</p>}

								<div className="max-h-64 overflow-y-auto space-y-2">
									{filteredUsers.length > 0 ? (
										filteredUsers.map((user) => (
											<div
												key={user._id}
												className="flex items-center justify-between bg-zinc-800 p-2 rounded hover:bg-zinc-700 transition"
											>
												<div className="flex items-center gap-3">
													<img
														src={user.imageUrl || "/default-avatar.png"}
														alt={user.fullName}
														className="w-8 h-8 rounded-full object-cover"
													/>
													<span className="text-white text-sm">{user.fullName}</span>
												</div>
												<Button
													size="sm"
													variant="secondary"
													disabled={sharing}
													onClick={() => handleSendShare(user._id)}
													className= "bg-customRed hover:bg-red-700"
												>
													{sharing ? "Sharing..." : "Send"}
												</Button>
											</div>
										))
									) : (
										<p className="text-zinc-400">No users found.</p>
									)}
								</div>

								{shareError && <p className="text-red-500 mt-3">{shareError}</p>}
								{shareSuccess && <p className="text-green-500 mt-3">{shareSuccess}</p>}
							</div>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default SongPage;
