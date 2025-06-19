import { axiosInstance } from "@/lib/axios";
import { type GetToken } from "@clerk/types";

export const createAuthenticatedAxios = (getToken: GetToken) => {
  const instance = axiosInstance;

  instance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  return instance;
};
