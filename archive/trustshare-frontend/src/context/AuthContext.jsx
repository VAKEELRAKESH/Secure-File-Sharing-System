import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService'; // Ready for tomorrow's endpoints

// Provide a default shape to prevent TypeScript/linter errors
const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Automatically check for an active session when the app loads
  useEffect(() => {
    const verifySession = async () => {
      try {
        const data = await authService.checkSession();
        setUser(data.user); // Restore user data from backend
      } catch (error) {
        setUser(null); // No valid cookie found
      } finally {
        setIsLoading(false); // App is ready to render
      }
    };
    
    verifySession();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Tell the backend to clear the HttpOnly cookie
      await authService.logout();
    } catch (error) {
      console.error("Logout failed on server, clearing local state anyway");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {/* Don't render the app until we know if the user is logged in or not */}
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);