import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Read from localStorage on mount
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = "/";
  };

  return {
    isAuthenticated: !!token,
    token,
    logout
  };
}
