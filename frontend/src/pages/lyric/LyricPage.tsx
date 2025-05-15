import { useEffect, useState, useRef } from "react";
import { usePlayerStore } from "@/stores/usePlayerStore";

const parseLRC = (lrc: string) => {
  const lines = lrc.split("\n");
  const parsed = lines
    .map((line) => {
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
      if (!match) return null;
      const [, min, sec, text] = match;
      const time = parseInt(min) * 60 + parseFloat(sec);
      return { time, text: text.trim() };
    })
    .filter(Boolean) as { time: number; text: string }[];
  return parsed;
};

const LyricPage = () => {
  const { currentSong, currentTime } = usePlayerStore();

  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadLyrics = async () => {
      if (currentSong?.lyricUrl) {
        try {
          const response = await fetch(currentSong.lyricUrl);
          const lrcText = await response.text();
          const parsedLyrics = parseLRC(lrcText);
          setLyrics(parsedLyrics);
        } catch (error) {
          console.error("Không thể tải lời bài hát:", error);
          setLyrics([]);
        }
      } else {
        setLyrics([]);
      }
    };

    loadLyrics();
  }, [currentSong]);

  useEffect(() => {
    if (!lyrics.length) return;

    const currentIndex = lyrics.findIndex((line, i) => {
      const nextLineTime = lyrics[i + 1]?.time ?? Infinity;
      return currentTime >= line.time && currentTime < nextLineTime;
    });

    setCurrentLineIndex(currentIndex);
  }, [currentTime, lyrics]);

  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeLine = activeLineRef.current;

      const containerHeight = container.clientHeight;
      const activeLineOffset = activeLine.offsetTop;
      const activeLineHeight = activeLine.clientHeight;

      const scrollTop = activeLineOffset - containerHeight / 2 + activeLineHeight / 2;

      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  }, [currentLineIndex]);

  if (!currentSong) return <p className="text-white p-4">There are no songs playing yet.</p>;

  return (
    <div className="h-full bg-gradient-to-b from-customRed via-[#191414] to-customRed text-white flex flex-col">
      <div className="p-8 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold tracking-wide">
          {currentSong.title}
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          {currentSong.artist}
          {currentSong.albumTitle && ` • ${currentSong.albumTitle}`}
        </p>
      </div>

      <div
        ref={lyricsContainerRef}
        className="flex-1 max-h-[60vh] overflow-y-auto overflow-x-hidden px-4 py-6 bg-black/30 backdrop-blur-md rounded-lg shadow-lg mx-6 scrollbar-hide"
      >
        {lyrics.length > 0 ? (
          <div className="flex flex-col space-y-3 text-center">
            {lyrics.map((line, index) => (
              <div
                key={line.time}
                ref={index === currentLineIndex ? activeLineRef : null}
                className={`w-full text-center transition-all duration-500 ease-in-out ${
                  index === currentLineIndex
                    ? "text-white font-bold text-xl scale-100 drop-shadow-[0_0_10px_rgba(29,185,84,0.7)]"
                    : "text-gray-400"
                }`}
              >
                {line.text}
              </div>
            ))}
          </div>
        ) : (
          <p className="italic text-gray-500 text-center">Không có lời bài hát.</p>
        )}
      </div>
    </div>
  );
};

export default LyricPage;
