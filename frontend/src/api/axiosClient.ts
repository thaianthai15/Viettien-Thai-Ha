import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
});

axiosClient.interceptors.request.use((config) => {
  // const accessToken = localStorage.getItem("accessToken");
  const accessToken = localStorage.getItem("access");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default axiosClient;