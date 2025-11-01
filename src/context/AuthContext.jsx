import { createContext, useState, useEffect } from 'react';
import { getPerfil } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarToken = async () => {
      // 🔒 Cambio: usar sessionStorage en vez de localStorage
      const tokenGuardado = sessionStorage.getItem('token');

      if (tokenGuardado) {
        try {
          const response = await getPerfil();
          setUsuario(response.data);
          setToken(tokenGuardado);
        } catch (error) {
          console.error('Token inválido');
          sessionStorage.removeItem('token');
        }
      }
      setCargando(false);
    };

    verificarToken();
  }, []);

  const login = (nuevoToken, nuevoUsuario) => {
    // 🔒 Cambio: usar sessionStorage (se borra al cerrar pestaña)
    sessionStorage.setItem('token', nuevoToken);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};