import { create } from "zustand";
import api from "../api/api";

const savedUser = JSON.parse(localStorage.getItem("user") || "null");
const savedToken = localStorage.getItem("token") || null;

export const useAuthStore = create((set) => ({
  user: savedUser,
  token: savedToken,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      const userData = res.data.user || res.data;
      const token = res.data.token;

      localStorage.setItem("user", JSON.stringify(userData));
      if (token) localStorage.setItem("token", token);

      set({ user: userData, token, loading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      set({ error: msg, loading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const userData = res.data.user || res.data;
      const token = res.data.token;

      localStorage.setItem("user", JSON.stringify(userData));
      if (token) localStorage.setItem("token", token);

      set({ user: userData, token, loading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));