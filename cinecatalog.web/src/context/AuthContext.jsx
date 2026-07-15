import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega os dados do usuário autenticado no início
  const loadUser = async () => {
    const token = localStorage.getItem('@CineCatalog:accessToken');
    if (token) {
      try {
        const response = await api.get('/api/Auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        // Em caso de erro irrecuperável de auth, limpamos a sessão
        if (error.status === 401 || error.status === 403) {
          handleLogoutLocal();
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();

    // Evento disparado pelo interceptor caso o refresh falhe
    const handleForceLogout = () => {
      handleLogoutLocal();
      toast.error('Sua sessão expirou. Faça login novamente.');
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, []);

  const handleLogoutLocal = () => {
    localStorage.removeItem('@CineCatalog:accessToken');
    localStorage.removeItem('@CineCatalog:refreshToken');
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/Auth/login', { email, password });
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('@CineCatalog:accessToken', accessToken);
      localStorage.setItem('@CineCatalog:refreshToken', refreshToken);

      // Busca dados do usuário após login de sucesso
      const userResponse = await api.get('/api/Auth/me');
      setUser(userResponse.data);
      
      toast.success(`Bem-vindo de volta, ${userResponse.data.name}!`);
      return userResponse.data;
    } catch (error) {
      throw error; // Repassa o erro formatado pelo interceptor para a tela tratar
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/api/Auth/register', { name, email, password });
      toast.success('Cadastro realizado com sucesso! Faça seu login.');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    handleLogoutLocal();
    toast.success('Sessão encerrada com sucesso.');
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfileState,
        refreshProfile: loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
