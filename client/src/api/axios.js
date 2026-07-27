// client/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Points to your Express server
});

// Automatically attach the JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
