import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import SectionGridSkeleton from "./SectionGridSkeleton ";
import PlayButton from "./PlayButton.tsx";
import { Link } from "react-router-dom";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Plus, Check } from "lucide-react";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
	const { addToQueueOnly, queue } = usePlayerStore();

	if (isLoading) return <SectionGridSkeleton />;

	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
				<Link to="/songs">
					<Button variant='link' className='text-sm text-zinc-400 hover:text-customRed'>
						Show all
					</Button>
				</Link>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{songs.map((song) => {
					const isInQueue = queue.some((s) => s._id === song._id);

					return (
						<Link
							to={`/songs/${song._id}`}
							key={song._id}
							className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer relative'
						>
							<div className='relative mb-4'>
								<div className='aspect-square rounded-md shadow-lg overflow-hidden'>
									<img
										src={song.imageUrl}
										alt={song.title}
										className='w-full h-full object-cover transition-transform duration-300 
											group-hover:scale-105'
									/>
								</div>

								{/* Nút play */}
								<PlayButton song={song} />

								{/* Nút thêm hoặc dấu tích */}
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										if (!isInQueue) addToQueueOnly(song);
									}}
									className={`absolute top-2 right-2 p-1 rounded-full z-10 
										${isInQueue ? "bg-customRed text-white" : "bg-zinc-600 hover:bg-zinc-500 text-white"}`}
									title={isInQueue ? "Already in playlist" : "Add to playlist"}
								>
									{isInQueue ? <Check size={16} /> : <Plus size={16} />}
								</button>
							</div>

							<h3 className='font-medium mb-2 truncate'>{song.title}</h3>
							<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default SectionGrid;
