import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "@/lib/axios";

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSongRef = useRef<string | null>(null);

  const [hasCountedPlay, setHasCountedPlay] = useState(false);

  const { currentSong, isPlaying, playNext, setCurrentTime } = usePlayerStore();

  // Tăng lượt nghe khi nghe đủ 60 giây
  const handleTimeUpdate = async () => {
    if (audioRef.current && currentSong) {
      setCurrentTime(audioRef.current.currentTime);

      if (!hasCountedPlay && audioRef.current.currentTime >= 60) {
        setHasCountedPlay(true);
        try {
          await axiosInstance.patch(`/songs/${currentSong._id}/incrementplays`);
          console.log("✅ Đã tăng lượt nghe");
        } catch (error: any) {
          console.error("❌ Lỗi khi tăng lượt nghe:", error.response?.data?.message || error.message);
        }
      }
    }
  };

  // handle play/pause logic
  useEffect(() => {
    if (isPlaying) audioRef.current?.play();
    else audioRef.current?.pause();
  }, [isPlaying]);

  // handle song ends
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      playNext();
    };

    audio?.addEventListener("ended", handleEnded);

    return () => audio?.removeEventListener("ended", handleEnded);
  }, [playNext]);

  // handle song changes
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    // check if this is actually a new song
    const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
    if (isSongChange) {
      audio.src = currentSong?.audioUrl;
      // reset the playback position
      audio.currentTime = 0;
      setHasCountedPlay(false);
      prevSongRef.current = currentSong?.audioUrl;

      if (isPlaying) audio.play();
    }
  }, [currentSong, isPlaying]);

  return <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} />;
};
export default AudioPlayer;
