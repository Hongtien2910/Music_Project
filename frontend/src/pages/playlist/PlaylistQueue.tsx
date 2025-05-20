import PlaylistQueue from "@/components/PlaylistQueue";

const PlaylistQueuePage = () => {
  return (
    <main className="rounded-md overflow-hidden h-full bg-gradient-to-b bg-zinc-900">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Playlist</h1>
        <PlaylistQueue />
      </div>
    </main>
  );
};

export default PlaylistQueuePage;