import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import PlayButton from "./PlayButton";
import { Link } from "react-router-dom";

type SectionGridProps = {
  title: string;
  songs: any[]; // chấp nhận dữ liệu không chuẩn từ ngoài
  isLoading: boolean;
  columns?: string;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
  if (isLoading) return <SectionGridSkeleton />;

  // ✨ Chuyển đổi dữ liệu về đúng dạng Song
const mappedSongs: Song[] = songs.map((song) => ({
  _id: song._id || song.mongoData?._id || "",
  albumId: song.mongoData?.albumId || "",
  albumTitle:  song.mongoData?.albumTitle || song.albumTitle || "Unknown Album",
  audioUrl: song.mongoData?.audioUrl || song.link || "",
  createdAt: song.mongoData?.createdAt || new Date().toISOString(),
  updatedAt: song.mongoData?.updatedAt || new Date().toISOString(),
  title: song.mongoData?.title || song.title || "Unknown Title",
  artist: song.mongoData?.artist || song.artist || "Unknown Artist",
  imageUrl: song.mongoData?.imageUrl || song.imageUrl || "",
  duration: Number(song.mongoData?.duration || song.duration ||  0),
  lyricUrl: song.mongoData?.lyricUrl || song.lyricUrl ||  "",
}));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mappedSongs.map((song) => (
          <Link
            to={`/songs/${song._id}`}
            key={song._id}
            className="bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer"
          >
            <div className="relative mb-4">
              <div className="aspect-square rounded-md shadow-lg overflow-hidden">
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <PlayButton song={song} />
            </div>
            <h3 className="font-medium mb-2 truncate">{song.title}</h3>
            <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SectionGrid;
