import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Music, Trash2 } from "lucide-react";
import { useEffect } from "react";
import EditAlbumDialog from "./EditAlbumDialog";

const AlbumsTable = () => {
	const { albums, deleteAlbum, fetchAlbums } = useMusicStore();

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	return (
		<ScrollArea className="h-[500px] w-full rounded-md border">
			<Table>
				<TableHeader>
					<TableRow className='hover:bg-zinc-800/50'>
						<TableHead className='w-[50px]'></TableHead>
						<TableHead>Title</TableHead>
						<TableHead>Artist</TableHead>
						<TableHead>Release Year</TableHead>
						<TableHead>Songs</TableHead>
						<TableHead className='w-[60px] text-center'>Edit  /  Delete</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{albums.map((album) => (
						<TableRow key={album._id} className='hover:bg-zinc-800/50'>
							<TableCell>
								<img src={album.imageUrl} alt={album.title} className='w-10 h-10 rounded object-cover' />
							</TableCell>
							<TableCell className='font-medium'>{album.title}</TableCell>
							<TableCell>{album.artist}</TableCell>
							<TableCell>
								<span className='inline-flex items-center gap-1 text-zinc-400'>
									<Calendar className='h-4 w-4' />
									{album.releaseYear}
								</span>
							</TableCell>
							<TableCell>
								<span className='inline-flex items-center gap-1 text-zinc-400'>
									<Music className='h-4 w-4' />
									{album.songs.length} songs
								</span>
							</TableCell>
							<TableCell className='text-right'>
								<div className='flex gap-2 justify-end'>
									{/* Nút chỉnh sửa album */}
									<EditAlbumDialog album={album} />
									{/* Nút xóa album */}
									<Button
										variant={"outline"}
										className="text-sm flex items-center gap-2"
										onClick={() => deleteAlbum(album._id)}
									>
										<Trash2 size={16} className='text-customRed hover:text-customRed/40 hover:bg-red-400/10' />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</ScrollArea>

	);
};
export default AlbumsTable;