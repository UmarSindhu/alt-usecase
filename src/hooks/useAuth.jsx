import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/service/auth?op=session', {
          credentials: 'include' // Important for cookies
        });
        
        if (!response.ok) {
          setUser(null);
          return;
        }
        
        const { user } = await response.json();
        setUser(user);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Poll for session status every 5 minutes to keep it alive
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/service/auth?op=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const { user } = await response.json();
      setUser(user);
      return true;
    } catch (error) {
      console.error('Login error:', error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/service/auth?op=logout', {
        method: 'POST',
        credentials: 'include' // Important for cookies
      });
      
      if (!response.ok) throw new Error('Logout failed');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};