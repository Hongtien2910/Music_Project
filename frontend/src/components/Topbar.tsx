import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";

const Topbar = () => {
    const {isAdmin} = useAuthStore();
    console.log(isAdmin);
  return (
    <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10">
        <div className = "flex gap-2 items-center">
            <img src="/logo.png" alt="Logo" className="w-12 h-10" />
            <h1 className="text-2xl font-bold text-customRed">PSong</h1>
        </div>
        <div className= "flex items-center gap-4">
            {isAdmin && (
                <Link to={"/admin"} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200">
                    <LayoutDashboardIcon className="size-4 mr-2"/>Admin Dasboard
                </Link>
            )}

            <SignedOut>
                <SignInOAuthButtons />
            </SignedOut>

            <div className="relative">
                <UserButton
                    appearance={{
                    elements: {
                        userButtonAvatarBox: "w-9 h-9 rounded-full",
                    },
                    }}
                />
                <div className="absolute bottom-0 right-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-customRed"></div>
            </div>


        </div>
    </div>
  )
};

export default Topbar;