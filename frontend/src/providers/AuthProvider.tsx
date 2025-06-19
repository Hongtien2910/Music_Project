import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { createAuthenticatedAxios } from "@/lib/authenticatedAxios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { Loader } from "lucide-react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const { checkAdminStatus, checkSignedIn } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    const initAuth = async () => {
      const axios = createAuthenticatedAxios(getToken);
      try {
        await checkAdminStatus(axios);
        await checkSignedIn(axios);
        if (userId) initSocket(userId);
      } catch (error) {
        console.error("Lỗi xác thực:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    return () => disconnectSocket();
  }, [getToken, userId, checkAdminStatus, checkSignedIn, initSocket, disconnectSocket]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-3/12 text-customRed animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
