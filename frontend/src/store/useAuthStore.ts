import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  let initialUser: User | null = null;
  try {
    if (savedUser) initialUser = JSON.parse(savedUser);
  } catch (e) {
    // ignore
  }

  return {
    token: savedToken,
    user: initialUser,
    isAuthenticated: !!savedToken,

    setAuth: (token: string, user: User) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false });
    },

    hasPermission: (permissionCode: string) => {
      const { user } = get();
      if (!user) return false;
      if (user.roles?.includes('ROLE_ADMIN')) return true;
      return user.permissions?.includes(permissionCode) || false;
    },

    hasRole: (roleName: string) => {
      const { user } = get();
      if (!user) return false;
      return user.roles?.includes(roleName) || false;
    },
  };
});
