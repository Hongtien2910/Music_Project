import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useMusicStore } from "@/stores/useMusicStore";
import SectionGridSong from "./components/SectionGridSong";
import SectionGridAlbum from "./components/SectionGridAlbum";
import MicrophoneIndicator from "./components/MicrophoneIndicator";

const SearchPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [keyword, setKeyword] = useState("");
  const [hasSearchedByAudio, setHasSearchedByAudio] = useState(false);

  const fetchSongs = useMusicStore(state => state.fetchSongs);
  const fetchAlbums = useMusicStore(state => state.fetchAlbums);

  useEffect(() => {
    fetchSongs();
    fetchAlbums();
  }, [fetchSongs, fetchAlbums]);

  const {
    isLoading,
    searchByAudio,
    searchedSongs,
    searchedAlbums,
    songs,
    albums,
  } = useMusicStore();

  // Lọc bài hát theo keyword trên toàn bộ songs
  const filteredSongs = keyword.trim()
    ? songs.filter(
        (song) =>
          song.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          song.artist?.toLowerCase().includes(keyword.toLowerCase())
      )
    : [];

  // Lọc album theo keyword trên toàn bộ albums
  const filteredAlbums = keyword.trim()
    ? albums.filter(
        (album) =>
          album.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          album.artist?.toLowerCase().includes(keyword.toLowerCase())
      )
    : [];
    
  // Logic ghi âm tìm kiếm bằng audio
  const handleAudioSearch = async () => {
    if (!navigator.mediaDevices) {
      alert("The browser does not support recording");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "recording.webm");
        await searchByAudio(file);
        setHasSearchedByAudio(true);
        setIsRecording(false);
      };

      recorder.start();

      setIsRecording(true);
      setTimeout(() => {
        recorder.stop();
      }, 10000); // Dừng sau 10 giây
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone cannot be accessed. Please check your access rights.");
    }
  };

  // Quyết định hiển thị kết quả: nếu có từ khóa hoặc đã tìm bằng audio
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
              />
              <button
                className={`text-white p-2 rounded-full ${
                  isRecording ? "bg-customRed hover:bg-red-800" : "bg-zinc-700 hover:bg-zinc-600"
                } transition`}
                onClick={handleAudioSearch}
                title="Tìm bằng giọng nói"
              >
                {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
            </div>
          </div>

          {isRecording && <MicrophoneIndicator />}

          {/* Kết quả tìm kiếm */}
          {shouldShowResults && ( 
            <div className="space-y-8">
              
              {/* Nếu tìm bằng keyword */}
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

              {/* Nếu tìm bằng audio */}
              {hasSearchedByAudio && (
                <>
                  {searchedSongs.length > 0 && (
                    <SectionGridSong
                      title="Bài hát tương tự"
                      songs={searchedSongs}
                      isLoading={isLoading}
                    />
                  )}
                  {searchedAlbums.length > 0 && (
                    <SectionGridAlbum
                      title="Album tương tự"
                      albums={searchedAlbums}
                      isLoading={isLoading}
                    />
                  )}
                  {searchedSongs.length === 0 && searchedAlbums.length === 0 && (
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
