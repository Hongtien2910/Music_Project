import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
	return (
		<div className='flex items-center justify-between mb-8'>
			<div className='flex items-center gap-3'>
				<Link to='/' className='rounded-lg p-2 flex gap-2 items-center justify-center'>
					<img src='/logo.png' className='size-14 text-black' />
                    <h1 className="text-3xl font-bold text-customRed">PSong</h1>
				</Link>
				<div>
					<h1 className='text-3xl font-bold'>Music Manager</h1>
					<p className='text-zinc-400 mt-1'>Manage your music catalog</p>
				</div>
			</div>
            <div className="relative">
                <UserButton
                    appearance={{
                    elements: {
                        userButtonAvatarBox: "w-11 h-11 rounded-full",
                    },
                    }}
                />
                <div className="absolute bottom-1 right-0 w-1 h-1 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-customRed"></div>
            </div>
		</div>
	);
};
export default Header;