import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";

interface EditSongDialogProps {
	song: {
		_id: string;
		title: string;
		artist: string;
		duration: number;
		albumId?: string;
		audioUrl?: string;
		imageUrl?: string;
		lyricUrl?: string;
	};
}

const EditSongDialog = ({ song }: EditSongDialogProps) => {
	const { albums, updateSong } = useMusicStore();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [updatedSong, setUpdatedSong] = useState({
		title: song.title,
		artist: song.artist,
		duration: song.duration,
		album: song.albumId || "none",
	});

	const [files, setFiles] = useState<{ audio: File | null; image: File | null; lyric: File | null }>({
		audio: null,
		image: null,
		lyric: null,
	});

	const imageInputRef = useRef<HTMLInputElement>(null);
	const lyricInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("artist", updatedSong.artist);
			formData.append("duration", updatedSong.duration.toString());

			if (updatedSong.album && updatedSong.album !== "none") {
				formData.append("albumId", updatedSong.album);
			}

			// Không cho phép thay đổi audio file
			if (files.image) formData.append("imageFile", files.image);
			if (files.lyric) formData.append("lyricFile", files.lyric);

			await updateSong(song._id, formData);
			setDialogOpen(false);
		} catch (error: any) {
			console.error("Update song error", error);
		} finally {
			setIsLoading(false);
		}
	};

	const audioFilename = song.audioUrl ? song.audioUrl.split("/").pop() : null;
	const imageFilename = song.imageUrl ? song.imageUrl.split("/").pop() : null;
	const lyricFilename = song.lyricUrl ? song.lyricUrl.split("/").pop() : null;

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="text-sm flex items-center gap-2">
					<Pencil size={16} className="text-blue-500 hover:text-blue-400 hover:bg-blue-400/10" />
				</Button>
			</DialogTrigger>

			<DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh]">
				<DialogHeader>
					<DialogTitle>Edit Song</DialogTitle>
					<DialogDescription>Update the song details</DialogDescription>
				</DialogHeader>

				{/* Bọc nội dung bằng ScrollArea để cuộn nội dung nếu vượt quá chiều cao */}
				<ScrollArea className="max-h-[60vh] py-4 space-y-4">
					{/* Audio file (không thể chỉnh sửa) */}
					<div className="space-y-1">
						<label className="text-sm font-medium text-white">Audio File</label>
						<label className="text-sm font-medium text-red-500"> (cannot edit)</label>
						<div className="text-zinc-400 select-none">{audioFilename || "No audio file available"}</div>
					</div>

					{/* Image file */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Update Artwork</label>
						<div className="flex items-center justify-between">
							<div className="text-slate-200 select-none max-w-full truncate">{imageFilename || "No image file available"}</div>
							<Button
								variant="outline"
								onClick={() => imageInputRef.current?.click()}
								className="w-[180px] truncate overflow-hidden whitespace-nowrap"
							>
								{files.image ? files.image.name : "Choose new image file"}
							</Button>
							<input
								type="file"
								hidden
								accept="image/*"
								ref={imageInputRef}
								onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
							/>
						</div>
					</div>

					{/* Lyric file */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Update Lyric file</label>
						<div className="flex items-center justify-between">
							<div className="text-slate-200 select-none max-w-full truncate">{lyricFilename || "No lyric file available"}</div>
							<Button
								variant="outline"
								onClick={() => lyricInputRef.current?.click()}
								className="w-[180px] truncate overflow-hidden whitespace-nowrap"
							>
								{files.lyric ? files.lyric.name : "Choose new lyric file"}
							</Button>
							<input
								type="file"
								hidden
								accept=".lrc"
								ref={lyricInputRef}
								onChange={(e) => setFiles((prev) => ({ ...prev, lyric: e.target.files?.[0] || null }))}
							/>
						</div>
					</div>

					{/* Title */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-white">Title</label>
						<label className="text-sm font-medium text-red-500"> (cannot edit)</label>
						<Input
							value={updatedSong.title}
							readOnly
							className="bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed"
						/>
					</div>

					{/* Artist */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Artist</label>
						<Input
							value={updatedSong.artist}
							onChange={(e) => setUpdatedSong({ ...updatedSong, artist: e.target.value })}
							className="bg-zinc-800 border-zinc-700"
						/>
					</div>

					{/* Duration (không cho sửa) */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-white">Duration</label>
						<label className="text-sm font-medium text-red-500"> (cannot edit)</label>
						<Input
							type="number"
							value={updatedSong.duration}
							readOnly
							className="bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed"
						/>
					</div>

					{/* Album select */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Album</label>
						<Select
							value={updatedSong.album}
							onValueChange={(value) => setUpdatedSong({ ...updatedSong, album: value })}
						>
							<SelectTrigger className="bg-zinc-800 border-zinc-700">
								<SelectValue placeholder="Select album" />
							</SelectTrigger>
							<SelectContent className="bg-zinc-800 border-zinc-700">
								<SelectItem value="none">No Album (Single)</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</ScrollArea>

				<DialogFooter>
					<Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>
						{isLoading ? "Updating..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditSongDialog;