import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Play, Info, Pause, Plus, Check, Heart } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import Topbar from "@/components/Topbar";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const LikedSongPage = () => {
	const { fetchLikedSongs, likedSongs, isLoading, likeOrUnlikeSong, isSongLiked } = useMusicStore();
	const { currentSong, isPlaying, playSong, togglePlay, playAlbum, queue, addToQueueOnly } = usePlayerStore();
	const navigate = useNavigate();
	const { currentUser } = useAuthStore();

	useEffect(() => {
		if (currentUser?._id) {
			fetchLikedSongs(currentUser._id);
		}
	}, [fetchLikedSongs, currentUser]);

	const handlePlayAllLikedSongs = () => {
		if (!likedSongs.length) return;

		const isCurrentSongLiked = likedSongs.some((song) => song._id === currentSong?._id);
		if (isCurrentSongLiked) togglePlay();
		else playAlbum(likedSongs, 0); // Dùng playAlbum để phát danh sách
	};

	const handlePlaySong = (index: number) => {
		const selectedSong = likedSongs[index];
		if (!selectedSong) return;

		if (currentSong?._id === selectedSong._id) return;

		if (!queue.some((s) => s._id === selectedSong._id)) {
			addToQueueOnly(selectedSong);
		}

		playSong(selectedSong, queue.length);
	};

	const handleNavigateToSongPage = (songId: string) => {
		navigate(`/songs/${songId}`);
	};

	if (isLoading) return null;

	return (
	<main className="rounded-md overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-900">
		<Topbar />
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				<div className='relative min-h-full'>
					<div className="absolute top-0 left-0 right-0 h-[642px] bg-gradient-to-b from-customRed/80 via-zinc-900 to-zinc-900 pointer-events-none rounded-lg" />
					<div className="absolute top-[600px] left-0 right-0 bottom-0 bg-zinc-900 pointer-events-none" />

					<div className='relative z-10'>
						<div className='flex p-6 gap-6 pb-8'>
							<div className='w-[240px] h-[240px] flex items-center justify-center bg-gradient-to-br from-red-900 via-red-500 to-red-300 rounded-md'>
								<Heart className='w-20 h-20 text-white fill-white' />
							</div>

							<div className='flex flex-col justify-end'>
								<p className='text-sm font-medium'>Songs</p>
								<h1 className='text-6xl font-bold my-4'>Liked Songs</h1>
								<div className='text-sm text-zinc-100'>
									<span className='font-medium text-white'>{likedSongs.length} songs</span>
								</div>
							</div>
													{/* Nút play toàn bộ */}
							<div className='px-6 pb-4 flex items-center gap-6'>
								<Button
									onClick={handlePlayAllLikedSongs}
									size='icon'
									className='w-14 h-14 rounded-full border border-white bg-customRed hover:bg-red-800 hover:scale-105 transition-all'>
									{isPlaying && likedSongs.some((s) => s._id === currentSong?._id) ? (
										<Pause className='h-7 w-7 text-white fill-white' />
									) : (
										<Play className='h-7 w-7 text-white fill-white' />
									)}
								</Button>
							</div>
						</div>



						{/* Table header */}
						<div className='bg-black/20 backdrop-blur-sm'>
							<div className='grid grid-cols-[24px_3fr_1fr_2fr_1fr] gap-4 px-10 py-2 text-sm text-zinc-400 border-b border-white/5'>
								<div>#</div>
								<div>Title</div>
								<div></div>
								<div>Released Date</div>
								<div><Clock className='h-4 w-4' /></div>
							</div>

							<div className='px-6'>
								<div className='space-y-2 py-4'>
									{likedSongs.map((song, index) => {
										const isCurrentSong = currentSong?._id === song._id;
										const isInQueue = queue.some((s) => s._id === song._id);

										return (
											<div
												key={song._id}
												onClick={() => handlePlaySong(index)}
												className='grid grid-cols-[24px_3fr_1fr_2fr_1fr] gap-4 px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer'>
												<div className='flex items-center justify-center'>
													{isCurrentSong ? (
														isPlaying ? (
															<div className='flex items-end gap-[2px] h-4'>
																<div className='w-[2px] h-full bg-customRed animate-[equalizer_1s_ease-in-out_infinite]' />
																<div className='w-[2px] h-3 bg-customRed animate-[equalizer_1s_ease-in-out_infinite_0.2s]' />
																<div className='w-[2px] h-2 bg-customRed animate-[equalizer_1s_ease-in-out_infinite_0.4s]' />
															</div>
														) : (
															<Play className='h-4 w-4 text-customRed' />
														)
													) : (
														<>
															<span className='group-hover:hidden'>{index + 1}</span>
															<Play className='h-4 w-4 hidden group-hover:block' />
														</>
													)}
												</div>

												<div className='flex items-center gap-3'>
													<img src={song.imageUrl} alt={song.title} className='size-10' />
													<div>
														<div className='font-medium text-white'>{song.title}</div>
														<div>{song.artist}</div>
													</div>
												</div>

												<button
													onClick={(e) => {
														e.stopPropagation();
														likeOrUnlikeSong(song._id, currentUser?._id ?? "");
													}}
												>
													<Heart
														className={`w-4 h-4 ${
															isSongLiked(song._id)
																? "text-red-500 fill-red-500"
																: "text-zinc-400 hover:text-white"
														}`}
													/>
												</button>

												<div className='flex items-center'>{song.createdAt.split("T")[0]}</div>

												<div className='flex items-center gap-2'>
													<span>{formatDuration(song.duration)}</span>
													<Info
														className='ml-4 w-4 h-4 cursor-pointer text-zinc-400 hover:text-white transition'
														onClick={(e) => {
															e.stopPropagation();
															handleNavigateToSongPage(song._id);
														}}
													/>
													<button
														onClick={(e) => {
															e.stopPropagation();
															if (!isInQueue) addToQueueOnly(song);
														}}
														title={isInQueue ? "Already in playlist" : "Add to playlist"}
														className={`ml-2 p-1 rounded-full transition ${
															isInQueue ? "text-customRed" : "text-zinc-400 hover:text-white"
														}`}
													>
														{isInQueue ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
													</button>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	</main>
	);
};

export default LikedSongPage;
