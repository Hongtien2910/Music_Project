import SongSkeleton from "@/components/skeletons/SongSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SignedIn } from "@clerk/clerk-react";
import { Heart, HomeIcon, Library, MessageCircle, SearchIcon } from "lucide-react";
import { useLocation, Link } from "react-router-dom";


const LeftSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname; 

    const isLoading = true;

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
                        <span className = "text-lg font-semibold">Recent Songs</span>
                    </div>
                </div>
                <ScrollArea className = "h-[calc(100vh-300px)]">
                    <div className="space-y-2">
                        {isLoading ? (
                            <SongSkeleton />
                        ) : ("some music")}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
};

export default LeftSidebar;