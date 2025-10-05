import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const API_BASE = 'http://localhost:3000/api'; // O la IP de tu backend si es remota

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const response = await fetch(`${API_BASE}/usuarios/auth/me`, {
            headers: { 
              Authorization: `Bearer ${storedToken}` 
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Si el token no es válido, limpiar el almacenamiento
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error verificando token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    checkToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/usuarios/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || 'Error en la autenticación' 
        };
      }
      
      // Guardar token y datos de usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      
      setToken(data.token);
      setUser(data.usuario);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Error de login:', error);
      return { 
        success: false, 
        error: 'Error al conectar con el servidor' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      user, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;