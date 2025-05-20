import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Song } from "@/types";

// Định nghĩa kiểu cho props component SortableSongRow
interface SortableSongRowProps {
  song: Song;
  index: number;
  isCurrentSong: boolean;
  isPlaying: boolean;
  handlePlaySong: (index: number) => void;
  handleNavigate: (songId: string) => void;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SortableSongRow = ({
  song,
  index,
  isCurrentSong,
  isPlaying,
  handlePlaySong,
  handleNavigate,
}: SortableSongRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: song._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => handlePlaySong(index)}
      className={`grid grid-cols-[16px_4fr_1fr] gap-4 px-2 py-2 text-sm rounded-md group cursor-pointer transition-colors ${
        isCurrentSong ? "bg-white/10 text-white" : "hover:bg-white/5 text-zinc-400"
      }`}
    >
      {/* Play / Index */}
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

      {/* Thumbnail, title, artist */}
      <div className="flex items-center gap-3 truncate">
        <img
          src={song.imageUrl}
          alt={song.title}
          className="w-10 h-10 rounded-md object-cover"
        />
        <div className="truncate">
          <div className="font-medium truncate">{song.title}</div>
          <div className="truncate text-sm">{song.artist}</div>
        </div>
      </div>

      {/* Duration + Info */}
      <div className="flex items-center justify-between gap-2 pr-2">
        <span>{formatDuration(song.duration)}</span>
        <Info
          className="w-4 h-4 cursor-pointer hover:text-white transition"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate(song._id);
          }}
        />
      </div>
    </div>
  );
};

const PlaylistQueue = () => {
  const { queue, currentSong, isPlaying, playSong, setQueue, togglePlay  } = usePlayerStore();
  const navigate = useNavigate();

  // Sử dụng dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor));

  const handlePlaySong = (index: number) => {
    const selectedSong = queue[index];

    if (!selectedSong.audioUrl) {
      console.warn("Bài hát không có audioUrl:", selectedSong);
      return;
    }

    if (currentSong?._id === selectedSong._id) {
      if (isPlaying) {
        togglePlay();
      } else {
        togglePlay();
      }
      return;
    }

    playSong(selectedSong, index);
  };


  const handleNavigateToSongPage = (songId: string) => {
    navigate(`/songs/${songId}`);
  };

  // Xử lý sắp xếp lại danh sách phát khi kéo thả
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((song) => song._id === active.id);
      const newIndex = queue.findIndex((song) => song._id === over.id);
      const newQueue = arrayMove(queue, oldIndex, newIndex);
      setQueue(newQueue);
    }
  };

  return (
    <div className="bg-zinc-900 backdrop-blur-sm rounded-md">
      <div className="grid grid-cols-[16px_4fr_1fr] gap-4 px-4 py-2 text-sm text-zinc-400 border-b border-white/5">
        <div>#</div>
        <div>Title</div>
        <div>Duration</div>
      </div>

      <ScrollArea className="h-[500px] px-4 py-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={queue.map((song) => song._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {queue.map((song, index) => {
                const isCurrentSong = currentSong?._id === song._id;

                return (
                  <SortableSongRow
                    key={song._id}
                    song={song}
                    index={index}
                    isCurrentSong={isCurrentSong}
                    isPlaying={isPlaying}
                    handlePlaySong={handlePlaySong}
                    handleNavigate={handleNavigateToSongPage}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
};

export default PlaylistQueue;
