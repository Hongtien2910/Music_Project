import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth, useSession } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const updateApiToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, userId } = useAuth();
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const { checkAdminStatus, checkSignedIn } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();

  // Khởi tạo và kiểm tra auth ban đầu
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        updateApiToken(token);
        if (token) {
          await checkAdminStatus();
          await checkSignedIn();
          if (userId) initSocket(userId);
        }
      } catch (error) {
        updateApiToken(null);
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      disconnectSocket();
    };
  }, [getToken, userId, checkAdminStatus, checkSignedIn, initSocket, disconnectSocket]);

  // Tự động refresh token mỗi 1 phút
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        // Không truyền { refresh: true }
        const token = await getToken();
        updateApiToken(token);
      } catch (error) {
        console.error("Error refreshing token:", error);
        updateApiToken(null);
      }
    }, 60 * 1000); // 1 phút

    return () => clearInterval(intervalId);
  }, [getToken]);

  // Cập nhật token mỗi khi session thay đổi
  useEffect(() => {
    if (!session) {
      updateApiToken(null);
      return;
    }

    const refreshToken = async () => {
      try {
        const token = await getToken();
        updateApiToken(token);
      } catch (error) {
        console.error("Error refreshing token on session change:", error);
        updateApiToken(null);
      }
    };

    refreshToken();
  }, [session, getToken]);

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
