import { useMusicStore } from "@/stores/useMusicStore";
import { Library , ListMusic, Headphones, Users  } from "lucide-react";
import StatsCard from "./StatsCard";

const DashboardStats = () => {
	const { stats } = useMusicStore();

	const statsData = [
		{
			icon: ListMusic,
			label: "Total Songs",
			value: stats.totalSongs.toString(),
			bgColor: "bg-[#68D9CE]/10",
			iconColor: "text-[#68D9CE]",
		},
		{
			icon: Library,
			label: "Total Albums",
			value: stats.totalAlbums.toString(),
			bgColor: "bg-[#76D53E]/10",
			iconColor: "text-[#76D53E]",
		},
		{
			icon: Headphones,
			label: "Total Artists",
			value: stats.totalArtists.toLocaleString(),
			bgColor: "bg-[#E43939]/10",
			iconColor: "text-[#E43939]",
		},
		{
			icon: Users,
			label: "Total Users",
			value: stats.totalUsers.toLocaleString(),
			bgColor: "bg-[#4F39B3]/10",
			iconColor: "text-[#4F39B3] ",
		},
	];

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 '>
			{statsData.map((stat) => (
				<StatsCard
					key={stat.label}
					icon={stat.icon}
					label={stat.label}
					value={stat.value}
					bgColor={stat.bgColor}
					iconColor={stat.iconColor}
				/>
			))}
		</div>
	);
};
export default DashboardStats;