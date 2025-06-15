import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaUpload } from "react-icons/fa";
import { useMusicStore } from "@/stores/useMusicStore";
import SectionGridSong from "./components/SectionGridSong";
import SectionGridAlbum from "./components/SectionGridAlbum";
import MicrophoneIndicator from "./components/MicrophoneIndicator";

const SearchPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [hasSearchedByAudio, setHasSearchedByAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const fetchSongs = useMusicStore((state) => state.fetchSongs);
  const fetchAlbums = useMusicStore((state) => state.fetchAlbums);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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

  useEffect(() => {
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
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
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert("Your browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });

        setIsRecording(false);
        setIsAudioLoading(true);

        try {
          await searchByAudio(audioFile);
          setHasSearchedByAudio(true);
        } catch (error) {
          console.error("Error uploading recorded audio:", error);
          alert("There was an error processing the recorded audio.");
        } finally {
          setIsAudioLoading(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      timeoutId.current = window.setTimeout(() => {
        mediaRecorder.stop();
      }, 10000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone cannot be accessed.");
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["audio/wav", "audio/mp3", "audio/mpeg"].includes(file.type)) {
      alert("Please upload an MP3 or WAV file.");
      return;
    }

    try {
      setIsAudioLoading(true);
      await searchByAudio(file);
      setHasSearchedByAudio(true);
    } catch (error) {
      console.error("Error uploading audio file:", error);
      alert("There was an error processing the uploaded file.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const shouldShowResults = keyword.trim() !== "" || hasSearchedByAudio;

  return (
    <main className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900">
      <Topbar />
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Search</h1>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Enter song name, album or artist..."
                className="w-[300px] max-w-xl bg-zinc-800 text-white px-4 py-2 rounded-md border border-customRed focus:outline-none focus:border-customRed focus:ring-1 focus:ring-customRed"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isRecording || isAudioLoading}
              />

              <button
                className={`text-white p-2 rounded-full ${
                  isRecording ? "bg-zinc-700 hover:bg-zinc-600" : "bg-customRed hover:bg-red-800"
                } transition`}
                onClick={handleAudioSearch}
                title="Search by voice"
                disabled={isRecording || isAudioLoading || keyword.trim() !== ""}
              >
                {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>

              <label
                htmlFor="file-upload"
                className={`cursor-pointer text-white p-2 rounded-full bg-customRed hover:bg-red-800 transition ${
                  isRecording || isAudioLoading ? "pointer-events-none opacity-50" : ""
                }`}
                title="Upload audio file"
              >
                <FaUpload />
                <input
                  id="file-upload"
                  type="file"
                  accept=".mp3,.wav"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isRecording || isAudioLoading || keyword.trim() !== ""}
                />
              </label>
            </div>
          </div>

          {isRecording && <MicrophoneIndicator />}

          {isAudioLoading && (
            <div className="flex justify-center mt-6">
              <div className="w-8 h-8 border-4 border-white border-t-customRed rounded-full animate-spin" />
            </div>
          )}

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
                  {searchedSongs.length > 0 ? (
                    <SectionGridSong
                      title="Maybe this song"
                      songs={searchedSongs}
                      isLoading={isLoading}
                    />
                  ) : (
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
