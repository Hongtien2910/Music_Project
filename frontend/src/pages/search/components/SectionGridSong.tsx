import { Song } from "@/types";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Info, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { Heart } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useAuthStore } from "@/stores/useAuthStore";

type SectionGridProps = {
  title: string;
  songs: any[];
  isLoading: boolean;
};

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
  const { queue, addToQueueOnly } = usePlayerStore(); 
  const navigate = useNavigate();
  const { currentSong, isPlaying, playAlbum } = usePlayerStore();
  const { likeOrUnlikeSong, isSongLiked } = useMusicStore();
	const { currentUser } = useAuthStore();

  // chuẩn hóa data đầu vào thành dạng Song
  const mappedSongs: Song[] = songs.map((song) => ({
    _id: song._id || song.mongoData?._id || "",
    albumId: song.mongoData?.albumId || "",
    albumTitle: song.mongoData?.albumTitle || song.albumTitle || "Unknown Album",
    audioUrl: song.mongoData?.audioUrl || song.audioUrl || "",
    createdAt: song.mongoData?.createdAt || new Date().toISOString(),
    updatedAt: song.mongoData?.updatedAt || new Date().toISOString(),
    title: song.mongoData?.title || song.title || "Unknown Title",
    artist: song.mongoData?.artist || song.artist || "Unknown Artist",
    imageUrl: song.mongoData?.imageUrl || song.imageUrl || "",
    duration: Number(song.mongoData?.duration || song.duration || 0),
    lyricUrl: song.mongoData?.lyricUrl || song.lyricUrl || "",
  }));

  const handlePlaySong = (index: number) => {
    playAlbum(mappedSongs, index);
  };

  const handleNavigateToSongPage = (songId: string) => {
    navigate(`/songs/${songId}`);
  };

  if (isLoading) return <div>Loading...</div>; // Bạn có thể thay bằng skeleton

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>

      <div className="bg-black/20 backdrop-blur-sm rounded-md">
        {/* Table header */}
        <div className="grid grid-cols-[24px_3fr_1fr_2fr_1fr] gap-4 px-6 py-2 text-sm text-zinc-400 border-b border-white/5">
          <div>#</div>
          <div>Title</div>
          <div></div>
          <div>Released Date</div>
          <div>
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div>
          <ScrollArea className="h-[200px] rounded-md">
            <div className="space-y-2 py-2">
              {mappedSongs.map((song, index) => {
                const isCurrentSong = currentSong?._id === song._id;
                return (
                  <div
                    key={song._id}
                    onClick={() => handlePlaySong(index)}
                    className={`grid grid-cols-[24px_3fr_1fr_2fr_1fr] gap-4 px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer ${
                      isCurrentSong ? "text-white" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {isCurrentSong ? (
                        isPlaying ? (
                          <div className="flex items-end gap-[2px] h-4">
                            <div className="w-[2px] h-full bg-customRed animate-[equalizer_1s_ease-in-out_infinite]" />
                            <div className="w-[2px] h-3 bg-customRed animate-[equalizer_1s_ease-in-out_infinite_0.2s]" />
                            <div className="w-[2px] h-2 bg-customRed animate-[equalizer_1s_ease-in-out_infinite_0.4s]" />
                          </div>
                        ) : (
                          <Play className="h-4 w-4 text-customRed" />
                        )
                      ) : (
                        <>
                          <span className="group-hover:hidden">{index + 1}</span>
                          <Play className="h-4 w-4 hidden group-hover:block" />
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="truncate">
                        <div className="font-medium truncate">{song.title}</div>
                        <div className="truncate">{song.artist}</div>
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

                    <div className="flex items-center">{song.createdAt.split("T")[0]}</div>

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
  );
};

export default SectionGrid;
