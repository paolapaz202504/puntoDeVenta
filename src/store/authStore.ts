import { create } from "zustand";
import { AuthState } from "../types";

const TOKEN_KEY = "puntov_token";
const USER_KEY = "puntov_user";

export const useAuthStore = create<AuthState>((set, get) => {
  const savedToken = localStorage.getItem(TOKEN_KEY);
  const savedUser = localStorage.getItem(USER_KEY);

  let initialUser = null;
  if (savedUser) {
    try {
      initialUser = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem(USER_KEY);
    }
  }

  return {
    token: savedToken,
    user: initialUser,
    isAuthenticated: !!savedToken && !!initialUser,

    login: (token, user) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    },

    updateUser: (updated) => {
      set((state) => {
        if (!state.user) return state;
        const newUser = { ...state.user, ...updated };
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        return { user: newUser };
      });
    },

    hasPermission: (slug: string) => {
      const user = get().user;
      if (!user || !user.permissions) return false;
      return user.permissions.includes(slug);
    },
  };
});
