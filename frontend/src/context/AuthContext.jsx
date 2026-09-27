import { createContext, useContext, useState, useEffect } from 'react';
import { loginRequest, registerRequest, googleLoginRequest, updateProfileRequest } from '../api';

const AuthContext = createContext();
const STORAGE_KEY = 'vwl_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  async function login(email, password) {
    const data = await loginRequest(email, password);
    setAuth(data);
    return data;
  }

  async function register(payload) {
    const data = await registerRequest(payload);
    setAuth(data);
    return data;
  }

  async function loginWithGoogle(credential) {
    const data = await googleLoginRequest(credential);
    setAuth(data);
    return data;
  }

  async function updateProfile(payload) {
    const data = await updateProfileRequest(payload);
    setAuth(data);
    return data;
  }

  function logout() {
    setAuth(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user: auth?.user || null,
        token: auth?.token || null,
        isAdmin: auth?.user?.role === 'administrador',
        login,
        register,
        loginWithGoogle,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
