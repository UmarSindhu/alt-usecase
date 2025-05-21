import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // First check localStorage for existing session
        const storedUser = localStorage.getItem('supabaseUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Then verify with server
        const response = await fetch('/api/service/auth/session');
        if (!response.ok) throw new Error('Session check failed');
        
        const { user: currentUser } = await response.json();
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('supabaseUser', JSON.stringify(currentUser));
        } else {
          localStorage.removeItem('supabaseUser');
        }
      } catch (error) {
        console.error('Session error:', error);
        localStorage.removeItem('supabaseUser');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const eventSource = new EventSource('/api/service/auth/realtime');
    eventSource.onmessage = (e) => {
      const { user: updatedUser } = JSON.parse(e.data);
      setUser(updatedUser);
      if (updatedUser) {
        localStorage.setItem('supabaseUser', JSON.stringify(updatedUser));
      } else {
        localStorage.removeItem('supabaseUser');
      }
    };

    return () => eventSource.close();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/service/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch('/api/service/auth/logout', { method: 'POST' });
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