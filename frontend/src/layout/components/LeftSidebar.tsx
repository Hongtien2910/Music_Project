import SongSkeleton from "@/components/skeletons/SongSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { SignedIn } from "@clerk/clerk-react";
import { Heart, HomeIcon, Library, MessageCircle, SearchIcon } from "lucide-react";
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";


const LeftSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname; 

    // const { songs, fetchSongs, isLoading} = useMusicStore();

    // useEffect(() => {
    //     fetchSongs();
    // }, [fetchSongs]);

    // console.log("songs", songs);

    const { albums, fetchAlbums, isLoading} = useMusicStore();

    useEffect(() => {
        fetchAlbums();
    }, [fetchAlbums]);

    return (
        <div className = "h-full flex flex-col gap-2">
            {/* Logo */}
            <div className = "rounded-lg bg-zinc-900 p-2 flex gap-2 items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="w-14 h-12" />
                    <h1 className="text-2xl font-bold text-customRed">PSong</h1>
            </div>

            {/* Navigation Menu */}
            <div className = "rounded-lg bg-zinc-900 p-4">
                <div className = "space-y-2">
                    <Link to = {"/"} className = {cn(buttonVariants(
                        {
                            variant: "ghost",
                            className: `w-full justify-start text-white hover:bg-zinc-800 ${currentPath === "/" ? "bg-zinc-800" : ""}`
                        }
                    ))}>
                        <HomeIcon className = "mr-2 size-5" />
                        <span className = "hidden md:inline">Home</span>
                    </Link>

                    <Link to = {"/search"} className = {cn(buttonVariants(
                        {
                            variant: "ghost",
                            className: `w-full justify-start text-white hover:bg-zinc-800 ${currentPath === "/search" ? "bg-zinc-800" : ""}`
                        }
                    ))}>
                        <SearchIcon className = "mr-2 size-5" />
                        <span className = "hidden md:inline">Search</span>
                    </Link>

                    <SignedIn>
                        <Link to = {"/chat"} className = {cn(buttonVariants(
                            {
                                variant: "ghost",
                                className: `w-full justify-start text-white hover:bg-zinc-800 ${currentPath === "/chat" ? "bg-zinc-800" : ""}`
                            }
                        ))}>
                            <MessageCircle className = "mr-2 size-5" />
                            <span className = "hidden md:inline">Message</span>
                        </Link>

                        <Link to = {"/liked-song"} className = {cn(buttonVariants(
                            {
                                variant: "ghost",
                                className: `w-full justify-start text-white hover:bg-zinc-800 ${currentPath === "/liked-song" ? "bg-zinc-800" : ""}`
                            }
                        ))}>
                            <Heart className = "mr-2 size-5" />
                            <span className = "hidden md:inline">Liked Song</span>
                        </Link>
                    </SignedIn>
                </div>
            </div>

            {/* Library sections */}
            <div className = "flex-1 rounded-lg bg-zinc-900 p-4">
                <div className = "flex items-center justify-between mb-4">
                    <div className = "flex items-center text-white px-2">
                        <Library className = "mr-2 size-5" />
                        <span className = "text-lg font-semibold">All Albums</span>
                    </div>
                </div>
                <ScrollArea className = "h-[calc(100vh-460px)]">
                    <div className="space-y-2">
                        {isLoading ? (
                            <SongSkeleton />
                        ) : (
                            // songs.map((song) => (
                            //     <Link to={`/songs/${song._id}`} key={song._id} className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer">
                            //         <img src={song.imageUrl} alt="Song img" className="size-12 rounded-md flex-shrink-0 object-cover" />
                            //         <div className="flex-1 min-w-0 hidden md:block">
                            //             <p className="font-medium truncate">{song.title}</p>
                            //             <p className="text-sm text-zinc-400 truncate">Artist ・ {song.artist}</p>
                            //         </div>
                            //     </Link>
                            // ))
                            albums.map((album) => (
                                <Link to={`/albums/${album._id}`} key={album._id} className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer">
                                    <img src={album.imageUrl} alt="Album img" className="size-12 rounded-md flex-shrink-0 object-cover" />
                                    <div className="flex-1 min-w-0 hidden md:block">
                                        <p className="font-medium truncate">{album.title}</p>
                                        <p className="text-sm text-zinc-400 truncate">Artist ・ {album.artist}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
};

export default LeftSidebar;