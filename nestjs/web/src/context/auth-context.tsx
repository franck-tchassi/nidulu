// web/src/context/auth-context.tsx

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, refreshToken as apiRefresh, getMe } from '../lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore'; // Importez le store

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Récupérez les fonctions du store cart
  const syncCartWithBackend = useCartStore((state) => state.syncCartWithBackend);
  const syncWishlistWithBackend = useCartStore((state) => state.syncWishlistWithBackend);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      const userData = await getMe();
      setUser(userData);
      
      // Synchroniser le panier et la wishlist après login
      setTimeout(() => {
        syncCartWithBackend(true);
        syncWishlistWithBackend(true);
      }, 500);
      
      toast.success("Connexion réussie !");
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      const response = await apiRegister(data);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
      
      // Synchroniser le panier et la wishlist après inscription
      setTimeout(() => {
        syncCartWithBackend(true);
        syncWishlistWithBackend(true);
      }, 500);
      
      toast.success("Inscription réussie !");
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Erreur d\'inscription');
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    
    // IMPORTANT: Ne pas vider le panier local
    // Le panier local reste pour quand l'utilisateur se reconnecte
    // Le store cart-storage gère déjà la persistance
    
    toast.info("Déconnexion réussie.");
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
          
          // Synchroniser au chargement initial si connecté
          setTimeout(() => {
            syncCartWithBackend(true);
            syncWishlistWithBackend(true);
          }, 800);
          
        } catch (error) {
          // Token invalide, essayer refresh
          try {
            const refreshData = await apiRefresh();
            localStorage.setItem('accessToken', refreshData.access_token);
            localStorage.setItem('refreshToken', refreshData.refresh_token);
            const userData = await getMe();
            setUser(userData);
            
            // Synchroniser après refresh
            setTimeout(() => {
              syncCartWithBackend(true);
              syncWishlistWithBackend(true);
            }, 800);
            
          } catch (refreshError) {
            logout();
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [syncCartWithBackend, syncWishlistWithBackend]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};