import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import { Album, Music } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useState } from "react";


const AdminPage = () => {
	const { isAdmin, isLoading } = useAuthStore();
	const { fetchAlbums, fetchSongs, fetchStats } = useMusicStore();

	const [searchQuery, setSearchQuery] = useState(""); // State lưu từ khóa tìm kiếm
	const [activeTab, setActiveTab] = useState("songs"); // State theo dõi tab hiện tại

	useEffect(() => {
		fetchAlbums();
		fetchSongs();
		fetchStats();
	}, [fetchAlbums, fetchSongs, fetchStats]);

	if (!isAdmin && !isLoading) return <div>Unauthorized</div>;

	return (
		<div className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100 p-8'>
			<Header />
			<DashboardStats />

			<Tabs
				defaultValue='songs'
				className='space-y-6'
				onValueChange={(val) => {
					setActiveTab(val);
					setSearchQuery(""); // Reset search on tab change
				}}
			>
				{/* Tabs list + search input on the same row */}
				<div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
					<TabsList className='p-1 bg-zinc-800/50'>
						<TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700'>
							<Music className='mr-2 size-4' />
							Songs
						</TabsTrigger>
						<TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700'>
							<Album className='mr-2 size-4' />
							Albums
						</TabsTrigger>
					</TabsList>

					{/* Search input aligned to the right */}
					<input
						type='text'
						placeholder={`Search by title or artist in ${activeTab}`}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='w-64 px-4 py-2 rounded-md bg-zinc-800 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-600'
					/>
				</div>

				<TabsContent value='songs'>
					<SongsTabContent searchQuery={searchQuery} />
				</TabsContent>
				<TabsContent value='albums'>
					<AlbumsTabContent searchQuery={searchQuery} />
				</TabsContent>
			</Tabs>

		</div>
	);
};
export default AdminPage;