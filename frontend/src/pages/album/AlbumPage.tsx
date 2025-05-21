import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { Heart } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
    const {albumId} = useParams();
    const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
	const {currentSong, isPlaying, playAlbum, playSong, togglePlay} = usePlayerStore();
	const navigate = useNavigate();
	const { likeOrUnlikeSong, isSongLiked, fetchLikedSongs } = useMusicStore();
	const { currentUser } = useAuthStore();

	const handleNavigateToSongPage = (songId: string) => {
		navigate(`/songs/${songId}`);
	};
	const { queue, addToQueueOnly } = usePlayerStore();

    useEffect(() => {
        if (albumId) fetchAlbumById(albumId!);
    }, [fetchAlbumById, albumId]);

	useEffect(() => {
		if (currentUser) {
			fetchLikedSongs(currentUser._id);
		}
	}, [currentUser]);

    if (isLoading) return null;

	const handlePlayAlbum = () => {
		if (!currentAlbum) return

		const isCurrentAlbumPlaying = currentAlbum?.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentAlbumPlaying) togglePlay();
		else {
			// start playing the album from the beginning
			playAlbum(currentAlbum?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentAlbum) return;

		const selectedSong = currentAlbum.songs[index];
		if (!selectedSong) return;

		// Nếu đang phát đúng bài đó thì toggle play/pause
		if (currentSong?._id === selectedSong._id) {
			togglePlay();
			return;
		}

		// Nếu bài chưa có trong queue thì thêm vào
		if (!queue.some((s) => s._id === selectedSong._id)) {
			addToQueueOnly(selectedSong);
		}

		// Phát bài đó
		playSong(selectedSong, queue.length); // dùng queue.length nếu vừa mới add
	};


    return (
		<div className='h-full'>
			{/* <ScrollArea className='h-full rounded-md'> */}
				{/* Main Content */}
				<div className='relative min-h-full'>
					{/* bg gradient */}
					<div
						className="absolute top-0 left-0 right-0 h-[642px] bg-gradient-to-b from-customRed/80 via-zinc-900 to-zinc-900 pointer-events-none rounded-lg"
						aria-hidden="true"
					/>
					<div
						className="absolute top-[600px] left-0 right-0 bottom-0 bg-zinc-900 pointer-events-none"
						aria-hidden="true"
					/>
					{/* Content */}
					<div className='relative z-10'>

						<div className='flex p-6 gap-6 pb-8'>
							<img
								src={currentAlbum?.imageUrl}
								alt={currentAlbum?.title}
								className='w-[240px] h-[240px] shadow-xl rounded'
							/>
							<div className='flex flex-col justify-end'>
								<p className='text-sm font-medium'>Album</p>
								<h1 className='text-7xl font-bold my-4'>{currentAlbum?.title}</h1>
								<div className='flex items-center gap-2 text-sm text-zinc-100'>
									<span className='font-medium text-white'>{currentAlbum?.artist}</span>
									<span>• {currentAlbum?.songs.length} songs</span>
									<span>• {currentAlbum?.releaseYear}</span>
								</div>
							</div>
                            
						{/* play button */}
						<div className='px-6 pb-4 flex items-center gap-6'>
							<Button
								onClick={handlePlayAlbum}
								size='icon'
								className='w-14 h-14 rounded-full border border-white bg-customRed hover:bg-red-800 hover:scale-105 transition-all'>
								{isPlaying && currentAlbum?.songs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7 text-white fill-white' />
								) : (
									<Play className='h-7 w-7 text-white fill-white' />
								)}
							</Button>
						</div>
						</div>


						{/* Table Section */}
						<div className='bg-black/20 backdrop-blur-sm'>
							{/* table header */}
							<div
								className='grid grid-cols-[24px_3fr_1fr_2fr_1fr] gap-4 px-10 py-2 text-sm text-zinc-400 border-b border-white/5'>
								<div>#</div>
								<div>Title</div>
								<div></div>
								<div>Released Date</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
							</div>

							{/* songs list */}

							<div className='px-6'>
								<ScrollArea className="h-[310px] rounded-md">
								<div className='space-y-2 py-4'>
									{currentAlbum?.songs.map((song, index) => {
										const isCurrentSong = currentSong?._id === song._id;
										return (
											<div
												key={song._id}
												onClick={() => handlePlaySong(index)}
												className={`grid grid-cols-[24px_3fr_1fr_2fr_1fr] gap-4 px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer`}>
												<div className='flex items-center justify-center'>
													{isCurrentSong ? (
														isPlaying ? (
														// Bài hiện tại và đang phát -> Hiện cột sóng
														<div className="flex items-end gap-[2px] h-4">
															<div className="w-[2px] h-full bg-customRed animate-[equalizer_1s_ease-in-out_infinite]" />
															<div className="w-[2px] h-3 bg-customRed animate-[equalizer_1s_ease-in-out_infinite_0.2s]" />
															<div className="w-[2px] h-2 bg-customRed animate-[equalizer_1s_ease-in-out_infinite_0.4s]" />
														</div>
														) : (
														// Bài hiện tại nhưng đang dừng -> Hiện icon Play
														<Play className='h-4 w-4 text-customRed' />
														)
													) : (
														<>
														{/* Hiện index bài */}
														<span className='group-hover:hidden'>{index + 1}</span>
														{/* Icon Play chỉ hiện khi hover */}
														<Play className='h-4 w-4 hidden group-hover:block' />
														</>
													)}
												</div>


												<div className='flex items-center gap-3'>
													<img src={song.imageUrl} alt={song.title} className='size-10' />

													<div>
														<div className={`font-medium text-white`}>{song.title}</div>
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
															if (!queue.some((s) => s._id === song._id)) {
																addToQueueOnly(song);
															}
														}}
														title={
															queue.some((s) => s._id === song._id)
																? "Already in playlist"
																: "Add to playlist"
														}
														className={`ml-2 p-1 rounded-full transition ${
															queue.some((s) => s._id === song._id)
																? "text-customRed"
																: "text-zinc-400 hover:text-white"
														}`}
													>
														{queue.some((s) => s._id === song._id) ? (
															<Check className="w-4 h-4" />
														) : (
															<Plus className="w-4 h-4" />
														)}
													</button>
												</div>
											</div>
										);
									})}
								</div>
								</ScrollArea>
							</div>
						</div>
					</div>
				</div>
			{/* </ScrollArea> */}
		</div>
	);
};

export default AlbumPage;