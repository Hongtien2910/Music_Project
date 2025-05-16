import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useMusicStore } from "@/stores/useMusicStore";
import SectionGridSong from "./components/SectionGridSong";
import SectionGridAlbum from "./components/SectionGridAlbum";
import MicrophoneIndicator from "./components/MicrophoneIndicator";

// @ts-ignore
import Recorder from "recorder-js";

const SearchPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [hasSearchedByAudio, setHasSearchedByAudio] = useState(false);

  const fetchSongs = useMusicStore(state => state.fetchSongs);
  const fetchAlbums = useMusicStore(state => state.fetchAlbums);

  // Khai báo ref cho AudioContext, Recorder, MediaStream và Timeout ID
  const audioContext = useRef<AudioContext | null>(null);
  const recorder = useRef<Recorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutId = useRef<number | null>(null);

  useEffect(() => {
    fetchSongs();
    fetchAlbums();
  }, [fetchSongs, fetchAlbums]);

  useEffect(() => {
    if (keyword.trim() !== "") {
      setHasSearchedByAudio(false);
    }
  }, [keyword]);

  // Cleanup khi component unmount hoặc khi bắt đầu ghi âm mới
  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }
    };
  }, []);

  const {
    isLoading,
    searchByAudio,
    searchedSongs,
    songs,
    albums,
  } = useMusicStore();

  const filteredSongs = keyword.trim()
    ? songs.filter(
        (song) =>
          song.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          song.artist?.toLowerCase().includes(keyword.toLowerCase())
      )
    : [];

  const filteredAlbums = keyword.trim()
    ? albums.filter(
        (album) =>
          album.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          album.artist?.toLowerCase().includes(keyword.toLowerCase())
      )
    : [];

  const handleAudioSearch = async () => {
    if (!navigator.mediaDevices) {
      alert("The browser does not support recording");
      return;
    }

    try {
      if (!audioContext.current) {
        const AudioCtxClass = (window.AudioContext || (window as any).webkitAudioContext);
        audioContext.current = new AudioCtxClass();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Khởi tạo Recorder với AudioContext
      recorder.current = new Recorder(audioContext.current);

      await audioContext.current.resume();

      // Kết nối stream tới recorder
      await recorder.current.init(stream);

      // Bắt đầu ghi
      recorder.current.start();
      setIsRecording(true);

      // Ghi trong 10 giây rồi dừng
      timeoutId.current = window.setTimeout(async () => {
        if (!recorder.current) return;
        const { blob } = await recorder.current.stop();
        setIsRecording(false);

        // Tạo file WAV
        const wavFile = new File([blob], "recording.wav", { type: "audio/wav" });

        // Gọi hàm gửi file lên backend
        await searchByAudio(wavFile);

        setHasSearchedByAudio(true);

        // Dừng stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }, 10000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone cannot be accessed. Please check your access rights.");
      setIsRecording(false);
    }
  };

  // Hiển thị kết quả nếu có keyword hoặc tìm bằng audio
  const shouldShowResults = keyword.trim() !== "" || hasSearchedByAudio;

  return (
    <main className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900">
      <Topbar />
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-4 sm:p-6">
          {/* Header + Search input + Mic button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Search</h1>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Enter song name, album or artist..."
                className="w-[300px] max-w-xl bg-zinc-800 text-white px-4 py-2 rounded-md border border-customRed focus:outline-none focus:border-customRed focus:ring-1 focus:ring-customRed"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isRecording}
              />
              <button
                className={`text-white p-2 rounded-full ${
                  isRecording ? "bg-customRed hover:bg-red-800" : "bg-zinc-700 hover:bg-zinc-600"
                } transition`}
                onClick={handleAudioSearch}
                title="Tìm bằng giọng nói"
                disabled={isRecording}
              >
                {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
            </div>
          </div>

          {isRecording && <MicrophoneIndicator />}

          {/* Kết quả tìm kiếm */}
          {shouldShowResults && (
            <div className="space-y-8">
              {keyword.trim() !== "" && (
                <>
                  {filteredSongs.length > 0 && (
                    <SectionGridSong
                      title="Songs results"
                      songs={filteredSongs}
                      isLoading={isLoading}
                    />
                  )}
                  {filteredAlbums.length > 0 && (
                    <SectionGridAlbum
                      title="Albums results"
                      albums={filteredAlbums}
                      isLoading={isLoading}
                    />
                  )}
                  {filteredSongs.length === 0 && filteredAlbums.length === 0 && (
                    <p className="text-white text-center">No results found matching your keyword.</p>
                  )}
                </>
              )}

              {hasSearchedByAudio && (
                <>
                  {searchedSongs.length > 0 && (
                    <SectionGridSong
                      title="Maybe this song"
                      songs={searchedSongs}
                      isLoading={isLoading}
                    />
                  )}
                  {searchedSongs.length === 0 && (
                    <p className="text-white text-center">No results found matching the audio.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </main>
  );
};

export default SearchPage;
