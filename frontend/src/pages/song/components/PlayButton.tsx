import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { Pause, Play } from "lucide-react";

const PlayButton = ({ song }: { song: Song }) => {
	const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
	const isCurrentSong = currentSong?._id === song._id;

	const handlePlay = (e: React.MouseEvent) => {
		e.stopPropagation(); 
		e.preventDefault(); 

		if (isCurrentSong) togglePlay();
		else setCurrentSong(song);
	};

	return (
		<Button
			size="icon"
			onClick={handlePlay}
			className={`absolute bottom-3 right-2 bg-customRed hover:bg-customRed/75 hover:scale-105 transition-all 
				opacity-0 translate-y-2 group-hover:translate-y-0 ${
					isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
				}`}
		>
			{isCurrentSong && isPlaying ? (
				<>
					<div className="flex items-end gap-[3px] h-4 group-hover:hidden">
						<div className="w-[2px] h-full bg-white animate-[equalizer_1s_ease-in-out_infinite]" />
						<div className="w-[2px] h-3 bg-white animate-[equalizer_1s_ease-in-out_infinite_0.2s]" />
						<div className="w-[2px] h-2 bg-white animate-[equalizer_1s_ease-in-out_infinite_0.4s]" />
					</div>
					<Pause className="size-5 text-white fill-white hidden group-hover:block" />
				</>
			) : (
				<Play className="size-5 text-white fill-white" />
			)}
		</Button>


	);
};
export default PlayButton;