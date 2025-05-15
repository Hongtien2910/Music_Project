import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ListMusic, Mic2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious } = usePlayerStore();

	const [volume, setVolume] = useState(75);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isMuted, setIsMuted] = useState(false);

	useEffect(() => {
		audioRef.current = document.querySelector("audio");

		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);

		const handleEnded = () => {
			usePlayerStore.setState({ isPlaying: false });
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [currentSong]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
		}
	};

	return (
		<footer className='h-20 sm:h-24 bg-zinc-900 border-t border-zinc-800 px-4'>
			<div className='flex justify-between items-center h-full max-w-[1800px] mx-auto'>
				{/* currently playing song */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%]'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-14 h-14 object-cover rounded-md'
							/>
							<div className='flex-1 min-w-0'>
								<div className='font-medium truncate hover:underline cursor-pointer'>
								<Link to={`/songs/${currentSong._id}`}>
									{currentSong.title}
								</Link>
								</div>
								<div className='text-sm text-zinc-400'>
									{currentSong.artist}
								</div>
							</div>
						</>
					)}
				</div>

				{/* player controls*/}
				<div className='flex flex-col items-center gap-2 flex-1 max-w-full sm:max-w-[45%]'>
					<div className='flex items-center gap-4 sm:gap-6'>
						<Button
							size='icon'
							variant='ghost'
							className='hidden sm:inline-flex hover:text-white text-zinc-400'
						>
							<Shuffle className='h-4 w-4 text-white' />
						</Button>

						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4 text-white fill-white' />
						</Button>

						<Button
							size='icon'
							className='bg-customRed hover:bg-customRed/7 rounded-full h-8 w-8'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-5 w-5 text-white fill-white' /> : <Play className='h-5 w-5 text-white fill-white' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4 text-white fill-white' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hidden sm:inline-flex hover:text-white text-zinc-400'
						>
							<Repeat className='h-4 w-4 text-white' />
						</Button>
					</div>

					<div className='hidden sm:flex items-center gap-2 w-full'>
						<div className='text-xs text-zinc-400'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing [&_[role=slider]]:bg-customRed [&_[role=slider]]:border [&_[role=slider]]:border-white' 
							onValueChange={handleSeek}
						/>
						<div className='text-xs text-zinc-400'>{formatTime(duration)}</div>
					</div>
				</div>
				{/* volume controls */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] justify-end'>
					<Button asChild size="icon" variant="ghost" className="hover:text-white text-zinc-400">
						<Link to="/lyric">
							<Mic2 className="h-4 w-4 text-white" />
						</Link>
					</Button>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<ListMusic className='h-4 w-4 text-white' />
					</Button>

					<div className='flex items-center gap-2'>
					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400'
						onClick={() => {
							const newMuted = !isMuted;
							setIsMuted(newMuted);
							const newVolume = newMuted ? 0 : 75;
							setVolume(newVolume);
							if (audioRef.current) {
							audioRef.current.volume = newVolume / 100;
							}
						}}
						>
						{isMuted ? (
							<VolumeX className='h-4 w-4 text-white' />
						) : (
							<Volume1 className='h-4 w-4 text-white' />
						)}
					</Button>

					<Slider
						value={[volume]}
						max={100}
						step={1}
						className='w-24 hover:cursor-grab active:cursor-grabbing [&_[role=slider]]:bg-customRed   [&_[role=slider]]:border [&_[role=slider]]:border-white'
						onValueChange={(value) => {
							const vol = value[0];
							setVolume(vol);
							setIsMuted(vol === 0);
							if (audioRef.current) {
							audioRef.current.volume = vol / 100;
							}
						}}
					/>

					</div>
				</div>
			</div>
		</footer>
	);
};