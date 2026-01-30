import axios from "axios";

const api = axios.create({
  baseURL: "https://metamind-backend-5tu9.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  const publicRoutes = [
    "/admin/login/",
    "/token/",
    "/token/refresh/"
  ];

  const isPublicRoute = publicRoutes.some(route =>
    config.url.includes(route)
  );

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
