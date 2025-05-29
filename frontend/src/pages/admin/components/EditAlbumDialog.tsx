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
import { useMusicStore } from "@/stores/useMusicStore";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";

interface EditAlbumDialogProps {
	album: {
		_id: string;
		title: string;
		artist: string;
		releaseYear: number;
		imageUrl?: string;
	};
}

const EditAlbumDialog = ({ album }: EditAlbumDialogProps) => {
	const { updateAlbum } = useMusicStore();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [updatedAlbum, setUpdatedAlbum] = useState({
		title: album.title,
		artist: album.artist,
		releaseYear: album.releaseYear,
	});

	const [imageFile, setImageFile] = useState<File | null>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("title", updatedAlbum.title);
			formData.append("artist", updatedAlbum.artist);
			formData.append("releaseYear", updatedAlbum.releaseYear.toString());

			if (imageFile) {
				formData.append("imageFile", imageFile);
			}

			await updateAlbum(album._id, formData);
			setDialogOpen(false);
		} catch (error: any) {
			console.error("Update album error", error);
		} finally {
			setIsLoading(false);
		}
	};

	const imageFilename = album.imageUrl ? album.imageUrl.split("/").pop() : null;

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="text-sm flex items-center gap-2">
					<Pencil size={16} className="text-blue-500 hover:text-blue-400 hover:bg-blue-400/10" />
				</Button>
			</DialogTrigger>

			<DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh]">
				<DialogHeader>
					<DialogTitle>Edit Album</DialogTitle>
					<DialogDescription>Update album details</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Image file */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Update Album Artwork</label>
						<div className="flex items-center justify-between">
							<div className="text-slate-200 select-none max-w-full truncate">{imageFile ? imageFile.name : imageFilename || "No image available"}</div>
							<Button
								variant="outline"
								onClick={() => imageInputRef.current?.click()}
								className="w-[180px] truncate overflow-hidden whitespace-nowrap"
							>
								{imageFile ? imageFile.name : "Choose new image file"}
							</Button>
							<input
								type="file"
								hidden
								accept="image/*"
								ref={imageInputRef}
								onChange={(e) => setImageFile(e.target.files?.[0] || null)}
							/>
						</div>
					</div>

					{/* Title */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Album Title</label>
						<Input
							value={updatedAlbum.title}
							onChange={(e) => setUpdatedAlbum({ ...updatedAlbum, title: e.target.value })}
							className="bg-zinc-800 border-zinc-700"
							placeholder="Enter album title"
						/>
					</div>

					{/* Artist */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Artist</label>
						<Input
							value={updatedAlbum.artist}
							onChange={(e) => setUpdatedAlbum({ ...updatedAlbum, artist: e.target.value })}
							className="bg-zinc-800 border-zinc-700"
							placeholder="Enter artist name"
						/>
					</div>

					{/* Release Year */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Release Year</label>
						<Input
							type="number"
							value={updatedAlbum.releaseYear}
							onChange={(e) =>
								setUpdatedAlbum({
									...updatedAlbum,
									releaseYear: Math.min(Math.max(parseInt(e.target.value), 1900), new Date().getFullYear()),
								})
							}
							className="bg-zinc-800 border-zinc-700"
							placeholder="Enter release year"
							min={1900}
							max={new Date().getFullYear()}
						/>
					</div>
				</div>

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

export default EditAlbumDialog;