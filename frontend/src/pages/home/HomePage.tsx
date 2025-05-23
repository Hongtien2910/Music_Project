import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import SectionGridAlbum from "./components/SectionGridAlbum";
import { useAuthStore } from "@/stores/useAuthStore";

const HomePage = () => {

  const {fetchFeaturedSongs, 
        fetchMadeForYouSongs, 
        fetchTrendingSongs, 
        fetchRandomAlbums,
        isLoading, 
        madeForYouSongs, 
        trendingSongs,
        randomAlbums} = useMusicStore();

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    fetchFeaturedSongs();
    fetchTrendingSongs();
    fetchRandomAlbums();

    if (isAuthenticated) {
      fetchMadeForYouSongs("/songs/made-for-you");
    } else {
      fetchMadeForYouSongs("/songs/made-for-you-public");
    }
  }, [isAuthenticated, fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs, fetchRandomAlbums]);


  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<h1 className='text-2xl sm:text-3xl font-bold mb-6'>Good afternoon</h1>
					<FeaturedSection />

					<div className='space-y-8'>
						<SectionGrid title='Made For You' songs={madeForYouSongs} isLoading={isLoading} />
						<SectionGrid title='Trending' songs={trendingSongs} isLoading={isLoading} />
					</div>
          <div className="my-8">
            <SectionGridAlbum 
              title="Random Albums" 
              albums={randomAlbums}
              isLoading={isLoading} 
            />
          </div>
				</div>
			</ScrollArea>
    </main>
  )
};

export default HomePage;